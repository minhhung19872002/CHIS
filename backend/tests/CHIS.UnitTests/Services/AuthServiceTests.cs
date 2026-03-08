using CHIS.Application.DTOs;
using CHIS.Application.Services;
using CHIS.Core.Entities;
using CHIS.Infrastructure.Data;
using CHIS.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CHIS.UnitTests.Services;

public class AuthServiceTests : IDisposable
{
    private readonly CHISDbContext _db;
    private readonly UnitOfWork _uow;
    private readonly AuthService _sut;

    public AuthServiceTests()
    {
        _db = TestDbContextFactory.Create();
        _uow = new UnitOfWork(_db);
        _sut = new AuthService(_db, _uow, TestHelper.CreateConfiguration());
    }

    public void Dispose()
    {
        _db.Dispose();
    }

    // ---- Login ----

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsToken()
    {
        var role = TestHelper.CreateRole();
        role.RolePermissions = new List<RolePermission>();
        await _db.Roles.AddAsync(role);

        var user = TestHelper.CreateUser();
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123");
        await _db.Users.AddAsync(user);
        await _db.UserRoles.AddAsync(new UserRole { UserId = user.Id, RoleId = role.Id });
        await _db.SaveChangesAsync();

        var result = await _sut.LoginAsync(new LoginDto { Username = user.Username, Password = "Admin@123" });

        result.Token.Should().NotBeNullOrEmpty();
        result.User.Should().NotBeNull();
        result.User.Username.Should().Be(user.Username);
        result.RequiresOtp.Should().BeFalse();
    }

