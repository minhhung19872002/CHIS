using CHIS.API.Controllers;
using CHIS.Application.DTOs;
using CHIS.Application.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace CHIS.UnitTests.Controllers;

public class SystemControllerTests
{
    private readonly Mock<ISystemService> _mock;
    private readonly SystemController _sut;

    public SystemControllerTests()
    {
        _mock = new Mock<ISystemService>();
        _sut = new SystemController(_mock.Object);
    }

    [Fact]
    public async Task GetConfigs_ReturnsOk()
    {
        _mock.Setup(s => s.GetConfigsAsync(It.IsAny<string?>())).ReturnsAsync(new List<SystemConfigDto>());
        var result = await _sut.GetConfigs();
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task SaveConfig_ReturnsOk()
    {
        _mock.Setup(s => s.SaveConfigAsync(It.IsAny<SystemConfigDto>())).ReturnsAsync(new SystemConfigDto());
        var result = await _sut.SaveConfig(new SystemConfigDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetFacilities_ReturnsOk()
    {
        _mock.Setup(s => s.GetFacilitiesAsync()).ReturnsAsync(new List<FacilityDto>());
        var result = await _sut.GetFacilities();
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task CreateFacility_ReturnsOk()
    {
        _mock.Setup(s => s.CreateFacilityAsync(It.IsAny<CreateFacilityDto>())).ReturnsAsync(new FacilityDto());
        var result = await _sut.CreateFacility(new CreateFacilityDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetDepartments_ReturnsOk()
    {
        _mock.Setup(s => s.GetDepartmentsAsync(It.IsAny<Guid?>())).ReturnsAsync(new List<DepartmentDto>());
        var result = await _sut.GetDepartments();
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task CreateDepartment_ReturnsOk()
    {
        _mock.Setup(s => s.CreateDepartmentAsync(It.IsAny<CreateDepartmentDto>())).ReturnsAsync(new DepartmentDto());
        var result = await _sut.CreateDepartment(new CreateDepartmentDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetRooms_ReturnsOk()
    {
        _mock.Setup(s => s.GetRoomsAsync(It.IsAny<Guid?>())).ReturnsAsync(new List<RoomDto>());
        var result = await _sut.GetRooms();
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task SearchIcdCodes_ReturnsOk()
    {
        _mock.Setup(s => s.SearchIcdCodesAsync(It.IsAny<IcdSearchDto>())).ReturnsAsync(new PagedResult<IcdCodeDto>());
        var result = await _sut.SearchIcdCodes(new IcdSearchDto());
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetAuditLogs_ReturnsOk()
    {
        _mock.Setup(s => s.GetAuditLogsAsync(It.IsAny<AuditLogSearchDto>())).ReturnsAsync(new PagedResult<AuditLogDto>());
        var result = await _sut.GetAuditLogs(new AuditLogSearchDto());
        result.Should().BeOfType<OkObjectResult>();
    }
}
