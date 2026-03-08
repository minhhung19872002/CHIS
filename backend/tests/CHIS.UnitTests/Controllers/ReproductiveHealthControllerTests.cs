using CHIS.API.Controllers;
using CHIS.Application.DTOs;
using CHIS.Application.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace CHIS.UnitTests.Controllers;

public class ReproductiveHealthControllerTests
{
    private readonly Mock<IReproductiveHealthService> _mock;
    private readonly ReproductiveHealthController _sut;

    public ReproductiveHealthControllerTests()
    {
        _mock = new Mock<IReproductiveHealthService>();
        _sut = new ReproductiveHealthController(_mock.Object);
    }

    [Fact]
    public async Task GetPrenatalRecords_ReturnsOk()
    {
        _mock.Setup(s => s.GetPrenatalRecordsAsync(It.IsAny<ReproductiveHealthSearchDto>())).ReturnsAsync(new PagedResult<PrenatalRecordDto>());
        var result = await _sut.GetPrenatalRecords(new ReproductiveHealthSearchDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task CreatePrenatalRecord_ReturnsOk()
    {
        _mock.Setup(s => s.CreatePrenatalRecordAsync(It.IsAny<CreatePrenatalRecordDto>())).ReturnsAsync(new PrenatalRecordDto());
        var result = await _sut.CreatePrenatalRecord(new CreatePrenatalRecordDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetDeliveryRecords_ReturnsOk()
    {
        _mock.Setup(s => s.GetDeliveryRecordsAsync(It.IsAny<ReproductiveHealthSearchDto>())).ReturnsAsync(new PagedResult<DeliveryRecordDto>());
        var result = await _sut.GetDeliveryRecords(new ReproductiveHealthSearchDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task CreateDeliveryRecord_ReturnsOk()
    {
        _mock.Setup(s => s.CreateDeliveryRecordAsync(It.IsAny<CreateDeliveryRecordDto>())).ReturnsAsync(new DeliveryRecordDto());
        var result = await _sut.CreateDeliveryRecord(new CreateDeliveryRecordDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetFamilyPlanning_ReturnsOk()
    {
        _mock.Setup(s => s.GetFamilyPlanningAsync(It.IsAny<Guid>())).ReturnsAsync(new List<FamilyPlanningRecordDto>());
        var result = await _sut.GetFamilyPlanning(Guid.NewGuid());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task CreateFamilyPlanning_ReturnsOk()
    {
        var patientId = Guid.NewGuid();
        _mock.Setup(s => s.CreateFamilyPlanningAsync(patientId, It.IsAny<FamilyPlanningRecordDto>())).ReturnsAsync(new FamilyPlanningRecordDto());
        var result = await _sut.CreateFamilyPlanning(patientId, new FamilyPlanningRecordDto());
        result.Should().BeOfType<OkObjectResult>();
    }
}
