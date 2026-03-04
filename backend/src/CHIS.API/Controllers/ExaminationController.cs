using CHIS.Application.DTOs;
using CHIS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CHIS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExaminationController : ControllerBase
{
    private readonly IExaminationService _examinationService;
    public ExaminationController(IExaminationService examinationService) => _examinationService = examinationService;

    // ============================================================
    // EXISTING ENDPOINTS
    // ============================================================

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var result = await _examinationService.GetByIdAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] ExaminationSearchDto dto)
    {
        var result = await _examinationService.SearchAsync(dto);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateExaminationDto dto)
    {
        var result = await _examinationService.CreateAsync(dto);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateExaminationDto dto)
    {
        try
        {
            var result = await _examinationService.UpdateAsync(id, dto);
            return Ok(result);
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpPost("{id}/complete")]
    public async Task<IActionResult> Complete(Guid id)
    {
        try
        {
            await _examinationService.CompleteExaminationAsync(id);
            return Ok(new { message = "Examination completed" });
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpGet("queue/{roomId}")]
    public async Task<IActionResult> GetQueue(Guid roomId)
    {
        var result = await _examinationService.GetQueueByRoomAsync(roomId);
        return Ok(result);
    }

    [HttpPost("queue/{roomId}/call-next")]
    public async Task<IActionResult> CallNext(Guid roomId)
    {
        try
        {
            var result = await _examinationService.CallNextAsync(roomId);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("queue/{ticketId}/cancel")]
    public async Task<IActionResult> CancelTicket(Guid ticketId)
    {
        try
        {
            await _examinationService.CancelQueueTicketAsync(ticketId);
            return NoContent();
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    // ============================================================
    // SPECIALIZED MEDICAL RECORDS (14 types)
    // ============================================================

    [HttpGet("specialized-records")]
    public async Task<IActionResult> GetSpecializedRecords([FromQuery] Guid patientId, [FromQuery] string? recordType)
    {
        var result = await _examinationService.GetSpecializedRecordsAsync(patientId, recordType);
        return Ok(result);
    }

    [HttpPost("specialized-records")]
    public async Task<IActionResult> CreateSpecializedRecord([FromBody] CreateSpecializedRecordDto dto)
    {
        var result = await _examinationService.CreateSpecializedRecordAsync(dto);
        return Ok(result);
    }

    [HttpPut("specialized-records/{id}")]
    public async Task<IActionResult> UpdateSpecializedRecord(Guid id, [FromBody] CreateSpecializedRecordDto dto)
    {
        try
        {
            var result = await _examinationService.UpdateSpecializedRecordAsync(id, dto);
            return Ok(result);
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpDelete("specialized-records/{id}")]
    public async Task<IActionResult> DeleteSpecializedRecord(Guid id)
    {
        try
        {
            await _examinationService.DeleteSpecializedRecordAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpGet("specialized-records/{id}/print")]
    public async Task<IActionResult> PrintSpecializedRecord(Guid id)
    {
        try
        {
            var html = await _examinationService.PrintSpecializedRecordAsync(id);
            return File(html, "text/html", "specialized-record.html");
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    // ============================================================
    // TRACKING BOOKS (8 types)
    // ============================================================

    [HttpGet("tracking-books")]
    public async Task<IActionResult> GetTrackingBookEntries([FromQuery] Guid patientId, [FromQuery] string bookType)
    {
        var result = await _examinationService.GetTrackingBookEntriesAsync(patientId, bookType);
        return Ok(result);
    }

    [HttpPost("tracking-books")]
    public async Task<IActionResult> CreateTrackingBookEntry([FromBody] CreateTrackingBookEntryDto dto)
    {
        var result = await _examinationService.CreateTrackingBookEntryAsync(dto);
        return Ok(result);
    }

    [HttpPut("tracking-books/{id}")]
    public async Task<IActionResult> UpdateTrackingBookEntry(Guid id, [FromBody] CreateTrackingBookEntryDto dto)
    {
        try
        {
            var result = await _examinationService.UpdateTrackingBookEntryAsync(id, dto);
            return Ok(result);
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpDelete("tracking-books/{id}")]
    public async Task<IActionResult> DeleteTrackingBookEntry(Guid id)
    {
        try
        {
            await _examinationService.DeleteTrackingBookEntryAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    // ============================================================
    // VITAL SIGN CHARTS
    // ============================================================

    [HttpGet("vital-chart")]
    public async Task<IActionResult> GetVitalSignChart(
        [FromQuery] Guid patientId, [FromQuery] string chartType,
        [FromQuery] DateTime from, [FromQuery] DateTime to)
    {
        var result = await _examinationService.GetVitalSignChartAsync(patientId, chartType, from, to);
        return Ok(result);
    }

    // ============================================================
    // INFUSION / OXYTOCIN / SURGERY RECORDS
    // ============================================================

    [HttpPost("infusion-records")]
    public async Task<IActionResult> CreateInfusionRecord([FromBody] CreateInfusionRecordDto dto)
    {
        var result = await _examinationService.CreateInfusionRecordAsync(dto);
        return Ok(result);
    }

    [HttpPost("oxytocin-records")]
    public async Task<IActionResult> CreateOxytocinRecord([FromBody] CreateOxytocinRecordDto dto)
    {
        var result = await _examinationService.CreateOxytocinRecordAsync(dto);
        return Ok(result);
    }

    [HttpPost("surgery-records")]
    public async Task<IActionResult> CreateSurgeryRecord([FromBody] CreateSurgeryRecordDto dto)
    {
        var result = await _examinationService.CreateSurgeryRecordAsync(dto);
        return Ok(result);
    }

    // ============================================================
    // PATIENT TYPE CHANGE
    // ============================================================

    [HttpPut("{id}/change-type")]
    public async Task<IActionResult> ChangePatientType(Guid id, [FromBody] ChangePatientTypeDto dto)
    {
        try
        {
            await _examinationService.ChangePatientTypeAsync(id, dto.NewType);
            return Ok(new { message = "Patient type changed" });
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    // ============================================================
    // ONLINE BOOKINGS
    // ============================================================

    [HttpGet("online-bookings")]
    public async Task<IActionResult> GetOnlineBookings([FromQuery] OnlineBookingSearchDto dto)
    {
        var result = await _examinationService.GetOnlineBookingsAsync(dto);
        return Ok(result);
    }

    // ============================================================
    // PATIENTS BY LEVEL
    // ============================================================

    [HttpGet("patients-by-level")]
    public async Task<IActionResult> GetPatientsByLevel([FromQuery] string level)
    {
        var result = await _examinationService.GetPatientsByLevelAsync(level);
        return Ok(result);
    }

    // ============================================================
    // REFERENCE DATA
    // ============================================================

    [HttpGet("record-types")]
    public IActionResult GetRecordTypes()
    {
        var types = RecordTypes.All.Select(t => new { value = t, label = RecordTypes.Labels[t] });
        return Ok(types);
    }

    [HttpGet("tracking-book-types")]
    public IActionResult GetTrackingBookTypes()
    {
        var types = TrackingBookTypes.All.Select(t => new { value = t, label = TrackingBookTypes.Labels[t] });
        return Ok(types);
    }
}
