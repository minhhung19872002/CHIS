using CHIS.Application.DTOs;
using CHIS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CHIS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EquipmentController : ControllerBase
{
    private readonly IEquipmentService _svc;
    public EquipmentController(IEquipmentService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] EquipmentSearchDto dto)
        => Ok(await _svc.SearchAsync(dto));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try { return Ok(await _svc.GetByIdAsync(id)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEquipmentDto dto)
        => Ok(await _svc.CreateAsync(dto));

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateEquipmentDto dto)
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

    [HttpPost("{equipmentId}/transfer")]
    public async Task<IActionResult> Transfer(Guid equipmentId, [FromQuery] Guid toDepartmentId, [FromQuery] string? notes = null)
    {
        try { return Ok(await _svc.TransferAsync(equipmentId, toDepartmentId, notes)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpGet("{equipmentId}/transfers")]
    public async Task<IActionResult> GetTransferHistory(Guid equipmentId)
        => Ok(await _svc.GetTransferHistoryAsync(equipmentId));
}
