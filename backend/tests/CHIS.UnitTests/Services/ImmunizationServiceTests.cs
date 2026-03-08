using CHIS.Application.DTOs;
using CHIS.Core.Entities;
using CHIS.Infrastructure.Data;
using CHIS.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CHIS.UnitTests.Services;

public class ImmunizationServiceTests : IDisposable
{
    private readonly CHISDbContext _db;
    private readonly UnitOfWork _uow;
    private readonly ImmunizationService _sut;

    public ImmunizationServiceTests()
    {
        _db = TestDbContextFactory.Create();
        _uow = new UnitOfWork(_db);
        _sut = new ImmunizationService(_db, _uow);
    }

    public void Dispose() => _db.Dispose();

    private async Task<(ImmunizationSubject subject, Vaccine vaccine)> SeedDataAsync()
    {
        var subject = new ImmunizationSubject
        {
            SubjectCode = "TC260001",
            FullName = "Nguyen Van Be",
            DateOfBirth = new DateTime(2025, 6, 15),
            Gender = 1,
            MotherName = "Tran Thi Me",
            Address = "Thon 1, Thuong Tin",
            Village = "Thon 1",
            Phone = "0901234567",
            Vaccinations = new List<VaccinationRecord>(),
            NutritionMeasurements = new List<NutritionMeasurement>()
        };
        await _db.ImmunizationSubjects.AddAsync(subject);

        var vaccine = new Vaccine
        {
            Code = "BCG",
            Name = "Vac xin BCG",
            Manufacturer = "VNVC",
            AntigenList = "BCG",
            StorageCondition = "2-8 do C",
            DosesPerVial = 20,
            IsActive = true
        };
        await _db.Vaccines.AddAsync(vaccine);
        await _db.SaveChangesAsync();
        return (subject, vaccine);
    }

    [Fact]
    public async Task SearchSubjectsAsync_SearchByKeyword()
    {
        var (subject, _) = await SeedDataAsync();

        var result = await _sut.SearchSubjectsAsync(new ImmunizationSearchDto
        {
            Keyword = "Nguyen",
            PageSize = 20
        });

        result.Items.Should().ContainSingle();
        result.Items[0].FullName.Should().Be("Nguyen Van Be");
        result.Items[0].SubjectCode.Should().Be("TC260001");
    }

    [Fact]
    public async Task CreateSubjectAsync_CreatesWithAutoSubjectCode()
    {
        var result = await _sut.CreateSubjectAsync(new CreateImmunizationSubjectDto
        {
            FullName = "Le Thi Nho",
            DateOfBirth = new DateTime(2026, 1, 10),
            Gender = 2,
            MotherName = "Le Thi Lon",
            Address = "Thon 2",
            Village = "Thon 2",
            Phone = "0909876543"
        });

        result.Should().NotBeNull();
        result.SubjectCode.Should().StartWith("TC");
        result.FullName.Should().Be("Le Thi Nho");

        var saved = await _db.ImmunizationSubjects.FindAsync(result.Id);
        saved.Should().NotBeNull();
    }

    [Fact]
    public async Task GetVaccinationsAsync_ReturnsVaccinationsForSubject()
    {
        var (subject, vaccine) = await SeedDataAsync();
        await _db.VaccinationRecords.AddRangeAsync(
            new VaccinationRecord { SubjectId = subject.Id, VaccineId = vaccine.Id, VaccinationDate = DateTime.UtcNow.AddMonths(-1), DoseNumber = 1, BatchNumber = "LOT001" },
            new VaccinationRecord { SubjectId = subject.Id, VaccineId = vaccine.Id, VaccinationDate = DateTime.UtcNow, DoseNumber = 2, BatchNumber = "LOT002" }
        );
        await _db.SaveChangesAsync();

        var result = await _sut.GetVaccinationsAsync(subject.Id);

        result.Should().HaveCount(2);
        result.Should().OnlyContain(v => v.SubjectId == subject.Id);
    }

    [Fact]
    public async Task RecordVaccinationAsync_CreatesVaccinationRecord()
    {
        var (subject, vaccine) = await SeedDataAsync();

        var result = await _sut.RecordVaccinationAsync(new CreateVaccinationRecordDto
        {
            SubjectId = subject.Id,
            VaccineId = vaccine.Id,
            DoseNumber = 1,
            BatchNumber = "LOT001",
            InjectionSite = "Dui trai",
            Route = "Tiem trong da"
        });

        result.Should().NotBeNull();
        result.SubjectId.Should().Be(subject.Id);
        result.VaccineId.Should().Be(vaccine.Id);
        result.DoseNumber.Should().Be(1);

        var saved = await _db.VaccinationRecords.CountAsync(v => v.SubjectId == subject.Id);
        saved.Should().Be(1);
    }

    [Fact]
    public async Task GetVaccinesAsync_ReturnsActiveVaccines()
    {
        await _db.Vaccines.AddRangeAsync(
            new Vaccine { Code = "BCG", Name = "BCG", IsActive = true },
            new Vaccine { Code = "DPT", Name = "DPT", IsActive = true },
            new Vaccine { Code = "OLD", Name = "Old vaccine", IsActive = false }
        );
        await _db.SaveChangesAsync();

        var result = await _sut.GetVaccinesAsync();

        result.Should().HaveCount(2);
        result.Should().OnlyContain(v => v.IsActive);
    }

    [Fact]
    public async Task CreateVaccineAsync_CreatesVaccine()
    {
        var result = await _sut.CreateVaccineAsync(new VaccineDto
        {
            Code = "IPV",
            Name = "Vac xin bai liet bat hoat",
            Manufacturer = "Sanofi",
            AntigenList = "Polio",
            StorageCondition = "2-8 do C",
            DosesPerVial = 10
        });

        result.Should().NotBeNull();
        result.Id.Should().NotBeEmpty();
        result.Code.Should().Be("IPV");

        var saved = await _db.Vaccines.FindAsync(result.Id);
        saved.Should().NotBeNull();
        saved!.IsActive.Should().BeTrue();
        saved.Name.Should().Be("Vac xin bai liet bat hoat");
    }
}
