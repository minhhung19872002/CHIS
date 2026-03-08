using CHIS.API.Controllers;
using CHIS.Application.DTOs;
using CHIS.Application.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace CHIS.UnitTests.Controllers;

public class InpatientControllerTests
{
    private readonly Mock<IInpatientService> _mock;
    private readonly InpatientController _sut;

    public InpatientControllerTests()
    {
        _mock = new Mock<IInpatientService>();
        _sut = new InpatientController(_mock.Object);
    }

    [Fact]
    public async Task GetAdmission_Existing_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.GetAdmissionByIdAsync(id)).ReturnsAsync(new AdmissionDto { Id = id });
        var result = await _sut.GetAdmission(id);
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetAdmission_NotFound_ReturnsNotFound()
    {
        _mock.Setup(s => s.GetAdmissionByIdAsync(It.IsAny<Guid>())).ThrowsAsync(new KeyNotFoundException());
        var result = await _sut.GetAdmission(Guid.NewGuid());
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task SearchAdmissions_ReturnsOk()
    {
        _mock.Setup(s => s.SearchAdmissionsAsync(It.IsAny<AdmissionSearchDto>())).ReturnsAsync(new PagedResult<AdmissionDto>());
        var result = await _sut.SearchAdmissions(new AdmissionSearchDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task Admit_ReturnsOk()
    {
        _mock.Setup(s => s.AdmitAsync(It.IsAny<CreateAdmissionDto>())).ReturnsAsync(new AdmissionDto());
        var result = await _sut.Admit(new CreateAdmissionDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task Discharge_Existing_ReturnsOk()
    {
        _mock.Setup(s => s.DischargeAsync(It.IsAny<CreateDischargeDto>())).ReturnsAsync(new DischargeDto());
        var result = await _sut.Discharge(new CreateDischargeDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task Discharge_NotFound_ReturnsNotFound()
    {
        _mock.Setup(s => s.DischargeAsync(It.IsAny<CreateDischargeDto>())).ThrowsAsync(new KeyNotFoundException());
        var result = await _sut.Discharge(new CreateDischargeDto());
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task GetAvailableBeds_ReturnsOk()
    {
        _mock.Setup(s => s.GetAvailableBedsAsync(It.IsAny<Guid>())).ReturnsAsync(new List<BedDto>());
        var result = await _sut.GetAvailableBeds(Guid.NewGuid());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task AssignBed_Existing_ReturnsOk()
    {
        _mock.Setup(s => s.AssignBedAsync(It.IsAny<Guid>(), It.IsAny<Guid>())).Returns(Task.CompletedTask);
        var result = await _sut.AssignBed(Guid.NewGuid(), Guid.NewGuid());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task AssignBed_NotFound_ReturnsNotFound()
    {
        _mock.Setup(s => s.AssignBedAsync(It.IsAny<Guid>(), It.IsAny<Guid>())).ThrowsAsync(new KeyNotFoundException());
        var result = await _sut.AssignBed(Guid.NewGuid(), Guid.NewGuid());
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task GetTreatmentSheets_ReturnsOk()
    {
        _mock.Setup(s => s.GetTreatmentSheetsAsync(It.IsAny<Guid>())).ReturnsAsync(new List<TreatmentSheetDto>());
        var result = await _sut.GetTreatmentSheets(Guid.NewGuid());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task CreateTreatmentSheet_ReturnsOk()
    {
        _mock.Setup(s => s.CreateTreatmentSheetAsync(It.IsAny<CreateTreatmentSheetDto>())).ReturnsAsync(new TreatmentSheetDto());
        var result = await _sut.CreateTreatmentSheet(new CreateTreatmentSheetDto());
        result.Should().BeOfType<OkObjectResult>();
    }
}
