using CHIS.Application.DTOs;
using CHIS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CHIS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ImmunizationController : ControllerBase
{
    private readonly IImmunizationService _svc;
    public ImmunizationController(IImmunizationService svc) => _svc = svc;

    [HttpGet("subjects")]
    public async Task<IActionResult> SearchSubjects([FromQuery] ImmunizationSearchDto dto)
        => Ok(await _svc.SearchSubjectsAsync(dto));

    [HttpGet("subjects/{id}")]
    public async Task<IActionResult> GetSubject(Guid id)
    {
        try { return Ok(await _svc.GetSubjectByIdAsync(id)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpPost("subjects")]
    public async Task<IActionResult> CreateSubject([FromBody] CreateImmunizationSubjectDto dto)
        => Ok(await _svc.CreateSubjectAsync(dto));

    [HttpGet("subjects/{subjectId}/vaccinations")]
    public async Task<IActionResult> GetVaccinations(Guid subjectId)
        => Ok(await _svc.GetVaccinationsAsync(subjectId));

    [HttpPost("vaccinations")]
    public async Task<IActionResult> RecordVaccination([FromBody] CreateVaccinationRecordDto dto)
        => Ok(await _svc.RecordVaccinationAsync(dto));

    [HttpGet("vaccines")]
    public async Task<IActionResult> GetVaccines()
        => Ok(await _svc.GetVaccinesAsync());

    [HttpPost("vaccines")]
    public async Task<IActionResult> CreateVaccine([FromBody] VaccineDto dto)
        => Ok(await _svc.CreateVaccineAsync(dto));

    [HttpGet("vaccine-stock")]
    public async Task<IActionResult> GetVaccineStock([FromQuery] Guid? vaccineId = null)
        => Ok(await _svc.GetVaccineStockAsync(vaccineId));

    [HttpGet("subjects/{subjectId}/nutrition")]
    public async Task<IActionResult> GetNutritionMeasurements(Guid subjectId)
        => Ok(await _svc.GetNutritionMeasurementsAsync(subjectId));

    [HttpPost("subjects/{subjectId}/nutrition")]
    public async Task<IActionResult> RecordMeasurement(Guid subjectId, [FromBody] NutritionMeasurementDto dto)
        => Ok(await _svc.RecordMeasurementAsync(subjectId, dto));

    // ---- Vaccine stock issues ----
    [HttpPost("vaccine-stock-issues")]
    public async Task<IActionResult> CreateVaccineStockIssue([FromBody] CreateVaccineStockIssueDto dto)
    {
        try { return Ok(await _svc.CreateVaccineStockIssueAsync(dto)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpGet("vaccine-stock-issues")]
    public async Task<IActionResult> GetVaccineStockIssues([FromQuery] string? issueType = null, [FromQuery] int pageIndex = 0, [FromQuery] int pageSize = 20)
        => Ok(await _svc.GetVaccineStockIssuesAsync(issueType, pageIndex, pageSize));

    // ---- Reports ----
    [HttpGet("reports/{reportCode}")]
    public async Task<IActionResult> GetReport(string reportCode, [FromQuery] int year, [FromQuery] int? month = null, [FromQuery] int? quarter = null, [FromQuery] Guid? facilityId = null)
        => Ok(await _svc.GetImmunizationReportAsync(reportCode, year, month, quarter, facilityId));

    [HttpPost("reports/{reportCode}/{reportId}/send")]
    public async Task<IActionResult> SendReport(string reportCode, Guid reportId)
    { await _svc.SendReportToUpperLevelAsync(reportCode, reportId); return Ok(new { message = "Report sent" }); }

    // ---- Print ----
    [HttpGet("subjects/{subjectId}/barcode")]
    public async Task<IActionResult> PrintBarcode(Guid subjectId)
    {
        var bytes = await _svc.PrintBarcodeAsync(subjectId);
        return File(bytes, "text/html", "barcode.html");
    }

    [HttpGet("plans/{planId}/appointment-slip")]
    public async Task<IActionResult> PrintAppointmentSlip(Guid planId)
    {
        var bytes = await _svc.PrintAppointmentSlipAsync(planId);
        return File(bytes, "text/html", "appointment-slip.html");
    }

    // ---- Stats ----
    [HttpGet("child-stats")]
    public async Task<IActionResult> GetChildStats([FromQuery] Guid? facilityId = null)
        => Ok(await _svc.GetChildStatsByAgeAsync(facilityId));
}
