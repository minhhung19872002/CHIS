using CHIS.Application.DTOs;
using CHIS.Core.Entities;
using CHIS.Infrastructure.Data;
using CHIS.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CHIS.UnitTests.Services;

public class FoodSafetyServiceTests : IDisposable
{
    private readonly CHISDbContext _db;
    private readonly UnitOfWork _uow;
    private readonly FoodSafetyService _sut;

    public FoodSafetyServiceTests()
    {
        _db = TestDbContextFactory.Create();
        _uow = new UnitOfWork(_db);
        _sut = new FoodSafetyService(_db, _uow);
    }

    public void Dispose() => _db.Dispose();

    private async Task<FoodBusiness> SeedDataAsync()
    {
        var business = new FoodBusiness
        {
            BusinessName = "Nha hang Pho Viet",
            Address = "12 Le Loi, Thuong Tin",
            OwnerName = "Nguyen Van Chu",
            Phone = "0901234567",
            BusinessType = "NhaHang",
            LicenseNumber = "ATTP001",
            LicenseExpiry = new DateTime(2027, 12, 31),
            Status = "Active"
        };
        await _db.FoodBusinesses.AddAsync(business);
        await _db.SaveChangesAsync();
        return business;
    }

    [Fact]
    public async Task SearchBusinessesAsync_ByKeyword()
    {
        await SeedDataAsync();
        await _db.FoodBusinesses.AddAsync(new FoodBusiness
        {
            BusinessName = "Quan Com Binh Dan",
            Address = "5 Tran Hung Dao",
            Status = "Active"
        });
        await _db.SaveChangesAsync();

        var result = await _sut.SearchBusinessesAsync(new FoodSafetySearchDto
        {
            Keyword = "Pho Viet",
            PageSize = 20
        });

        result.Items.Should().ContainSingle();
        result.Items[0].BusinessName.Should().Be("Nha hang Pho Viet");
    }

    [Fact]
    public async Task CreateBusinessAsync_CreatesWithActiveStatus()
    {
        var result = await _sut.CreateBusinessAsync(new CreateFoodBusinessDto
        {
            BusinessName = "Tiem Banh Mi",
            Address = "20 Nguyen Trai",
            OwnerName = "Tran Van Banh",
            Phone = "0909876543",
            BusinessType = "QuanAn",
            LicenseNumber = "ATTP002"
        });

        result.Should().NotBeNull();
        result.BusinessName.Should().Be("Tiem Banh Mi");

        var saved = await _db.FoodBusinesses.FindAsync(result.Id);
        saved.Should().NotBeNull();
        saved!.Status.Should().Be("Active");
    }

    [Fact]
    public async Task CreateViolationAsync_CreatesViolationForBusiness()
    {
        var business = await SeedDataAsync();

        var result = await _sut.CreateViolationAsync(business.Id, new FoodViolationDto
        {
            ViolationType = "Ve sinh",
            Description = "Khong dam bao ve sinh an toan thuc pham",
            Penalty = "Phat 5 trieu dong"
        });

        result.Should().NotBeNull();
        result.ViolationType.Should().Be("Ve sinh");
        result.Penalty.Should().Be("Phat 5 trieu dong");

        var saved = await _db.FoodViolations.CountAsync(v => v.FoodBusinessId == business.Id);
        saved.Should().Be(1);
    }

    [Fact]
    public async Task GetPoisoningCasesAsync_FiltersByDateRange()
    {
        await _db.FoodPoisonings.AddRangeAsync(
            new FoodPoisoning { IncidentDate = new DateTime(2026, 1, 15), Location = "Truong hoc A", AffectedCount = 20, SuspectedFood = "Com hop" },
            new FoodPoisoning { IncidentDate = new DateTime(2026, 2, 20), Location = "Nha may B", AffectedCount = 5, SuspectedFood = "Nuoc uong" },
            new FoodPoisoning { IncidentDate = new DateTime(2026, 3, 5), Location = "Tiec cuoi C", AffectedCount = 50, SuspectedFood = "Hai san" }
        );
        await _db.SaveChangesAsync();

        var result = await _sut.GetPoisoningCasesAsync(
            fromDate: new DateTime(2026, 2, 1),
            toDate: new DateTime(2026, 2, 28)
        );

        result.Should().ContainSingle();
        result[0].Location.Should().Be("Nha may B");
    }

    [Fact]
    public async Task ReportPoisoningAsync_CreatesPoisoningReport()
    {
        var result = await _sut.ReportPoisoningAsync(new FoodPoisoningDto
        {
            IncidentDate = DateTime.UtcNow,
            Location = "Khu cong nghiep X",
            AffectedCount = 30,
            HospitalizedCount = 10,
            DeathCount = 0,
            SuspectedFood = "Thuc an cong nghiep",
            CauseAgent = "Salmonella",
            Description = "Ngo doc thuc pham tap the"
        });

        result.Should().NotBeNull();
        result.Id.Should().NotBeEmpty();
        result.AffectedCount.Should().Be(30);
        result.Location.Should().Be("Khu cong nghiep X");

        var saved = await _db.FoodPoisonings.FindAsync(result.Id);
        saved.Should().NotBeNull();
    }
}
