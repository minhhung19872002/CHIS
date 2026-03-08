using CHIS.API.Controllers;
using CHIS.Application.DTOs;
using CHIS.Application.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace CHIS.UnitTests.Controllers;

public class PharmacyControllerTests
{
    private readonly Mock<IPharmacyService> _mock;
    private readonly PharmacyController _sut;

    public PharmacyControllerTests()
    {
        _mock = new Mock<IPharmacyService>();
        _sut = new PharmacyController(_mock.Object);
    }

    [Fact]
    public async Task GetStock_ReturnsOk()
    {
        _mock.Setup(s => s.GetStockAsync(It.IsAny<StockSearchDto>())).ReturnsAsync(new PagedResult<StockBalanceDto>());
        var result = await _sut.GetStock(new StockSearchDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task CreateReceipt_ReturnsOk()
    {
        _mock.Setup(s => s.CreateReceiptAsync(It.IsAny<CreateStockReceiptDto>())).ReturnsAsync(new StockReceiptDto());
        var result = await _sut.CreateReceipt(new CreateStockReceiptDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task ApproveReceipt_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.ApproveReceiptAsync(id)).Returns(Task.CompletedTask);
        var result = await _sut.ApproveReceipt(id);
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task ApproveReceipt_NotFound_ReturnsNotFound()
    {
        _mock.Setup(s => s.ApproveReceiptAsync(It.IsAny<Guid>())).ThrowsAsync(new KeyNotFoundException());
        var result = await _sut.ApproveReceipt(Guid.NewGuid());
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task Dispense_ReturnsOk()
    {
        _mock.Setup(s => s.DispensePrescriptionAsync(It.IsAny<DispensePrescriptionDto>())).Returns(Task.CompletedTask);
        var result = await _sut.Dispense(new DispensePrescriptionDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task Dispense_NotFound_ReturnsNotFound()
    {
        _mock.Setup(s => s.DispensePrescriptionAsync(It.IsAny<DispensePrescriptionDto>())).ThrowsAsync(new KeyNotFoundException("Not found"));
        var result = await _sut.Dispense(new DispensePrescriptionDto());
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task GetWarehouses_ReturnsOk()
    {
        _mock.Setup(s => s.GetWarehousesAsync()).ReturnsAsync(new List<WarehouseDto>());
        var result = await _sut.GetWarehouses();
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task CreateWarehouse_ReturnsOk()
    {
        _mock.Setup(s => s.CreateWarehouseAsync(It.IsAny<WarehouseDto>())).ReturnsAsync(new WarehouseDto());
        var result = await _sut.CreateWarehouse(new WarehouseDto());
        result.Should().BeOfType<OkObjectResult>();
    }
}
