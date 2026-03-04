using CHIS.Application.DTOs;
using CHIS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CHIS.API.Controllers;

[ApiController]
[Route("api/environmental-health")]
[Authorize]
public class EnvironmentalHealthController : ControllerBase
{
    private readonly IEnvironmentalHealthService _svc;
    public EnvironmentalHealthController(IEnvironmentalHealthService svc) => _svc = svc;

    [HttpGet("sanitation")]
    public async Task<IActionResult> GetSanitationFacilities([FromQuery] string? village = null)
        => Ok(await _svc.GetSanitationFacilitiesAsync(village));

    [HttpPost("sanitation")]
    public async Task<IActionResult> Create([FromBody] SanitationFacilityDto dto)
        => Ok(await _svc.CreateAsync(dto));

    [HttpPut("sanitation/{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] SanitationFacilityDto dto)
    {
        try { return Ok(await _svc.UpdateAsync(id, dto)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpDelete("sanitation/{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try { await _svc.DeleteAsync(id); return NoContent(); }
        catch (KeyNotFoundException) { return NotFound(); }
    }
}
