using CHIS.API.Controllers;
using CHIS.Application.DTOs;
using CHIS.Application.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace CHIS.UnitTests.Controllers;

public class CommunicableDiseaseControllerTests
{
    private readonly Mock<ICommunicableDiseaseService> _mock;
    private readonly CommunicableDiseaseController _sut;

    public CommunicableDiseaseControllerTests()
    {
        _mock = new Mock<ICommunicableDiseaseService>();
        _sut = new CommunicableDiseaseController(_mock.Object);
    }

    [Fact]
    public async Task SearchCases_ReturnsOk()
    {
        _mock.Setup(s => s.SearchCasesAsync(It.IsAny<DiseaseCaseSearchDto>())).ReturnsAsync(new PagedResult<DiseaseCaseDto>());
        var result = await _sut.SearchCases(new DiseaseCaseSearchDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetCase_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.GetCaseByIdAsync(id)).ReturnsAsync(new DiseaseCaseDto { Id = id });
        var result = await _sut.GetCase(id);
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetCase_NotFound_ReturnsNotFound()
    {
        _mock.Setup(s => s.GetCaseByIdAsync(It.IsAny<Guid>())).ThrowsAsync(new KeyNotFoundException());
        var result = await _sut.GetCase(Guid.NewGuid());
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task ReportCase_ReturnsOk()
    {
        _mock.Setup(s => s.ReportCaseAsync(It.IsAny<CreateDiseaseCaseDto>())).ReturnsAsync(new DiseaseCaseDto());
        var result = await _sut.ReportCase(new CreateDiseaseCaseDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task UpdateOutcome_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.UpdateCaseOutcomeAsync(id, "Recovered")).Returns(Task.CompletedTask);
        var result = await _sut.UpdateOutcome(id, "Recovered");
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetWeeklyReports_ReturnsOk()
    {
        var facilityId = Guid.NewGuid();
        _mock.Setup(s => s.GetWeeklyReportsAsync(2026, facilityId)).ReturnsAsync(new List<WeeklyReportDto>());
        var result = await _sut.GetWeeklyReports(2026, facilityId);
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task CreateWeeklyReport_ReturnsOk()
    {
        var facilityId = Guid.NewGuid();
        _mock.Setup(s => s.CreateWeeklyReportAsync(2026, 10, facilityId, It.IsAny<string>())).ReturnsAsync(new WeeklyReportDto());
        var result = await _sut.CreateWeeklyReport(2026, 10, facilityId, "{}");
        result.Should().BeOfType<OkObjectResult>();
    }
}
