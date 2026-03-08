using CHIS.Application.DTOs;
using CHIS.Core.Entities;
using CHIS.Infrastructure.Data;
using CHIS.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CHIS.UnitTests.Services;

public class RadiologyServiceTests : IDisposable
{
    private readonly CHISDbContext _db;
    private readonly UnitOfWork _uow;
    private readonly RadiologyService _sut;

    public RadiologyServiceTests()
    {
        _db = TestDbContextFactory.Create();
        _uow = new UnitOfWork(_db);
        _sut = new RadiologyService(_db, _uow);
    }

    public void Dispose() => _db.Dispose();

    private async Task<(Patient patient, Examination exam, Service service)> SeedDataAsync()
    {
        var patient = TestHelper.CreatePatient();
        await _db.Patients.AddAsync(patient);
        var record = new MedicalRecord { RecordNumber = "BA001", PatientId = patient.Id, RecordDate = DateTime.UtcNow, Status = 0 };
        await _db.MedicalRecords.AddAsync(record);
        var exam = new Examination { PatientId = patient.Id, MedicalRecordId = record.Id, ExamDate = DateTime.UtcNow, Status = 1 };
        await _db.Examinations.AddAsync(exam);
        var service = new Service { Code = "CDHA01", Name = "X-Ray nguc", ServiceType = "CDHA", BhytPrice = 120000, IsActive = true };
        await _db.Services.AddAsync(service);
        await _db.SaveChangesAsync();
        return (patient, exam, service);
    }

    [Fact]
    public async Task CreateImagingRequestAsync_CreatesRequestWithCDHAType()
    {
        var (patient, exam, service) = await SeedDataAsync();

        var result = await _sut.CreateImagingRequestAsync(new CreateServiceRequestDto
        {
            ExaminationId = exam.Id,
            PatientId = patient.Id,
            ServiceId = service.Id,
            Notes = "Chup X-Ray"
        });

        result.ServiceType.Should().Be("CDHA");
        result.ServiceName.Should().Be("X-Ray nguc");
        result.Status.Should().Be(0);
    }

    [Fact]
    public async Task GetImagingRequestsAsync_FiltersByCDHATypeOnly()
    {
        var (patient, exam, _) = await SeedDataAsync();
        await _db.ServiceRequests.AddRangeAsync(
            new ServiceRequest { ExaminationId = exam.Id, PatientId = patient.Id, ServiceType = "CDHA", Status = 0 },
            new ServiceRequest { ExaminationId = exam.Id, PatientId = patient.Id, ServiceType = "XetNghiem", Status = 0 },
            new ServiceRequest { ExaminationId = exam.Id, PatientId = patient.Id, ServiceType = "CDHA", Status = 1 }
        );
        await _db.SaveChangesAsync();

        var result = await _sut.GetImagingRequestsAsync(new ServiceRequestSearchDto { PageSize = 20 });

        result.Items.Should().HaveCount(2);
        result.Items.Should().OnlyContain(s => s.ServiceType == "CDHA");
    }

    [Fact]
    public async Task UpdateImagingResultAsync_SetsResultAndStatus1()
    {
        var (patient, exam, _) = await SeedDataAsync();
        var sr = new ServiceRequest
        {
            ExaminationId = exam.Id, PatientId = patient.Id,
            ServiceType = "CDHA", Status = 0,
            Details = new List<ServiceRequestDetail>()
        };
        await _db.ServiceRequests.AddAsync(sr);
        await _db.SaveChangesAsync();

        var result = await _sut.UpdateImagingResultAsync(sr.Id, new UpdateServiceResultDto
        {
            Result = "Binh thuong",
            ResultDescription = "Khong co bat thuong"
        });

        result.Result.Should().Be("Binh thuong");
        result.Status.Should().Be(1);
    }

    [Fact]
    public async Task UpdateImagingResultAsync_NonExistent_ThrowsNotFound()
    {
        var act = () => _sut.UpdateImagingResultAsync(Guid.NewGuid(), new UpdateServiceResultDto());
        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task ApproveImagingResultAsync_SetsStatusTo2()
    {
        var (patient, exam, _) = await SeedDataAsync();
        var sr = new ServiceRequest
        {
            ExaminationId = exam.Id, PatientId = patient.Id,
            ServiceType = "CDHA", Status = 1
        };
        await _db.ServiceRequests.AddAsync(sr);
        await _db.SaveChangesAsync();

        await _sut.ApproveImagingResultAsync(sr.Id);

        var updated = await _db.ServiceRequests.FindAsync(sr.Id);
        updated!.Status.Should().Be(2);
    }

    [Fact]
    public async Task GetImagingServicesAsync_ReturnsOnlyCDHAServices()
    {
        await _db.Services.AddRangeAsync(
            new Service { Code = "CDHA01", Name = "X-Ray", ServiceType = "CDHA", IsActive = true },
            new Service { Code = "XN01", Name = "CTM", ServiceType = "XetNghiem", IsActive = true },
            new Service { Code = "CDHA02", Name = "Sieu am", ServiceType = "CDHA", IsActive = true }
        );
        await _db.SaveChangesAsync();

        var result = await _sut.GetImagingServicesAsync();

        result.Should().HaveCount(2);
        result.Should().OnlyContain(s => s.ServiceType == "CDHA");
    }
}
