using CHIS.Application.DTOs;
using CHIS.Core.Entities;
using CHIS.Infrastructure.Data;
using CHIS.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CHIS.UnitTests.Services;

public class BillingServiceTests : IDisposable
{
    private readonly CHISDbContext _db;
    private readonly UnitOfWork _uow;
    private readonly BillingService _sut;

    public BillingServiceTests()
    {
        _db = TestDbContextFactory.Create();
        _uow = new UnitOfWork(_db);
        _sut = new BillingService(_db, _uow);
    }

    public void Dispose()
    {
        _db.Dispose();
    }

    private async Task<(Patient patient, MedicalRecord record)> SeedBillingDataAsync()
    {
        var patient = TestHelper.CreatePatient();
        await _db.Patients.AddAsync(patient);
        var record = new MedicalRecord
        {
            RecordNumber = "BA001",
            PatientId = patient.Id,
            RecordDate = DateTime.UtcNow,
            Status = 0
        };
        await _db.MedicalRecords.AddAsync(record);
        await _db.SaveChangesAsync();
        return (patient, record);
    }

    [Fact]
    public async Task CreateAsync_CalculatesAmountsCorrectly()
    {
        var (patient, record) = await SeedBillingDataAsync();

        var result = await _sut.CreateAsync(new CreateReceiptDto
        {
            PatientId = patient.Id,
            MedicalRecordId = record.Id,
            PaymentMethod = "TienMat",
            Details = new List<CreateReceiptDetailDto>
            {
                new() { ItemType = "KhamBenh", ItemName = "Kham benh", Quantity = 1, UnitPrice = 50000, BhytPercent = 80 },
                new() { ItemType = "XetNghiem", ItemName = "Xet nghiem mau", Quantity = 1, UnitPrice = 100000, BhytPercent = 80 }
            }
        });

        result.ReceiptNumber.Should().StartWith("PT");
        result.TotalAmount.Should().Be(150000m);
        result.BhytAmount.Should().Be(120000m);
        result.PatientAmount.Should().Be(30000m);
        result.Status.Should().Be(0);

        // Verify details were created in DB
        var detailCount = await _db.ReceiptDetails.CountAsync();
        detailCount.Should().Be(2);
    }

    [Fact]
    public async Task CreateAsync_WithDiscount_AppliesDiscount()
    {
        var (patient, record) = await SeedBillingDataAsync();

        var result = await _sut.CreateAsync(new CreateReceiptDto
        {
            PatientId = patient.Id,
            MedicalRecordId = record.Id,
            DiscountAmount = 10000,
            Details = new List<CreateReceiptDetailDto>
            {
                new() { ItemType = "KhamBenh", ItemName = "Kham benh", Quantity = 1, UnitPrice = 100000 }
            }
        });

        result.TotalAmount.Should().Be(100000m);
        result.BhytAmount.Should().Be(0m);
        result.PatientAmount.Should().Be(90000m);
    }

