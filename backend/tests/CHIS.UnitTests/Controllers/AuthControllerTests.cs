using System.Security.Claims;
using CHIS.API.Controllers;
using CHIS.Application.DTOs;
using CHIS.Application.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace CHIS.UnitTests.Controllers;

public class AuthControllerTests
{
    private readonly Mock<IAuthService> _mockAuthService;
    private readonly AuthController _sut;

    public AuthControllerTests()
    {
        _mockAuthService = new Mock<IAuthService>();
        _sut = new AuthController(_mockAuthService.Object);
    }

    private void SetUser(Guid userId)
    {
        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, userId.ToString()) };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);
        _sut.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsOk()
    {
        var loginDto = new LoginDto { Username = "admin", Password = "Admin@123" };
        var response = new LoginResponseDto
        {
            Token = "jwt_token",
            User = new UserDto { Id = Guid.NewGuid(), Username = "admin", FullName = "Admin" }
        };
        _mockAuthService.Setup(s => s.LoginAsync(loginDto)).ReturnsAsync(response);

        var result = await _sut.Login(loginDto);

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var data = okResult.Value.Should().BeOfType<LoginResponseDto>().Subject;
        data.Token.Should().Be("jwt_token");
    }

    [Fact]
    public async Task Login_InvalidCredentials_ReturnsUnauthorized()
    {
        var loginDto = new LoginDto { Username = "admin", Password = "wrong" };
        _mockAuthService.Setup(s => s.LoginAsync(loginDto))
            .ThrowsAsync(new UnauthorizedAccessException("Invalid username or password"));

        var result = await _sut.Login(loginDto);

        result.Should().BeOfType<UnauthorizedObjectResult>();
    }

    [Fact]
    public async Task VerifyOtp_Valid_ReturnsOk()
    {
        var dto = new VerifyOtpDto { UserId = Guid.NewGuid(), Otp = "123456" };
        var response = new LoginResponseDto
        {
            Token = "jwt_token",
            User = new UserDto { Id = dto.UserId, Username = "admin", FullName = "Admin" }
        };
        _mockAuthService.Setup(s => s.VerifyOtpAsync(dto)).ReturnsAsync(response);

        var result = await _sut.VerifyOtp(dto);

        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task VerifyOtp_Invalid_ReturnsUnauthorized()
    {
        var dto = new VerifyOtpDto { UserId = Guid.NewGuid(), Otp = "wrong" };
        _mockAuthService.Setup(s => s.VerifyOtpAsync(dto))
            .ThrowsAsync(new UnauthorizedAccessException("Invalid OTP"));

        var result = await _sut.VerifyOtp(dto);

        result.Should().BeOfType<UnauthorizedObjectResult>();
    }

    [Fact]
    public async Task GetCurrentUser_Authenticated_ReturnsOk()
    {
        var userId = Guid.NewGuid();
        SetUser(userId);
        var userDto = new UserDto { Id = userId, Username = "admin", FullName = "Admin" };
        _mockAuthService.Setup(s => s.GetCurrentUserAsync(userId)).ReturnsAsync(userDto);

        var result = await _sut.GetCurrentUser();

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var data = okResult.Value.Should().BeOfType<UserDto>().Subject;
        data.Id.Should().Be(userId);
    }

    [Fact]
    public async Task GetCurrentUser_NoUserClaim_ReturnsUnauthorized()
    {
        _sut.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };

        var result = await _sut.GetCurrentUser();

        result.Should().BeOfType<UnauthorizedResult>();
    }

    [Fact]
    public async Task GetCurrentUser_UserNotFound_ReturnsNotFound()
    {
        var userId = Guid.NewGuid();
        SetUser(userId);
        _mockAuthService.Setup(s => s.GetCurrentUserAsync(userId))
            .ThrowsAsync(new KeyNotFoundException());

        var result = await _sut.GetCurrentUser();

        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task ChangePassword_Valid_ReturnsOk()
    {
        var userId = Guid.NewGuid();
        SetUser(userId);
        var dto = new ChangePasswordDto { CurrentPassword = "old", NewPassword = "new" };
        _mockAuthService.Setup(s => s.ChangePasswordAsync(userId, dto)).Returns(Task.CompletedTask);

        var result = await _sut.ChangePassword(dto);

        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task ChangePassword_WrongCurrent_ReturnsBadRequest()
    {
        var userId = Guid.NewGuid();
        SetUser(userId);
        var dto = new ChangePasswordDto { CurrentPassword = "wrong", NewPassword = "new" };
        _mockAuthService.Setup(s => s.ChangePasswordAsync(userId, dto))
            .ThrowsAsync(new UnauthorizedAccessException("Current password is incorrect"));

        var result = await _sut.ChangePassword(dto);

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task CreateUser_Valid_ReturnsOk()
    {
        var dto = new CreateUserDto { Username = "new", Password = "p", FullName = "New" };
        var userDto = new UserDto { Id = Guid.NewGuid(), Username = "new", FullName = "New" };
        _mockAuthService.Setup(s => s.CreateUserAsync(dto)).ReturnsAsync(userDto);

        var result = await _sut.CreateUser(dto);

        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task CreateUser_Duplicate_ReturnsBadRequest()
    {
        var dto = new CreateUserDto { Username = "existing", Password = "p", FullName = "E" };
        _mockAuthService.Setup(s => s.CreateUserAsync(dto))
            .ThrowsAsync(new InvalidOperationException("Username already exists"));

        var result = await _sut.CreateUser(dto);

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task DeleteUser_Existing_ReturnsNoContent()
    {
        var id = Guid.NewGuid();
        _mockAuthService.Setup(s => s.DeleteUserAsync(id)).Returns(Task.CompletedTask);

        var result = await _sut.DeleteUser(id);

        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public async Task DeleteUser_NotFound_ReturnsNotFound()
    {
        var id = Guid.NewGuid();
        _mockAuthService.Setup(s => s.DeleteUserAsync(id))
            .ThrowsAsync(new KeyNotFoundException());

        var result = await _sut.DeleteUser(id);

        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task GetRoles_ReturnsOk()
    {
        _mockAuthService.Setup(s => s.GetRolesAsync())
            .ReturnsAsync(new List<RoleDto> { new() { Name = "Admin" } });

        var result = await _sut.GetRoles();

        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetPermissions_ReturnsOk()
    {
        _mockAuthService.Setup(s => s.GetPermissionsAsync())
            .ReturnsAsync(new List<PermissionDto>());

        var result = await _sut.GetPermissions();

        result.Should().BeOfType<OkObjectResult>();
    }
}
