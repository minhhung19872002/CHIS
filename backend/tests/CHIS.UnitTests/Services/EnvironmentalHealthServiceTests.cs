using CHIS.Application.DTOs;
using CHIS.Core.Entities;
using CHIS.Infrastructure.Data;
using CHIS.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CHIS.UnitTests.Services;

public class EnvironmentalHealthServiceTests : IDisposable
{
    private readonly CHISDbContext _db;
    private readonly UnitOfWork _uow;
    private readonly EnvironmentalHealthService _sut;

    public EnvironmentalHealthServiceTests()
    {
        _db = TestDbContextFactory.Create();
        _uow = new UnitOfWork(_db);
        _sut = new EnvironmentalHealthService(_db, _uow);
    }

    public void Dispose() => _db.Dispose();

    private async Task<SanitationFacility> SeedDataAsync()
    {
        var facility = new SanitationFacility
        {
            FacilityType = "NhaTieuHopVeSinh",
            Address = "So 5 Thon 1",
            Village = "Thon 1",
            Status = "Dat",
            Notes = "Nha tieu tu hoai"
        };
        await _db.SanitationFacilities.AddAsync(facility);
        await _db.SaveChangesAsync();
        return facility;
    }

    [Fact]
    public async Task GetSanitationFacilitiesAsync_FilterByVillage()
    {
        await SeedDataAsync();
        await _db.SanitationFacilities.AddAsync(new SanitationFacility
        {
            FacilityType = "GiengNuoc",
            Address = "So 10 Thon 2",
            Village = "Thon 2",
            Status = "Dat"
        });
        await _db.SaveChangesAsync();

        var result = await _sut.GetSanitationFacilitiesAsync("Thon 1");

        result.Should().ContainSingle();
        result[0].Village.Should().Be("Thon 1");
        result[0].FacilityType.Should().Be("NhaTieuHopVeSinh");
    }

    [Fact]
    public async Task CreateAsync_CreatesFacility()
    {
        var result = await _sut.CreateAsync(new SanitationFacilityDto
        {
            FacilityType = "GiengKhoan",
            Address = "So 15 Thon 3",
            Village = "Thon 3",
            Status = "ChuaDat",
            Notes = "Can kiem tra chat luong nuoc"
        });

        result.Should().NotBeNull();
        result.Id.Should().NotBeEmpty();
        result.FacilityType.Should().Be("GiengKhoan");
        result.Village.Should().Be("Thon 3");

        var saved = await _db.SanitationFacilities.FindAsync(result.Id);
        saved.Should().NotBeNull();
    }

    [Fact]
    public async Task UpdateAsync_UpdatesFacility()
    {
        var facility = await SeedDataAsync();

        var result = await _sut.UpdateAsync(facility.Id, new SanitationFacilityDto
        {
            FacilityType = "NhaTieuHopVeSinh",
            Address = "So 5 Thon 1 (cap nhat)",
            Village = "Thon 1",
            Status = "KhongDat",
            Notes = "Can sua chua"
        });

        result.Should().NotBeNull();
        result.Status.Should().Be("KhongDat");
        result.Address.Should().Contain("cap nhat");

        var updated = await _db.SanitationFacilities.FindAsync(facility.Id);
        updated!.Status.Should().Be("KhongDat");
    }

    [Fact]
    public async Task DeleteAsync_SoftDeletes()
    {
        var facility = await SeedDataAsync();

        await _sut.DeleteAsync(facility.Id);

        var deleted = await _db.SanitationFacilities.FindAsync(facility.Id);
        deleted!.IsDeleted.Should().BeTrue();
    }

    [Fact]
    public async Task UpdateAsync_NonExistent_ThrowsKeyNotFoundException()
    {
        var act = () => _sut.UpdateAsync(Guid.NewGuid(), new SanitationFacilityDto
        {
            FacilityType = "Test",
            Status = "Test"
        });
        await act.Should().ThrowAsync<KeyNotFoundException>();
    }
}
