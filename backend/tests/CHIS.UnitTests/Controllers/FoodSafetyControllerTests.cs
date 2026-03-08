using CHIS.API.Controllers;
using CHIS.Application.DTOs;
using CHIS.Application.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace CHIS.UnitTests.Controllers;

public class FoodSafetyControllerTests
{
    private readonly Mock<IFoodSafetyService> _mock;
    private readonly FoodSafetyController _sut;

    public FoodSafetyControllerTests()
    {
        _mock = new Mock<IFoodSafetyService>();
        _sut = new FoodSafetyController(_mock.Object);
    }

    [Fact]
    public async Task SearchBusinesses_ReturnsOk()
    {
        _mock.Setup(s => s.SearchBusinessesAsync(It.IsAny<FoodSafetySearchDto>())).ReturnsAsync(new PagedResult<FoodBusinessDto>());
        var result = await _sut.SearchBusinesses(new FoodSafetySearchDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task CreateBusiness_ReturnsOk()
    {
        _mock.Setup(s => s.CreateBusinessAsync(It.IsAny<CreateFoodBusinessDto>())).ReturnsAsync(new FoodBusinessDto());
        var result = await _sut.CreateBusiness(new CreateFoodBusinessDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task UpdateBusiness_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.UpdateBusinessAsync(id, It.IsAny<CreateFoodBusinessDto>())).ReturnsAsync(new FoodBusinessDto());
        var result = await _sut.UpdateBusiness(id, new CreateFoodBusinessDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task UpdateBusiness_NotFound_ReturnsNotFound()
    {
        _mock.Setup(s => s.UpdateBusinessAsync(It.IsAny<Guid>(), It.IsAny<CreateFoodBusinessDto>())).ThrowsAsync(new KeyNotFoundException());
        var result = await _sut.UpdateBusiness(Guid.NewGuid(), new CreateFoodBusinessDto());
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task GetViolations_ReturnsOk()
    {
        _mock.Setup(s => s.GetViolationsAsync(It.IsAny<Guid?>())).ReturnsAsync(new List<FoodViolationDto>());
        var result = await _sut.GetViolations();
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task CreateViolation_ReturnsOk()
    {
        var businessId = Guid.NewGuid();
        _mock.Setup(s => s.CreateViolationAsync(businessId, It.IsAny<FoodViolationDto>())).ReturnsAsync(new FoodViolationDto());
        var result = await _sut.CreateViolation(businessId, new FoodViolationDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task ReportPoisoning_ReturnsOk()
    {
        _mock.Setup(s => s.ReportPoisoningAsync(It.IsAny<FoodPoisoningDto>())).ReturnsAsync(new FoodPoisoningDto());
        var result = await _sut.ReportPoisoning(new FoodPoisoningDto());
        result.Should().BeOfType<OkObjectResult>();
    }
}
