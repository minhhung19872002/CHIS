namespace CHIS.Application.DTOs;

public class StockBalanceDto
{
    public Guid Id { get; set; }
    public Guid WarehouseId { get; set; }
    public string? WarehouseName { get; set; }
    public Guid MedicineId { get; set; }
    public string? MedicineName { get; set; }
    public string? Unit { get; set; }
    public decimal Quantity { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public decimal? UnitPrice { get; set; }
}

public class StockReceiptDto
{
    public Guid Id { get; set; }
    public string ReceiptCode { get; set; } = string.Empty;
    public Guid WarehouseId { get; set; }
    public string? WarehouseName { get; set; }
    public Guid? SupplierId { get; set; }
    public string? SupplierName { get; set; }
    public DateTime ReceiptDate { get; set; }
    public string? ReceiptType { get; set; }
    public decimal TotalAmount { get; set; }
    public int Status { get; set; }
    public string? Notes { get; set; }
    public List<StockReceiptItemDto> Items { get; set; } = new();
}

public class StockReceiptItemDto
{
    public Guid Id { get; set; }
    public Guid MedicineId { get; set; }
    public string? MedicineName { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalAmount { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
}

public class CreateStockReceiptDto
{
    public Guid WarehouseId { get; set; }
    public Guid? SupplierId { get; set; }
    public string? ReceiptType { get; set; }
    public string? Notes { get; set; }
    public List<CreateStockReceiptItemDto> Items { get; set; } = new();
}

public class CreateStockReceiptItemDto
{
    public Guid MedicineId { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
}

public class DispensePrescriptionDto
{
    public Guid PrescriptionId { get; set; }
    public Guid WarehouseId { get; set; }
    public string? Notes { get; set; }
}

public class StockSearchDto
{
    public string? Keyword { get; set; }
    public Guid? WarehouseId { get; set; }
    public bool? ExpiringOnly { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; } = 20;
}

public class WarehouseDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? WarehouseType { get; set; }
    public Guid? FacilityId { get; set; }
    public bool IsActive { get; set; }
}

public class SupplierDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? TaxCode { get; set; }
    public string? ContactPerson { get; set; }
    public bool IsActive { get; set; }
}

// ---- Xuat tuyen duoi (distribution to commune health stations) ----
public class LowerLevelIssueDto
{
    public Guid Id { get; set; }
    public Guid FromWarehouseId { get; set; }
    public string? FromWarehouseName { get; set; }
    public Guid ToFacilityId { get; set; }
    public string? ToFacilityName { get; set; }
    public DateTime IssueDate { get; set; }
    public string? IssueCode { get; set; }
    public List<LowerLevelIssueItemDto> Items { get; set; } = new();
    public int Status { get; set; }
    public string? Notes { get; set; }
    public decimal TotalAmount { get; set; }
}

public class LowerLevelIssueItemDto
{
    public Guid MedicineId { get; set; }
    public string? MedicineName { get; set; }
    public string? Unit { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
}

public class CreateLowerLevelIssueDto
{
    public Guid FromWarehouseId { get; set; }
    public Guid ToFacilityId { get; set; }
    public string? Notes { get; set; }
    public List<LowerLevelIssueItemDto> Items { get; set; } = new();
}

// ---- Nhap tuyen tren (receive from upper level) ----
public class UpperLevelReceiptDto
{
    public Guid Id { get; set; }
    public Guid? FromFacilityId { get; set; }
    public string? FromFacilityName { get; set; }
    public DateTime ReceiptDate { get; set; }
    public string? ReceiptCode { get; set; }
    public List<StockReceiptItemDto> Items { get; set; } = new();
    public int Status { get; set; }
    public decimal TotalAmount { get; set; }
}

// ---- Bien ban kiem nhap ----
public class InspectionReportDto
{
    public Guid Id { get; set; }
    public Guid WarehouseId { get; set; }
    public string? WarehouseName { get; set; }
    public Guid? SupplierId { get; set; }
    public string? SupplierName { get; set; }
    public DateTime InspectionDate { get; set; }
    public string? ReportCode { get; set; }
    public List<InspectionReportItemDto> Items { get; set; } = new();
    public string? Template { get; set; }
    public string? Notes { get; set; }
    public int Status { get; set; }
}

public class InspectionReportItemDto
{
    public Guid MedicineId { get; set; }
    public string? MedicineName { get; set; }
    public string? Unit { get; set; }
    public decimal OrderedQuantity { get; set; }
    public decimal ReceivedQuantity { get; set; }
    public decimal AcceptedQuantity { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? QualityNotes { get; set; }
}

public class CreateInspectionReportDto
{
    public Guid WarehouseId { get; set; }
    public Guid? SupplierId { get; set; }
    public string? Template { get; set; }
    public string? Notes { get; set; }
    public List<InspectionReportItemDto> Items { get; set; } = new();
}

// ---- Bien ban kiem ke ----
public class StockTakeReportDto
{
    public Guid Id { get; set; }
    public string? StockTakeCode { get; set; }
    public Guid WarehouseId { get; set; }
    public string? WarehouseName { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public DateTime StockTakeDate { get; set; }
    public List<StockTakeReportItemDto> Items { get; set; } = new();
    public bool HasDisposal { get; set; }
    public int Status { get; set; }
    public string? Notes { get; set; }
}

public class StockTakeReportItemDto
{
    public Guid MedicineId { get; set; }
    public string? MedicineName { get; set; }
    public string? Unit { get; set; }
    public decimal SystemQuantity { get; set; }
    public decimal ActualQuantity { get; set; }
    public decimal Difference { get; set; }
    public string? Notes { get; set; }
}

public class CreateStockTakeReportDto
{
    public Guid WarehouseId { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public string? Notes { get; set; }
    public List<StockTakeReportItemDto> Items { get; set; } = new();
}

// ---- Xuat thanh ly ----
public class DisposalIssueDto
{
    public Guid Id { get; set; }
    public string? IssueCode { get; set; }
    public Guid WarehouseId { get; set; }
    public string? WarehouseName { get; set; }
    public DateTime IssueDate { get; set; }
    public string? Reason { get; set; }
    public List<DisposalIssueItemDto> Items { get; set; } = new();
    public string? ApprovedBy { get; set; }
    public int Status { get; set; }
    public decimal TotalAmount { get; set; }
}

public class DisposalIssueItemDto
{
    public Guid MedicineId { get; set; }
    public string? MedicineName { get; set; }
    public string? Unit { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? Reason { get; set; }
}

public class CreateDisposalIssueDto
{
    public Guid WarehouseId { get; set; }
    public string? Reason { get; set; }
    public List<DisposalIssueItemDto> Items { get; set; } = new();
}

// ---- Ban thuoc ----
public class RetailSaleDto
{
    public Guid Id { get; set; }
    public string? SaleCode { get; set; }
    public Guid? PatientId { get; set; }
    public string? PatientName { get; set; }
    public DateTime SaleDate { get; set; }
    public List<RetailSaleItemDto> Items { get; set; } = new();
    public decimal TotalAmount { get; set; }
    public string? PaymentMethod { get; set; }
    public int Status { get; set; }
}

public class RetailSaleItemDto
{
    public Guid MedicineId { get; set; }
    public string? MedicineName { get; set; }
    public string? Unit { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalAmount { get; set; }
    public string? BatchNumber { get; set; }
}

public class CreateRetailSaleDto
{
    public Guid? PatientId { get; set; }
    public string? PatientName { get; set; }
    public string? PaymentMethod { get; set; }
    public Guid WarehouseId { get; set; }
    public List<RetailSaleItemDto> Items { get; set; } = new();
}

// ---- Du tru tuyen tren ----
public class UpperProcurementDto
{
    public Guid Id { get; set; }
    public string? RequestCode { get; set; }
    public Guid? FacilityId { get; set; }
    public string? FacilityName { get; set; }
    public DateTime RequestDate { get; set; }
    public List<UpperProcurementItemDto> Items { get; set; } = new();
    public int Status { get; set; }
    public DateTime? SentDate { get; set; }
    public string? Notes { get; set; }
}

public class UpperProcurementItemDto
{
    public Guid MedicineId { get; set; }
    public string? MedicineName { get; set; }
    public string? Unit { get; set; }
    public decimal CurrentStock { get; set; }
    public decimal RequestedQuantity { get; set; }
    public string? Notes { get; set; }
}

public class CreateUpperProcurementDto
{
    public Guid? FacilityId { get; set; }
    public string? Notes { get; set; }
    public List<UpperProcurementItemDto> Items { get; set; } = new();
}

// ---- The kho ----
public class StockCardDto
{
    public Guid MedicineId { get; set; }
    public string? MedicineName { get; set; }
    public string? Unit { get; set; }
    public List<StockCardEntryDto> Entries { get; set; } = new();
}

public class StockCardEntryDto
{
    public DateTime Date { get; set; }
    public string? DocumentCode { get; set; }
    public string? TransactionType { get; set; }
    public decimal QuantityIn { get; set; }
    public decimal QuantityOut { get; set; }
    public decimal Balance { get; set; }
    public string? BatchNumber { get; set; }
    public string? Notes { get; set; }
}

// ---- Khoa so ----
public class DocumentLockDto
{
    public Guid WarehouseId { get; set; }
    public string? WarehouseName { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public bool IsLocked { get; set; }
    public DateTime? LockedAt { get; set; }
    public string? LockedBy { get; set; }
}

// ---- Duyet toa ----
public class PrescriptionApprovalDto
{
    public Guid PrescriptionId { get; set; }
    public string? PrescriptionCode { get; set; }
    public Guid PatientId { get; set; }
    public string? PatientName { get; set; }
    public string? DoctorName { get; set; }
    public DateTime PrescriptionDate { get; set; }
    public string? Diagnosis { get; set; }
    public List<PrescriptionApprovalItemDto> Items { get; set; } = new();
    public int Status { get; set; }
}

public class PrescriptionApprovalItemDto
{
    public Guid MedicineId { get; set; }
    public string? MedicineName { get; set; }
    public string? Unit { get; set; }
    public decimal Quantity { get; set; }
    public string? Dosage { get; set; }
    public string? Usage { get; set; }
    public int? DaysSupply { get; set; }
}

// ---- Bao cao xuat nhap ton ----
public class DailyDispenseReportDto
{
    public DateTime Date { get; set; }
    public Guid? WarehouseId { get; set; }
    public string? WarehouseName { get; set; }
    public int TotalPrescriptions { get; set; }
    public decimal TotalAmount { get; set; }
    public List<DailyDispenseReportItemDto> Items { get; set; } = new();
}

public class DailyDispenseReportItemDto
{
    public Guid MedicineId { get; set; }
    public string? MedicineName { get; set; }
    public string? Unit { get; set; }
    public decimal Quantity { get; set; }
    public decimal Amount { get; set; }
}
