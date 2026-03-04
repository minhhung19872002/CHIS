using CHIS.Application.DTOs;
using CHIS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CHIS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StaffController : ControllerBase
{
    private readonly IStaffService _svc;
    public StaffController(IStaffService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] StaffSearchDto dto)
        => Ok(await _svc.SearchAsync(dto));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try { return Ok(await _svc.GetByIdAsync(id)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateStaffDto dto)
        => Ok(await _svc.CreateAsync(dto));

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateStaffDto dto)
    {
        try { return Ok(await _svc.UpdateAsync(id, dto)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try { await _svc.DeleteAsync(id); return NoContent(); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpGet("collaborators")]
    public async Task<IActionResult> GetCollaborators([FromQuery] Guid? facilityId = null)
        => Ok(await _svc.GetCollaboratorsAsync(facilityId));

    [HttpPost("collaborators")]
    public async Task<IActionResult> CreateCollaborator([FromBody] CollaboratorDto dto)
        => Ok(await _svc.CreateCollaboratorAsync(dto));
}
