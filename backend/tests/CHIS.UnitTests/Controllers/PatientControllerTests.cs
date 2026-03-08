using CHIS.API.Controllers;
using CHIS.Application.DTOs;
using CHIS.Application.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace CHIS.UnitTests.Controllers;

public class PatientControllerTests
{
    private readonly Mock<IPatientService> _mockPatientService;
    private readonly PatientController _sut;

    public PatientControllerTests()
    {
        _mockPatientService = new Mock<IPatientService>();
        _sut = new PatientController(_mockPatientService.Object);
    }

    [Fact]
    public async Task GetById_ExistingPatient_ReturnsOk()
    {
        var id = Guid.NewGuid();
        var dto = new PatientDto { Id = id, PatientCode = "BN0001", FullName = "Nguyen Van A" };
        _mockPatientService.Setup(s => s.GetByIdAsync(id)).ReturnsAsync(dto);

        var result = await _sut.GetById(id);

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var data = okResult.Value.Should().BeOfType<PatientDto>().Subject;
        data.Id.Should().Be(id);
    }

    [Fact]
    public async Task GetById_NotFound_ReturnsNotFound()
    {
        var id = Guid.NewGuid();
        _mockPatientService.Setup(s => s.GetByIdAsync(id)).ThrowsAsync(new KeyNotFoundException());

        var result = await _sut.GetById(id);

        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task Search_ReturnsPagedResult()
    {
        var searchDto = new PatientSearchDto { Keyword = "Nguyen", PageSize = 20 };
        var pagedResult = new PagedResult<PatientDto>
        {
            Items = new List<PatientDto> { new() { FullName = "Nguyen Van A" } },
            TotalCount = 1,
            PageIndex = 0,
            PageSize = 20
        };
        _mockPatientService.Setup(s => s.SearchAsync(searchDto)).ReturnsAsync(pagedResult);

        var result = await _sut.Search(searchDto);

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var data = okResult.Value.Should().BeOfType<PagedResult<PatientDto>>().Subject;
        data.Items.Should().ContainSingle();
    }

    [Fact]
    public async Task Create_ValidData_ReturnsOk()
    {
        var dto = new CreatePatientDto { FullName = "Tran Van B" };
        var created = new PatientDto { Id = Guid.NewGuid(), PatientCode = "BN001", FullName = "Tran Van B" };
        _mockPatientService.Setup(s => s.CreateAsync(dto)).ReturnsAsync(created);

        var result = await _sut.Create(dto);

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var data = okResult.Value.Should().BeOfType<PatientDto>().Subject;
        data.FullName.Should().Be("Tran Van B");
    }

    [Fact]
    public async Task Update_ExistingPatient_ReturnsOk()
    {
        var id = Guid.NewGuid();
        var dto = new UpdatePatientDto { FullName = "Updated Name" };
        var updated = new PatientDto { Id = id, FullName = "Updated Name" };
        _mockPatientService.Setup(s => s.UpdateAsync(id, dto)).ReturnsAsync(updated);

        var result = await _sut.Update(id, dto);

        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task Update_NotFound_ReturnsNotFound()
    {
        var id = Guid.NewGuid();
        var dto = new UpdatePatientDto { FullName = "x" };
        _mockPatientService.Setup(s => s.UpdateAsync(id, dto)).ThrowsAsync(new KeyNotFoundException());

        var result = await _sut.Update(id, dto);

        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task Delete_ExistingPatient_ReturnsNoContent()
    {
        var id = Guid.NewGuid();
        _mockPatientService.Setup(s => s.DeleteAsync(id)).Returns(Task.CompletedTask);

        var result = await _sut.Delete(id);

        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public async Task Delete_NotFound_ReturnsNotFound()
    {
        var id = Guid.NewGuid();
        _mockPatientService.Setup(s => s.DeleteAsync(id)).ThrowsAsync(new KeyNotFoundException());

        var result = await _sut.Delete(id);

        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task GetByInsuranceNumber_Found_ReturnsOk()
    {
        var dto = new PatientDto { InsuranceNumber = "HS123" };
        _mockPatientService.Setup(s => s.GetByInsuranceNumberAsync("HS123")).ReturnsAsync(dto);

        var result = await _sut.GetByInsuranceNumber("HS123");

        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetByInsuranceNumber_NotFound_ReturnsNotFound()
    {
        _mockPatientService.Setup(s => s.GetByInsuranceNumberAsync("HS999")).ReturnsAsync((PatientDto?)null);

        var result = await _sut.GetByInsuranceNumber("HS999");

        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task GetByIdentityNumber_Found_ReturnsOk()
    {
        var dto = new PatientDto { IdentityNumber = "001090012345" };
        _mockPatientService.Setup(s => s.GetByIdentityNumberAsync("001090012345")).ReturnsAsync(dto);

        var result = await _sut.GetByIdentityNumber("001090012345");

        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetMedicalRecords_ReturnsOk()
    {
        var patientId = Guid.NewGuid();
        _mockPatientService.Setup(s => s.GetMedicalRecordsAsync(patientId))
            .ReturnsAsync(new List<MedicalRecordDto> { new() { RecordNumber = "BA001" } });

        var result = await _sut.GetMedicalRecords(patientId);

        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task CreateMedicalRecord_ValidPatient_ReturnsOk()
    {
        var patientId = Guid.NewGuid();
        var recordDto = new MedicalRecordDto { PatientId = patientId, RecordNumber = "BA001" };
        _mockPatientService.Setup(s => s.CreateMedicalRecordAsync(patientId, null, null)).ReturnsAsync(recordDto);

        var result = await _sut.CreateMedicalRecord(patientId);

        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task CreateMedicalRecord_PatientNotFound_ReturnsNotFound()
    {
        var patientId = Guid.NewGuid();
        _mockPatientService.Setup(s => s.CreateMedicalRecordAsync(patientId, null, null))
            .ThrowsAsync(new KeyNotFoundException());

        var result = await _sut.CreateMedicalRecord(patientId);

        result.Should().BeOfType<NotFoundResult>();
    }
}
