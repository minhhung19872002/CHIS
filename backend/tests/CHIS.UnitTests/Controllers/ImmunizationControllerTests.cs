using CHIS.API.Controllers;
using CHIS.Application.DTOs;
using CHIS.Application.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace CHIS.UnitTests.Controllers;

public class ImmunizationControllerTests
{
    private readonly Mock<IImmunizationService> _mock;
    private readonly ImmunizationController _sut;

    public ImmunizationControllerTests()
    {
        _mock = new Mock<IImmunizationService>();
        _sut = new ImmunizationController(_mock.Object);
    }

    [Fact]
    public async Task SearchSubjects_ReturnsOk()
    {
        _mock.Setup(s => s.SearchSubjectsAsync(It.IsAny<ImmunizationSearchDto>())).ReturnsAsync(new PagedResult<ImmunizationSubjectDto>());
        var result = await _sut.SearchSubjects(new ImmunizationSearchDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetSubject_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.GetSubjectByIdAsync(id)).ReturnsAsync(new ImmunizationSubjectDto { Id = id });
        var result = await _sut.GetSubject(id);
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetSubject_NotFound_ReturnsNotFound()
    {
        _mock.Setup(s => s.GetSubjectByIdAsync(It.IsAny<Guid>())).ThrowsAsync(new KeyNotFoundException());
        var result = await _sut.GetSubject(Guid.NewGuid());
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task CreateSubject_ReturnsOk()
    {
        _mock.Setup(s => s.CreateSubjectAsync(It.IsAny<CreateImmunizationSubjectDto>())).ReturnsAsync(new ImmunizationSubjectDto());
        var result = await _sut.CreateSubject(new CreateImmunizationSubjectDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task RecordVaccination_ReturnsOk()
    {
        _mock.Setup(s => s.RecordVaccinationAsync(It.IsAny<CreateVaccinationRecordDto>())).ReturnsAsync(new VaccinationRecordDto());
        var result = await _sut.RecordVaccination(new CreateVaccinationRecordDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetVaccines_ReturnsOk()
    {
        _mock.Setup(s => s.GetVaccinesAsync()).ReturnsAsync(new List<VaccineDto>());
        var result = await _sut.GetVaccines();
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetVaccineStock_ReturnsOk()
    {
        _mock.Setup(s => s.GetVaccineStockAsync(It.IsAny<Guid?>())).ReturnsAsync(new List<VaccineStockDto>());
        var result = await _sut.GetVaccineStock();
        result.Should().BeOfType<OkObjectResult>();
    }
}
