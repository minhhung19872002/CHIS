using CHIS.API.Controllers;
using CHIS.Application.DTOs;
using CHIS.Application.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace CHIS.UnitTests.Controllers;

public class BillingControllerTests
{
    private readonly Mock<IBillingService> _mock;
    private readonly BillingController _sut;

    public BillingControllerTests()
    {
        _mock = new Mock<IBillingService>();
        _sut = new BillingController(_mock.Object);
    }

    [Fact]
    public async Task GetById_Existing_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.GetByIdAsync(id)).ReturnsAsync(new ReceiptDto { Id = id });
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
        _mock.Setup(s => s.SearchAsync(It.IsAny<ReceiptSearchDto>())).ReturnsAsync(new PagedResult<ReceiptDto>());
        var result = await _sut.Search(new ReceiptSearchDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task Create_ReturnsOk()
    {
        _mock.Setup(s => s.CreateAsync(It.IsAny<CreateReceiptDto>())).ReturnsAsync(new ReceiptDto());
        var result = await _sut.Create(new CreateReceiptDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task Pay_Existing_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.PayAsync(id, "TienMat")).ReturnsAsync(new ReceiptDto { Status = 1 });
        var result = await _sut.Pay(id, "TienMat");
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task Pay_NotFound_ReturnsNotFound()
    {
        _mock.Setup(s => s.PayAsync(It.IsAny<Guid>(), It.IsAny<string>())).ThrowsAsync(new KeyNotFoundException());
        var result = await _sut.Pay(Guid.NewGuid());
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task Cancel_Existing_ReturnsOk()
    {
        _mock.Setup(s => s.CancelAsync(It.IsAny<Guid>())).Returns(Task.CompletedTask);
        var result = await _sut.Cancel(Guid.NewGuid());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task Cancel_NotFound_ReturnsNotFound()
    {
        _mock.Setup(s => s.CancelAsync(It.IsAny<Guid>())).ThrowsAsync(new KeyNotFoundException());
        var result = await _sut.Cancel(Guid.NewGuid());
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task GetRevenue_ReturnsOk()
    {
        _mock.Setup(s => s.GetRevenueReportAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>(), null))
            .ReturnsAsync(new RevenueReportDto());
        var result = await _sut.GetRevenue(DateTime.Today.AddDays(-30), DateTime.Today);
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetByPatient_ReturnsOk()
    {
        _mock.Setup(s => s.GetByPatientAsync(It.IsAny<Guid>())).ReturnsAsync(new List<ReceiptDto>());
        var result = await _sut.GetByPatient(Guid.NewGuid());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetByMedicalRecord_ReturnsOk()
    {
        _mock.Setup(s => s.GetByMedicalRecordAsync(It.IsAny<Guid>())).ReturnsAsync(new List<ReceiptDto>());
        var result = await _sut.GetByMedicalRecord(Guid.NewGuid());
        result.Should().BeOfType<OkObjectResult>();
    }
}
