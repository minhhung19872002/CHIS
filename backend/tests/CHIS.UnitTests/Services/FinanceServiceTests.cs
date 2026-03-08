using CHIS.Application.DTOs;
using CHIS.Core.Entities;
using CHIS.Infrastructure.Data;
using CHIS.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CHIS.UnitTests.Services;

public class FinanceServiceTests : IDisposable
{
    private readonly CHISDbContext _db;
    private readonly UnitOfWork _uow;
    private readonly FinanceService _sut;

    public FinanceServiceTests()
    {
        _db = TestDbContextFactory.Create();
        _uow = new UnitOfWork(_db);
        _sut = new FinanceService(_db, _uow);
    }

    public void Dispose() => _db.Dispose();

    private async Task SeedDataAsync()
    {
        await _db.FinanceVouchers.AddRangeAsync(
            new FinanceVoucher
            {
                VoucherCode = "PT2603010001",
                VoucherType = "PhieuThu",
                VoucherDate = new DateTime(2026, 3, 1),
                Amount = 10000000m,
                Description = "Thu vien phi",
                Category = "VienPhi",
                Status = 1
            },
            new FinanceVoucher
            {
                VoucherCode = "PC2603010001",
                VoucherType = "PhieuChi",
                VoucherDate = new DateTime(2026, 3, 2),
                Amount = 3000000m,
                Description = "Chi mua thuoc",
                Category = "Thuoc",
                Status = 1
            },
            new FinanceVoucher
            {
                VoucherCode = "PT2603030001",
                VoucherType = "PhieuThu",
                VoucherDate = new DateTime(2026, 3, 3),
                Amount = 5000000m,
                Description = "Thu BHYT",
                Category = "BHYT",
                Status = 0
            }
        );
        await _db.SaveChangesAsync();
    }

    [Fact]
    public async Task SearchVouchersAsync_ByKeywordAndTypeFilter()
    {
        await SeedDataAsync();

        var result = await _sut.SearchVouchersAsync(new FinanceSearchDto
        {
            VoucherType = "PhieuThu",
            PageSize = 20
        });

        result.Items.Should().HaveCount(2);
        result.Items.Should().OnlyContain(v => v.VoucherType == "PhieuThu");
    }

    [Fact]
    public async Task CreateVoucherAsync_CreatesWithAutoCode_PhieuThu()
    {
        var result = await _sut.CreateVoucherAsync(new CreateFinanceVoucherDto
        {
            VoucherType = "PhieuThu",
            Amount = 15000000m,
            Description = "Thu phi kham benh",
            Category = "VienPhi"
        });

        result.Should().NotBeNull();
        result.VoucherCode.Should().StartWith("PT");
        result.VoucherType.Should().Be("PhieuThu");
        result.Amount.Should().Be(15000000m);
        result.Status.Should().Be(0);
    }

    [Fact]
    public async Task CreateVoucherAsync_CreatesWithAutoCode_PhieuChi()
    {
        var result = await _sut.CreateVoucherAsync(new CreateFinanceVoucherDto
        {
            VoucherType = "PhieuChi",
            Amount = 8000000m,
            Description = "Chi mua vat tu",
            Category = "VatTu"
        });

        result.Should().NotBeNull();
        result.VoucherCode.Should().StartWith("PC");
        result.VoucherType.Should().Be("PhieuChi");
    }

    [Fact]
    public async Task ApproveVoucherAsync_SetsStatus1()
    {
        await SeedDataAsync();
        var pending = await _db.FinanceVouchers.FirstAsync(v => v.Status == 0);

        await _sut.ApproveVoucherAsync(pending.Id);

        var updated = await _db.FinanceVouchers.FindAsync(pending.Id);
        updated!.Status.Should().Be(1);
    }

    [Fact]
    public async Task CancelVoucherAsync_SetsStatus2()
    {
        await SeedDataAsync();
        var pending = await _db.FinanceVouchers.FirstAsync(v => v.Status == 0);

        await _sut.CancelVoucherAsync(pending.Id);

        var updated = await _db.FinanceVouchers.FindAsync(pending.Id);
        updated!.Status.Should().Be(2);
    }

    [Fact]
    public async Task GetBalanceAsync_CalculatesReceiptsMinusPayments()
    {
        await SeedDataAsync();

        var result = await _sut.GetBalanceAsync(2026, 3);

        // Only approved (Status=1) vouchers count:
        // Receipts: 10,000,000 (PhieuThu, Status=1)
        // Payments: 3,000,000 (PhieuChi, Status=1)
        // Balance: 7,000,000
        result.Amount.Should().Be(7000000m);
        result.VoucherType.Should().Be("Balance");
    }
}
