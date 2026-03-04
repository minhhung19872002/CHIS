using CHIS.Application.DTOs;
using CHIS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CHIS.API.Controllers;

[ApiController]
[Route("api/food-safety")]
[Authorize]
public class FoodSafetyController : ControllerBase
{
    private readonly IFoodSafetyService _svc;
    public FoodSafetyController(IFoodSafetyService svc) => _svc = svc;

    [HttpGet("businesses")]
    public async Task<IActionResult> SearchBusinesses([FromQuery] FoodSafetySearchDto dto)
        => Ok(await _svc.SearchBusinessesAsync(dto));

    [HttpPost("businesses")]
    public async Task<IActionResult> CreateBusiness([FromBody] CreateFoodBusinessDto dto)
        => Ok(await _svc.CreateBusinessAsync(dto));

    [HttpPut("businesses/{id}")]
    public async Task<IActionResult> UpdateBusiness(Guid id, [FromBody] CreateFoodBusinessDto dto)
    {
        try { return Ok(await _svc.UpdateBusinessAsync(id, dto)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpGet("violations")]
    public async Task<IActionResult> GetViolations([FromQuery] Guid? businessId = null)
        => Ok(await _svc.GetViolationsAsync(businessId));

    [HttpPost("businesses/{businessId}/violations")]
    public async Task<IActionResult> CreateViolation(Guid businessId, [FromBody] FoodViolationDto dto)
        => Ok(await _svc.CreateViolationAsync(businessId, dto));

    [HttpGet("poisoning")]
    public async Task<IActionResult> GetPoisoningCases([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        => Ok(await _svc.GetPoisoningCasesAsync(fromDate, toDate));

    [HttpPost("poisoning")]
    public async Task<IActionResult> ReportPoisoning([FromBody] FoodPoisoningDto dto)
        => Ok(await _svc.ReportPoisoningAsync(dto));
}
