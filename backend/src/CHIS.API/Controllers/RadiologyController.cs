using CHIS.Application.DTOs;
using CHIS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CHIS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RadiologyController : ControllerBase
{
    private readonly IRadiologyService _radiologyService;
    public RadiologyController(IRadiologyService radiologyService) => _radiologyService = radiologyService;

    [HttpGet("requests")]
    public async Task<IActionResult> GetRequests([FromQuery] ServiceRequestSearchDto dto)
    {
        var result = await _radiologyService.GetImagingRequestsAsync(dto);
        return Ok(result);
    }

    [HttpPost("requests")]
    public async Task<IActionResult> CreateRequest([FromBody] CreateServiceRequestDto dto)
    {
        var result = await _radiologyService.CreateImagingRequestAsync(dto);
        return Ok(result);
    }

    [HttpPut("requests/{id}/result")]
    public async Task<IActionResult> UpdateResult(Guid id, [FromBody] UpdateServiceResultDto dto)
    {
        try
        {
            var result = await _radiologyService.UpdateImagingResultAsync(id, dto);
            return Ok(result);
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpPost("requests/{id}/approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        try
        {
            await _radiologyService.ApproveImagingResultAsync(id);
            return Ok(new { message = "Imaging result approved" });
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpGet("services")]
    public async Task<IActionResult> GetServices([FromQuery] string? keyword = null)
    {
        var result = await _radiologyService.GetImagingServicesAsync(keyword);
        return Ok(result);
    }
}
