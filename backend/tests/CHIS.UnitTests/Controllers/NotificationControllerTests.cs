using System.Security.Claims;
using CHIS.API.Controllers;
using CHIS.Application.DTOs;
using CHIS.Application.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace CHIS.UnitTests.Controllers;

public class NotificationControllerTests
{
    private readonly Mock<INotificationService> _mock;
    private readonly NotificationController _sut;

    public NotificationControllerTests()
    {
        _mock = new Mock<INotificationService>();
        _sut = new NotificationController(_mock.Object);
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
    public async Task GetMyNotifications_ReturnsOk()
    {
        var userId = Guid.NewGuid();
        SetUser(userId);
        _mock.Setup(s => s.GetUserNotificationsAsync(userId, false)).ReturnsAsync(new List<NotificationDto>());
        var result = await _sut.GetMyNotifications();
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetUnreadCount_ReturnsOk()
    {
        var userId = Guid.NewGuid();
        SetUser(userId);
        _mock.Setup(s => s.GetUnreadCountAsync(userId)).ReturnsAsync(5);
        var result = await _sut.GetUnreadCount();
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task MarkAsRead_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.MarkAsReadAsync(id)).Returns(Task.CompletedTask);
        var result = await _sut.MarkAsRead(id);
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task MarkAllAsRead_ReturnsOk()
    {
        var userId = Guid.NewGuid();
        SetUser(userId);
        _mock.Setup(s => s.MarkAllAsReadAsync(userId)).Returns(Task.CompletedTask);
        var result = await _sut.MarkAllAsRead();
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task SendTestNotification_ReturnsOk()
    {
        var userId = Guid.NewGuid();
        SetUser(userId);
        _mock.Setup(s => s.CreateNotificationAsync(userId, "Test notification", "This is a test.", "info", "system")).Returns(Task.CompletedTask);
        var result = await _sut.SendTestNotification();
        result.Should().BeOfType<OkObjectResult>();
    }
}
