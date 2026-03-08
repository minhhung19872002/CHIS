using CHIS.Application.DTOs;
using CHIS.Core.Entities;
using CHIS.Infrastructure.Data;
using CHIS.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CHIS.UnitTests.Services;

public class PrescriptionServiceTests : IDisposable
{
    private readonly CHISDbContext _db;
    private readonly UnitOfWork _uow;
    private readonly PrescriptionService _sut;

    public PrescriptionServiceTests()
    {
        _db = TestDbContextFactory.Create();
        _uow = new UnitOfWork(_db);
        _sut = new PrescriptionService(_db, _uow);
    }

    public void Dispose() => _db.Dispose();

    private async Task<(Patient patient, Examination exam, Medicine med)> SeedDataAsync()
    {
        var patient = TestHelper.CreatePatient();
        await _db.Patients.AddAsync(patient);
        var record = new MedicalRecord { RecordNumber = "BA001", PatientId = patient.Id, RecordDate = DateTime.UtcNow, Status = 0 };
        await _db.MedicalRecords.AddAsync(record);
        var exam = new Examination { PatientId = patient.Id, MedicalRecordId = record.Id, ExamDate = DateTime.UtcNow, Status = 1 };
        await _db.Examinations.AddAsync(exam);
        var med = TestHelper.CreateMedicine();
        med.SellPrice = 5000;
        await _db.Medicines.AddAsync(med);
        await _db.SaveChangesAsync();
        return (patient, exam, med);
    }

    [Fact]
    public async Task CreateAsync_CreatesPrescriptionWithItems()
    {
        var (patient, exam, med) = await SeedDataAsync();

        var result = await _sut.CreateAsync(new CreatePrescriptionDto
        {
            ExaminationId = exam.Id,
            PatientId = patient.Id,
            Diagnosis = "Cam cum",
            Items = new List<CreatePrescriptionItemDto>
            {
                new() { MedicineId = med.Id, Quantity = 10, Dosage = "500mg", Usage = "Uong", DaysSupply = 5 }
            }
        });

        result.PatientId.Should().Be(patient.Id);
        result.Diagnosis.Should().Be("Cam cum");
        result.Status.Should().Be(0);
        result.Items.Should().ContainSingle();
        result.Items[0].UnitPrice.Should().Be(5000);
        result.Items[0].TotalAmount.Should().Be(50000);
    }

