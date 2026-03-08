using CHIS.Application.DTOs;
using CHIS.Core.Entities;
using CHIS.Infrastructure.Data;
using CHIS.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CHIS.UnitTests.Services;

public class PharmacyServiceTests : IDisposable
{
    private readonly CHISDbContext _db;
    private readonly UnitOfWork _uow;
    private readonly PharmacyService _sut;

    public PharmacyServiceTests()
    {
        _db = TestDbContextFactory.Create();
        _uow = new UnitOfWork(_db);
        _sut = new PharmacyService(_db, _uow);
    }

    public void Dispose()
    {
        _db.Dispose();
    }

    private async Task<(Warehouse warehouse, Medicine medicine, Supplier supplier)> SeedPharmacyDataAsync()
    {
        var warehouse = TestHelper.CreateWarehouse();
        var medicine = TestHelper.CreateMedicine();
        var supplier = new Supplier
        {
            Id = Guid.NewGuid(),
            Code = "NCC01",
            Name = "Nha cung cap A",
            IsActive = true
        };
        await _db.Warehouses.AddAsync(warehouse);
        await _db.Medicines.AddAsync(medicine);
        await _db.Suppliers.AddAsync(supplier);
        await _db.SaveChangesAsync();
        return (warehouse, medicine, supplier);
    }

    [Fact]
    public async Task CreateReceiptAsync_CreatesStockReceipt()
    {
        var (warehouse, medicine, supplier) = await SeedPharmacyDataAsync();

        var result = await _sut.CreateReceiptAsync(new CreateStockReceiptDto
        {
            WarehouseId = warehouse.Id,
            SupplierId = supplier.Id,
            ReceiptType = "NhapMua",
            Items = new List<CreateStockReceiptItemDto>
            {
                new() { MedicineId = medicine.Id, Quantity = 100, UnitPrice = 1000, BatchNumber = "LOT001" }
            }
        });

        result.ReceiptCode.Should().StartWith("PN");
        result.TotalAmount.Should().Be(100000m);
        result.Status.Should().Be(0);
    }

    [Fact]
    public async Task ApproveReceiptAsync_UpdatesStockBalance()
    {
        var (warehouse, medicine, _) = await SeedPharmacyDataAsync();

        var receipt = new StockReceipt
        {
            ReceiptCode = "PN001",
            WarehouseId = warehouse.Id,
            ReceiptDate = DateTime.UtcNow,
            TotalAmount = 50000,
            Status = 0,
            Items = new List<StockReceiptItem>
            {
                new()
                {
                    MedicineId = medicine.Id,
                    Quantity = 50,
                    UnitPrice = 1000,
                    TotalAmount = 50000,
                    BatchNumber = "LOT001"
                }
            }
        };
        await _db.StockReceipts.AddAsync(receipt);
        await _db.SaveChangesAsync();

        await _sut.ApproveReceiptAsync(receipt.Id);

        var balance = await _db.StockBalances
            .FirstOrDefaultAsync(b => b.WarehouseId == warehouse.Id && b.MedicineId == medicine.Id);
        balance.Should().NotBeNull();
        balance!.Quantity.Should().Be(50);
    }

    [Fact]
    public async Task ApproveReceiptAsync_ExistingBalance_AddsQuantity()
    {
        var (warehouse, medicine, _) = await SeedPharmacyDataAsync();

        await _db.StockBalances.AddAsync(new StockBalance
        {
            WarehouseId = warehouse.Id,
            MedicineId = medicine.Id,
            Quantity = 100,
            BatchNumber = "LOT001",
            UnitPrice = 1000
        });

        var receipt = new StockReceipt
        {
            ReceiptCode = "PN001",
            WarehouseId = warehouse.Id,
            ReceiptDate = DateTime.UtcNow,
            TotalAmount = 50000,
            Status = 0,
            Items = new List<StockReceiptItem>
            {
                new()
                {
                    MedicineId = medicine.Id,
                    Quantity = 50,
                    UnitPrice = 1000,
                    TotalAmount = 50000,
                    BatchNumber = "LOT001"
                }
            }
        };
        await _db.StockReceipts.AddAsync(receipt);
        await _db.SaveChangesAsync();

        await _sut.ApproveReceiptAsync(receipt.Id);

        var balance = await _db.StockBalances
            .FirstOrDefaultAsync(b => b.WarehouseId == warehouse.Id && b.MedicineId == medicine.Id);
        balance!.Quantity.Should().Be(150);
    }

