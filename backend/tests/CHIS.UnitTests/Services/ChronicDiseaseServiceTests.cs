using CHIS.Application.DTOs;
using CHIS.Core.Entities;
using CHIS.Infrastructure.Data;
using CHIS.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CHIS.UnitTests.Services;

public class ChronicDiseaseServiceTests : IDisposable
{
    private readonly CHISDbContext _db;
    private readonly UnitOfWork _uow;
    private readonly ChronicDiseaseService _sut;

    public ChronicDiseaseServiceTests()
    {
        _db = TestDbContextFactory.Create();
        _uow = new UnitOfWork(_db);
        _sut = new ChronicDiseaseService(_db, _uow);
    }

    public void Dispose() => _db.Dispose();

    private async Task<(Patient patient, ChronicDiseaseRegister register)> SeedDataAsync()
    {
        var patient = TestHelper.CreatePatient();
        await _db.Patients.AddAsync(patient);
        var register = new ChronicDiseaseRegister
        {
            PatientId = patient.Id,
            DiseaseType = "hypertension",
            RegisterDate = DateTime.UtcNow,
            Status = "Active",
            Notes = "Tang huyet ap do 2",
            Treatments = new List<ChronicDiseaseTreatment>()
        };
        await _db.ChronicDiseaseRegisters.AddAsync(register);
        await _db.SaveChangesAsync();
        return (patient, register);
    }

    [Fact]
    public async Task SearchAsync_SearchByKeywordAndDiseaseType()
    {
        var (patient, _) = await SeedDataAsync();
        // Add another register with different disease type
        var patient2 = TestHelper.CreatePatient("Tran Van B", "BN0002");
        await _db.Patients.AddAsync(patient2);
        await _db.ChronicDiseaseRegisters.AddAsync(new ChronicDiseaseRegister
        {
            PatientId = patient2.Id,
            DiseaseType = "diabetes",
            RegisterDate = DateTime.UtcNow,
            Status = "Active",
            Treatments = new List<ChronicDiseaseTreatment>()
        });
        await _db.SaveChangesAsync();

        var result = await _sut.SearchAsync(new ChronicDiseaseSearchDto
        {
            DiseaseType = "hypertension",
            PageSize = 20
        });

        result.Items.Should().ContainSingle();
        result.Items[0].DiseaseType.Should().Be("hypertension");
        result.Items[0].PatientName.Should().Be(patient.FullName);
    }

    [Fact]
    public async Task RegisterAsync_CreatesRegisterWithActiveStatus()
    {
        var patient = TestHelper.CreatePatient();
        await _db.Patients.AddAsync(patient);
        await _db.SaveChangesAsync();

        var result = await _sut.RegisterAsync(new CreateChronicDiseaseRegisterDto
        {
            PatientId = patient.Id,
            DiseaseType = "diabetes",
            Notes = "Tieu duong type 2"
        });

        result.Should().NotBeNull();
        result.Status.Should().Be("Active");
        result.DiseaseType.Should().Be("diabetes");
        result.PatientName.Should().Be(patient.FullName);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsDtoWithTreatmentCount()
    {
        var (patient, register) = await SeedDataAsync();
        // Add treatments
        await _db.ChronicDiseaseTreatments.AddRangeAsync(
            new ChronicDiseaseTreatment { RegisterId = register.Id, TreatmentDate = DateTime.UtcNow, Progress = "On dinh" },
            new ChronicDiseaseTreatment { RegisterId = register.Id, TreatmentDate = DateTime.UtcNow, Progress = "Tot hon" }
        );
        await _db.SaveChangesAsync();

        var result = await _sut.GetByIdAsync(register.Id);

        result.Should().NotBeNull();
        result.TreatmentCount.Should().Be(2);
        result.DiseaseType.Should().Be("hypertension");
    }

    [Fact]
    public async Task GetByIdAsync_NonExistent_ThrowsKeyNotFoundException()
    {
        var act = () => _sut.GetByIdAsync(Guid.NewGuid());
        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task UpdateStatusAsync_UpdatesStatus()
    {
        var (_, register) = await SeedDataAsync();

        await _sut.UpdateStatusAsync(register.Id, "Treated");

        var updated = await _db.ChronicDiseaseRegisters.FindAsync(register.Id);
        updated!.Status.Should().Be("Treated");
    }

    [Fact]
    public async Task AddTreatmentAsync_CreatesTreatmentRecord()
    {
        var (_, register) = await SeedDataAsync();

        var result = await _sut.AddTreatmentAsync(new CreateChronicDiseaseTreatmentDto
        {
            RegisterId = register.Id,
            Progress = "Huyet ap on dinh",
            Orders = "Tiep tuc thuoc",
            VitalSigns = "{\"SystolicBP\":130,\"DiastolicBP\":85}",
            Notes = "Tai kham sau 1 thang"
        });

        result.Should().NotBeNull();
        result.RegisterId.Should().Be(register.Id);
        result.Progress.Should().Be("Huyet ap on dinh");

        var saved = await _db.ChronicDiseaseTreatments.CountAsync(t => t.RegisterId == register.Id);
        saved.Should().Be(1);
    }
}
