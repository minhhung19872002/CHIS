using CHIS.API.Controllers;
using CHIS.Application.DTOs;
using CHIS.Application.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace CHIS.UnitTests.Controllers;

public class EquipmentControllerTests
{
    private readonly Mock<IEquipmentService> _mock;
    private readonly EquipmentController _sut;

    public EquipmentControllerTests()
    {
        _mock = new Mock<IEquipmentService>();
        _sut = new EquipmentController(_mock.Object);
    }

    [Fact]
    public async Task Search_ReturnsOk()
    {
        _mock.Setup(s => s.SearchAsync(It.IsAny<EquipmentSearchDto>())).ReturnsAsync(new PagedResult<EquipmentDto>());
        var result = await _sut.Search(new EquipmentSearchDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetById_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.GetByIdAsync(id)).ReturnsAsync(new EquipmentDto { Id = id });
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
        _mock.Setup(s => s.CreateAsync(It.IsAny<CreateEquipmentDto>())).ReturnsAsync(new EquipmentDto());
        var result = await _sut.Create(new CreateEquipmentDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task Update_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.UpdateAsync(id, It.IsAny<CreateEquipmentDto>())).ReturnsAsync(new EquipmentDto());
        var result = await _sut.Update(id, new CreateEquipmentDto());
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
    public async Task Delete_NotFound_ReturnsNotFound()
    {
        _mock.Setup(s => s.DeleteAsync(It.IsAny<Guid>())).ThrowsAsync(new KeyNotFoundException());
        var result = await _sut.Delete(Guid.NewGuid());
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task Transfer_ReturnsOk()
    {
        var equipmentId = Guid.NewGuid();
        var deptId = Guid.NewGuid();
        _mock.Setup(s => s.TransferAsync(equipmentId, deptId, It.IsAny<string?>())).ReturnsAsync(new EquipmentTransferDto());
        var result = await _sut.Transfer(equipmentId, deptId);
        result.Should().BeOfType<OkObjectResult>();
    }
}
