using CHIS.Application.DTOs;
using CHIS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CHIS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SystemController : ControllerBase
{
    private readonly ISystemService _svc;
    public SystemController(ISystemService svc) => _svc = svc;

    // ---- System Configs ----
    [HttpGet("configs")]
    public async Task<IActionResult> GetConfigs([FromQuery] string? module = null)
        => Ok(await _svc.GetConfigsAsync(module));

    [HttpPost("configs")]
    public async Task<IActionResult> SaveConfig([FromBody] SystemConfigDto dto)
        => Ok(await _svc.SaveConfigAsync(dto));

    // ---- Facilities ----
    [HttpGet("facilities")]
    public async Task<IActionResult> GetFacilities()
        => Ok(await _svc.GetFacilitiesAsync());

    [HttpPost("facilities")]
    public async Task<IActionResult> CreateFacility([FromBody] CreateFacilityDto dto)
        => Ok(await _svc.CreateFacilityAsync(dto));

    [HttpPut("facilities/{id}")]
    public async Task<IActionResult> UpdateFacility(Guid id, [FromBody] CreateFacilityDto dto)
    {
        try { return Ok(await _svc.UpdateFacilityAsync(id, dto)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    // ---- Departments ----
    [HttpGet("departments")]
    public async Task<IActionResult> GetDepartments([FromQuery] Guid? facilityId = null)
        => Ok(await _svc.GetDepartmentsAsync(facilityId));

    [HttpPost("departments")]
    public async Task<IActionResult> CreateDepartment([FromBody] CreateDepartmentDto dto)
        => Ok(await _svc.CreateDepartmentAsync(dto));

    [HttpPut("departments/{id}")]
    public async Task<IActionResult> UpdateDepartment(Guid id, [FromBody] CreateDepartmentDto dto)
    {
        try { return Ok(await _svc.UpdateDepartmentAsync(id, dto)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    // ---- Rooms ----
    [HttpGet("rooms")]
    public async Task<IActionResult> GetRooms([FromQuery] Guid? departmentId = null)
        => Ok(await _svc.GetRoomsAsync(departmentId));

    [HttpPost("rooms")]
    public async Task<IActionResult> CreateRoom([FromBody] CreateRoomDto dto)
        => Ok(await _svc.CreateRoomAsync(dto));

    // ---- ICD Codes ----
    [HttpGet("icd-codes")]
    public async Task<IActionResult> SearchIcdCodes([FromQuery] IcdSearchDto dto)
        => Ok(await _svc.SearchIcdCodesAsync(dto));

    // ---- Audit Logs ----
    [HttpGet("audit-logs")]
    public async Task<IActionResult> GetAuditLogs([FromQuery] AuditLogSearchDto dto)
        => Ok(await _svc.GetAuditLogsAsync(dto));
}
