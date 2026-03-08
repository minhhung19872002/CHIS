using CHIS.API.Controllers;
using CHIS.Application.DTOs;
using CHIS.Application.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace CHIS.UnitTests.Controllers;

public class ReportControllerTests
{
    private readonly Mock<IReportService> _mock;
    private readonly ReportController _sut;

    public ReportControllerTests()
    {
        _mock = new Mock<IReportService>();
        _sut = new ReportController(_mock.Object);
    }

    [Fact]
    public async Task GetDashboard_ReturnsOk()
    {
        _mock.Setup(s => s.GetDashboardAsync(It.IsAny<Guid?>())).ReturnsAsync(new DashboardDto());
        var result = await _sut.GetDashboard();
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetMonthlyStatistics_ReturnsOk()
    {
        _mock.Setup(s => s.GetMonthlyStatisticsAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<Guid?>())).ReturnsAsync(new MonthlyStatisticsDto());
        var result = await _sut.GetMonthlyStatistics(2026, 3);
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetDiseaseStatistics_ReturnsOk()
    {
        _mock.Setup(s => s.GetDiseaseStatisticsAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<Guid?>()))
            .ReturnsAsync(new List<DiseaseStatisticsDto>());
        var result = await _sut.GetDiseaseStatistics(DateTime.Today.AddDays(-30), DateTime.Today);
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetBcxReport_ReturnsOk()
    {
        _mock.Setup(s => s.GetBcxReportAsync(It.IsAny<int>(), It.IsAny<ReportFilterDto>())).ReturnsAsync(new object());
        var result = await _sut.GetBcxReport(1, new ReportFilterDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task ExportReport_ReturnsOk()
    {
        _mock.Setup(s => s.ExportReportAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<ReportFilterDto>()))
            .ReturnsAsync(Array.Empty<byte>());
        var dto = new ReportExportDto { ReportType = "dashboard", Format = "xlsx", Filter = new ReportFilterDto() };
        var result = await _sut.ExportReport(dto);
        result.Should().BeOfType<OkObjectResult>();
    }
}
