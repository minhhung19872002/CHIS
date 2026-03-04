using System.Security.Claims;
using CHIS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CHIS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _svc;
    public NotificationController(INotificationService svc) => _svc = svc;

    [HttpGet("my")]
    public async Task<IActionResult> GetMyNotifications([FromQuery] bool unreadOnly = false)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();
        return Ok(await _svc.GetUserNotificationsAsync(userId.Value, unreadOnly));
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();
        return Ok(new { count = await _svc.GetUnreadCountAsync(userId.Value) });
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        await _svc.MarkAsReadAsync(id);
        return Ok(new { message = "Marked as read" });
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();
        await _svc.MarkAllAsReadAsync(userId.Value);
        return Ok(new { message = "All marked as read" });
    }

    [HttpPost("test")]
    public async Task<IActionResult> SendTestNotification()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();
        await _svc.CreateNotificationAsync(userId.Value, "Test notification", "This is a test.", "info", "system");
        return Ok(new { message = "Test notification sent" });
    }

    private Guid? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return claim != null && Guid.TryParse(claim.Value, out var id) ? id : null;
    }
}
