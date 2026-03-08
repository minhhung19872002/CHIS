using CHIS.API.Controllers;
using CHIS.Application.DTOs;
using CHIS.Application.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace CHIS.UnitTests.Controllers;

public class ChronicDiseaseControllerTests
{
    private readonly Mock<IChronicDiseaseService> _mock;
    private readonly ChronicDiseaseController _sut;

    public ChronicDiseaseControllerTests()
    {
        _mock = new Mock<IChronicDiseaseService>();
        _sut = new ChronicDiseaseController(_mock.Object);
    }

    [Fact]
    public async Task Search_ReturnsOk()
    {
        _mock.Setup(s => s.SearchAsync(It.IsAny<ChronicDiseaseSearchDto>())).ReturnsAsync(new PagedResult<ChronicDiseaseRegisterDto>());
        var result = await _sut.Search(new ChronicDiseaseSearchDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetById_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.GetByIdAsync(id)).ReturnsAsync(new ChronicDiseaseRegisterDto { Id = id });
        var result = await _sut.GetById(id);
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetById_NotFound_ReturnsNotFound()
    {
        _mock.Setup(s => s.GetByIdAsync(It.IsAny<Guid>())).ThrowsAsync(new KeyNotFoundException());
        var result = await _sut.GetById(Guid.NewGuid());
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task Register_ReturnsOk()
    {
        _mock.Setup(s => s.RegisterAsync(It.IsAny<CreateChronicDiseaseRegisterDto>())).ReturnsAsync(new ChronicDiseaseRegisterDto());
        var result = await _sut.Register(new CreateChronicDiseaseRegisterDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task UpdateStatus_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.UpdateStatusAsync(id, "Active")).Returns(Task.CompletedTask);
        var result = await _sut.UpdateStatus(id, "Active");
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetTreatments_ReturnsOk()
    {
        _mock.Setup(s => s.GetTreatmentsAsync(It.IsAny<Guid>())).ReturnsAsync(new List<ChronicDiseaseTreatmentDto>());
        var result = await _sut.GetTreatments(Guid.NewGuid());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task AddTreatment_ReturnsOk()
    {
        _mock.Setup(s => s.AddTreatmentAsync(It.IsAny<CreateChronicDiseaseTreatmentDto>())).ReturnsAsync(new ChronicDiseaseTreatmentDto());
        var result = await _sut.AddTreatment(new CreateChronicDiseaseTreatmentDto());
        result.Should().BeOfType<OkObjectResult>();
    }
}
