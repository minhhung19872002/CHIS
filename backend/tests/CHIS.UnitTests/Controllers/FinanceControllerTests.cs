using CHIS.API.Controllers;
using CHIS.Application.DTOs;
using CHIS.Application.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace CHIS.UnitTests.Controllers;

public class FinanceControllerTests
{
    private readonly Mock<IFinanceService> _mock;
    private readonly FinanceController _sut;

    public FinanceControllerTests()
    {
        _mock = new Mock<IFinanceService>();
        _sut = new FinanceController(_mock.Object);
    }

    [Fact]
    public async Task SearchVouchers_ReturnsOk()
    {
        _mock.Setup(s => s.SearchVouchersAsync(It.IsAny<FinanceSearchDto>())).ReturnsAsync(new PagedResult<FinanceVoucherDto>());
        var result = await _sut.SearchVouchers(new FinanceSearchDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task CreateVoucher_ReturnsOk()
    {
        _mock.Setup(s => s.CreateVoucherAsync(It.IsAny<CreateFinanceVoucherDto>())).ReturnsAsync(new FinanceVoucherDto());
        var result = await _sut.CreateVoucher(new CreateFinanceVoucherDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task ApproveVoucher_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.ApproveVoucherAsync(id)).Returns(Task.CompletedTask);
        var result = await _sut.ApproveVoucher(id);
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task ApproveVoucher_NotFound_ReturnsNotFound()
    {
        _mock.Setup(s => s.ApproveVoucherAsync(It.IsAny<Guid>())).ThrowsAsync(new KeyNotFoundException());
        var result = await _sut.ApproveVoucher(Guid.NewGuid());
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task CancelVoucher_ReturnsOk()
    {
        var id = Guid.NewGuid();
        _mock.Setup(s => s.CancelVoucherAsync(id)).Returns(Task.CompletedTask);
        var result = await _sut.CancelVoucher(id);
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetBalance_ReturnsOk()
    {
        _mock.Setup(s => s.GetBalanceAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<Guid?>())).ReturnsAsync(new FinanceVoucherDto());
        var result = await _sut.GetBalance(2026, 3);
        result.Should().BeOfType<OkObjectResult>();
    }
}
