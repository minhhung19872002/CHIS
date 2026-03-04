using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using CHIS.Application.DTOs;
using CHIS.Application.Services;
using CHIS.Core.Entities;
using CHIS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace CHIS.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly CHISDbContext _db;
    private readonly IUnitOfWork _uow;
    private readonly IConfiguration _config;

    public AuthService(CHISDbContext db, IUnitOfWork uow, IConfiguration config)
    {
        _db = db;
        _uow = uow;
        _config = config;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role).ThenInclude(r => r.RolePermissions)
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Username == dto.Username && u.IsActive);

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid username or password");

        if (user.IsTwoFactorEnabled && !string.IsNullOrEmpty(user.Email))
        {
            var otp = GenerateOtp();
            var otpEntity = new TwoFactorOtp
            {
                UserId = user.Id,
                OtpHash = HashOtp(otp),
                ExpiresAt = DateTime.UtcNow.AddMinutes(5),
                Attempts = 0,
                IsUsed = false
            };
            await _db.TwoFactorOtps.AddAsync(otpEntity);
            await _uow.SaveChangesAsync();

            return new LoginResponseDto
            {
                RequiresOtp = true,
                OtpUserId = user.Id,
                MaskedEmail = MaskEmail(user.Email)
            };
        }

        return new LoginResponseDto
        {
            Token = GenerateJwt(user),
            User = MapUserDto(user)
        };
    }

    public async Task<LoginResponseDto> VerifyOtpAsync(VerifyOtpDto dto)
    {
        var otp = await _db.TwoFactorOtps
            .Where(o => o.UserId == dto.UserId && !o.IsUsed && o.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (otp == null) throw new UnauthorizedAccessException("OTP expired or not found");
        if (otp.Attempts >= 3) throw new UnauthorizedAccessException("Too many attempts");

        if (HashOtp(dto.Otp) != otp.OtpHash)
        {
            otp.Attempts++;
            await _uow.SaveChangesAsync();
            throw new UnauthorizedAccessException("Invalid OTP");
        }

        otp.IsUsed = true;
        await _uow.SaveChangesAsync();

        var user = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role).ThenInclude(r => r.RolePermissions)
            .Include(u => u.Department)
            .FirstAsync(u => u.Id == dto.UserId);

        return new LoginResponseDto
        {
            Token = GenerateJwt(user),
            User = MapUserDto(user)
        };
    }

    public async Task<UserDto> GetCurrentUserAsync(Guid userId)
    {
        var user = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role).ThenInclude(r => r.RolePermissions)
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new KeyNotFoundException("User not found");
        return MapUserDto(user);
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto)
    {
        var user = await _db.Users.FindAsync(userId) ?? throw new KeyNotFoundException("User not found");
        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            throw new UnauthorizedAccessException("Current password is incorrect");
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _uow.SaveChangesAsync();
    }

    public async Task<UserDto> CreateUserAsync(CreateUserDto dto)
    {
        var existing = await _db.Users.AnyAsync(u => u.Username == dto.Username);
        if (existing) throw new InvalidOperationException("Username already exists");

        var user = new User
        {
            Username = dto.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            FullName = dto.FullName,
            Email = dto.Email,
            Phone = dto.Phone,
            EmployeeCode = dto.EmployeeCode,
            DepartmentId = dto.DepartmentId,
            Position = dto.Position,
            IsActive = true
        };
        await _db.Users.AddAsync(user);

        if (dto.RoleIds?.Any() == true)
        {
            foreach (var roleId in dto.RoleIds)
                await _db.UserRoles.AddAsync(new UserRole { UserId = user.Id, RoleId = roleId });
        }

        await _uow.SaveChangesAsync();
        return await GetCurrentUserAsync(user.Id);
    }

    public async Task<UserDto> UpdateUserAsync(Guid id, UpdateUserDto dto)
    {
        var user = await _db.Users.FindAsync(id) ?? throw new KeyNotFoundException("User not found");
        user.FullName = dto.FullName;
        user.Email = dto.Email;
        user.Phone = dto.Phone;
        user.EmployeeCode = dto.EmployeeCode;
        user.DepartmentId = dto.DepartmentId;
        user.Position = dto.Position;
        user.IsActive = dto.IsActive;

        if (dto.RoleIds != null)
        {
            var existingRoles = await _db.UserRoles.Where(ur => ur.UserId == id).ToListAsync();
            _db.UserRoles.RemoveRange(existingRoles);
            foreach (var roleId in dto.RoleIds)
                await _db.UserRoles.AddAsync(new UserRole { UserId = id, RoleId = roleId });
        }

        await _uow.SaveChangesAsync();
        return await GetCurrentUserAsync(id);
    }

    public async Task<PagedResult<UserDto>> GetUsersAsync(int pageIndex, int pageSize, string? keyword = null)
    {
        var query = _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Include(u => u.Department)
            .AsQueryable();

        if (!string.IsNullOrEmpty(keyword))
            query = query.Where(u => u.FullName.Contains(keyword) || u.Username.Contains(keyword));

        var total = await query.CountAsync();
        var items = await query.OrderBy(u => u.FullName).Skip(pageIndex * pageSize).Take(pageSize).ToListAsync();

        return new PagedResult<UserDto>
        {
            Items = items.Select(MapUserDto).ToList(),
            TotalCount = total,
            PageIndex = pageIndex,
            PageSize = pageSize
        };
    }

    public async Task DeleteUserAsync(Guid id)
    {
        var user = await _db.Users.FindAsync(id) ?? throw new KeyNotFoundException("User not found");
        user.IsDeleted = true;
        await _uow.SaveChangesAsync();
    }

    public async Task<List<RoleDto>> GetRolesAsync()
    {
        var roles = await _db.Roles
            .Include(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
            .ToListAsync();
        return roles.Select(r => new RoleDto
        {
            Id = r.Id,
            Name = r.Name,
            Description = r.Description,
            Permissions = r.RolePermissions.Select(rp => rp.Permission.Code).ToList()
        }).ToList();
    }

    public async Task<RoleDto> CreateRoleAsync(CreateRoleDto dto)
    {
        var role = new Role { Name = dto.Name, Description = dto.Description };
        await _db.Roles.AddAsync(role);
        if (dto.PermissionIds?.Any() == true)
        {
            foreach (var pid in dto.PermissionIds)
                await _db.RolePermissions.AddAsync(new RolePermission { RoleId = role.Id, PermissionId = pid });
        }
        await _uow.SaveChangesAsync();
        return (await GetRolesAsync()).First(r => r.Id == role.Id);
    }

    public async Task<RoleDto> UpdateRoleAsync(Guid id, CreateRoleDto dto)
    {
        var role = await _db.Roles.FindAsync(id) ?? throw new KeyNotFoundException("Role not found");
        role.Name = dto.Name;
        role.Description = dto.Description;
        var existing = await _db.RolePermissions.Where(rp => rp.RoleId == id).ToListAsync();
        _db.RolePermissions.RemoveRange(existing);
        if (dto.PermissionIds?.Any() == true)
        {
            foreach (var pid in dto.PermissionIds)
                await _db.RolePermissions.AddAsync(new RolePermission { RoleId = id, PermissionId = pid });
        }
        await _uow.SaveChangesAsync();
        return (await GetRolesAsync()).First(r => r.Id == id);
    }

    public async Task DeleteRoleAsync(Guid id)
    {
        var role = await _db.Roles.FindAsync(id) ?? throw new KeyNotFoundException("Role not found");
        role.IsDeleted = true;
        await _uow.SaveChangesAsync();
    }

    public async Task<List<PermissionDto>> GetPermissionsAsync()
    {
        return await _db.Permissions.Select(p => new PermissionDto
        {
            Id = p.Id, Code = p.Code, Name = p.Name, Module = p.Module
        }).ToListAsync();
    }

    // ---- Helpers ----
    private string GenerateJwt(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "CHIS_Default_JWT_Secret_Key_2024_Must_Be_32_Chars!"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Username),
            new("fullName", user.FullName)
        };
        foreach (var ur in user.UserRoles)
            claims.Add(new(ClaimTypes.Role, ur.Role.Name));

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? "CHIS",
            audience: _config["Jwt:Audience"] ?? "CHIS",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(12),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static UserDto MapUserDto(User user) => new()
    {
        Id = user.Id,
        Username = user.Username,
        FullName = user.FullName,
        Email = user.Email,
        Phone = user.Phone,
        EmployeeCode = user.EmployeeCode,
        DepartmentId = user.DepartmentId,
        DepartmentName = user.Department?.Name,
        Position = user.Position,
        IsActive = user.IsActive,
        IsTwoFactorEnabled = user.IsTwoFactorEnabled,
        Roles = user.UserRoles.Select(ur => ur.Role.Name).ToList(),
        Permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission?.Code ?? "")
            .Where(c => !string.IsNullOrEmpty(c))
            .Distinct().ToList()
    };

    private static string GenerateOtp() => RandomNumberGenerator.GetInt32(100000, 999999).ToString();
    private static string HashOtp(string otp)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(otp));
        return Convert.ToBase64String(bytes);
    }
    private static string MaskEmail(string email)
    {
        var parts = email.Split('@');
        if (parts.Length != 2) return "***@***";
        var name = parts[0];
        var masked = name.Length <= 2 ? "**" : name[..2] + new string('*', name.Length - 2);
        return $"{masked}@{parts[1]}";
    }
}
