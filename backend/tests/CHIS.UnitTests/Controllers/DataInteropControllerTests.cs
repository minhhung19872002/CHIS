using CHIS.API.Controllers;
using CHIS.Application.DTOs;
using CHIS.Application.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace CHIS.UnitTests.Controllers;

public class DataInteropControllerTests
{
    private readonly Mock<IDataInteropService> _mock;
    private readonly DataInteropController _sut;

    public DataInteropControllerTests()
    {
        _mock = new Mock<IDataInteropService>();
        _sut = new DataInteropController(_mock.Object);
    }

    [Fact]
    public async Task GetSyncLogs_ReturnsOk()
    {
        _mock.Setup(s => s.GetSyncLogsAsync(It.IsAny<string?>(), It.IsAny<int>(), It.IsAny<int>()))
            .ReturnsAsync(new List<DataSyncLogDto>());
        var result = await _sut.GetSyncLogs();
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task SyncBhyt_ReturnsOk()
    {
        var facilityId = Guid.NewGuid();
        _mock.Setup(s => s.SyncBhytAsync(facilityId)).ReturnsAsync(new DataSyncLogDto());
        var result = await _sut.SyncBhyt(facilityId);
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task SyncHssk_ReturnsOk()
    {
        var facilityId = Guid.NewGuid();
        _mock.Setup(s => s.SyncHsskAsync(facilityId)).ReturnsAsync(new DataSyncLogDto());
        var result = await _sut.SyncHssk(facilityId);
        result.Should().BeOfType<OkObjectResult>();
    }
}
