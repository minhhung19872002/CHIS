using CHIS.Application.DTOs;
using CHIS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CHIS.API.Controllers;

[ApiController]
[Route("api/reproductive-health")]
[Authorize]
public class ReproductiveHealthController : ControllerBase
{
    private readonly IReproductiveHealthService _svc;
    public ReproductiveHealthController(IReproductiveHealthService svc) => _svc = svc;

    [HttpGet("prenatal")]
    public async Task<IActionResult> GetPrenatalRecords([FromQuery] ReproductiveHealthSearchDto dto)
        => Ok(await _svc.GetPrenatalRecordsAsync(dto));

    [HttpPost("prenatal")]
    public async Task<IActionResult> CreatePrenatalRecord([FromBody] CreatePrenatalRecordDto dto)
        => Ok(await _svc.CreatePrenatalRecordAsync(dto));

    [HttpGet("delivery")]
    public async Task<IActionResult> GetDeliveryRecords([FromQuery] ReproductiveHealthSearchDto dto)
        => Ok(await _svc.GetDeliveryRecordsAsync(dto));

    [HttpPost("delivery")]
    public async Task<IActionResult> CreateDeliveryRecord([FromBody] CreateDeliveryRecordDto dto)
        => Ok(await _svc.CreateDeliveryRecordAsync(dto));

    [HttpGet("family-planning/{patientId}")]
    public async Task<IActionResult> GetFamilyPlanning(Guid patientId)
        => Ok(await _svc.GetFamilyPlanningAsync(patientId));

    [HttpPost("family-planning/{patientId}")]
    public async Task<IActionResult> CreateFamilyPlanning(Guid patientId, [FromBody] FamilyPlanningRecordDto dto)
        => Ok(await _svc.CreateFamilyPlanningAsync(patientId, dto));
}
