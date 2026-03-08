using CHIS.API.Controllers;
using CHIS.Application.DTOs;
using CHIS.Application.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace CHIS.UnitTests.Controllers;

public class ExaminationControllerTests
{
    private readonly Mock<IExaminationService> _mock;
    private readonly ExaminationController _sut;

    public ExaminationControllerTests()
    {
        _mock = new Mock<IExaminationService>();
        _sut = new ExaminationController(_mock.Object);
    }

    [Fact]
    public async Task GetById_Existing_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.GetByIdAsync(id)).ReturnsAsync(new ExaminationDto { Id = id });
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
    public async Task Search_ReturnsOk()
    {
        var dto = new ExaminationSearchDto { PageSize = 20 };
        _mock.Setup(s => s.SearchAsync(dto)).ReturnsAsync(new PagedResult<ExaminationDto>());
        var result = await _sut.Search(dto);
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task Create_ReturnsOk()
    {
        var dto = new CreateExaminationDto { PatientId = Guid.NewGuid() };
        _mock.Setup(s => s.CreateAsync(dto)).ReturnsAsync(new ExaminationDto());
        var result = await _sut.Create(dto);
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task Update_Existing_ReturnsOk()
    {
        var id = Guid.NewGuid();
        var dto = new UpdateExaminationDto { ChiefComplaint = "Test" };
        _mock.Setup(s => s.UpdateAsync(id, dto)).ReturnsAsync(new ExaminationDto());
        var result = await _sut.Update(id, dto);
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task Update_NotFound_ReturnsNotFound()
    {
        _mock.Setup(s => s.UpdateAsync(It.IsAny<Guid>(), It.IsAny<UpdateExaminationDto>())).ThrowsAsync(new KeyNotFoundException());
        var result = await _sut.Update(Guid.NewGuid(), new UpdateExaminationDto());
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task Complete_Existing_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.CompleteExaminationAsync(id)).Returns(Task.CompletedTask);
        var result = await _sut.Complete(id);
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task Complete_NotFound_ReturnsNotFound()
    {
        _mock.Setup(s => s.CompleteExaminationAsync(It.IsAny<Guid>())).ThrowsAsync(new KeyNotFoundException());
        var result = await _sut.Complete(Guid.NewGuid());
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task CallNext_EmptyQueue_ReturnsBadRequest()
    {
        _mock.Setup(s => s.CallNextAsync(It.IsAny<Guid>())).ThrowsAsync(new InvalidOperationException("No tickets"));
        var result = await _sut.CallNext(Guid.NewGuid());
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task CancelTicket_Existing_ReturnsNoContent()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.CancelQueueTicketAsync(id)).Returns(Task.CompletedTask);
        var result = await _sut.CancelTicket(id);
        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public async Task CancelTicket_NotFound_ReturnsNotFound()
    {
        _mock.Setup(s => s.CancelQueueTicketAsync(It.IsAny<Guid>())).ThrowsAsync(new KeyNotFoundException());
        var result = await _sut.CancelTicket(Guid.NewGuid());
        result.Should().BeOfType<NotFoundResult>();
    }
}
