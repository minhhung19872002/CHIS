using CHIS.API.Controllers;
using CHIS.Application.DTOs;
using CHIS.Application.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace CHIS.UnitTests.Controllers;

public class PrescriptionControllerTests
{
    private readonly Mock<IPrescriptionService> _mock;
    private readonly PrescriptionController _sut;

    public PrescriptionControllerTests()
    {
        _mock = new Mock<IPrescriptionService>();
        _sut = new PrescriptionController(_mock.Object);
    }

    [Fact]
    public async Task GetById_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.GetByIdAsync(id)).ReturnsAsync(new PrescriptionDto { Id = id });
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
    public async Task GetByExamination_ReturnsOk()
    {
        _mock.Setup(s => s.GetByExaminationAsync(It.IsAny<Guid>())).ReturnsAsync(new List<PrescriptionDto>());
        var result = await _sut.GetByExamination(Guid.NewGuid());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task Search_ReturnsOk()
    {
        _mock.Setup(s => s.SearchAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string?>(), It.IsAny<int?>()))
            .ReturnsAsync(new PagedResult<PrescriptionDto>());
        var result = await _sut.Search();
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task Create_ReturnsOk()
    {
        _mock.Setup(s => s.CreateAsync(It.IsAny<CreatePrescriptionDto>())).ReturnsAsync(new PrescriptionDto());
        var result = await _sut.Create(new CreatePrescriptionDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task Confirm_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.ConfirmAsync(id)).Returns(Task.CompletedTask);
        var result = await _sut.Confirm(id);
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task Confirm_NotFound_ReturnsNotFound()
    {
        _mock.Setup(s => s.ConfirmAsync(It.IsAny<Guid>())).ThrowsAsync(new KeyNotFoundException());
        var result = await _sut.Confirm(Guid.NewGuid());
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task Cancel_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.CancelAsync(id)).Returns(Task.CompletedTask);
        var result = await _sut.Cancel(id);
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
    public async Task SearchMedicines_ReturnsOk()
    {
        _mock.Setup(s => s.SearchMedicinesAsync(It.IsAny<MedicineSearchDto>())).ReturnsAsync(new PagedResult<MedicineDto>());
        var result = await _sut.SearchMedicines(new MedicineSearchDto());
        result.Should().BeOfType<OkObjectResult>();
    }
}