    [Fact]
    public async Task LoginAsync_InvalidPassword_ThrowsUnauthorized()
    {
        var user = TestHelper.CreateUser();
        await _db.Users.AddAsync(user);
        await _db.SaveChangesAsync();

        var act = () => _sut.LoginAsync(new LoginDto { Username = user.Username, Password = "wrong" });

        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task LoginAsync_NonExistentUser_ThrowsUnauthorized()
    {
        var act = () => _sut.LoginAsync(new LoginDto { Username = "nobody", Password = "any" });

        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task LoginAsync_InactiveUser_ThrowsUnauthorized()
    {
        var user = TestHelper.CreateUser(isActive: false);
        await _db.Users.AddAsync(user);
        await _db.SaveChangesAsync();

        var act = () => _sut.LoginAsync(new LoginDto { Username = user.Username, Password = "Test@123" });

        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task LoginAsync_TwoFactorEnabled_ReturnsOtpRequired()
    {
        var role = TestHelper.CreateRole();
        role.RolePermissions = new List<RolePermission>();
        await _db.Roles.AddAsync(role);

        var user = TestHelper.CreateUser(isTwoFactor: true, email: "test@example.com");
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123");
        await _db.Users.AddAsync(user);
        await _db.UserRoles.AddAsync(new UserRole { UserId = user.Id, RoleId = role.Id });
        await _db.SaveChangesAsync();

        var result = await _sut.LoginAsync(new LoginDto { Username = user.Username, Password = "Admin@123" });

        result.RequiresOtp.Should().BeTrue();
        result.OtpUserId.Should().Be(user.Id);
        result.MaskedEmail.Should().Contain("@example.com");
        result.Token.Should().BeEmpty();
    }

    // ---- User CRUD ----

    [Fact]
    public async Task CreateUserAsync_ValidData_ReturnsUserDto()
    {
        var result = await _sut.CreateUserAsync(new CreateUserDto
        {
            Username = "newuser",
            Password = "NewPass@123",
            FullName = "New User",
            Email = "new@test.com"
        });

        result.Username.Should().Be("newuser");
        result.FullName.Should().Be("New User");
        result.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task CreateUserAsync_DuplicateUsername_ThrowsInvalidOperation()
    {
        var user = TestHelper.CreateUser(username: "existing");
        await _db.Users.AddAsync(user);
        await _db.SaveChangesAsync();

        var act = () => _sut.CreateUserAsync(new CreateUserDto { Username = "existing", Password = "p", FullName = "n" });

        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("*already exists*");
    }

    [Fact]
    public async Task GetCurrentUserAsync_ExistingUser_ReturnsDto()
    {
        var role = TestHelper.CreateRole();
        role.RolePermissions = new List<RolePermission>();
        await _db.Roles.AddAsync(role);

        var user = TestHelper.CreateUser();
        await _db.Users.AddAsync(user);
        await _db.UserRoles.AddAsync(new UserRole { UserId = user.Id, RoleId = role.Id });
        await _db.SaveChangesAsync();

        var result = await _sut.GetCurrentUserAsync(user.Id);

        result.Id.Should().Be(user.Id);
        result.Roles.Should().Contain(role.Name);
    }

    [Fact]
    public async Task GetCurrentUserAsync_NonExistentUser_ThrowsNotFound()
    {
        var act = () => _sut.GetCurrentUserAsync(Guid.NewGuid());

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task UpdateUserAsync_ValidData_UpdatesFields()
    {
        var role = TestHelper.CreateRole();
        role.RolePermissions = new List<RolePermission>();
        await _db.Roles.AddAsync(role);

        var user = TestHelper.CreateUser();
        await _db.Users.AddAsync(user);
        await _db.UserRoles.AddAsync(new UserRole { UserId = user.Id, RoleId = role.Id });
        await _db.SaveChangesAsync();

        var result = await _sut.UpdateUserAsync(user.Id, new UpdateUserDto
        {
            FullName = "Updated Name",
            Email = "updated@test.com",
            IsActive = true
        });

        result.FullName.Should().Be("Updated Name");
        result.Email.Should().Be("updated@test.com");
    }

    [Fact]
    public async Task DeleteUserAsync_ExistingUser_SoftDeletes()
    {
        var user = TestHelper.CreateUser();
        await _db.Users.AddAsync(user);
        await _db.SaveChangesAsync();

        await _sut.DeleteUserAsync(user.Id);

        var deleted = await _db.Users.IgnoreQueryFilters().FirstAsync(u => u.Id == user.Id);
        deleted.IsDeleted.Should().BeTrue();
    }

    [Fact]
    public async Task DeleteUserAsync_NonExistentUser_ThrowsNotFound()
    {
        var act = () => _sut.DeleteUserAsync(Guid.NewGuid());

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    // ---- Password ----

    [Fact]
    public async Task ChangePasswordAsync_CorrectCurrentPassword_ChangesPassword()
    {
        var user = TestHelper.CreateUser();
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword("OldPass@123");
        await _db.Users.AddAsync(user);
        await _db.SaveChangesAsync();

        await _sut.ChangePasswordAsync(user.Id, new ChangePasswordDto
        {
            CurrentPassword = "OldPass@123",
            NewPassword = "NewPass@123"
        });

        var updated = await _db.Users.FindAsync(user.Id);
        BCrypt.Net.BCrypt.Verify("NewPass@123", updated!.PasswordHash).Should().BeTrue();
    }

    [Fact]
    public async Task ChangePasswordAsync_WrongCurrentPassword_ThrowsUnauthorized()
    {
        var user = TestHelper.CreateUser();
        await _db.Users.AddAsync(user);
        await _db.SaveChangesAsync();

        var act = () => _sut.ChangePasswordAsync(user.Id, new ChangePasswordDto
        {
            CurrentPassword = "wrong",
            NewPassword = "new"
        });

        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    // ---- Users Paging ----

    [Fact]
    public async Task GetUsersAsync_ReturnsPagedResults()
    {
        for (int i = 0; i < 5; i++)
        {
            var u = TestHelper.CreateUser(username: $"user{i}", fullName: $"User {i}");
            u.UserRoles = new List<UserRole>();
            await _db.Users.AddAsync(u);
        }
        await _db.SaveChangesAsync();

        var result = await _sut.GetUsersAsync(0, 3);

        result.Items.Should().HaveCount(3);
        result.TotalCount.Should().Be(5);
    }

    [Fact]
    public async Task GetUsersAsync_WithKeyword_FiltersResults()
    {
        var u1 = TestHelper.CreateUser(username: "admin", fullName: "Admin User");
        u1.UserRoles = new List<UserRole>();
        var u2 = TestHelper.CreateUser(username: "doctor", fullName: "Doctor Nguyen");
        u2.UserRoles = new List<UserRole>();
        await _db.Users.AddRangeAsync(u1, u2);
        await _db.SaveChangesAsync();

        var result = await _sut.GetUsersAsync(0, 20, "admin");

        result.Items.Should().ContainSingle();
        result.Items[0].Username.Should().Be("admin");
    }

    // ---- Roles ----

    [Fact]
    public async Task CreateRoleAsync_CreatesRoleWithPermissions()
    {
        var perm = TestHelper.CreatePermission();
        await _db.Permissions.AddAsync(perm);
        await _db.SaveChangesAsync();

        var result = await _sut.CreateRoleAsync(new CreateRoleDto
        {
            Name = "Nurse",
            Description = "Nurse role",
            PermissionIds = new List<Guid> { perm.Id }
        });

        result.Name.Should().Be("Nurse");
        result.Permissions.Should().Contain(perm.Code);
    }

    [Fact]
    public async Task GetRolesAsync_ReturnsAllRoles()
    {
        var role = TestHelper.CreateRole();
        await _db.Roles.AddAsync(role);
        await _db.SaveChangesAsync();

        var result = await _sut.GetRolesAsync();

        result.Should().ContainSingle();
        result[0].Name.Should().Be(role.Name);
    }

    [Fact]
    public async Task DeleteRoleAsync_SoftDeletesRole()
    {
        var role = TestHelper.CreateRole();
        await _db.Roles.AddAsync(role);
        await _db.SaveChangesAsync();

        await _sut.DeleteRoleAsync(role.Id);

        var deleted = await _db.Roles.IgnoreQueryFilters().FirstAsync(r => r.Id == role.Id);
        deleted.IsDeleted.Should().BeTrue();
    }

    // ---- Permissions ----

    [Fact]
    public async Task GetPermissionsAsync_ReturnsAll()
    {
        await _db.Permissions.AddAsync(TestHelper.CreatePermission("p1", "Perm 1"));
        await _db.Permissions.AddAsync(TestHelper.CreatePermission("p2", "Perm 2"));
        await _db.SaveChangesAsync();

        var result = await _sut.GetPermissionsAsync();

        result.Should().HaveCount(2);
    }
}
