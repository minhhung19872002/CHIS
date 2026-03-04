using CHIS.Application.DTOs;

namespace CHIS.Application.Services;

public interface IPharmacyService
{
    // Existing
    Task<PagedResult<StockBalanceDto>> GetStockAsync(StockSearchDto dto);
    Task<StockReceiptDto> CreateReceiptAsync(CreateStockReceiptDto dto);
    Task ApproveReceiptAsync(Guid receiptId);
    Task CancelReceiptAsync(Guid receiptId);
    Task<PagedResult<StockReceiptDto>> SearchReceiptsAsync(Guid? warehouseId, string? receiptType, int pageIndex, int pageSize);
    Task DispensePrescriptionAsync(DispensePrescriptionDto dto);
    Task<List<StockBalanceDto>> GetExpiringStockAsync(Guid warehouseId, int daysUntilExpiry = 90);
    Task<List<WarehouseDto>> GetWarehousesAsync();
    Task<WarehouseDto> CreateWarehouseAsync(WarehouseDto dto);
    Task<List<SupplierDto>> GetSuppliersAsync();
    Task<SupplierDto> CreateSupplierAsync(SupplierDto dto);

    // Xuat tuyen duoi
    Task<LowerLevelIssueDto> IssueToLowerLevelAsync(CreateLowerLevelIssueDto dto);
    Task<PagedResult<LowerLevelIssueDto>> GetLowerLevelIssuesAsync(Guid? facilityId, int pageIndex, int pageSize);

    // Nhap tuyen tren
    Task ReceiveFromUpperLevelAsync(Guid receiptId);
    Task<PagedResult<UpperLevelReceiptDto>> GetUpperLevelReceiptsAsync(Guid? facilityId, int pageIndex, int pageSize);

    // Bien ban kiem nhap
    Task<InspectionReportDto> CreateInspectionReportAsync(CreateInspectionReportDto dto);
    Task<PagedResult<InspectionReportDto>> GetInspectionReportsAsync(Guid? warehouseId, int pageIndex, int pageSize);

    // Kiem ke
    Task<StockTakeReportDto> CreateStockTakeReportAsync(CreateStockTakeReportDto dto);
    Task<PagedResult<StockTakeReportDto>> GetStockTakeReportsAsync(Guid? warehouseId, int? year, int pageIndex, int pageSize);

    // Thanh ly
    Task<DisposalIssueDto> CreateDisposalIssueAsync(CreateDisposalIssueDto dto);
    Task<PagedResult<DisposalIssueDto>> GetDisposalIssuesAsync(Guid? warehouseId, int pageIndex, int pageSize);

    // Ban thuoc
    Task<RetailSaleDto> CreateRetailSaleAsync(CreateRetailSaleDto dto);
    Task<PagedResult<RetailSaleDto>> GetRetailSalesAsync(DateTime? from, DateTime? to, int pageIndex, int pageSize);

    // Du tru tuyen tren
    Task<UpperProcurementDto> CreateUpperProcurementAsync(CreateUpperProcurementDto dto);
    Task SendUpperProcurementAsync(Guid id);
    Task<PagedResult<UpperProcurementDto>> GetUpperProcurementsAsync(int pageIndex, int pageSize);

    // The kho
    Task<StockCardDto> GetStockCardAsync(Guid warehouseId, Guid medicineId, DateTime from, DateTime to);

    // Khoa so
    Task LockDocumentPeriodAsync(Guid warehouseId, int year, int month);
    Task UnlockDocumentPeriodAsync(Guid warehouseId, int year, int month);
    Task RecalculateOpeningBalanceAsync(Guid warehouseId);
    Task<List<DocumentLockDto>> GetDocumentLocksAsync(Guid warehouseId);

    // Duyet toa
    Task ApprovePrescriptionAsync(Guid prescriptionId);
    Task<PagedResult<PrescriptionApprovalDto>> GetPendingPrescriptionsAsync(int pageIndex, int pageSize);

    // Bao cao
    Task<DailyDispenseReportDto> GetDailyDispenseReportAsync(DateTime date, Guid? warehouseId);
    Task<List<StockBalanceDto>> GetLowerLevelStockAsync(Guid? facilityId);
}
