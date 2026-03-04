using CHIS.Application.DTOs;
using CHIS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CHIS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FinanceController : ControllerBase
{
    private readonly IFinanceService _svc;
    public FinanceController(IFinanceService svc) => _svc = svc;

    [HttpGet("vouchers")]
    public async Task<IActionResult> SearchVouchers([FromQuery] FinanceSearchDto dto)
        => Ok(await _svc.SearchVouchersAsync(dto));

    [HttpPost("vouchers")]
    public async Task<IActionResult> CreateVoucher([FromBody] CreateFinanceVoucherDto dto)
        => Ok(await _svc.CreateVoucherAsync(dto));

    [HttpPost("vouchers/{id}/approve")]
    public async Task<IActionResult> ApproveVoucher(Guid id)
    {
        try { await _svc.ApproveVoucherAsync(id); return Ok(new { message = "Voucher approved" }); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpPost("vouchers/{id}/cancel")]
    public async Task<IActionResult> CancelVoucher(Guid id)
    {
        try { await _svc.CancelVoucherAsync(id); return Ok(new { message = "Voucher cancelled" }); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpGet("balance")]
    public async Task<IActionResult> GetBalance([FromQuery] int year, [FromQuery] int month, [FromQuery] Guid? facilityId = null)
        => Ok(await _svc.GetBalanceAsync(year, month, facilityId));
}
