using CHIS.Application.DTOs;
using CHIS.Core.Entities;
using CHIS.Infrastructure.Data;
using CHIS.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CHIS.UnitTests.Services;

public class HivAidsServiceTests : IDisposable
{
    private readonly CHISDbContext _db;
    private readonly UnitOfWork _uow;
    private readonly HivAidsService _sut;

    public HivAidsServiceTests()
    {
        _db = TestDbContextFactory.Create();
        _uow = new UnitOfWork(_db);
        _sut = new HivAidsService(_db, _uow);
    }

    public void Dispose() => _db.Dispose();

    private async Task<(Patient patient, HivPatient hivPatient)> SeedDataAsync()
    {
        var patient = TestHelper.CreatePatient();
        await _db.Patients.AddAsync(patient);
        var hivPatient = new HivPatient
        {
            PatientId = patient.Id,
            HivCode = "HIV001",
            DiagnosisDate = new DateTime(2025, 6, 1),
            ClinicalStage = "Stage 2",
            Status = 0,
            TreatmentCourses = new List<ArvTreatmentCourse>()
        };
        await _db.HivPatients.AddAsync(hivPatient);
        await _db.SaveChangesAsync();
        return (patient, hivPatient);
    }

    [Fact]
    public async Task SearchAsync_SearchByKeyword()
    {
        var (patient, _) = await SeedDataAsync();

        var result = await _sut.SearchAsync(new HivSearchDto
        {
            Keyword = patient.FullName.Substring(0, 6),
            PageSize = 20
        });

        result.Items.Should().ContainSingle();
        result.Items[0].PatientName.Should().Be(patient.FullName);
        result.Items[0].HivCode.Should().Be("HIV001");
    }

    [Fact]
    public async Task RegisterAsync_CreatesHivPatient()
    {
        var patient = TestHelper.CreatePatient("Le Van D", "BN0002");
        await _db.Patients.AddAsync(patient);
        await _db.SaveChangesAsync();

        var result = await _sut.RegisterAsync(new CreateHivPatientDto
        {
            PatientId = patient.Id,
            HivCode = "HIV002",
            DiagnosisDate = DateTime.UtcNow,
            ClinicalStage = "Stage 1",
            FamilyHistory = "Khong"
        });

        result.Should().NotBeNull();
        result.Status.Should().Be(0);
        result.HivCode.Should().Be("HIV002");
        result.PatientName.Should().Be("Le Van D");
    }

    [Fact]
    public async Task GetByIdAsync_NonExistent_ThrowsKeyNotFoundException()
    {
        var act = () => _sut.GetByIdAsync(Guid.NewGuid());
        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task StartTreatmentCourseAsync_CreatesArvTreatmentCourse()
    {
        var (_, hivPatient) = await SeedDataAsync();

        var result = await _sut.StartTreatmentCourseAsync(new CreateArvTreatmentCourseDto
        {
            HivPatientId = hivPatient.Id,
            Regimen = "TDF/3TC/DTG",
            Notes = "Bat dau dieu tri ARV"
        });

        result.Should().NotBeNull();
        result.HivPatientId.Should().Be(hivPatient.Id);
        result.Regimen.Should().Be("TDF/3TC/DTG");
        result.EndDate.Should().BeNull();

        // Verify the HivPatient's CurrentRegimen was updated
        var updatedHiv = await _db.HivPatients.FindAsync(hivPatient.Id);
        updatedHiv!.CurrentRegimen.Should().Be("TDF/3TC/DTG");
        updatedHiv.ArvStartDate.Should().NotBeNull();
    }

    [Fact]
    public async Task EndTreatmentCourseAsync_SetsEndDate()
    {
        var (_, hivPatient) = await SeedDataAsync();
        var course = new ArvTreatmentCourse
        {
            HivPatientId = hivPatient.Id,
            StartDate = DateTime.UtcNow.AddMonths(-6),
            Regimen = "TDF/3TC/EFV"
        };
        await _db.ArvTreatmentCourses.AddAsync(course);
        await _db.SaveChangesAsync();

        await _sut.EndTreatmentCourseAsync(course.Id, "Doi phac do do tac dung phu");

        var updated = await _db.ArvTreatmentCourses.FindAsync(course.Id);
        updated!.EndDate.Should().NotBeNull();
        updated.ChangeReason.Should().Be("Doi phac do do tac dung phu");
    }
}
