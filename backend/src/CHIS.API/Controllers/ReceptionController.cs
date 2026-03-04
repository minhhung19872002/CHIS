using CHIS.Application.DTOs;
using CHIS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CHIS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReceptionController : ControllerBase
{
    private readonly IPatientService _patientService;
    private readonly IExaminationService _examinationService;

    public ReceptionController(IPatientService patientService, IExaminationService examinationService)
    {
        _patientService = patientService;
        _examinationService = examinationService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] CreatePatientDto dto)
    {
        var patient = await _patientService.CreateAsync(dto);
        return Ok(patient);
    }

    [HttpPost("register-and-exam")]
    public async Task<IActionResult> RegisterAndCreateExam([FromBody] RegisterAndExamDto dto)
    {
        var patient = dto.PatientId.HasValue
            ? await _patientService.GetByIdAsync(dto.PatientId.Value)
            : await _patientService.CreateAsync(dto.Patient!);

        var record = await _patientService.CreateMedicalRecordAsync(patient.Id, "NgoaiTru", dto.DepartmentId);

        var exam = await _examinationService.CreateAsync(new CreateExaminationDto
        {
            PatientId = patient.Id,
            MedicalRecordId = record.Id,
            RoomId = dto.RoomId,
            DoctorId = dto.DoctorId,
            ChiefComplaint = dto.ChiefComplaint,
            QueueType = dto.QueueType
        });

        return Ok(new { patient, medicalRecord = record, examination = exam });
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

    [HttpGet("patient/search")]
    public async Task<IActionResult> SearchPatient([FromQuery] PatientSearchDto dto)
    {
        var result = await _patientService.SearchAsync(dto);
        return Ok(result);
    }

    [HttpGet("patient/{patientId}/medical-records")]
    public async Task<IActionResult> GetMedicalRecords(Guid patientId)
    {
        var result = await _patientService.GetMedicalRecordsAsync(patientId);
        return Ok(result);
    }
}

public class RegisterAndExamDto
{
    public Guid? PatientId { get; set; }
    public CreatePatientDto? Patient { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? RoomId { get; set; }
    public Guid? DoctorId { get; set; }
    public string? ChiefComplaint { get; set; }
    public int? QueueType { get; set; }
}
