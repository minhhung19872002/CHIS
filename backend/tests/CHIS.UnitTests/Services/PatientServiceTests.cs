using CHIS.Application.DTOs;
using CHIS.Core.Entities;
using CHIS.Infrastructure.Data;
using CHIS.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CHIS.UnitTests.Services;

public class PatientServiceTests : IDisposable
{
    private readonly CHISDbContext _db;
    private readonly UnitOfWork _uow;
    private readonly PatientService _sut;

    public PatientServiceTests()
    {
        _db = TestDbContextFactory.Create();
        _uow = new UnitOfWork(_db);
        _sut = new PatientService(_db, _uow);
    }

    public void Dispose()
    {
        _db.Dispose();
    }

    [Fact]
    public async Task GetByIdAsync_ExistingPatient_ReturnsDto()
    {
        var patient = TestHelper.CreatePatient();
        await _db.Patients.AddAsync(patient);
        await _db.SaveChangesAsync();

        var result = await _sut.GetByIdAsync(patient.Id);

        result.Id.Should().Be(patient.Id);
        result.FullName.Should().Be(patient.FullName);
        result.PatientCode.Should().Be(patient.PatientCode);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistent_ThrowsNotFound()
    {
        var act = () => _sut.GetByIdAsync(Guid.NewGuid());

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task CreateAsync_GeneratesPatientCode()
    {
        var result = await _sut.CreateAsync(new CreatePatientDto
        {
            FullName = "Tran Van B",
            DateOfBirth = new DateTime(1985, 6, 15),
            Gender = 1,
            Phone = "0912345678"
        });

        result.PatientCode.Should().StartWith("BN");
        result.FullName.Should().Be("Tran Van B");
        result.Gender.Should().Be(1);
    }

    [Fact]
    public async Task SearchAsync_ByKeyword_FiltersResults()
    {
        await _db.Patients.AddRangeAsync(
            TestHelper.CreatePatient("Nguyen Van A", "BN0001"),
            TestHelper.CreatePatient("Tran Thi B", "BN0002"),
            TestHelper.CreatePatient("Nguyen Van C", "BN0003")
        );
        await _db.SaveChangesAsync();

        var result = await _sut.SearchAsync(new PatientSearchDto { Keyword = "Nguyen", PageSize = 20 });

        result.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(2);
    }

    [Fact]
    public async Task SearchAsync_Pagination_ReturnsCorrectPage()
    {
        for (int i = 0; i < 5; i++)
            await _db.Patients.AddAsync(TestHelper.CreatePatient($"Patient {i}", $"BN{i:D4}"));
        await _db.SaveChangesAsync();

        var result = await _sut.SearchAsync(new PatientSearchDto { PageIndex = 1, PageSize = 2 });

        result.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(5);
        result.PageIndex.Should().Be(1);
    }

    [Fact]
    public async Task UpdateAsync_ValidData_UpdatesFields()
    {
        var patient = TestHelper.CreatePatient();
        await _db.Patients.AddAsync(patient);
        await _db.SaveChangesAsync();

        var result = await _sut.UpdateAsync(patient.Id, new UpdatePatientDto
        {
            FullName = "Updated Name",
            Phone = "0999999999",
            Gender = 2
        });

        result.FullName.Should().Be("Updated Name");
        result.Phone.Should().Be("0999999999");
        result.Gender.Should().Be(2);
    }

    [Fact]
    public async Task UpdateAsync_NonExistent_ThrowsNotFound()
    {
        var act = () => _sut.UpdateAsync(Guid.NewGuid(), new UpdatePatientDto { FullName = "x" });

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task DeleteAsync_SoftDeletesPatient()
    {
        var patient = TestHelper.CreatePatient();
        await _db.Patients.AddAsync(patient);
        await _db.SaveChangesAsync();

        await _sut.DeleteAsync(patient.Id);

        var deleted = await _db.Patients.IgnoreQueryFilters().FirstAsync(p => p.Id == patient.Id);
        deleted.IsDeleted.Should().BeTrue();
    }

    [Fact]
    public async Task DeleteAsync_NonExistent_ThrowsNotFound()
    {
        var act = () => _sut.DeleteAsync(Guid.NewGuid());

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task GetByInsuranceNumberAsync_Found_ReturnsDto()
    {
        var patient = TestHelper.CreatePatient();
        patient.InsuranceNumber = "HS4010099999999";
        await _db.Patients.AddAsync(patient);
        await _db.SaveChangesAsync();

        var result = await _sut.GetByInsuranceNumberAsync("HS4010099999999");

        result.Should().NotBeNull();
        result!.InsuranceNumber.Should().Be("HS4010099999999");
    }

    [Fact]
    public async Task GetByInsuranceNumberAsync_NotFound_ReturnsNull()
    {
        var result = await _sut.GetByInsuranceNumberAsync("NOTEXIST");

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByIdentityNumberAsync_Found_ReturnsDto()
    {
        var patient = TestHelper.CreatePatient();
        patient.IdentityNumber = "001090099999";
        await _db.Patients.AddAsync(patient);
        await _db.SaveChangesAsync();

        var result = await _sut.GetByIdentityNumberAsync("001090099999");

        result.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateMedicalRecordAsync_CreatesRecord()
    {
        var patient = TestHelper.CreatePatient();
        await _db.Patients.AddAsync(patient);
        await _db.SaveChangesAsync();

        var result = await _sut.CreateMedicalRecordAsync(patient.Id, "NgoaiTru", null);

        result.RecordNumber.Should().StartWith("BA");
        result.PatientId.Should().Be(patient.Id);
        result.RecordType.Should().Be("NgoaiTru");
        result.Status.Should().Be(0);
    }

    [Fact]
    public async Task CreateMedicalRecordAsync_NonExistentPatient_ThrowsNotFound()
    {
        var act = () => _sut.CreateMedicalRecordAsync(Guid.NewGuid(), null, null);

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task GetMedicalRecordsAsync_ReturnsRecordsForPatient()
    {
        var patient = TestHelper.CreatePatient();
        await _db.Patients.AddAsync(patient);
        await _db.MedicalRecords.AddRangeAsync(
            new MedicalRecord { RecordNumber = "BA001", PatientId = patient.Id, RecordDate = DateTime.UtcNow, Status = 0 },
            new MedicalRecord { RecordNumber = "BA002", PatientId = patient.Id, RecordDate = DateTime.UtcNow, Status = 0 }
        );
        await _db.SaveChangesAsync();

        var result = await _sut.GetMedicalRecordsAsync(patient.Id);

        result.Should().HaveCount(2);
    }
}
