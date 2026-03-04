using CHIS.Application.DTOs;
using CHIS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CHIS.API.Controllers;

[ApiController]
[Route("api/hiv-aids")]
[Authorize]
public class HivAidsController : ControllerBase
{
    private readonly IHivAidsService _svc;
    public HivAidsController(IHivAidsService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] HivSearchDto dto)
        => Ok(await _svc.SearchAsync(dto));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try { return Ok(await _svc.GetByIdAsync(id)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpPost]
    public async Task<IActionResult> Register([FromBody] CreateHivPatientDto dto)
        => Ok(await _svc.RegisterAsync(dto));

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateHivPatientDto dto)
    {
        try { return Ok(await _svc.UpdateAsync(id, dto)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpGet("{hivPatientId}/treatment-courses")]
    public async Task<IActionResult> GetTreatmentCourses(Guid hivPatientId)
        => Ok(await _svc.GetTreatmentCoursesAsync(hivPatientId));

    [HttpPost("treatment-courses")]
    public async Task<IActionResult> StartTreatmentCourse([FromBody] CreateArvTreatmentCourseDto dto)
    {
        try { return Ok(await _svc.StartTreatmentCourseAsync(dto)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpPost("treatment-courses/{courseId}/end")]
    public async Task<IActionResult> EndTreatmentCourse(Guid courseId, [FromQuery] string? changeReason = null)
    {
        try { await _svc.EndTreatmentCourseAsync(courseId, changeReason); return Ok(new { message = "Treatment course ended" }); }
        catch (KeyNotFoundException) { return NotFound(); }
    }
}
