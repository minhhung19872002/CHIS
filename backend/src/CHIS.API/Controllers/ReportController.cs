using CHIS.Application.DTOs;
using CHIS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CHIS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportController : ControllerBase
{
    private readonly IReportService _svc;
    public ReportController(IReportService svc) => _svc = svc;

    // ---- Dashboard & Basic Statistics ----

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard([FromQuery] Guid? facilityId = null)
        => Ok(await _svc.GetDashboardAsync(facilityId));

    [HttpGet("monthly")]
    public async Task<IActionResult> GetMonthlyStatistics([FromQuery] int year, [FromQuery] int month, [FromQuery] Guid? facilityId = null)
        => Ok(await _svc.GetMonthlyStatisticsAsync(year, month, facilityId));

    [HttpGet("diseases")]
    public async Task<IActionResult> GetDiseaseStatistics([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate, [FromQuery] Guid? facilityId = null)
        => Ok(await _svc.GetDiseaseStatisticsAsync(fromDate, toDate, facilityId));

    [HttpGet("immunization-coverage")]
    public async Task<IActionResult> GetImmunizationCoverage([FromQuery] int year, [FromQuery] Guid? facilityId = null)
        => Ok(await _svc.GetImmunizationCoverageAsync(year, facilityId));

    // ---- BCX Reports (tuyen xa, Bieu 1-10) ----

    [HttpGet("bcx/{number:int}")]
    public async Task<IActionResult> GetBcxReport(int number, [FromQuery] ReportFilterDto filter)
        => Ok(await _svc.GetBcxReportAsync(number, filter));

    // ---- BCH Reports (tuyen huyen, Bieu 1-16) ----

    [HttpGet("bch/{number:int}")]
    public async Task<IActionResult> GetBchReport(int number, [FromQuery] ReportFilterDto filter)
        => Ok(await _svc.GetBchReportAsync(number, filter));

    // ---- BCX TT37 Reports (tuyen xa TT37, Bieu 1-8) ----

    [HttpGet("bcx-tt37/{number:int}")]
    public async Task<IActionResult> GetBcxTT37Report(int number, [FromQuery] ReportFilterDto filter)
        => Ok(await _svc.GetBcxTT37ReportAsync(number, filter));

    // ---- BCH TT37 Reports (tuyen huyen TT37, Bieu 1-14) ----

    [HttpGet("bch-tt37/{number:int}")]
    public async Task<IActionResult> GetBchTT37Report(int number, [FromQuery] ReportFilterDto filter)
        => Ok(await _svc.GetBchTT37ReportAsync(number, filter));

    // ---- BHYT Reports ----

    [HttpGet("bhyt/{mau}")]
    public async Task<IActionResult> GetBhytReport(string mau, [FromQuery] ReportFilterDto filter)
        => Ok(await _svc.GetBhytReportAsync(mau, filter));

    // ---- So YTCS (A1-A12) ----

    [HttpGet("so-ytcs/{soType}")]
    public async Task<IActionResult> GetSoYtcs(string soType, [FromQuery] ReportFilterDto filter)
        => Ok(await _svc.GetSoYtcsAsync(soType, filter));

    // ---- BHYT Summary ----

    [HttpGet("bhyt-summary")]
    public async Task<IActionResult> GetBhytSummary([FromQuery] ReportFilterDto filter)
        => Ok(await _svc.GetBhytSummaryAsync(filter));

    // ---- Additional Statistics ----

    [HttpGet("disease-statistics")]
    public async Task<IActionResult> GetDiseaseStatisticsReport([FromQuery] ReportFilterDto filter)
    {
        var from = filter.FromDate ?? new DateTime(filter.Year ?? DateTime.UtcNow.Year, 1, 1);
        var to = filter.ToDate ?? new DateTime(filter.Year ?? DateTime.UtcNow.Year, 12, 31);
        return Ok(await _svc.GetDiseaseStatisticsAsync(from, to, filter.FacilityId));
    }

    [HttpGet("ncd-statistics")]
    public async Task<IActionResult> GetNcdStatistics([FromQuery] ReportFilterDto filter)
        => Ok(await _svc.GetNcdStatisticsAsync(filter));

    [HttpGet("billing-summary")]
    public async Task<IActionResult> GetBillingSummary([FromQuery] ReportFilterDto filter)
        => Ok(await _svc.GetBillingSummaryAsync(filter));

    [HttpGet("general-summary")]
    public async Task<IActionResult> GetGeneralSummary([FromQuery] ReportFilterDto filter)
        => Ok(await _svc.GetGeneralSummaryAsync(filter));

    [HttpGet("patient-by-level")]
    public async Task<IActionResult> GetPatientByLevel([FromQuery] ReportFilterDto filter)
        => Ok(await _svc.GetPatientByLevelAsync(filter));

    [HttpGet("utility")]
    public async Task<IActionResult> GetUtilityReport([FromQuery] ReportFilterDto filter)
        => Ok(await _svc.GetUtilityReportAsync(filter));

    [HttpGet("pharmacy")]
    public async Task<IActionResult> GetPharmacyReport([FromQuery] ReportFilterDto filter)
        => Ok(await _svc.GetPharmacyReportAsync(filter));

    // ---- Export ----

    [HttpPost("export")]
    public async Task<IActionResult> ExportReport([FromBody] ReportExportDto dto)
    {
        var bytes = await _svc.ExportReportAsync(dto.ReportType, dto.Format, dto.Filter);
        if (bytes.Length == 0)
            return Ok(new { message = "Export not yet implemented for this report type" });

        var contentType = dto.Format == "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        var ext = dto.Format == "pdf" ? "pdf" : "xlsx";
        return File(bytes, contentType, $"{dto.ReportType}_{DateTime.UtcNow:yyyyMMdd}.{ext}");
    }
}
