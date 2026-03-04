using CHIS.Application.DTOs;

namespace CHIS.Application.Services;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginDto dto);
    Task<LoginResponseDto> VerifyOtpAsync(VerifyOtpDto dto);
    Task<UserDto> GetCurrentUserAsync(Guid userId);
    Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto);
    Task<UserDto> CreateUserAsync(CreateUserDto dto);
    Task<UserDto> UpdateUserAsync(Guid id, UpdateUserDto dto);
    Task<PagedResult<UserDto>> GetUsersAsync(int pageIndex, int pageSize, string? keyword = null);
    Task DeleteUserAsync(Guid id);
    Task<List<RoleDto>> GetRolesAsync();
    Task<RoleDto> CreateRoleAsync(CreateRoleDto dto);
    Task<RoleDto> UpdateRoleAsync(Guid id, CreateRoleDto dto);
    Task DeleteRoleAsync(Guid id);
    Task<List<PermissionDto>> GetPermissionsAsync();
}
