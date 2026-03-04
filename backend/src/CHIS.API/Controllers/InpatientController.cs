using CHIS.Application.DTOs;
using CHIS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CHIS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InpatientController : ControllerBase
{
    private readonly IInpatientService _inpatientService;
    public InpatientController(IInpatientService inpatientService) => _inpatientService = inpatientService;

    [HttpGet("admissions/{id}")]
    public async Task<IActionResult> GetAdmission(Guid id)
    {
        try
        {
            var result = await _inpatientService.GetAdmissionByIdAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpGet("admissions")]
    public async Task<IActionResult> SearchAdmissions([FromQuery] AdmissionSearchDto dto)
    {
        var result = await _inpatientService.SearchAdmissionsAsync(dto);
        return Ok(result);
    }

    [HttpPost("admit")]
    public async Task<IActionResult> Admit([FromBody] CreateAdmissionDto dto)
    {
        var result = await _inpatientService.AdmitAsync(dto);
        return Ok(result);
    }

    [HttpPost("discharge")]
    public async Task<IActionResult> Discharge([FromBody] CreateDischargeDto dto)
    {
        try
        {
            var result = await _inpatientService.DischargeAsync(dto);
            return Ok(result);
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpGet("beds/available/{departmentId}")]
    public async Task<IActionResult> GetAvailableBeds(Guid departmentId)
    {
        var result = await _inpatientService.GetAvailableBedsAsync(departmentId);
        return Ok(result);
    }

    [HttpPost("admissions/{admissionId}/assign-bed/{bedId}")]
    public async Task<IActionResult> AssignBed(Guid admissionId, Guid bedId)
    {
        try
        {
            await _inpatientService.AssignBedAsync(admissionId, bedId);
            return Ok(new { message = "Bed assigned" });
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpPost("admissions/{admissionId}/transfer-bed/{newBedId}")]
    public async Task<IActionResult> TransferBed(Guid admissionId, Guid newBedId)
    {
        try
        {
            await _inpatientService.TransferBedAsync(admissionId, newBedId);
            return Ok(new { message = "Bed transferred" });
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpGet("admissions/{admissionId}/treatment-sheets")]
    public async Task<IActionResult> GetTreatmentSheets(Guid admissionId)
    {
        var result = await _inpatientService.GetTreatmentSheetsAsync(admissionId);
        return Ok(result);
    }

    [HttpPost("treatment-sheets")]
    public async Task<IActionResult> CreateTreatmentSheet([FromBody] CreateTreatmentSheetDto dto)
    {
        var result = await _inpatientService.CreateTreatmentSheetAsync(dto);
        return Ok(result);
    }
}
