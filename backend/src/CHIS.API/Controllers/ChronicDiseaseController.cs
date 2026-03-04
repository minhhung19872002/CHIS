using CHIS.Application.DTOs;
using CHIS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CHIS.API.Controllers;

[ApiController]
[Route("api/chronic-disease")]
[Authorize]
public class ChronicDiseaseController : ControllerBase
{
    private readonly IChronicDiseaseService _svc;
    public ChronicDiseaseController(IChronicDiseaseService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] ChronicDiseaseSearchDto dto)
        => Ok(await _svc.SearchAsync(dto));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try { return Ok(await _svc.GetByIdAsync(id)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpPost]
    public async Task<IActionResult> Register([FromBody] CreateChronicDiseaseRegisterDto dto)
        => Ok(await _svc.RegisterAsync(dto));

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromQuery] string status)
    {
        try { await _svc.UpdateStatusAsync(id, status); return Ok(new { message = "Status updated" }); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpGet("{registerId}/treatments")]
    public async Task<IActionResult> GetTreatments(Guid registerId)
        => Ok(await _svc.GetTreatmentsAsync(registerId));

    [HttpPost("treatments")]
    public async Task<IActionResult> AddTreatment([FromBody] CreateChronicDiseaseTreatmentDto dto)
        => Ok(await _svc.AddTreatmentAsync(dto));

    // ---- NCD Examination ----
    [HttpPost("examinations")]
    public async Task<IActionResult> CreateNcdExamination([FromBody] CreateNcdExaminationDto dto)
    {
        try { return Ok(await _svc.CreateNcdExaminationAsync(dto)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpGet("{registerId}/examinations")]
    public async Task<IActionResult> GetNcdExaminations(Guid registerId)
        => Ok(await _svc.GetNcdExaminationsAsync(registerId));

    // ---- Referral ----
    [HttpPost("referrals")]
    public async Task<IActionResult> CreateReferral([FromBody] CreateNcdReferralDto dto)
    {
        try { return Ok(await _svc.CreateReferralAsync(dto)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    // ---- Sick Leave ----
    [HttpPost("sick-leaves")]
    public async Task<IActionResult> CreateSickLeave([FromBody] CreateNcdSickLeaveDto dto)
    {
        try { return Ok(await _svc.CreateSickLeaveAsync(dto)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    // ---- Tracking books ----
    [HttpGet("tracking-books/{bookType}")]
    public async Task<IActionResult> GetTrackingBook(string bookType, [FromQuery] Guid? facilityId = null)
        => Ok(await _svc.GetTrackingBookAsync(bookType, facilityId));

    // ---- Chart data ----
    [HttpGet("{registerId}/bp-chart")]
    public async Task<IActionResult> GetBPChartData(Guid registerId)
        => Ok(await _svc.GetBPChartDataAsync(registerId));

    [HttpGet("{registerId}/glucose-chart")]
    public async Task<IActionResult> GetGlucoseChartData(Guid registerId)
        => Ok(await _svc.GetGlucoseChartDataAsync(registerId));
}
