using CHIS.Application.DTOs;
using CHIS.Core.Entities;
using CHIS.Infrastructure.Data;
using CHIS.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CHIS.UnitTests.Services;

public class ReproductiveHealthServiceTests : IDisposable
{
    private readonly CHISDbContext _db;
    private readonly UnitOfWork _uow;
    private readonly ReproductiveHealthService _sut;

    public ReproductiveHealthServiceTests()
    {
        _db = TestDbContextFactory.Create();
        _uow = new UnitOfWork(_db);
        _sut = new ReproductiveHealthService(_db, _uow);
    }

    public void Dispose() => _db.Dispose();

    private async Task<Patient> SeedDataAsync()
    {
        var patient = TestHelper.CreatePatient("Tran Thi B", "BN0001");
        await _db.Patients.AddAsync(patient);
        await _db.SaveChangesAsync();
        return patient;
    }

    [Fact]
    public async Task GetPrenatalRecordsAsync_ReturnsRecordsForPatient()
    {
        var patient = await SeedDataAsync();
        await _db.PrenatalRecords.AddRangeAsync(
            new PrenatalRecord { PatientId = patient.Id, ExamDate = DateTime.UtcNow.AddDays(-14), GestationalWeek = 12, Weight = 55m },
            new PrenatalRecord { PatientId = patient.Id, ExamDate = DateTime.UtcNow, GestationalWeek = 14, Weight = 56m }
        );
        await _db.SaveChangesAsync();

        var result = await _sut.GetPrenatalRecordsAsync(new ReproductiveHealthSearchDto
        {
            PatientId = patient.Id,
            PageSize = 20
        });

        result.Items.Should().HaveCount(2);
        result.Items.Should().OnlyContain(r => r.PatientId == patient.Id);
    }

    [Fact]
    public async Task CreatePrenatalRecordAsync_CreatesRecord()
    {
        var patient = await SeedDataAsync();

        var result = await _sut.CreatePrenatalRecordAsync(new CreatePrenatalRecordDto
        {
            PatientId = patient.Id,
            GestationalWeek = 16,
            Weight = 57.5m,
            SystolicBP = 120,
            DiastolicBP = 80,
            FundalHeight = 14m,
            FetalHeartRate = "140",
            FetalPosition = "Dau",
            Diagnosis = "Thai ky binh thuong"
        });

        result.Should().NotBeNull();
        result.PatientId.Should().Be(patient.Id);
        result.GestationalWeek.Should().Be(16);

        var saved = await _db.PrenatalRecords.FindAsync(result.Id);
        saved.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateDeliveryRecordAsync_CreatesDeliveryRecord()
    {
        var patient = await SeedDataAsync();

        var result = await _sut.CreateDeliveryRecordAsync(new CreateDeliveryRecordDto
        {
            PatientId = patient.Id,
            GestationalWeek = 39,
            DeliveryType = "Thuong",
            ChildGender = "Nam",
            ChildWeight = 3.2m,
            ChildLength = 50m,
            ApgarScore1Min = 8,
            ApgarScore5Min = 9,
            ChildStatus = "Khoe",
            MotherStatus = "Khoe"
        });

        result.Should().NotBeNull();
        result.PatientId.Should().Be(patient.Id);

        var saved = await _db.DeliveryRecords.FindAsync(result.Id);
        saved.Should().NotBeNull();
    }

    [Fact]
    public async Task GetFamilyPlanningAsync_ReturnsRecords()
    {
        var patient = await SeedDataAsync();
        await _db.FamilyPlanningRecords.AddRangeAsync(
            new FamilyPlanningRecord { PatientId = patient.Id, RecordDate = DateTime.UtcNow, Method = "Vong tranh thai", StartDate = DateTime.UtcNow },
            new FamilyPlanningRecord { PatientId = patient.Id, RecordDate = DateTime.UtcNow.AddMonths(-6), Method = "Thuoc tranh thai", StartDate = DateTime.UtcNow.AddMonths(-6) }
        );
        await _db.SaveChangesAsync();

        var result = await _sut.GetFamilyPlanningAsync(patient.Id);

        result.Should().HaveCount(2);
        result.Should().OnlyContain(f => f.PatientId == patient.Id);
    }

    [Fact]
    public async Task CreateFamilyPlanningAsync_CreatesRecord()
    {
        var patient = await SeedDataAsync();

        var result = await _sut.CreateFamilyPlanningAsync(patient.Id, new FamilyPlanningRecordDto
        {
            Method = "Que cam tranh thai",
            StartDate = DateTime.UtcNow,
            Notes = "Cam que 3 nam"
        });

        result.Should().NotBeNull();
        result.PatientId.Should().Be(patient.Id);
        result.Method.Should().Be("Que cam tranh thai");

        var saved = await _db.FamilyPlanningRecords.CountAsync(f => f.PatientId == patient.Id);
        saved.Should().Be(1);
    }
}
