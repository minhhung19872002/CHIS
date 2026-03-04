using CHIS.Application.DTOs;
using CHIS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CHIS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PopulationController : ControllerBase
{
    private readonly IPopulationService _svc;
    public PopulationController(IPopulationService svc) => _svc = svc;

    [HttpGet("households")]
    public async Task<IActionResult> SearchHouseholds([FromQuery] HouseholdSearchDto dto)
        => Ok(await _svc.SearchHouseholdsAsync(dto));

    [HttpGet("households/{id}")]
    public async Task<IActionResult> GetHousehold(Guid id)
    {
        try { return Ok(await _svc.GetHouseholdByIdAsync(id)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpPost("households")]
    public async Task<IActionResult> CreateHousehold([FromBody] CreateHouseholdDto dto)
        => Ok(await _svc.CreateHouseholdAsync(dto));

    [HttpPut("households/{id}")]
    public async Task<IActionResult> UpdateHousehold(Guid id, [FromBody] CreateHouseholdDto dto)
    {
        try { return Ok(await _svc.UpdateHouseholdAsync(id, dto)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpPost("households/{householdId}/members/{patientId}")]
    public async Task<IActionResult> AddMember(Guid householdId, Guid patientId)
    {
        try { await _svc.AddMemberAsync(householdId, patientId); return Ok(new { message = "Member added" }); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpDelete("households/{householdId}/members/{patientId}")]
    public async Task<IActionResult> RemoveMember(Guid householdId, Guid patientId)
    {
        try { await _svc.RemoveMemberAsync(householdId, patientId); return NoContent(); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpGet("birth-certificates")]
    public async Task<IActionResult> GetBirthCertificates([FromQuery] int pageIndex = 0, [FromQuery] int pageSize = 20, [FromQuery] string? keyword = null)
        => Ok(await _svc.GetBirthCertificatesAsync(pageIndex, pageSize, keyword));

    [HttpPost("birth-certificates")]
    public async Task<IActionResult> CreateBirthCertificate([FromBody] CreateBirthCertificateDto dto)
        => Ok(await _svc.CreateBirthCertificateAsync(dto));

    [HttpGet("death-certificates")]
    public async Task<IActionResult> GetDeathCertificates([FromQuery] int pageIndex = 0, [FromQuery] int pageSize = 20, [FromQuery] string? keyword = null)
        => Ok(await _svc.GetDeathCertificatesAsync(pageIndex, pageSize, keyword));

    [HttpPost("death-certificates")]
    public async Task<IActionResult> CreateDeathCertificate([FromBody] CreateDeathCertificateDto dto)
        => Ok(await _svc.CreateDeathCertificateAsync(dto));

    [HttpGet("elderly")]
    public async Task<IActionResult> GetElderlyList([FromQuery] Guid? facilityId = null)
        => Ok(await _svc.GetElderlyListAsync(facilityId));

    [HttpPut("elderly/{patientId}")]
    public async Task<IActionResult> SaveElderlyInfo(Guid patientId, [FromBody] ElderlyInfoDto dto)
        => Ok(await _svc.SaveElderlyInfoAsync(patientId, dto));
}
