using CHIS.Application.DTOs;
using CHIS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CHIS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PatientController : ControllerBase
{
    private readonly IPatientService _patientService;
    public PatientController(IPatientService patientService) => _patientService = patientService;

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var result = await _patientService.GetByIdAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] PatientSearchDto dto)
    {
        var result = await _patientService.SearchAsync(dto);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePatientDto dto)
    {
        var result = await _patientService.CreateAsync(dto);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePatientDto dto)
    {
        try
        {
            var result = await _patientService.UpdateAsync(id, dto);
            return Ok(result);
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _patientService.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpGet("by-insurance/{insuranceNumber}")]
    public async Task<IActionResult> GetByInsuranceNumber(string insuranceNumber)
    {
        var result = await _patientService.GetByInsuranceNumberAsync(insuranceNumber);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpGet("by-identity/{identityNumber}")]
    public async Task<IActionResult> GetByIdentityNumber(string identityNumber)
    {
        var result = await _patientService.GetByIdentityNumberAsync(identityNumber);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpGet("{patientId}/medical-records")]
    public async Task<IActionResult> GetMedicalRecords(Guid patientId)
    {
        var result = await _patientService.GetMedicalRecordsAsync(patientId);
        return Ok(result);
    }

    [HttpPost("{patientId}/medical-records")]
    public async Task<IActionResult> CreateMedicalRecord(Guid patientId, [FromQuery] string? recordType = null, [FromQuery] Guid? departmentId = null)
    {
        try
        {
            var result = await _patientService.CreateMedicalRecordAsync(patientId, recordType, departmentId);
            return Ok(result);
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }
}
