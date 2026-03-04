using CHIS.Application.DTOs;
using CHIS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CHIS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BillingController : ControllerBase
{
    private readonly IBillingService _billingService;
    public BillingController(IBillingService billingService) => _billingService = billingService;

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var result = await _billingService.GetByIdAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] ReceiptSearchDto dto)
    {
        var result = await _billingService.SearchAsync(dto);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReceiptDto dto)
    {
        var result = await _billingService.CreateAsync(dto);
        return Ok(result);
    }

    [HttpPost("{id}/pay")]
    public async Task<IActionResult> Pay(Guid id, [FromQuery] string? paymentMethod = null)
    {
        try
        {
            var result = await _billingService.PayAsync(id, paymentMethod);
            return Ok(result);
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        try
        {
            await _billingService.CancelAsync(id);
            return Ok(new { message = "Receipt cancelled" });
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpGet("revenue")]
    public async Task<IActionResult> GetRevenue([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate, [FromQuery] Guid? facilityId = null)
    {
        var result = await _billingService.GetRevenueReportAsync(fromDate, toDate, facilityId);
        return Ok(result);
    }

    [HttpGet("by-patient/{patientId}")]
    public async Task<IActionResult> GetByPatient(Guid patientId)
    {
        var result = await _billingService.GetByPatientAsync(patientId);
        return Ok(result);
    }

    [HttpGet("by-medical-record/{medicalRecordId}")]
    public async Task<IActionResult> GetByMedicalRecord(Guid medicalRecordId)
    {
        var result = await _billingService.GetByMedicalRecordAsync(medicalRecordId);
        return Ok(result);
    }
}
