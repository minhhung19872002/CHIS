using CHIS.Application.DTOs;
using CHIS.Core.Entities;
using CHIS.Infrastructure.Data;
using CHIS.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CHIS.UnitTests.Services;

public class StaffServiceTests : IDisposable
{
    private readonly CHISDbContext _db;
    private readonly UnitOfWork _uow;
    private readonly StaffService _sut;

    public StaffServiceTests()
    {
        _db = TestDbContextFactory.Create();
        _uow = new UnitOfWork(_db);
        _sut = new StaffService(_db, _uow);
    }

    public void Dispose() => _db.Dispose();

    private async Task<(Staff staff, Department department)> SeedDataAsync()
    {
        var department = new Department
        {
            Code = "KKB",
            Name = "Khoa Kham benh",
            DepartmentType = "Clinical",
            IsActive = true
        };
        await _db.Departments.AddAsync(department);

        var staff = new Staff
        {
            StaffCode = "NV000001",
            FullName = "Nguyen Van Bac Si",
            DateOfBirth = new DateTime(1985, 5, 10),
            Gender = 1,
            Position = "Bac si",
            Qualification = "Thac si",
            Specialty = "Noi khoa",
            Phone = "0901234567",
            Email = "bacsi@chis.vn",
            DepartmentId = department.Id,
            IsActive = true
        };
        await _db.Staffs.AddAsync(staff);
        await _db.SaveChangesAsync();
        return (staff, department);
    }

    [Fact]
    public async Task SearchAsync_ByKeyword()
    {
        var (staff, _) = await SeedDataAsync();

        var result = await _sut.SearchAsync(new StaffSearchDto
        {
            Keyword = "Bac Si",
            PageSize = 20
        });

        result.Items.Should().ContainSingle();
        result.Items[0].FullName.Should().Be("Nguyen Van Bac Si");
        result.Items[0].Position.Should().Be("Bac si");
    }

    [Fact]
    public async Task CreateAsync_CreatesWithAutoStaffCode()
    {
        var department = new Department { Code = "KKB", Name = "Khoa Kham benh", IsActive = true };
        await _db.Departments.AddAsync(department);
        await _db.SaveChangesAsync();

        var result = await _sut.CreateAsync(new CreateStaffDto
        {
            FullName = "Tran Thi Dieu Duong",
            DateOfBirth = new DateTime(1990, 3, 20),
            Gender = 2,
            Position = "Dieu duong",
            Qualification = "Dai hoc",
            Specialty = "Dieu duong",
            Phone = "0909876543",
            Email = "dieuduong@chis.vn",
            DepartmentId = department.Id
        });

        result.Should().NotBeNull();
        result.StaffCode.Should().StartWith("NV");
        result.FullName.Should().Be("Tran Thi Dieu Duong");
        result.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task DeleteAsync_SoftDeletes()
    {
        var (staff, _) = await SeedDataAsync();

        await _sut.DeleteAsync(staff.Id);

        var deleted = await _db.Staffs.FindAsync(staff.Id);
        deleted!.IsDeleted.Should().BeTrue();
    }

    [Fact]
    public async Task GetCollaboratorsAsync_ReturnsActiveCollaborators()
    {
        await _db.Collaborators.AddRangeAsync(
            new Collaborator { Code = "CTV0001", FullName = "Nguyen Van CTV1", Village = "Thon 1", IsActive = true },
            new Collaborator { Code = "CTV0002", FullName = "Tran Thi CTV2", Village = "Thon 2", IsActive = true },
            new Collaborator { Code = "CTV0003", FullName = "Le Van CTV3", Village = "Thon 3", IsActive = false }
        );
        await _db.SaveChangesAsync();

        var result = await _sut.GetCollaboratorsAsync();

        result.Should().HaveCount(2);
        result.Should().OnlyContain(c => c.IsActive);
    }

    [Fact]
    public async Task CreateCollaboratorAsync_CreatesWithAutoCode()
    {
        var result = await _sut.CreateCollaboratorAsync(new CollaboratorDto
        {
            FullName = "Pham Van CTV",
            Phone = "0901111222",
            Address = "Thon 4",
            Village = "Thon 4"
        });

        result.Should().NotBeNull();
        result.Code.Should().StartWith("CTV");
        result.FullName.Should().Be("Pham Van CTV");

        var saved = await _db.Collaborators.FindAsync(result.Id);
        saved.Should().NotBeNull();
        saved!.IsActive.Should().BeTrue();
    }
}
