using CHIS.API.Controllers;
using CHIS.Application.DTOs;
using CHIS.Application.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace CHIS.UnitTests.Controllers;

public class ReceptionControllerTests
{
    private readonly Mock<IPatientService> _mockPatientService;
    private readonly Mock<IExaminationService> _mockExaminationService;
    private readonly ReceptionController _sut;

    public ReceptionControllerTests()
    {
        _mockPatientService = new Mock<IPatientService>();
        _mockExaminationService = new Mock<IExaminationService>();
        _sut = new ReceptionController(_mockPatientService.Object, _mockExaminationService.Object);
    }

    [Fact]
    public async Task Register_ReturnsOk()
    {
        _mockPatientService.Setup(s => s.CreateAsync(It.IsAny<CreatePatientDto>())).ReturnsAsync(new PatientDto());
        var result = await _sut.Register(new CreatePatientDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task RegisterAndCreateExam_ReturnsOk()
    {
        var patientId = Guid.NewGuid();
        var recordId = Guid.NewGuid();
        _mockPatientService.Setup(s => s.CreateAsync(It.IsAny<CreatePatientDto>()))
            .ReturnsAsync(new PatientDto { Id = patientId });
        _mockPatientService.Setup(s => s.CreateMedicalRecordAsync(patientId, "NgoaiTru", It.IsAny<Guid?>()))
            .ReturnsAsync(new MedicalRecordDto { Id = recordId });
        _mockExaminationService.Setup(s => s.CreateAsync(It.IsAny<CreateExaminationDto>()))
            .ReturnsAsync(new ExaminationDto());

        var dto = new RegisterAndExamDto { Patient = new CreatePatientDto() };
        var result = await _sut.RegisterAndCreateExam(dto);
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetQueue_ReturnsOk()
    {
        _mockExaminationService.Setup(s => s.GetQueueByRoomAsync(It.IsAny<Guid>())).ReturnsAsync(new List<QueueTicketDto>());
        var result = await _sut.GetQueue(Guid.NewGuid());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task CallNext_ReturnsOk()
    {
        _mockExaminationService.Setup(s => s.CallNextAsync(It.IsAny<Guid>())).ReturnsAsync(new QueueTicketDto());
        var result = await _sut.CallNext(Guid.NewGuid());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task CallNext_EmptyQueue_ReturnsBadRequest()
    {
        _mockExaminationService.Setup(s => s.CallNextAsync(It.IsAny<Guid>())).ThrowsAsync(new InvalidOperationException("No tickets"));
        var result = await _sut.CallNext(Guid.NewGuid());
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task CancelTicket_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mockExaminationService.Setup(s => s.CancelQueueTicketAsync(id)).Returns(Task.CompletedTask);
        var result = await _sut.CancelTicket(id);
        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public async Task CancelTicket_NotFound_ReturnsNotFound()
    {
        _mockExaminationService.Setup(s => s.CancelQueueTicketAsync(It.IsAny<Guid>())).ThrowsAsync(new KeyNotFoundException());
        var result = await _sut.CancelTicket(Guid.NewGuid());
        result.Should().BeOfType<NotFoundResult>();
    }
}
