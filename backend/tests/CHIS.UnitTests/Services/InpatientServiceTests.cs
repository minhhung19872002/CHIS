using CHIS.Application.DTOs;
using CHIS.Core.Entities;
using CHIS.Infrastructure.Data;
using CHIS.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CHIS.UnitTests.Services;

public class InpatientServiceTests : IDisposable
{
    private readonly CHISDbContext _db;
    private readonly UnitOfWork _uow;
    private readonly InpatientService _sut;

    public InpatientServiceTests()
    {
        _db = TestDbContextFactory.Create();
        _uow = new UnitOfWork(_db);
        _sut = new InpatientService(_db, _uow);
    }

    public void Dispose() => _db.Dispose();

    private async Task<(Patient patient, MedicalRecord record, Department dept, Bed bed)> SeedDataAsync()
    {
        var patient = TestHelper.CreatePatient();
        await _db.Patients.AddAsync(patient);

        var dept = new Department { Id = Guid.NewGuid(), Name = "Noi khoa", Code = "NK" };
        await _db.Departments.AddAsync(dept);

        var room = TestHelper.CreateRoom();
        room.DepartmentId = dept.Id;
        await _db.Rooms.AddAsync(room);

        var bed = new Bed
        {
            Id = Guid.NewGuid(), Code = "G01", Name = "Giuong 01",
            RoomId = room.Id, DepartmentId = dept.Id, Status = "Available", IsActive = true
        };
        await _db.Beds.AddAsync(bed);

        var record = new MedicalRecord
        {
            RecordNumber = "BA001", PatientId = patient.Id,
            RecordDate = DateTime.UtcNow, Status = 0
        };
        await _db.MedicalRecords.AddAsync(record);
        await _db.SaveChangesAsync();

        return (patient, record, dept, bed);
    }

    [Fact]
    public async Task AdmitAsync_CreatesAdmissionAndOccupiesBed()
    {
        var (patient, record, dept, bed) = await SeedDataAsync();

        var result = await _sut.AdmitAsync(new CreateAdmissionDto
        {
            PatientId = patient.Id,
            MedicalRecordId = record.Id,
            DepartmentId = dept.Id,
            BedId = bed.Id,
            AdmissionDiagnosis = "Viem phoi",
            AdmissionReason = "Sot cao",
            AdmissionType = "CapCuu"
        });

        result.PatientId.Should().Be(patient.Id);
        result.DepartmentId.Should().Be(dept.Id);
        result.Status.Should().Be(0);

        var updatedBed = await _db.Beds.FindAsync(bed.Id);
        updatedBed!.Status.Should().Be("Occupied");
    }

    [Fact]
    public async Task AdmitAsync_WithoutBed_CreatesAdmission()
    {
        var (patient, record, dept, _) = await SeedDataAsync();

        var result = await _sut.AdmitAsync(new CreateAdmissionDto
        {
            PatientId = patient.Id,
            MedicalRecordId = record.Id,
            DepartmentId = dept.Id,
            AdmissionDiagnosis = "Viem phoi"
        });

        result.Should().NotBeNull();
        result.BedId.Should().BeNull();
    }

    [Fact]
    public async Task GetAdmissionByIdAsync_Existing_ReturnsDto()
    {
        var (patient, record, dept, bed) = await SeedDataAsync();
        var admission = new Admission
        {
            PatientId = patient.Id, MedicalRecordId = record.Id,
            DepartmentId = dept.Id, BedId = bed.Id,
            AdmissionDate = DateTime.UtcNow, Status = 0
        };
        await _db.Admissions.AddAsync(admission);
        await _db.SaveChangesAsync();

        var result = await _sut.GetAdmissionByIdAsync(admission.Id);

        result.Id.Should().Be(admission.Id);
        result.PatientName.Should().Be(patient.FullName);
    }

