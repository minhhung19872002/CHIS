using CHIS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CHIS.API.Controllers;

[ApiController]
[Route("api/data-interop")]
[Authorize]
public class DataInteropController : ControllerBase
{
    private readonly IDataInteropService _svc;
    public DataInteropController(IDataInteropService svc) => _svc = svc;

    [HttpGet("sync-logs")]
    public async Task<IActionResult> GetSyncLogs([FromQuery] string? syncType = null, [FromQuery] int pageIndex = 0, [FromQuery] int pageSize = 20)
        => Ok(await _svc.GetSyncLogsAsync(syncType, pageIndex, pageSize));

    [HttpPost("sync/bhyt/{facilityId}")]
    public async Task<IActionResult> SyncBhyt(Guid facilityId)
    {
        try { return Ok(await _svc.SyncBhytAsync(facilityId)); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("sync/hssk/{facilityId}")]
    public async Task<IActionResult> SyncHssk(Guid facilityId)
    {
        try { return Ok(await _svc.SyncHsskAsync(facilityId)); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }
}