    [Fact]
    public async Task ApproveReceiptAsync_NonExistent_ThrowsNotFound()
    {
        var act = () => _sut.ApproveReceiptAsync(Guid.NewGuid());

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task CancelReceiptAsync_SetsCancelledStatus()
    {
        var (warehouse, _, _) = await SeedPharmacyDataAsync();
        var receipt = new StockReceipt
        {
            ReceiptCode = "PN001",
            WarehouseId = warehouse.Id,
            ReceiptDate = DateTime.UtcNow,
            TotalAmount = 0,
            Status = 0,
            Items = new List<StockReceiptItem>()
        };
        await _db.StockReceipts.AddAsync(receipt);
        await _db.SaveChangesAsync();

        await _sut.CancelReceiptAsync(receipt.Id);

        var updated = await _db.StockReceipts.FindAsync(receipt.Id);
        updated!.Status.Should().Be(2);
    }

    [Fact]
    public async Task DispensePrescriptionAsync_DeductsStock()
    {
        var (warehouse, medicine, _) = await SeedPharmacyDataAsync();

        await _db.StockBalances.AddAsync(new StockBalance
        {
            WarehouseId = warehouse.Id,
            MedicineId = medicine.Id,
            Quantity = 100,
            BatchNumber = "LOT001",
            UnitPrice = 1000
        });

        var patient = TestHelper.CreatePatient();
        await _db.Patients.AddAsync(patient);
        var record = new MedicalRecord { RecordNumber = "BA001", PatientId = patient.Id, RecordDate = DateTime.UtcNow, Status = 0 };
        await _db.MedicalRecords.AddAsync(record);
        var exam = new Examination { PatientId = patient.Id, MedicalRecordId = record.Id, ExamDate = DateTime.UtcNow, Status = 1 };
        await _db.Examinations.AddAsync(exam);

        var prescription = new Prescription
        {
            ExaminationId = exam.Id,
            PatientId = patient.Id,
            PrescriptionDate = DateTime.UtcNow,
            Status = 1,
            IsDispensed = false,
            Items = new List<PrescriptionItem>
            {
                new() { MedicineId = medicine.Id, Quantity = 10, UnitPrice = 1000, TotalAmount = 10000 }
            }
        };
        await _db.Prescriptions.AddAsync(prescription);
        await _db.SaveChangesAsync();

        await _sut.DispensePrescriptionAsync(new DispensePrescriptionDto
        {
            PrescriptionId = prescription.Id,
            WarehouseId = warehouse.Id
        });

        var balance = await _db.StockBalances
            .FirstAsync(b => b.WarehouseId == warehouse.Id && b.MedicineId == medicine.Id);
        balance.Quantity.Should().Be(90);
    }

    [Fact]
    public async Task DispensePrescriptionAsync_InsufficientStock_ThrowsInvalidOperation()
    {
        var (warehouse, medicine, _) = await SeedPharmacyDataAsync();

        await _db.StockBalances.AddAsync(new StockBalance
        {
            WarehouseId = warehouse.Id,
            MedicineId = medicine.Id,
            Quantity = 5,
            BatchNumber = "LOT001",
            UnitPrice = 1000
        });

        var patient = TestHelper.CreatePatient();
        await _db.Patients.AddAsync(patient);
        var record = new MedicalRecord { RecordNumber = "BA001", PatientId = patient.Id, RecordDate = DateTime.UtcNow, Status = 0 };
        await _db.MedicalRecords.AddAsync(record);
        var exam = new Examination { PatientId = patient.Id, MedicalRecordId = record.Id, ExamDate = DateTime.UtcNow, Status = 1 };
        await _db.Examinations.AddAsync(exam);

        var prescription = new Prescription
        {
            ExaminationId = exam.Id,
            PatientId = patient.Id,
            PrescriptionDate = DateTime.UtcNow,
            Status = 1,
            IsDispensed = false,
            Items = new List<PrescriptionItem>
            {
                new() { MedicineId = medicine.Id, Quantity = 10, UnitPrice = 1000, TotalAmount = 10000 }
            }
        };
        await _db.Prescriptions.AddAsync(prescription);
        await _db.SaveChangesAsync();

        var act = () => _sut.DispensePrescriptionAsync(new DispensePrescriptionDto
        {
            PrescriptionId = prescription.Id,
            WarehouseId = warehouse.Id
        });

        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("*Insufficient*");
    }

    [Fact]
    public async Task DispensePrescriptionAsync_AlreadyDispensed_ThrowsInvalidOperation()
    {
        var (warehouse, medicine, _) = await SeedPharmacyDataAsync();
        var patient = TestHelper.CreatePatient();
        await _db.Patients.AddAsync(patient);
        var record = new MedicalRecord { RecordNumber = "BA001", PatientId = patient.Id, RecordDate = DateTime.UtcNow, Status = 0 };
        await _db.MedicalRecords.AddAsync(record);
        var exam = new Examination { PatientId = patient.Id, MedicalRecordId = record.Id, ExamDate = DateTime.UtcNow, Status = 1 };
        await _db.Examinations.AddAsync(exam);

        var prescription = new Prescription
        {
            ExaminationId = exam.Id,
            PatientId = patient.Id,
            PrescriptionDate = DateTime.UtcNow,
            Status = 1,
            IsDispensed = true,
            Items = new List<PrescriptionItem>()
        };
        await _db.Prescriptions.AddAsync(prescription);
        await _db.SaveChangesAsync();

        var act = () => _sut.DispensePrescriptionAsync(new DispensePrescriptionDto
        {
            PrescriptionId = prescription.Id,
            WarehouseId = warehouse.Id
        });

        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("*dispensed*");
    }
}
