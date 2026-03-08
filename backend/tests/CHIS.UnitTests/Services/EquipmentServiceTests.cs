using CHIS.Application.DTOs;
using CHIS.Core.Entities;
using CHIS.Infrastructure.Data;
using CHIS.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CHIS.UnitTests.Services;

public class EquipmentServiceTests : IDisposable
{
    private readonly CHISDbContext _db;
    private readonly UnitOfWork _uow;
    private readonly EquipmentService _sut;

    public EquipmentServiceTests()
    {
        _db = TestDbContextFactory.Create();
        _uow = new UnitOfWork(_db);
        _sut = new EquipmentService(_db, _uow);
    }

    public void Dispose() => _db.Dispose();

    private async Task<(Equipment equipment, Department department)> SeedDataAsync()
    {
        var department = new Department
        {
            Code = "KKB",
            Name = "Khoa Kham benh",
            DepartmentType = "Clinical",
            IsActive = true
        };
        await _db.Departments.AddAsync(department);

        var equipment = new Equipment
        {
            Code = "TB001",
            Name = "May sieu am",
            Model = "GE Logiq E10",
            SerialNumber = "SN12345",
            DepartmentId = department.Id,
            PurchaseDate = new DateTime(2024, 1, 15),
            PurchasePrice = 500000000m,
            CurrentValue = 500000000m,
            Status = "Active",
            AssetType = "ThietBiYTe"
        };
        await _db.Equipments.AddAsync(equipment);
        await _db.SaveChangesAsync();
        return (equipment, department);
    }

    [Fact]
    public async Task SearchAsync_ByKeywordAndDepartmentFilter()
    {
        var (_, department) = await SeedDataAsync();
        // Add another equipment in different department
        var dept2 = new Department { Code = "KXN", Name = "Khoa Xet nghiem", IsActive = true };
        await _db.Departments.AddAsync(dept2);
        await _db.Equipments.AddAsync(new Equipment
        {
            Code = "TB002", Name = "May xet nghiem", DepartmentId = dept2.Id, Status = "Active"
        });
        await _db.SaveChangesAsync();

        var result = await _sut.SearchAsync(new EquipmentSearchDto
        {
            DepartmentId = department.Id,
            PageSize = 20
        });

        result.Items.Should().ContainSingle();
        result.Items[0].Name.Should().Be("May sieu am");
        result.Items[0].DepartmentName.Should().Be("Khoa Kham benh");
    }

    [Fact]
    public async Task CreateAsync_CreatesEquipmentWithActiveStatus()
    {
        var (_, department) = await SeedDataAsync();

        var result = await _sut.CreateAsync(new CreateEquipmentDto
        {
            Code = "TB003",
            Name = "May dien tim",
            Model = "Philips TC30",
            SerialNumber = "SN67890",
            DepartmentId = department.Id,
            PurchaseDate = DateTime.UtcNow,
            PurchasePrice = 200000000m,
            AssetType = "ThietBiYTe"
        });

        result.Should().NotBeNull();
        result.Status.Should().Be("Active");
        result.Name.Should().Be("May dien tim");
        result.CurrentValue.Should().Be(200000000m);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistent_ThrowsKeyNotFoundException()
    {
        var act = () => _sut.GetByIdAsync(Guid.NewGuid());
        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task DeleteAsync_SoftDeletes()
    {
        var (equipment, _) = await SeedDataAsync();

        await _sut.DeleteAsync(equipment.Id);

        var deleted = await _db.Equipments.FindAsync(equipment.Id);
        deleted!.IsDeleted.Should().BeTrue();
    }

    [Fact]
    public async Task TransferAsync_CreatesTransferRecordAndUpdatesDepartment()
    {
        var (equipment, department) = await SeedDataAsync();
        var toDept = new Department { Code = "KXN", Name = "Khoa Xet nghiem", IsActive = true };
        await _db.Departments.AddAsync(toDept);
        await _db.SaveChangesAsync();

        var result = await _sut.TransferAsync(equipment.Id, toDept.Id, "Chuyen khoa su dung");

        result.Should().NotBeNull();
        result.EquipmentId.Should().Be(equipment.Id);
        result.FromDepartmentId.Should().Be(department.Id);
        result.ToDepartmentId.Should().Be(toDept.Id);
        result.Notes.Should().Be("Chuyen khoa su dung");

        // Verify the equipment's department was updated
        var updated = await _db.Equipments.FindAsync(equipment.Id);
        updated!.DepartmentId.Should().Be(toDept.Id);

        // Verify transfer record was created
        var transferCount = await _db.EquipmentTransfers.CountAsync(t => t.EquipmentId == equipment.Id);
        transferCount.Should().Be(1);
    }
}
