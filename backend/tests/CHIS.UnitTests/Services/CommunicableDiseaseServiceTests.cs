using CHIS.Application.DTOs;
using CHIS.Core.Entities;
using CHIS.Infrastructure.Data;
using CHIS.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CHIS.UnitTests.Services;

public class CommunicableDiseaseServiceTests : IDisposable
{
    private readonly CHISDbContext _db;
    private readonly UnitOfWork _uow;
    private readonly CommunicableDiseaseService _sut;

    public CommunicableDiseaseServiceTests()
    {
        _db = TestDbContextFactory.Create();
        _uow = new UnitOfWork(_db);
        _sut = new CommunicableDiseaseService(_db, _uow);
    }

    public void Dispose() => _db.Dispose();

    private async Task<(Patient patient, DiseaseCase diseaseCase)> SeedDataAsync()
    {
        var patient = TestHelper.CreatePatient();
        await _db.Patients.AddAsync(patient);
        var diseaseCase = new DiseaseCase
        {
            PatientId = patient.Id,
            DiseaseName = "Sot xuat huyet",
            IcdCode = "A97",
            OnsetDate = DateTime.UtcNow.AddDays(-3),
            ReportDate = DateTime.UtcNow,
            Status = 0
        };
        await _db.DiseaseCases.AddAsync(diseaseCase);
        await _db.SaveChangesAsync();
        return (patient, diseaseCase);
    }

    [Fact]
    public async Task SearchCasesAsync_WithFilters()
    {
        var (patient, _) = await SeedDataAsync();
        // Add another case with different disease
        var patient2 = TestHelper.CreatePatient("Le Van C", "BN0002");
        await _db.Patients.AddAsync(patient2);
        await _db.DiseaseCases.AddAsync(new DiseaseCase
        {
            PatientId = patient2.Id,
            DiseaseName = "Tay chan mieng",
            IcdCode = "B08.4",
            OnsetDate = DateTime.UtcNow,
            Status = 0
        });
        await _db.SaveChangesAsync();

        var result = await _sut.SearchCasesAsync(new DiseaseCaseSearchDto
        {
            DiseaseName = "Sot xuat huyet",
            PageSize = 20
        });

        result.Items.Should().ContainSingle();
        result.Items[0].DiseaseName.Should().Be("Sot xuat huyet");
        result.Items[0].PatientName.Should().Be(patient.FullName);
    }

    [Fact]
    public async Task ReportCaseAsync_CreatesCaseWithStatus0()
    {
        var patient = TestHelper.CreatePatient();
        await _db.Patients.AddAsync(patient);
        await _db.SaveChangesAsync();

        var result = await _sut.ReportCaseAsync(new CreateDiseaseCaseDto
        {
            PatientId = patient.Id,
            DiseaseName = "Cum A",
            IcdCode = "J09",
            OnsetDate = DateTime.UtcNow.AddDays(-1),
            EpidemiologicalHistory = "Tiep xuc nguoi benh",
            TreatmentInfo = "Dieu tri trieu chung"
        });

        result.Should().NotBeNull();
        result.Status.Should().Be(0);
        result.DiseaseName.Should().Be("Cum A");
        result.PatientName.Should().Be(patient.FullName);
    }

    [Fact]
    public async Task UpdateOutcomeAsync_UpdatesOutcome()
    {
        var (_, diseaseCase) = await SeedDataAsync();

        await _sut.UpdateCaseOutcomeAsync(diseaseCase.Id, "Khoi benh");

        var updated = await _db.DiseaseCases.FindAsync(diseaseCase.Id);
        updated!.Outcome.Should().Be("Khoi benh");
        updated.Status.Should().Be(1);
    }

    [Fact]
    public async Task UpdateOutcomeAsync_NonExistent_ThrowsKeyNotFoundException()
    {
        var act = () => _sut.UpdateCaseOutcomeAsync(Guid.NewGuid(), "Khoi benh");
        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task CreateWeeklyReportAsync_CreatesReport()
    {
        var facilityId = Guid.NewGuid();

        var result = await _sut.CreateWeeklyReportAsync(2026, 10, facilityId, "{\"cases\":5}");

        result.Should().NotBeNull();
        result.Year.Should().Be(2026);
        result.WeekNumber.Should().Be(10);
        result.FacilityId.Should().Be(facilityId);
        result.Status.Should().Be(0);

        var saved = await _db.WeeklyReports.FindAsync(result.Id);
        saved.Should().NotBeNull();
    }
}