    [Fact]
    public async Task GetByIdAsync_Existing_ReturnsDto()
    {
        var (patient, exam, med) = await SeedDataAsync();
        var rx = new Prescription
        {
            ExaminationId = exam.Id, PatientId = patient.Id,
            PrescriptionDate = DateTime.UtcNow, Status = 0,
            Items = new List<PrescriptionItem>
            {
                new() { MedicineId = med.Id, Quantity = 5, UnitPrice = 5000, TotalAmount = 25000 }
            }
        };
        await _db.Prescriptions.AddAsync(rx);
        await _db.SaveChangesAsync();

        var result = await _sut.GetByIdAsync(rx.Id);

        result.Id.Should().Be(rx.Id);
        result.PatientName.Should().Be(patient.FullName);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistent_ThrowsNotFound()
    {
        var act = () => _sut.GetByIdAsync(Guid.NewGuid());
        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task GetByExaminationAsync_ReturnsExamPrescriptions()
    {
        var (patient, exam, med) = await SeedDataAsync();
        await _db.Prescriptions.AddRangeAsync(
            new Prescription { ExaminationId = exam.Id, PatientId = patient.Id, PrescriptionDate = DateTime.UtcNow, Status = 0, Items = new List<PrescriptionItem>() },
            new Prescription { ExaminationId = exam.Id, PatientId = patient.Id, PrescriptionDate = DateTime.UtcNow, Status = 0, Items = new List<PrescriptionItem>() }
        );
        await _db.SaveChangesAsync();

        var result = await _sut.GetByExaminationAsync(exam.Id);

        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task ConfirmAsync_SetsStatusTo1()
    {
        var (patient, exam, _) = await SeedDataAsync();
        var rx = new Prescription { ExaminationId = exam.Id, PatientId = patient.Id, PrescriptionDate = DateTime.UtcNow, Status = 0, Items = new List<PrescriptionItem>() };
        await _db.Prescriptions.AddAsync(rx);
        await _db.SaveChangesAsync();

        await _sut.ConfirmAsync(rx.Id);

        var updated = await _db.Prescriptions.FindAsync(rx.Id);
        updated!.Status.Should().Be(1);
    }

    [Fact]
    public async Task CancelAsync_SetsStatusTo3()
    {
        var (patient, exam, _) = await SeedDataAsync();
        var rx = new Prescription { ExaminationId = exam.Id, PatientId = patient.Id, PrescriptionDate = DateTime.UtcNow, Status = 0, Items = new List<PrescriptionItem>() };
        await _db.Prescriptions.AddAsync(rx);
        await _db.SaveChangesAsync();

        await _sut.CancelAsync(rx.Id);

        var updated = await _db.Prescriptions.FindAsync(rx.Id);
        updated!.Status.Should().Be(3);
    }

    [Fact]
    public async Task DeleteAsync_SoftDeletes()
    {
        var (patient, exam, _) = await SeedDataAsync();
        var rx = new Prescription { ExaminationId = exam.Id, PatientId = patient.Id, PrescriptionDate = DateTime.UtcNow, Status = 0, Items = new List<PrescriptionItem>() };
        await _db.Prescriptions.AddAsync(rx);
        await _db.SaveChangesAsync();

        await _sut.DeleteAsync(rx.Id);

        var deleted = await _db.Prescriptions.IgnoreQueryFilters().FirstAsync(p => p.Id == rx.Id);
        deleted.IsDeleted.Should().BeTrue();
    }

    [Fact]
    public async Task SearchMedicinesAsync_ByKeyword_FiltersResults()
    {
        await _db.Medicines.AddRangeAsync(
            new Medicine { Code = "M01", Name = "Paracetamol", Unit = "Vien", IsActive = true },
            new Medicine { Code = "M02", Name = "Amoxicillin", Unit = "Vien", IsActive = true },
            new Medicine { Code = "M03", Name = "Panadol Extra", Unit = "Vien", IsActive = true }
        );
        await _db.SaveChangesAsync();

        var result = await _sut.SearchMedicinesAsync(new MedicineSearchDto { Keyword = "Para", PageSize = 20 });

        result.Items.Should().HaveCount(1);
        result.Items[0].Name.Should().Be("Paracetamol");
    }

    [Fact]
    public async Task CreateMedicineAsync_CreatesMedicine()
    {
        var result = await _sut.CreateMedicineAsync(new MedicineDto
        {
            Code = "M99", Name = "Test Med", Unit = "Vien", SellPrice = 1000
        });

        result.Id.Should().NotBeEmpty();
        result.Name.Should().Be("Test Med");
    }

    [Fact]
    public async Task GetMedicineByIdAsync_NonExistent_ThrowsNotFound()
    {
        var act = () => _sut.GetMedicineByIdAsync(Guid.NewGuid());
        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task SearchAsync_ByStatus_FiltersResults()
    {
        var (patient, exam, _) = await SeedDataAsync();
        await _db.Prescriptions.AddRangeAsync(
            new Prescription { ExaminationId = exam.Id, PatientId = patient.Id, PrescriptionDate = DateTime.UtcNow, Status = 0, Items = new List<PrescriptionItem>() },
            new Prescription { ExaminationId = exam.Id, PatientId = patient.Id, PrescriptionDate = DateTime.UtcNow, Status = 1, Items = new List<PrescriptionItem>() }
        );
        await _db.SaveChangesAsync();

        var result = await _sut.SearchAsync(0, 20, status: 1);

        result.Items.Should().ContainSingle();
    }
}