    [Fact]
    public async Task GetAdmissionByIdAsync_NonExistent_ThrowsNotFound()
    {
        var act = () => _sut.GetAdmissionByIdAsync(Guid.NewGuid());
        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task DischargeAsync_SetsStatusAndFreesBed()
    {
        var (patient, record, dept, bed) = await SeedDataAsync();
        bed.Status = "Occupied";
        var admission = new Admission
        {
            PatientId = patient.Id, MedicalRecordId = record.Id,
            DepartmentId = dept.Id, BedId = bed.Id,
            AdmissionDate = DateTime.UtcNow, Status = 0
        };
        await _db.Admissions.AddAsync(admission);
        await _db.SaveChangesAsync();

        var result = await _sut.DischargeAsync(new CreateDischargeDto
        {
            AdmissionId = admission.Id,
            DischargeDiagnosis = "Viem phoi da dieu tri",
            DischargeCondition = "Khoi",
            DischargeType = "BinhThuong",
            FollowUpPlan = "Tai kham sau 7 ngay"
        });

        result.AdmissionId.Should().Be(admission.Id);
        result.DischargeDiagnosis.Should().Be("Viem phoi da dieu tri");

        var updatedAdmission = await _db.Admissions.FindAsync(admission.Id);
        updatedAdmission!.Status.Should().Be(1);

        var updatedBed = await _db.Beds.FindAsync(bed.Id);
        updatedBed!.Status.Should().Be("Available");
    }

    [Fact]
    public async Task DischargeAsync_NonExistentAdmission_ThrowsNotFound()
    {
        var act = () => _sut.DischargeAsync(new CreateDischargeDto { AdmissionId = Guid.NewGuid() });
        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task GetAvailableBedsAsync_ReturnsOnlyAvailable()
    {
        var (_, _, dept, bed) = await SeedDataAsync();
        var room = await _db.Rooms.FirstAsync();

        var occupiedBed = new Bed
        {
            Id = Guid.NewGuid(), Code = "G02", Name = "Giuong 02",
            RoomId = room.Id, DepartmentId = dept.Id, Status = "Occupied", IsActive = true
        };
        await _db.Beds.AddAsync(occupiedBed);
        await _db.SaveChangesAsync();

        var result = await _sut.GetAvailableBedsAsync(dept.Id);

        result.Should().ContainSingle();
        result[0].Status.Should().Be("Available");
    }

    [Fact]
    public async Task AssignBedAsync_AssignsAndUpdatesStatus()
    {
        var (patient, record, dept, bed) = await SeedDataAsync();
        var admission = new Admission
        {
            PatientId = patient.Id, MedicalRecordId = record.Id,
            DepartmentId = dept.Id, AdmissionDate = DateTime.UtcNow, Status = 0
        };
        await _db.Admissions.AddAsync(admission);
        await _db.SaveChangesAsync();

        await _sut.AssignBedAsync(admission.Id, bed.Id);

        var updated = await _db.Admissions.FindAsync(admission.Id);
        updated!.BedId.Should().Be(bed.Id);

        var updatedBed = await _db.Beds.FindAsync(bed.Id);
        updatedBed!.Status.Should().Be("Occupied");
    }

    [Fact]
    public async Task AssignBedAsync_ReassignsAndFreesOldBed()
    {
        var (patient, record, dept, bed) = await SeedDataAsync();
        bed.Status = "Occupied";
        var room = await _db.Rooms.FirstAsync();
        var newBed = new Bed
        {
            Id = Guid.NewGuid(), Code = "G02", Name = "Giuong 02",
            RoomId = room.Id, DepartmentId = dept.Id, Status = "Available", IsActive = true
        };
        await _db.Beds.AddAsync(newBed);

        var admission = new Admission
        {
            PatientId = patient.Id, MedicalRecordId = record.Id,
            DepartmentId = dept.Id, BedId = bed.Id,
            AdmissionDate = DateTime.UtcNow, Status = 0
        };
        await _db.Admissions.AddAsync(admission);
        await _db.SaveChangesAsync();

        await _sut.AssignBedAsync(admission.Id, newBed.Id);

        var oldBed = await _db.Beds.FindAsync(bed.Id);
        oldBed!.Status.Should().Be("Available");

        var assignedBed = await _db.Beds.FindAsync(newBed.Id);
        assignedBed!.Status.Should().Be("Occupied");
    }

    [Fact]
    public async Task CreateTreatmentSheetAsync_CreatesSheet()
    {
        var (patient, record, dept, _) = await SeedDataAsync();
        var admission = new Admission
        {
            PatientId = patient.Id, MedicalRecordId = record.Id,
            DepartmentId = dept.Id, AdmissionDate = DateTime.UtcNow, Status = 0
        };
        await _db.Admissions.AddAsync(admission);
        await _db.SaveChangesAsync();

        var result = await _sut.CreateTreatmentSheetAsync(new CreateTreatmentSheetDto
        {
            AdmissionId = admission.Id,
            PatientId = patient.Id,
            DayNumber = 1,
            Progress = "Benh nhan on dinh",
            Orders = "Tiep tuc dieu tri",
            Notes = "Theo doi nhiet do"
        });

        result.AdmissionId.Should().Be(admission.Id);
        result.DayNumber.Should().Be(1);
        result.Progress.Should().Be("Benh nhan on dinh");
    }

    [Fact]
    public async Task GetTreatmentSheetsAsync_ReturnsSheets()
    {
        var (patient, record, dept, _) = await SeedDataAsync();
        var admission = new Admission
        {
            PatientId = patient.Id, MedicalRecordId = record.Id,
            DepartmentId = dept.Id, AdmissionDate = DateTime.UtcNow, Status = 0
        };
        await _db.Admissions.AddAsync(admission);
        await _db.TreatmentSheets.AddRangeAsync(
            new TreatmentSheet { AdmissionId = admission.Id, PatientId = patient.Id, TreatmentDate = DateTime.UtcNow, DayNumber = 1 },
            new TreatmentSheet { AdmissionId = admission.Id, PatientId = patient.Id, TreatmentDate = DateTime.UtcNow, DayNumber = 2 }
        );
        await _db.SaveChangesAsync();

        var result = await _sut.GetTreatmentSheetsAsync(admission.Id);

        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task SearchAdmissionsAsync_ByDepartment_FiltersResults()
    {
        var (patient, record, dept, _) = await SeedDataAsync();
        var otherDept = new Department { Id = Guid.NewGuid(), Name = "Ngoai khoa", Code = "NKH" };
        await _db.Departments.AddAsync(otherDept);
        await _db.Admissions.AddRangeAsync(
            new Admission { PatientId = patient.Id, MedicalRecordId = record.Id, DepartmentId = dept.Id, AdmissionDate = DateTime.UtcNow, Status = 0 },
            new Admission { PatientId = patient.Id, MedicalRecordId = record.Id, DepartmentId = otherDept.Id, AdmissionDate = DateTime.UtcNow, Status = 0 }
        );
        await _db.SaveChangesAsync();

        var result = await _sut.SearchAdmissionsAsync(new AdmissionSearchDto { DepartmentId = dept.Id, PageSize = 20 });

        result.Items.Should().ContainSingle();
    }
}
