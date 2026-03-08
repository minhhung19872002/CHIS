using CHIS.API.Controllers;
using CHIS.Application.DTOs;
using CHIS.Application.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace CHIS.UnitTests.Controllers;

public class PopulationControllerTests
{
    private readonly Mock<IPopulationService> _mock;
    private readonly PopulationController _sut;

    public PopulationControllerTests()
    {
        _mock = new Mock<IPopulationService>();
        _sut = new PopulationController(_mock.Object);
    }

    [Fact]
    public async Task SearchHouseholds_ReturnsOk()
    {
        _mock.Setup(s => s.SearchHouseholdsAsync(It.IsAny<HouseholdSearchDto>())).ReturnsAsync(new PagedResult<HouseholdDto>());
        var result = await _sut.SearchHouseholds(new HouseholdSearchDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetHousehold_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.GetHouseholdByIdAsync(id)).ReturnsAsync(new HouseholdDto { Id = id });
        var result = await _sut.GetHousehold(id);
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetHousehold_NotFound_ReturnsNotFound()
    {
        _mock.Setup(s => s.GetHouseholdByIdAsync(It.IsAny<Guid>())).ThrowsAsync(new KeyNotFoundException());
        var result = await _sut.GetHousehold(Guid.NewGuid());
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task CreateHousehold_ReturnsOk()
    {
        _mock.Setup(s => s.CreateHouseholdAsync(It.IsAny<CreateHouseholdDto>())).ReturnsAsync(new HouseholdDto());
        var result = await _sut.CreateHousehold(new CreateHouseholdDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task CreateBirthCertificate_ReturnsOk()
    {
        _mock.Setup(s => s.CreateBirthCertificateAsync(It.IsAny<CreateBirthCertificateDto>())).ReturnsAsync(new BirthCertificateDto());
        var result = await _sut.CreateBirthCertificate(new CreateBirthCertificateDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task CreateDeathCertificate_ReturnsOk()
    {
        _mock.Setup(s => s.CreateDeathCertificateAsync(It.IsAny<CreateDeathCertificateDto>())).ReturnsAsync(new DeathCertificateDto());
        var result = await _sut.CreateDeathCertificate(new CreateDeathCertificateDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetElderlyList_ReturnsOk()
    {
        _mock.Setup(s => s.GetElderlyListAsync(It.IsAny<Guid?>())).ReturnsAsync(new List<ElderlyInfoDto>());
        var result = await _sut.GetElderlyList();
        result.Should().BeOfType<OkObjectResult>();
    }
}
