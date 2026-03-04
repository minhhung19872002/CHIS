using CHIS.Application.DTOs;
using CHIS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CHIS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PrescriptionController : ControllerBase
{
    private readonly IPrescriptionService _prescriptionService;
    public PrescriptionController(IPrescriptionService prescriptionService) => _prescriptionService = prescriptionService;

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var result = await _prescriptionService.GetByIdAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpGet("by-examination/{examinationId}")]
    public async Task<IActionResult> GetByExamination(Guid examinationId)
    {
        var result = await _prescriptionService.GetByExaminationAsync(examinationId);
        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] int pageIndex = 0, [FromQuery] int pageSize = 20, [FromQuery] string? keyword = null, [FromQuery] int? status = null)
    {
        var result = await _prescriptionService.SearchAsync(pageIndex, pageSize, keyword, status);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePrescriptionDto dto)
    {
        var result = await _prescriptionService.CreateAsync(dto);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreatePrescriptionDto dto)
    {
        try
        {
            var result = await _prescriptionService.UpdateAsync(id, dto);
            return Ok(result);
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpPost("{id}/confirm")]
    public async Task<IActionResult> Confirm(Guid id)
    {
        try
        {
            await _prescriptionService.ConfirmAsync(id);
            return Ok(new { message = "Prescription confirmed" });
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        try
        {
            await _prescriptionService.CancelAsync(id);
            return Ok(new { message = "Prescription cancelled" });
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _prescriptionService.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpGet("medicines")]
    public async Task<IActionResult> SearchMedicines([FromQuery] MedicineSearchDto dto)
    {
        var result = await _prescriptionService.SearchMedicinesAsync(dto);
        return Ok(result);
    }

    [HttpGet("medicines/{id}")]
    public async Task<IActionResult> GetMedicine(Guid id)
    {
        try
        {
            var result = await _prescriptionService.GetMedicineByIdAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpPost("medicines")]
    public async Task<IActionResult> CreateMedicine([FromBody] MedicineDto dto)
    {
        var result = await _prescriptionService.CreateMedicineAsync(dto);
        return Ok(result);
    }

    [HttpPut("medicines/{id}")]
    public async Task<IActionResult> UpdateMedicine(Guid id, [FromBody] MedicineDto dto)
    {
        try
        {
            var result = await _prescriptionService.UpdateMedicineAsync(id, dto);
            return Ok(result);
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }
}
