using CHIS.Core.Entities;
using Microsoft.Extensions.Configuration;
using Moq;

namespace CHIS.UnitTests;

public static class TestHelper
{
    public static User CreateUser(string username = "testuser", string fullName = "Test User", bool isActive = true, bool isTwoFactor = false, string? email = null)
    {
        return new User
        {
            Id = Guid.NewGuid(),
            Username = username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test@123"),
            FullName = fullName,
            Email = email,
            IsActive = isActive,
            IsTwoFactorEnabled = isTwoFactor,
            UserRoles = new List<UserRole>()
        };
    }

    public static Role CreateRole(string name = "Admin", string? description = null)
    {
        return new Role
        {
            Id = Guid.NewGuid(),
            Name = name,
            Description = description ?? $"{name} role",
            RolePermissions = new List<RolePermission>(),
            UserRoles = new List<UserRole>()
        };
    }

    public static Permission CreatePermission(string code = "admin.read", string name = "Admin Read", string module = "Admin")
    {
        return new Permission
        {
            Id = Guid.NewGuid(),
            Code = code,
            Name = name,
            Module = module
        };
    }

    public static Patient CreatePatient(string fullName = "Nguyen Van A", string code = "BN0001")
    {
        return new Patient
        {
            Id = Guid.NewGuid(),
            PatientCode = code,
            FullName = fullName,
            DateOfBirth = new DateTime(1990, 1, 1),
            Gender = 1,
            Phone = "0901234567",
            Address = "Ha Noi",
            InsuranceNumber = "HS4010012345678",
            IdentityNumber = "001090012345",
            MedicalRecords = new List<MedicalRecord>(),
            Examinations = new List<Examination>()
        };
    }

    public static Room CreateRoom(string name = "Phong kham 1")
    {
        return new Room
        {
            Id = Guid.NewGuid(),
            Name = name,
            Code = "PK01",
            RoomType = "KhamBenh",
            IsActive = true
        };
    }

    public static Medicine CreateMedicine(string name = "Paracetamol 500mg", string code = "MED001")
    {
        return new Medicine
        {
            Id = Guid.NewGuid(),
            Code = code,
            Name = name,
            Unit = "Vien",
            SellPrice = 1000m,
            IsActive = true,
            IsApproved = true
        };
    }

    public static Warehouse CreateWarehouse(string name = "Kho thuoc chinh", string code = "KHO01")
    {
        return new Warehouse
        {
            Id = Guid.NewGuid(),
            Code = code,
            Name = name,
            WarehouseType = "KhoThuoc",
            IsActive = true
        };
    }

    public static IConfiguration CreateConfiguration()
    {
        var mockConfig = new Mock<IConfiguration>();
        var mockSection = new Mock<IConfigurationSection>();

        mockConfig.Setup(c => c["Jwt:Key"]).Returns("CHIS_Test_JWT_Secret_Key_2024_Must_Be_32_Characters!");
        mockConfig.Setup(c => c["Jwt:Issuer"]).Returns("CHIS_Test");
        mockConfig.Setup(c => c["Jwt:Audience"]).Returns("CHIS_Test");

        return mockConfig.Object;
    }
}
