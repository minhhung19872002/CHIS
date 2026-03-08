using CHIS.API.Controllers;
using CHIS.Application.DTOs;
using CHIS.Application.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace CHIS.UnitTests.Controllers;

public class RadiologyControllerTests
{
    private readonly Mock<IRadiologyService> _mock;
    private readonly RadiologyController _sut;

    public RadiologyControllerTests()
    {
        _mock = new Mock<IRadiologyService>();
        _sut = new RadiologyController(_mock.Object);
    }

    [Fact]
    public async Task GetRequests_ReturnsOk()
    {
        _mock.Setup(s => s.GetImagingRequestsAsync(It.IsAny<ServiceRequestSearchDto>())).ReturnsAsync(new PagedResult<ServiceRequestDto>());
        var result = await _sut.GetRequests(new ServiceRequestSearchDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task CreateRequest_ReturnsOk()
    {
        _mock.Setup(s => s.CreateImagingRequestAsync(It.IsAny<CreateServiceRequestDto>())).ReturnsAsync(new ServiceRequestDto());
        var result = await _sut.CreateRequest(new CreateServiceRequestDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task UpdateResult_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.UpdateImagingResultAsync(id, It.IsAny<UpdateServiceResultDto>())).ReturnsAsync(new ServiceRequestDto());
        var result = await _sut.UpdateResult(id, new UpdateServiceResultDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task UpdateResult_NotFound_ReturnsNotFound()
    {
        _mock.Setup(s => s.UpdateImagingResultAsync(It.IsAny<Guid>(), It.IsAny<UpdateServiceResultDto>())).ThrowsAsync(new KeyNotFoundException());
        var result = await _sut.UpdateResult(Guid.NewGuid(), new UpdateServiceResultDto());
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task Approve_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.ApproveImagingResultAsync(id)).Returns(Task.CompletedTask);
        var result = await _sut.Approve(id);
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetServices_ReturnsOk()
    {
        _mock.Setup(s => s.GetImagingServicesAsync(It.IsAny<string?>())).ReturnsAsync(new List<ServiceDto>());
        var result = await _sut.GetServices();
        result.Should().BeOfType<OkObjectResult>();
    }
}
