using System.Security.Claims;
using CHIS.Application.DTOs;
using CHIS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CHIS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    public AuthController(IAuthService authService) => _authService = authService;

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        try
        {
            var result = await _authService.LoginAsync(dto);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("verify-otp")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto dto)
    {
        try
        {
            var result = await _authService.VerifyOtpAsync(dto);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();
        try
        {
            var user = await _authService.GetCurrentUserAsync(userId.Value);
            return Ok(user);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();
        try
        {
            await _authService.ChangePasswordAsync(userId.Value, dto);
            return Ok(new { message = "Password changed successfully" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("users")]
    [Authorize]
    public async Task<IActionResult> GetUsers([FromQuery] int pageIndex = 0, [FromQuery] int pageSize = 20, [FromQuery] string? keyword = null)
    {
        var result = await _authService.GetUsersAsync(pageIndex, pageSize, keyword);
        return Ok(result);
    }

    [HttpPost("users")]
    [Authorize]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
    {
        try
        {
            var result = await _authService.CreateUserAsync(dto);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("users/{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
    {
        try
        {
            var result = await _authService.UpdateUserAsync(id, dto);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("users/{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        try
        {
            await _authService.DeleteUserAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpGet("roles")]
    [Authorize]
    public async Task<IActionResult> GetRoles()
    {
        var result = await _authService.GetRolesAsync();
        return Ok(result);
    }

    [HttpPost("roles")]
    [Authorize]
    public async Task<IActionResult> CreateRole([FromBody] CreateRoleDto dto)
    {
        var result = await _authService.CreateRoleAsync(dto);
        return Ok(result);
    }

    [HttpPut("roles/{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateRole(Guid id, [FromBody] CreateRoleDto dto)
    {
        try
        {
            var result = await _authService.UpdateRoleAsync(id, dto);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("roles/{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteRole(Guid id)
    {
        try
        {
            await _authService.DeleteRoleAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpGet("permissions")]
    [Authorize]
    public async Task<IActionResult> GetPermissions()
    {
        var result = await _authService.GetPermissionsAsync();
        return Ok(result);
    }


    private Guid? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return claim != null && Guid.TryParse(claim.Value, out var id) ? id : null;
    }
}