    [Fact]
    public async Task GetByIdAsync_ExistingReceipt_ReturnsDto()
    {
        var (patient, record) = await SeedBillingDataAsync();
        var receipt = new Receipt
        {
            ReceiptNumber = "PT001",
            PatientId = patient.Id,
            MedicalRecordId = record.Id,
            ReceiptDate = DateTime.UtcNow,
            TotalAmount = 100000,
            BhytAmount = 80000,
            PatientAmount = 20000,
            Status = 0,
            Details = new List<ReceiptDetail>()
        };
        await _db.Receipts.AddAsync(receipt);
        await _db.SaveChangesAsync();

        var result = await _sut.GetByIdAsync(receipt.Id);

        result.Id.Should().Be(receipt.Id);
        result.ReceiptNumber.Should().Be("PT001");
        result.PatientName.Should().Be(patient.FullName);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistent_ThrowsNotFound()
    {
        var act = () => _sut.GetByIdAsync(Guid.NewGuid());

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task PayAsync_SetsStatusToPaid()
    {
        var (patient, record) = await SeedBillingDataAsync();
        var receipt = new Receipt
        {
            ReceiptNumber = "PT001",
            PatientId = patient.Id,
            MedicalRecordId = record.Id,
            ReceiptDate = DateTime.UtcNow,
            TotalAmount = 100000,
            BhytAmount = 0,
            PatientAmount = 100000,
            Status = 0,
            Details = new List<ReceiptDetail>()
        };
        await _db.Receipts.AddAsync(receipt);
        await _db.SaveChangesAsync();

        var result = await _sut.PayAsync(receipt.Id, "ChuyenKhoan");

        result.Status.Should().Be(1);
        result.PaymentMethod.Should().Be("ChuyenKhoan");
    }

    [Fact]
    public async Task CancelAsync_SetsCancelledStatus()
    {
        var (patient, record) = await SeedBillingDataAsync();
        var receipt = new Receipt
        {
            ReceiptNumber = "PT001",
            PatientId = patient.Id,
            MedicalRecordId = record.Id,
            ReceiptDate = DateTime.UtcNow,
            TotalAmount = 100000,
            BhytAmount = 0,
            PatientAmount = 100000,
            Status = 0,
            Details = new List<ReceiptDetail>()
        };
        await _db.Receipts.AddAsync(receipt);
        await _db.SaveChangesAsync();

        await _sut.CancelAsync(receipt.Id);

        var updated = await _db.Receipts.FindAsync(receipt.Id);
        updated!.Status.Should().Be(2);
    }

    [Fact]
    public async Task GetRevenueReportAsync_CalculatesCorrectly()
    {
        var (patient, record) = await SeedBillingDataAsync();
        var today = DateTime.UtcNow;

        await _db.Receipts.AddRangeAsync(
            new Receipt
            {
                ReceiptNumber = "PT001", PatientId = patient.Id, MedicalRecordId = record.Id,
                ReceiptDate = today, TotalAmount = 100000, BhytAmount = 80000, PatientAmount = 20000,
                Status = 1, Details = new List<ReceiptDetail>()
            },
            new Receipt
            {
                ReceiptNumber = "PT002", PatientId = patient.Id, MedicalRecordId = record.Id,
                ReceiptDate = today, TotalAmount = 200000, BhytAmount = 160000, PatientAmount = 40000,
                Status = 1, Details = new List<ReceiptDetail>()
            },
            new Receipt
            {
                ReceiptNumber = "PT003", PatientId = patient.Id, MedicalRecordId = record.Id,
                ReceiptDate = today, TotalAmount = 50000, BhytAmount = 0, PatientAmount = 50000,
                Status = 0, Details = new List<ReceiptDetail>()
            }
        );
        await _db.SaveChangesAsync();

        var result = await _sut.GetRevenueReportAsync(today.AddDays(-1), today.AddDays(1));

        result.TotalRevenue.Should().Be(300000m);
        result.BhytRevenue.Should().Be(240000m);
        result.TotalReceipts.Should().Be(2);
    }

    [Fact]
    public async Task GetByPatientAsync_ReturnsPatientReceipts()
    {
        var (patient, record) = await SeedBillingDataAsync();
        await _db.Receipts.AddAsync(new Receipt
        {
            ReceiptNumber = "PT001", PatientId = patient.Id, MedicalRecordId = record.Id,
            ReceiptDate = DateTime.UtcNow, TotalAmount = 100000, BhytAmount = 0, PatientAmount = 100000,
            Status = 1, Details = new List<ReceiptDetail>()
        });
        await _db.SaveChangesAsync();

        var result = await _sut.GetByPatientAsync(patient.Id);

        result.Should().ContainSingle();
    }

    [Fact]
    public async Task GetByMedicalRecordAsync_ReturnsRecordReceipts()
    {
        var (patient, record) = await SeedBillingDataAsync();
        await _db.Receipts.AddAsync(new Receipt
        {
            ReceiptNumber = "PT001", PatientId = patient.Id, MedicalRecordId = record.Id,
            ReceiptDate = DateTime.UtcNow, TotalAmount = 100000, BhytAmount = 0, PatientAmount = 100000,
            Status = 1, Details = new List<ReceiptDetail>()
        });
        await _db.SaveChangesAsync();

        var result = await _sut.GetByMedicalRecordAsync(record.Id);

        result.Should().ContainSingle();
    }

    [Fact]
    public async Task SearchAsync_ByStatus_Filters()
    {
        var (patient, record) = await SeedBillingDataAsync();
        await _db.Receipts.AddRangeAsync(
            new Receipt { ReceiptNumber = "PT001", PatientId = patient.Id, MedicalRecordId = record.Id, ReceiptDate = DateTime.UtcNow, TotalAmount = 100000, BhytAmount = 0, PatientAmount = 100000, Status = 0, Details = new List<ReceiptDetail>() },
            new Receipt { ReceiptNumber = "PT002", PatientId = patient.Id, MedicalRecordId = record.Id, ReceiptDate = DateTime.UtcNow, TotalAmount = 200000, BhytAmount = 0, PatientAmount = 200000, Status = 1, Details = new List<ReceiptDetail>() }
        );
        await _db.SaveChangesAsync();

        var result = await _sut.SearchAsync(new ReceiptSearchDto { Status = 1, PageSize = 20 });

        result.Items.Should().ContainSingle();
        result.Items[0].Status.Should().Be(1);
    }
}
