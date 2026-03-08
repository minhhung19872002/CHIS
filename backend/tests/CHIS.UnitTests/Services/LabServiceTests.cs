using CHIS.Application.DTOs;
using CHIS.Core.Entities;
using CHIS.Infrastructure.Data;
using CHIS.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CHIS.UnitTests.Services;

public class LabServiceTests : IDisposable
{
    private readonly CHISDbContext _db;
    private readonly UnitOfWork _uow;
    private readonly LabService _sut;

    public LabServiceTests()
    {
        _db = TestDbContextFactory.Create();
        _uow = new UnitOfWork(_db);
        _sut = new LabService(_db, _uow);
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
        var service = new Service { Code = "XN01", Name = "Cong thuc mau", ServiceType = "XetNghiem", BhytPrice = 50000, IsActive = true };
        await _db.Services.AddAsync(service);
        await _db.SaveChangesAsync();
        return (patient, exam, service);
    }

    [Fact]
    public async Task CreateLabRequestAsync_CreatesRequest()
    {
        var (patient, exam, service) = await SeedDataAsync();

        var result = await _sut.CreateLabRequestAsync(new CreateServiceRequestDto
        {
            ExaminationId = exam.Id,
            PatientId = patient.Id,
            ServiceId = service.Id,
            Notes = "Kiem tra"
        });

        result.ServiceType.Should().Be("XetNghiem");
        result.ServiceName.Should().Be("Cong thuc mau");
        result.Status.Should().Be(0);
    }

    [Fact]
    public async Task UpdateLabResultAsync_UpdatesResultAndSetsStatus()
    {
        var (patient, exam, service) = await SeedDataAsync();
        var sr = new ServiceRequest
        {
            ExaminationId = exam.Id, PatientId = patient.Id,
            ServiceId = service.Id, ServiceName = service.Name,
            ServiceType = "XetNghiem", Status = 0,
            Details = new List<ServiceRequestDetail>()
        };
        await _db.ServiceRequests.AddAsync(sr);
        await _db.SaveChangesAsync();

        var result = await _sut.UpdateLabResultAsync(sr.Id, new UpdateServiceResultDto
        {
            Result = "Binh thuong",
            ResultDescription = "Cac chi so trong gioi han",
            Details = new List<UpdateServiceDetailResultDto>
            {
                new() { TestName = "WBC", Result = "7.5", Unit = "10^9/L", ReferenceRange = "4.0-10.0" },
                new() { TestName = "RBC", Result = "4.5", Unit = "10^12/L", ReferenceRange = "4.0-5.5" }
            }
        });

        result.Result.Should().Be("Binh thuong");
        result.Status.Should().Be(1);

        var detailCount = await _db.ServiceRequestDetails.CountAsync(d => d.ServiceRequestId == sr.Id);
        detailCount.Should().Be(2);
    }

    [Fact]
    public async Task UpdateLabResultAsync_NonExistent_ThrowsNotFound()
    {
        var act = () => _sut.UpdateLabResultAsync(Guid.NewGuid(), new UpdateServiceResultDto());
        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task ApproveLabResultAsync_SetsStatusTo2()
    {
        var (patient, exam, _) = await SeedDataAsync();
        var sr = new ServiceRequest
        {
            ExaminationId = exam.Id, PatientId = patient.Id,
            ServiceType = "XetNghiem", Status = 1
        };
        await _db.ServiceRequests.AddAsync(sr);
        await _db.SaveChangesAsync();

        await _sut.ApproveLabResultAsync(sr.Id);

        var updated = await _db.ServiceRequests.FindAsync(sr.Id);
        updated!.Status.Should().Be(2);
    }

    [Fact]
    public async Task GetLabServicesAsync_ReturnsOnlyLabServices()
    {
        await _db.Services.AddRangeAsync(
            new Service { Code = "XN01", Name = "CTM", ServiceType = "XetNghiem", IsActive = true },
            new Service { Code = "CDHA01", Name = "X-Ray", ServiceType = "CDHA", IsActive = true },
            new Service { Code = "XN02", Name = "Sinh hoa", ServiceType = "XetNghiem", IsActive = true }
        );
        await _db.SaveChangesAsync();

        var result = await _sut.GetLabServicesAsync();

        result.Should().HaveCount(2);
        result.Should().OnlyContain(s => s.ServiceType == "XetNghiem");
    }

    [Fact]
    public async Task GetLabRequestsAsync_FiltersByStatus()
    {
        var (patient, exam, _) = await SeedDataAsync();
        await _db.ServiceRequests.AddRangeAsync(
            new ServiceRequest { ExaminationId = exam.Id, PatientId = patient.Id, ServiceType = "XetNghiem", Status = 0 },
            new ServiceRequest { ExaminationId = exam.Id, PatientId = patient.Id, ServiceType = "XetNghiem", Status = 1 },
            new ServiceRequest { ExaminationId = exam.Id, PatientId = patient.Id, ServiceType = "CDHA", Status = 0 }
        );
        await _db.SaveChangesAsync();

        var result = await _sut.GetLabRequestsAsync(new ServiceRequestSearchDto { Status = 0, PageSize = 20 });

        result.Items.Should().ContainSingle();
    }
}
