using CHIS.Application.DTOs;
using CHIS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CHIS.API.Controllers;

[ApiController]
[Route("api/communicable-disease")]
[Authorize]
public class CommunicableDiseaseController : ControllerBase
{
    private readonly ICommunicableDiseaseService _svc;
    public CommunicableDiseaseController(ICommunicableDiseaseService svc) => _svc = svc;

    [HttpGet("cases")]
    public async Task<IActionResult> SearchCases([FromQuery] DiseaseCaseSearchDto dto)
        => Ok(await _svc.SearchCasesAsync(dto));

    [HttpGet("cases/{id}")]
    public async Task<IActionResult> GetCase(Guid id)
    {
        try { return Ok(await _svc.GetCaseByIdAsync(id)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpPost("cases")]
    public async Task<IActionResult> ReportCase([FromBody] CreateDiseaseCaseDto dto)
        => Ok(await _svc.ReportCaseAsync(dto));

    [HttpPut("cases/{id}/outcome")]
    public async Task<IActionResult> UpdateOutcome(Guid id, [FromQuery] string outcome)
    {
        try { await _svc.UpdateCaseOutcomeAsync(id, outcome); return Ok(new { message = "Outcome updated" }); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpGet("weekly-reports")]
    public async Task<IActionResult> GetWeeklyReports([FromQuery] int year, [FromQuery] Guid facilityId)
        => Ok(await _svc.GetWeeklyReportsAsync(year, facilityId));

    [HttpPost("weekly-reports")]
    public async Task<IActionResult> CreateWeeklyReport([FromQuery] int year, [FromQuery] int week, [FromQuery] Guid facilityId, [FromBody] string reportData)
        => Ok(await _svc.CreateWeeklyReportAsync(year, week, facilityId, reportData));

    [HttpGet("monthly-reports")]
    public async Task<IActionResult> GetMonthlyReports([FromQuery] int year, [FromQuery] Guid facilityId)
        => Ok(await _svc.GetMonthlyReportsAsync(year, facilityId));

    [HttpPost("monthly-reports")]
    public async Task<IActionResult> CreateMonthlyReport([FromQuery] int year, [FromQuery] int month, [FromQuery] Guid facilityId, [FromBody] string reportData)
        => Ok(await _svc.CreateMonthlyReportAsync(year, month, facilityId, reportData));
}
