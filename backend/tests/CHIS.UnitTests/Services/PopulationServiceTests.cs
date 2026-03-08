using CHIS.Application.DTOs;
using CHIS.Core.Entities;
using CHIS.Infrastructure.Data;
using CHIS.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CHIS.UnitTests.Services;

public class PopulationServiceTests : IDisposable
{
    private readonly CHISDbContext _db;
    private readonly UnitOfWork _uow;
    private readonly PopulationService _sut;

    public PopulationServiceTests()
    {
        _db = TestDbContextFactory.Create();
        _uow = new UnitOfWork(_db);
        _sut = new PopulationService(_db, _uow);
    }

    public void Dispose() => _db.Dispose();

    private async Task<Household> SeedDataAsync()
    {
        var household = new Household
        {
            HouseholdCode = "HGD000001",
            HeadOfHousehold = "Nguyen Van A",
            Address = "So 1 Ngo 5",
            Village = "Thon 1",
            WardCode = "00001",
            Phone = "0901234567",
            Members = new List<Patient>()
        };
        await _db.Households.AddAsync(household);
        await _db.SaveChangesAsync();
        return household;
    }

    [Fact]
    public async Task SearchHouseholdsAsync_SearchByKeyword()
    {
        await SeedDataAsync();
        await _db.Households.AddAsync(new Household
        {
            HouseholdCode = "HGD000002",
            HeadOfHousehold = "Tran Van B",
            Address = "So 2",
            Village = "Thon 2",
            Members = new List<Patient>()
        });
        await _db.SaveChangesAsync();

        var result = await _sut.SearchHouseholdsAsync(new HouseholdSearchDto
        {
            Keyword = "Nguyen",
            PageSize = 20
        });

        result.Items.Should().ContainSingle();
        result.Items[0].HeadOfHousehold.Should().Be("Nguyen Van A");
    }

    [Fact]
    public async Task GetHouseholdByIdAsync_ExistingReturnsDto()
    {
        var household = await SeedDataAsync();

        var result = await _sut.GetHouseholdByIdAsync(household.Id);

        result.Should().NotBeNull();
        result.HouseholdCode.Should().Be("HGD000001");
        result.HeadOfHousehold.Should().Be("Nguyen Van A");
        result.Village.Should().Be("Thon 1");
    }

    [Fact]
    public async Task GetHouseholdByIdAsync_NonExistent_ThrowsKeyNotFoundException()
    {
        var act = () => _sut.GetHouseholdByIdAsync(Guid.NewGuid());
        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task CreateHouseholdAsync_CreatesWithAutoHouseholdCode()
    {
        var result = await _sut.CreateHouseholdAsync(new CreateHouseholdDto
        {
            HeadOfHousehold = "Le Van C",
            Address = "So 3",
            Village = "Thon 3",
            WardCode = "00003"
        });

        result.Should().NotBeNull();
        result.HouseholdCode.Should().StartWith("HGD");
        result.HeadOfHousehold.Should().Be("Le Van C");

        var saved = await _db.Households.FindAsync(result.Id);
        saved.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateBirthCertificateAsync_CreatesWithAutoCertificateNumber()
    {
        var result = await _sut.CreateBirthCertificateAsync(new CreateBirthCertificateDto
        {
            ChildName = "Nguyen Van D",
            DateOfBirth = new DateTime(2026, 1, 15),
            Gender = 1,
            PlaceOfBirth = "Benh vien Thuong Tin",
            MotherName = "Tran Thi E",
            FatherName = "Nguyen Van A",
            BirthWeight = 3.2m,
            BirthLength = 50m
        });

        result.Should().NotBeNull();
        result.CertificateNumber.Should().StartWith("GKS");
        result.ChildName.Should().Be("Nguyen Van D");

        var saved = await _db.BirthCertificates.FindAsync(result.Id);
        saved.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateDeathCertificateAsync_CreatesCertificate()
    {
        var result = await _sut.CreateDeathCertificateAsync(new CreateDeathCertificateDto
        {
            DeceasedName = "Pham Van F",
            DateOfDeath = new DateTime(2026, 2, 10),
            PlaceOfDeath = "Tai nha",
            CauseOfDeath = "Benh gia",
            IcdCode = "R99",
            Age = 85,
            Gender = 1
        });

        result.Should().NotBeNull();
        result.CertificateNumber.Should().StartWith("GTV");
        result.DeceasedName.Should().Be("Pham Van F");

        var saved = await _db.DeathCertificates.FindAsync(result.Id);
        saved.Should().NotBeNull();
    }

    [Fact]
    public async Task GetElderlyListAsync_ReturnsElderlyInfo()
    {
        var patient = TestHelper.CreatePatient();
        await _db.Patients.AddAsync(patient);
        var elderly = new ElderlyInfo
        {
            PatientId = patient.Id,
            HealthStatus = "Trung binh",
            ChronicDiseases = "Tang huyet ap",
            CareLevel = "Cap 2",
            Notes = "Can theo doi"
        };
        await _db.ElderlyInfos.AddAsync(elderly);
        await _db.SaveChangesAsync();

        var result = await _sut.GetElderlyListAsync();

        result.Should().ContainSingle();
        result[0].HealthStatus.Should().Be("Trung binh");
        result[0].PatientName.Should().Be(patient.FullName);
    }
}
