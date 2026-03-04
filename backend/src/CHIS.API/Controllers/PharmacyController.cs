using CHIS.Application.DTOs;
using CHIS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CHIS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PharmacyController : ControllerBase
{
    private readonly IPharmacyService _pharmacyService;
    public PharmacyController(IPharmacyService pharmacyService) => _pharmacyService = pharmacyService;

    // ---- Stock ----
    [HttpGet("stock")]
    public async Task<IActionResult> GetStock([FromQuery] StockSearchDto dto)
        => Ok(await _pharmacyService.GetStockAsync(dto));

    [HttpGet("stock/expiring")]
    public async Task<IActionResult> GetExpiringStock([FromQuery] Guid warehouseId, [FromQuery] int daysUntilExpiry = 90)
        => Ok(await _pharmacyService.GetExpiringStockAsync(warehouseId, daysUntilExpiry));

    // ---- Receipts ----
    [HttpGet("receipts")]
    public async Task<IActionResult> SearchReceipts([FromQuery] Guid? warehouseId = null, [FromQuery] string? receiptType = null, [FromQuery] int pageIndex = 0, [FromQuery] int pageSize = 20)
        => Ok(await _pharmacyService.SearchReceiptsAsync(warehouseId, receiptType, pageIndex, pageSize));

    [HttpPost("receipts")]
    public async Task<IActionResult> CreateReceipt([FromBody] CreateStockReceiptDto dto)
        => Ok(await _pharmacyService.CreateReceiptAsync(dto));

    [HttpPost("receipts/{receiptId}/approve")]
    public async Task<IActionResult> ApproveReceipt(Guid receiptId)
    {
        try { await _pharmacyService.ApproveReceiptAsync(receiptId); return Ok(new { message = "Receipt approved" }); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpPost("receipts/{receiptId}/cancel")]
    public async Task<IActionResult> CancelReceipt(Guid receiptId)
    {
        try { await _pharmacyService.CancelReceiptAsync(receiptId); return Ok(new { message = "Receipt cancelled" }); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    // ---- Dispensing ----
    [HttpPost("dispense")]
    public async Task<IActionResult> Dispense([FromBody] DispensePrescriptionDto dto)
    {
        try { await _pharmacyService.DispensePrescriptionAsync(dto); return Ok(new { message = "Dispensed successfully" }); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    // ---- Warehouses & Suppliers ----
    [HttpGet("warehouses")]
    public async Task<IActionResult> GetWarehouses()
        => Ok(await _pharmacyService.GetWarehousesAsync());

    [HttpPost("warehouses")]
    public async Task<IActionResult> CreateWarehouse([FromBody] WarehouseDto dto)
        => Ok(await _pharmacyService.CreateWarehouseAsync(dto));

    [HttpGet("suppliers")]
    public async Task<IActionResult> GetSuppliers()
        => Ok(await _pharmacyService.GetSuppliersAsync());

    [HttpPost("suppliers")]
    public async Task<IActionResult> CreateSupplier([FromBody] SupplierDto dto)
        => Ok(await _pharmacyService.CreateSupplierAsync(dto));

    // ---- Xuat tuyen duoi ----
    [HttpPost("lower-level-issues")]
    public async Task<IActionResult> IssueToLowerLevel([FromBody] CreateLowerLevelIssueDto dto)
    {
        try { return Ok(await _pharmacyService.IssueToLowerLevelAsync(dto)); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("lower-level-issues")]
    public async Task<IActionResult> GetLowerLevelIssues([FromQuery] Guid? facilityId = null, [FromQuery] int pageIndex = 0, [FromQuery] int pageSize = 20)
        => Ok(await _pharmacyService.GetLowerLevelIssuesAsync(facilityId, pageIndex, pageSize));

    // ---- Nhap tuyen tren ----
    [HttpPost("upper-level-receipts/{receiptId}/receive")]
    public async Task<IActionResult> ReceiveFromUpperLevel(Guid receiptId)
    {
        try { await _pharmacyService.ReceiveFromUpperLevelAsync(receiptId); return Ok(new { message = "Received" }); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpGet("upper-level-receipts")]
    public async Task<IActionResult> GetUpperLevelReceipts([FromQuery] Guid? facilityId = null, [FromQuery] int pageIndex = 0, [FromQuery] int pageSize = 20)
        => Ok(await _pharmacyService.GetUpperLevelReceiptsAsync(facilityId, pageIndex, pageSize));

    // ---- Bien ban kiem nhap ----
    [HttpPost("inspection-reports")]
    public async Task<IActionResult> CreateInspectionReport([FromBody] CreateInspectionReportDto dto)
        => Ok(await _pharmacyService.CreateInspectionReportAsync(dto));

    [HttpGet("inspection-reports")]
    public async Task<IActionResult> GetInspectionReports([FromQuery] Guid? warehouseId = null, [FromQuery] int pageIndex = 0, [FromQuery] int pageSize = 20)
        => Ok(await _pharmacyService.GetInspectionReportsAsync(warehouseId, pageIndex, pageSize));

    // ---- Kiem ke ----
    [HttpPost("stock-take-reports")]
    public async Task<IActionResult> CreateStockTakeReport([FromBody] CreateStockTakeReportDto dto)
        => Ok(await _pharmacyService.CreateStockTakeReportAsync(dto));

    [HttpGet("stock-take-reports")]
    public async Task<IActionResult> GetStockTakeReports([FromQuery] Guid? warehouseId = null, [FromQuery] int? year = null, [FromQuery] int pageIndex = 0, [FromQuery] int pageSize = 20)
        => Ok(await _pharmacyService.GetStockTakeReportsAsync(warehouseId, year, pageIndex, pageSize));

    // ---- Thanh ly ----
    [HttpPost("disposal-issues")]
    public async Task<IActionResult> CreateDisposalIssue([FromBody] CreateDisposalIssueDto dto)
        => Ok(await _pharmacyService.CreateDisposalIssueAsync(dto));

    [HttpGet("disposal-issues")]
    public async Task<IActionResult> GetDisposalIssues([FromQuery] Guid? warehouseId = null, [FromQuery] int pageIndex = 0, [FromQuery] int pageSize = 20)
        => Ok(await _pharmacyService.GetDisposalIssuesAsync(warehouseId, pageIndex, pageSize));

    // ---- Ban thuoc ----
    [HttpPost("retail-sales")]
    public async Task<IActionResult> CreateRetailSale([FromBody] CreateRetailSaleDto dto)
    {
        try { return Ok(await _pharmacyService.CreateRetailSaleAsync(dto)); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("retail-sales")]
    public async Task<IActionResult> GetRetailSales([FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null, [FromQuery] int pageIndex = 0, [FromQuery] int pageSize = 20)
        => Ok(await _pharmacyService.GetRetailSalesAsync(from, to, pageIndex, pageSize));

    // ---- Du tru tuyen tren ----
    [HttpPost("upper-procurements")]
    public async Task<IActionResult> CreateUpperProcurement([FromBody] CreateUpperProcurementDto dto)
        => Ok(await _pharmacyService.CreateUpperProcurementAsync(dto));

    [HttpPost("upper-procurements/{id}/send")]
    public async Task<IActionResult> SendUpperProcurement(Guid id)
    {
        try { await _pharmacyService.SendUpperProcurementAsync(id); return Ok(new { message = "Sent" }); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpGet("upper-procurements")]
    public async Task<IActionResult> GetUpperProcurements([FromQuery] int pageIndex = 0, [FromQuery] int pageSize = 20)
        => Ok(await _pharmacyService.GetUpperProcurementsAsync(pageIndex, pageSize));

    // ---- The kho ----
    [HttpGet("stock-card")]
    public async Task<IActionResult> GetStockCard([FromQuery] Guid warehouseId, [FromQuery] Guid medicineId, [FromQuery] DateTime from, [FromQuery] DateTime to)
        => Ok(await _pharmacyService.GetStockCardAsync(warehouseId, medicineId, from, to));

    // ---- Khoa so ----
    [HttpPost("document-locks/lock")]
    public async Task<IActionResult> LockDocumentPeriod([FromQuery] Guid warehouseId, [FromQuery] int year, [FromQuery] int month)
    { await _pharmacyService.LockDocumentPeriodAsync(warehouseId, year, month); return Ok(new { message = "Locked" }); }

    [HttpPost("document-locks/unlock")]
    public async Task<IActionResult> UnlockDocumentPeriod([FromQuery] Guid warehouseId, [FromQuery] int year, [FromQuery] int month)
    { await _pharmacyService.UnlockDocumentPeriodAsync(warehouseId, year, month); return Ok(new { message = "Unlocked" }); }

    [HttpGet("document-locks")]
    public async Task<IActionResult> GetDocumentLocks([FromQuery] Guid warehouseId)
        => Ok(await _pharmacyService.GetDocumentLocksAsync(warehouseId));

    [HttpPost("recalculate-balance")]
    public async Task<IActionResult> RecalculateBalance([FromQuery] Guid warehouseId)
    { await _pharmacyService.RecalculateOpeningBalanceAsync(warehouseId); return Ok(new { message = "Recalculated" }); }

    // ---- Duyet toa ----
    [HttpPost("prescriptions/{prescriptionId}/approve")]
    public async Task<IActionResult> ApprovePrescription(Guid prescriptionId)
    {
        try { await _pharmacyService.ApprovePrescriptionAsync(prescriptionId); return Ok(new { message = "Approved" }); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpGet("prescriptions/pending")]
    public async Task<IActionResult> GetPendingPrescriptions([FromQuery] int pageIndex = 0, [FromQuery] int pageSize = 20)
        => Ok(await _pharmacyService.GetPendingPrescriptionsAsync(pageIndex, pageSize));

    // ---- Bao cao ----
    [HttpGet("reports/daily-dispense")]
    public async Task<IActionResult> GetDailyDispenseReport([FromQuery] DateTime date, [FromQuery] Guid? warehouseId = null)
        => Ok(await _pharmacyService.GetDailyDispenseReportAsync(date, warehouseId));

    [HttpGet("lower-level-stock")]
    public async Task<IActionResult> GetLowerLevelStock([FromQuery] Guid? facilityId = null)
        => Ok(await _pharmacyService.GetLowerLevelStockAsync(facilityId));
}
