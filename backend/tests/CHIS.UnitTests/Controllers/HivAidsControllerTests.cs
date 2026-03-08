using CHIS.API.Controllers;
using CHIS.Application.DTOs;
using CHIS.Application.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace CHIS.UnitTests.Controllers;

public class HivAidsControllerTests
{
    private readonly Mock<IHivAidsService> _mock;
    private readonly HivAidsController _sut;

    public HivAidsControllerTests()
    {
        _mock = new Mock<IHivAidsService>();
        _sut = new HivAidsController(_mock.Object);
    }

    [Fact]
    public async Task Search_ReturnsOk()
    {
        _mock.Setup(s => s.SearchAsync(It.IsAny<HivSearchDto>())).ReturnsAsync(new PagedResult<HivPatientDto>());
        var result = await _sut.Search(new HivSearchDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetById_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.GetByIdAsync(id)).ReturnsAsync(new HivPatientDto { Id = id });
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
        _mock.Setup(s => s.RegisterAsync(It.IsAny<CreateHivPatientDto>())).ReturnsAsync(new HivPatientDto());
        var result = await _sut.Register(new CreateHivPatientDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task Update_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.UpdateAsync(id, It.IsAny<CreateHivPatientDto>())).ReturnsAsync(new HivPatientDto());
        var result = await _sut.Update(id, new CreateHivPatientDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetTreatmentCourses_ReturnsOk()
    {
        _mock.Setup(s => s.GetTreatmentCoursesAsync(It.IsAny<Guid>())).ReturnsAsync(new List<ArvTreatmentCourseDto>());
        var result = await _sut.GetTreatmentCourses(Guid.NewGuid());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task StartTreatmentCourse_ReturnsOk()
    {
        _mock.Setup(s => s.StartTreatmentCourseAsync(It.IsAny<CreateArvTreatmentCourseDto>())).ReturnsAsync(new ArvTreatmentCourseDto());
        var result = await _sut.StartTreatmentCourse(new CreateArvTreatmentCourseDto());
        result.Should().BeOfType<OkObjectResult>();
    }
}
