using CHIS.API.Controllers;
using CHIS.Application.DTOs;
using CHIS.Application.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace CHIS.UnitTests.Controllers;

public class StaffControllerTests
{
    private readonly Mock<IStaffService> _mock;
    private readonly StaffController _sut;

    public StaffControllerTests()
    {
        _mock = new Mock<IStaffService>();
        _sut = new StaffController(_mock.Object);
    }

    [Fact]
    public async Task Search_ReturnsOk()
    {
        _mock.Setup(s => s.SearchAsync(It.IsAny<StaffSearchDto>())).ReturnsAsync(new PagedResult<StaffDto>());
        var result = await _sut.Search(new StaffSearchDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetById_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.GetByIdAsync(id)).ReturnsAsync(new StaffDto { Id = id });
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
    public async Task Create_ReturnsOk()
    {
        _mock.Setup(s => s.CreateAsync(It.IsAny<CreateStaffDto>())).ReturnsAsync(new StaffDto());
        var result = await _sut.Create(new CreateStaffDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task Update_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.UpdateAsync(id, It.IsAny<CreateStaffDto>())).ReturnsAsync(new StaffDto());
        var result = await _sut.Update(id, new CreateStaffDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task Delete_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.DeleteAsync(id)).Returns(Task.CompletedTask);
        var result = await _sut.Delete(id);
        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public async Task GetCollaborators_ReturnsOk()
    {
        _mock.Setup(s => s.GetCollaboratorsAsync(It.IsAny<Guid?>())).ReturnsAsync(new List<CollaboratorDto>());
        var result = await _sut.GetCollaborators();
        result.Should().BeOfType<OkObjectResult>();
    }
}
