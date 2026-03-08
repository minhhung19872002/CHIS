using CHIS.API.Controllers;
using CHIS.Application.DTOs;
using CHIS.Application.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace CHIS.UnitTests.Controllers;

public class EnvironmentalHealthControllerTests
{
    private readonly Mock<IEnvironmentalHealthService> _mock;
    private readonly EnvironmentalHealthController _sut;

    public EnvironmentalHealthControllerTests()
    {
        _mock = new Mock<IEnvironmentalHealthService>();
        _sut = new EnvironmentalHealthController(_mock.Object);
    }

    [Fact]
    public async Task GetSanitationFacilities_ReturnsOk()
    {
        _mock.Setup(s => s.GetSanitationFacilitiesAsync(It.IsAny<string?>())).ReturnsAsync(new List<SanitationFacilityDto>());
        var result = await _sut.GetSanitationFacilities();
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task Create_ReturnsOk()
    {
        _mock.Setup(s => s.CreateAsync(It.IsAny<SanitationFacilityDto>())).ReturnsAsync(new SanitationFacilityDto());
        var result = await _sut.Create(new SanitationFacilityDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task Update_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.UpdateAsync(id, It.IsAny<SanitationFacilityDto>())).ReturnsAsync(new SanitationFacilityDto());
        var result = await _sut.Update(id, new SanitationFacilityDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task Update_NotFound_ReturnsNotFound()
    {
        _mock.Setup(s => s.UpdateAsync(It.IsAny<Guid>(), It.IsAny<SanitationFacilityDto>())).ThrowsAsync(new KeyNotFoundException());
        var result = await _sut.Update(Guid.NewGuid(), new SanitationFacilityDto());
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task Delete_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.DeleteAsync(id)).Returns(Task.CompletedTask);
        var result = await _sut.Delete(id);
        result.Should().BeOfType<NoContentResult>();
    }
}
