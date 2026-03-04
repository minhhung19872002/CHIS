using CHIS.Application.DTOs;
using CHIS.Application.Services;
using CHIS.Core.Entities;
using CHIS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CHIS.Infrastructure.Services;

public class PharmacyService : IPharmacyService
{
    private readonly CHISDbContext _db;
    private readonly IUnitOfWork _uow;
    public PharmacyService(CHISDbContext db, IUnitOfWork uow) { _db = db; _uow = uow; }

    // ---- Existing methods ----

    public async Task<PagedResult<StockBalanceDto>> GetStockAsync(StockSearchDto dto)
    {
        var q = _db.StockBalances.Include(s => s.Warehouse).Include(s => s.Medicine).Where(s => s.Quantity > 0);
        if (dto.WarehouseId.HasValue) q = q.Where(s => s.WarehouseId == dto.WarehouseId);
        if (!string.IsNullOrEmpty(dto.Keyword)) q = q.Where(s => s.Medicine.Name.Contains(dto.Keyword));
        if (dto.ExpiringOnly == true) q = q.Where(s => s.ExpiryDate != null && s.ExpiryDate <= DateTime.UtcNow.AddDays(90));
        var total = await q.CountAsync();
        var items = await q.OrderBy(s => s.Medicine.Name).Skip(dto.PageIndex * dto.PageSize).Take(dto.PageSize)
            .Select(s => new StockBalanceDto { Id = s.Id, WarehouseId = s.WarehouseId, WarehouseName = s.Warehouse.Name, MedicineId = s.MedicineId, MedicineName = s.Medicine.Name, Unit = s.Medicine.Unit, Quantity = s.Quantity, BatchNumber = s.BatchNumber, ExpiryDate = s.ExpiryDate, UnitPrice = s.UnitPrice }).ToListAsync();
        return new PagedResult<StockBalanceDto> { Items = items, TotalCount = total, PageIndex = dto.PageIndex, PageSize = dto.PageSize };
    }

    public async Task<StockReceiptDto> CreateReceiptAsync(CreateStockReceiptDto dto)
    {
        var count = await _db.StockReceipts.CountAsync() + 1;
        var receipt = new StockReceipt
        {
            ReceiptCode = $"PN{DateTime.Now:yyMMdd}{count:D4}",
            WarehouseId = dto.WarehouseId, SupplierId = dto.SupplierId,
            ReceiptDate = DateTime.UtcNow, ReceiptType = dto.ReceiptType, Status = 0, Notes = dto.Notes
        };
        decimal total = 0;
        foreach (var i in dto.Items)
        {
            var amount = i.Quantity * i.UnitPrice;
            var item = new StockReceiptItem
            {
                StockReceiptId = receipt.Id, MedicineId = i.MedicineId, Quantity = i.Quantity,
                UnitPrice = i.UnitPrice, TotalAmount = amount, BatchNumber = i.BatchNumber, ExpiryDate = i.ExpiryDate
            };
            await _db.StockReceiptItems.AddAsync(item);
            total += amount;
        }
        receipt.TotalAmount = total;
        await _db.StockReceipts.AddAsync(receipt);
        await _uow.SaveChangesAsync();
        return new StockReceiptDto { Id = receipt.Id, ReceiptCode = receipt.ReceiptCode, WarehouseId = receipt.WarehouseId, ReceiptDate = receipt.ReceiptDate, ReceiptType = receipt.ReceiptType, TotalAmount = receipt.TotalAmount, Status = receipt.Status };
    }

    public async Task ApproveReceiptAsync(Guid receiptId)
    {
        var receipt = await _db.StockReceipts.Include(r => r.Items).FirstOrDefaultAsync(r => r.Id == receiptId)
            ?? throw new KeyNotFoundException();
        receipt.Status = 1;
        foreach (var item in receipt.Items)
        {
            var balance = await _db.StockBalances.FirstOrDefaultAsync(b => b.WarehouseId == receipt.WarehouseId && b.MedicineId == item.MedicineId && b.BatchNumber == item.BatchNumber);
            if (balance != null) { balance.Quantity += item.Quantity; }
            else
            {
                await _db.StockBalances.AddAsync(new StockBalance
                {
                    WarehouseId = receipt.WarehouseId, MedicineId = item.MedicineId,
                    Quantity = item.Quantity, BatchNumber = item.BatchNumber,
                    ExpiryDate = item.ExpiryDate, UnitPrice = item.UnitPrice
                });
            }
        }
        await _uow.SaveChangesAsync();
    }

    public async Task CancelReceiptAsync(Guid receiptId)
    {
        var r = await _db.StockReceipts.FindAsync(receiptId) ?? throw new KeyNotFoundException();
        r.Status = 2; await _uow.SaveChangesAsync();
    }

    public async Task<PagedResult<StockReceiptDto>> SearchReceiptsAsync(Guid? warehouseId, string? receiptType, int pageIndex, int pageSize)
    {
        var q = _db.StockReceipts.Include(r => r.Warehouse).Include(r => r.Supplier).AsQueryable();
        if (warehouseId.HasValue) q = q.Where(r => r.WarehouseId == warehouseId);
        if (!string.IsNullOrEmpty(receiptType)) q = q.Where(r => r.ReceiptType == receiptType);
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(r => r.ReceiptDate).Skip(pageIndex * pageSize).Take(pageSize)
            .Select(r => new StockReceiptDto { Id = r.Id, ReceiptCode = r.ReceiptCode, WarehouseId = r.WarehouseId, WarehouseName = r.Warehouse.Name, SupplierId = r.SupplierId, SupplierName = r.Supplier != null ? r.Supplier.Name : null, ReceiptDate = r.ReceiptDate, ReceiptType = r.ReceiptType, TotalAmount = r.TotalAmount, Status = r.Status, Notes = r.Notes }).ToListAsync();
        return new PagedResult<StockReceiptDto> { Items = items, TotalCount = total, PageIndex = pageIndex, PageSize = pageSize };
    }

    public async Task DispensePrescriptionAsync(DispensePrescriptionDto dto)
    {
        var rx = await _db.Prescriptions.Include(p => p.Items).FirstOrDefaultAsync(p => p.Id == dto.PrescriptionId)
            ?? throw new KeyNotFoundException("Prescription not found");
        if (rx.IsDispensed) throw new InvalidOperationException("Already dispensed");

        var count = await _db.StockIssues.CountAsync() + 1;
        var issue = new StockIssue
        {
            IssueCode = $"PX{DateTime.Now:yyMMdd}{count:D4}",
            WarehouseId = dto.WarehouseId, IssueDate = DateTime.UtcNow,
            IssueType = "XuatBanBenh", Status = 1, Notes = dto.Notes
        };
        decimal total = 0;
        foreach (var item in rx.Items)
        {
            var balance = await _db.StockBalances
                .Where(b => b.WarehouseId == dto.WarehouseId && b.MedicineId == item.MedicineId && b.Quantity > 0)
                .OrderBy(b => b.ExpiryDate).FirstOrDefaultAsync();
            if (balance == null || balance.Quantity < item.Quantity)
                throw new InvalidOperationException($"Insufficient stock for medicine {item.MedicineId}");
            balance.Quantity -= item.Quantity;
            var issueItem = new StockIssueItem
            {
                StockIssueId = issue.Id, MedicineId = item.MedicineId,
                Quantity = item.Quantity, UnitPrice = item.UnitPrice ?? 0,
                TotalAmount = item.TotalAmount ?? 0, BatchNumber = balance.BatchNumber
            };
            await _db.StockIssueItems.AddAsync(issueItem);
            total += issueItem.TotalAmount;
        }
        issue.TotalAmount = total;
        await _db.StockIssues.AddAsync(issue);
        rx.IsDispensed = true; rx.Status = 2;
        await _uow.SaveChangesAsync();
    }

    public async Task<List<StockBalanceDto>> GetExpiringStockAsync(Guid warehouseId, int daysUntilExpiry = 90)
    {
        var cutoff = DateTime.UtcNow.AddDays(daysUntilExpiry);
        return await _db.StockBalances.Include(s => s.Medicine)
            .Where(s => s.WarehouseId == warehouseId && s.Quantity > 0 && s.ExpiryDate != null && s.ExpiryDate <= cutoff)
            .OrderBy(s => s.ExpiryDate)
            .Select(s => new StockBalanceDto { Id = s.Id, WarehouseId = s.WarehouseId, MedicineId = s.MedicineId, MedicineName = s.Medicine.Name, Unit = s.Medicine.Unit, Quantity = s.Quantity, BatchNumber = s.BatchNumber, ExpiryDate = s.ExpiryDate, UnitPrice = s.UnitPrice }).ToListAsync();
    }

    public async Task<List<WarehouseDto>> GetWarehousesAsync()
        => await _db.Warehouses.Where(w => w.IsActive).OrderBy(w => w.Name)
            .Select(w => new WarehouseDto { Id = w.Id, Code = w.Code, Name = w.Name, WarehouseType = w.WarehouseType, FacilityId = w.FacilityId, IsActive = w.IsActive }).ToListAsync();

    public async Task<WarehouseDto> CreateWarehouseAsync(WarehouseDto dto)
    {
        var w = new Warehouse { Code = dto.Code, Name = dto.Name, WarehouseType = dto.WarehouseType, FacilityId = dto.FacilityId, IsActive = true };
        await _db.Warehouses.AddAsync(w); await _uow.SaveChangesAsync();
        dto.Id = w.Id; return dto;
    }

    public async Task<List<SupplierDto>> GetSuppliersAsync()
        => await _db.Suppliers.Where(s => s.IsActive).OrderBy(s => s.Name)
            .Select(s => new SupplierDto { Id = s.Id, Code = s.Code, Name = s.Name, Address = s.Address, Phone = s.Phone, TaxCode = s.TaxCode, ContactPerson = s.ContactPerson, IsActive = s.IsActive }).ToListAsync();

    public async Task<SupplierDto> CreateSupplierAsync(SupplierDto dto)
    {
        var s = new Supplier { Code = dto.Code, Name = dto.Name, Address = dto.Address, Phone = dto.Phone, TaxCode = dto.TaxCode, ContactPerson = dto.ContactPerson, IsActive = true };
        await _db.Suppliers.AddAsync(s); await _uow.SaveChangesAsync();
        dto.Id = s.Id; return dto;
    }

    // ---- Xuat tuyen duoi ----

    public async Task<LowerLevelIssueDto> IssueToLowerLevelAsync(CreateLowerLevelIssueDto dto)
    {
        var count = await _db.StockIssues.CountAsync() + 1;
        var facility = await _db.Facilities.FindAsync(dto.ToFacilityId);
        var issue = new StockIssue
        {
            IssueCode = $"XTD{DateTime.Now:yyMMdd}{count:D4}",
            WarehouseId = dto.FromWarehouseId, IssueDate = DateTime.UtcNow,
            IssueType = "XuatTuyenDuoi", Status = 0, Notes = dto.Notes,
            TargetWarehouseId = null
        };
        decimal total = 0;
        foreach (var i in dto.Items)
        {
            var balance = await _db.StockBalances
                .Where(b => b.WarehouseId == dto.FromWarehouseId && b.MedicineId == i.MedicineId && b.Quantity >= i.Quantity)
                .OrderBy(b => b.ExpiryDate).FirstOrDefaultAsync();
            if (balance == null) throw new InvalidOperationException($"Insufficient stock for medicine {i.MedicineId}");
            balance.Quantity -= i.Quantity;
            var issueItem = new StockIssueItem
            {
                StockIssueId = issue.Id, MedicineId = i.MedicineId,
                Quantity = i.Quantity, UnitPrice = i.UnitPrice,
                TotalAmount = i.Quantity * i.UnitPrice, BatchNumber = i.BatchNumber
            };
            await _db.StockIssueItems.AddAsync(issueItem);
            total += issueItem.TotalAmount;
        }
        issue.TotalAmount = total;
        await _db.StockIssues.AddAsync(issue);
        await _uow.SaveChangesAsync();
        return new LowerLevelIssueDto { Id = issue.Id, IssueCode = issue.IssueCode, FromWarehouseId = issue.WarehouseId, ToFacilityId = dto.ToFacilityId, ToFacilityName = facility?.Name, IssueDate = issue.IssueDate, Status = issue.Status, TotalAmount = total, Notes = issue.Notes };
    }

    public async Task<PagedResult<LowerLevelIssueDto>> GetLowerLevelIssuesAsync(Guid? facilityId, int pageIndex, int pageSize)
    {
        var q = _db.StockIssues.Include(i => i.Warehouse).Where(i => i.IssueType == "XuatTuyenDuoi");
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(i => i.IssueDate).Skip(pageIndex * pageSize).Take(pageSize)
            .Select(i => new LowerLevelIssueDto { Id = i.Id, IssueCode = i.IssueCode, FromWarehouseId = i.WarehouseId, FromWarehouseName = i.Warehouse.Name, IssueDate = i.IssueDate, Status = i.Status, TotalAmount = i.TotalAmount, Notes = i.Notes }).ToListAsync();
        return new PagedResult<LowerLevelIssueDto> { Items = items, TotalCount = total, PageIndex = pageIndex, PageSize = pageSize };
    }

    // ---- Nhap tuyen tren ----

    public async Task ReceiveFromUpperLevelAsync(Guid receiptId)
    {
        var receipt = await _db.StockReceipts.Include(r => r.Items).FirstOrDefaultAsync(r => r.Id == receiptId && r.ReceiptType == "NhapTuyenTren")
            ?? throw new KeyNotFoundException();
        receipt.Status = 1;
        foreach (var item in receipt.Items)
        {
            var balance = await _db.StockBalances.FirstOrDefaultAsync(b => b.WarehouseId == receipt.WarehouseId && b.MedicineId == item.MedicineId && b.BatchNumber == item.BatchNumber);
            if (balance != null) { balance.Quantity += item.Quantity; }
            else
            {
                await _db.StockBalances.AddAsync(new StockBalance { WarehouseId = receipt.WarehouseId, MedicineId = item.MedicineId, Quantity = item.Quantity, BatchNumber = item.BatchNumber, ExpiryDate = item.ExpiryDate, UnitPrice = item.UnitPrice });
            }
        }
        await _uow.SaveChangesAsync();
    }

    public async Task<PagedResult<UpperLevelReceiptDto>> GetUpperLevelReceiptsAsync(Guid? facilityId, int pageIndex, int pageSize)
    {
        var q = _db.StockReceipts.Include(r => r.Warehouse).Where(r => r.ReceiptType == "NhapTuyenTren");
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(r => r.ReceiptDate).Skip(pageIndex * pageSize).Take(pageSize)
            .Select(r => new UpperLevelReceiptDto { Id = r.Id, ReceiptCode = r.ReceiptCode, ReceiptDate = r.ReceiptDate, Status = r.Status, TotalAmount = r.TotalAmount }).ToListAsync();
        return new PagedResult<UpperLevelReceiptDto> { Items = items, TotalCount = total, PageIndex = pageIndex, PageSize = pageSize };
    }

    // ---- Bien ban kiem nhap ----

    public async Task<InspectionReportDto> CreateInspectionReportAsync(CreateInspectionReportDto dto)
    {
        var count = await _db.StockReceipts.CountAsync() + 1;
        var receipt = new StockReceipt
        {
            ReceiptCode = $"BBKN{DateTime.Now:yyMMdd}{count:D4}",
            WarehouseId = dto.WarehouseId, SupplierId = dto.SupplierId,
            ReceiptDate = DateTime.UtcNow, ReceiptType = "KiemNhap", Status = 0, Notes = dto.Notes
        };
        decimal total = 0;
        foreach (var i in dto.Items)
        {
            var item = new StockReceiptItem
            {
                StockReceiptId = receipt.Id, MedicineId = i.MedicineId, Quantity = i.AcceptedQuantity,
                UnitPrice = 0, TotalAmount = 0, BatchNumber = i.BatchNumber, ExpiryDate = i.ExpiryDate
            };
            await _db.StockReceiptItems.AddAsync(item);
        }
        receipt.TotalAmount = total;
        await _db.StockReceipts.AddAsync(receipt);
        await _uow.SaveChangesAsync();
        return new InspectionReportDto { Id = receipt.Id, ReportCode = receipt.ReceiptCode, WarehouseId = receipt.WarehouseId, InspectionDate = receipt.ReceiptDate, Status = receipt.Status, Notes = receipt.Notes, Template = dto.Template };
    }

    public async Task<PagedResult<InspectionReportDto>> GetInspectionReportsAsync(Guid? warehouseId, int pageIndex, int pageSize)
    {
        var q = _db.StockReceipts.Include(r => r.Warehouse).Include(r => r.Supplier).Where(r => r.ReceiptType == "KiemNhap");
        if (warehouseId.HasValue) q = q.Where(r => r.WarehouseId == warehouseId);
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(r => r.ReceiptDate).Skip(pageIndex * pageSize).Take(pageSize)
            .Select(r => new InspectionReportDto { Id = r.Id, ReportCode = r.ReceiptCode, WarehouseId = r.WarehouseId, WarehouseName = r.Warehouse.Name, SupplierId = r.SupplierId, SupplierName = r.Supplier != null ? r.Supplier.Name : null, InspectionDate = r.ReceiptDate, Status = r.Status, Notes = r.Notes }).ToListAsync();
        return new PagedResult<InspectionReportDto> { Items = items, TotalCount = total, PageIndex = pageIndex, PageSize = pageSize };
    }

    // ---- Kiem ke ----

    public async Task<StockTakeReportDto> CreateStockTakeReportAsync(CreateStockTakeReportDto dto)
    {
        var count = await _db.StockTakes.CountAsync() + 1;
        var st = new StockTake
        {
            StockTakeCode = $"KK{dto.Year}{dto.Month:D2}{count:D4}",
            WarehouseId = dto.WarehouseId, StockTakeDate = DateTime.UtcNow, Status = 0, Notes = dto.Notes
        };
        bool hasDisposal = false;
        foreach (var i in dto.Items)
        {
            var item = new StockTakeItem
            {
                StockTakeId = st.Id, MedicineId = i.MedicineId,
                SystemQuantity = i.SystemQuantity, ActualQuantity = i.ActualQuantity,
                Difference = i.ActualQuantity - i.SystemQuantity, Notes = i.Notes
            };
            if (item.Difference < 0) hasDisposal = true;
            await _db.StockTakeItems.AddAsync(item);
        }
        await _db.StockTakes.AddAsync(st);
        await _uow.SaveChangesAsync();
        return new StockTakeReportDto { Id = st.Id, StockTakeCode = st.StockTakeCode, WarehouseId = st.WarehouseId, Year = dto.Year, Month = dto.Month, StockTakeDate = st.StockTakeDate, HasDisposal = hasDisposal, Status = st.Status, Notes = st.Notes };
    }

    public async Task<PagedResult<StockTakeReportDto>> GetStockTakeReportsAsync(Guid? warehouseId, int? year, int pageIndex, int pageSize)
    {
        var q = _db.StockTakes.Include(s => s.Warehouse).AsQueryable();
        if (warehouseId.HasValue) q = q.Where(s => s.WarehouseId == warehouseId);
        if (year.HasValue) q = q.Where(s => s.StockTakeDate.Year == year);
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(s => s.StockTakeDate).Skip(pageIndex * pageSize).Take(pageSize)
            .Select(s => new StockTakeReportDto { Id = s.Id, StockTakeCode = s.StockTakeCode, WarehouseId = s.WarehouseId, WarehouseName = s.Warehouse.Name, StockTakeDate = s.StockTakeDate, Status = s.Status, Notes = s.Notes }).ToListAsync();
        return new PagedResult<StockTakeReportDto> { Items = items, TotalCount = total, PageIndex = pageIndex, PageSize = pageSize };
    }

    // ---- Thanh ly ----

    public async Task<DisposalIssueDto> CreateDisposalIssueAsync(CreateDisposalIssueDto dto)
    {
        var count = await _db.StockIssues.CountAsync() + 1;
        var issue = new StockIssue
        {
            IssueCode = $"TL{DateTime.Now:yyMMdd}{count:D4}",
            WarehouseId = dto.WarehouseId, IssueDate = DateTime.UtcNow,
            IssueType = "ThanhLy", Status = 0, Notes = dto.Reason
        };
        decimal total = 0;
        foreach (var i in dto.Items)
        {
            var balance = await _db.StockBalances
                .Where(b => b.WarehouseId == dto.WarehouseId && b.MedicineId == i.MedicineId && b.Quantity >= i.Quantity)
                .OrderBy(b => b.ExpiryDate).FirstOrDefaultAsync();
            if (balance != null) balance.Quantity -= i.Quantity;
            var issueItem = new StockIssueItem
            {
                StockIssueId = issue.Id, MedicineId = i.MedicineId,
                Quantity = i.Quantity, UnitPrice = i.UnitPrice,
                TotalAmount = i.Quantity * i.UnitPrice, BatchNumber = i.BatchNumber
            };
            await _db.StockIssueItems.AddAsync(issueItem);
            total += issueItem.TotalAmount;
        }
        issue.TotalAmount = total;
        await _db.StockIssues.AddAsync(issue);
        await _uow.SaveChangesAsync();
        return new DisposalIssueDto { Id = issue.Id, IssueCode = issue.IssueCode, WarehouseId = issue.WarehouseId, IssueDate = issue.IssueDate, Reason = dto.Reason, Status = issue.Status, TotalAmount = total };
    }

    public async Task<PagedResult<DisposalIssueDto>> GetDisposalIssuesAsync(Guid? warehouseId, int pageIndex, int pageSize)
    {
        var q = _db.StockIssues.Include(i => i.Warehouse).Where(i => i.IssueType == "ThanhLy");
        if (warehouseId.HasValue) q = q.Where(i => i.WarehouseId == warehouseId);
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(i => i.IssueDate).Skip(pageIndex * pageSize).Take(pageSize)
            .Select(i => new DisposalIssueDto { Id = i.Id, IssueCode = i.IssueCode, WarehouseId = i.WarehouseId, WarehouseName = i.Warehouse.Name, IssueDate = i.IssueDate, Reason = i.Notes, Status = i.Status, TotalAmount = i.TotalAmount }).ToListAsync();
        return new PagedResult<DisposalIssueDto> { Items = items, TotalCount = total, PageIndex = pageIndex, PageSize = pageSize };
    }

    // ---- Ban thuoc ----

    public async Task<RetailSaleDto> CreateRetailSaleAsync(CreateRetailSaleDto dto)
    {
        var count = await _db.StockIssues.CountAsync() + 1;
        var issue = new StockIssue
        {
            IssueCode = $"BT{DateTime.Now:yyMMdd}{count:D4}",
            WarehouseId = dto.WarehouseId, IssueDate = DateTime.UtcNow,
            IssueType = "BanThuoc", Status = 1, Notes = $"Ban thuoc: {dto.PatientName}"
        };
        decimal total = 0;
        foreach (var i in dto.Items)
        {
            var balance = await _db.StockBalances
                .Where(b => b.WarehouseId == dto.WarehouseId && b.MedicineId == i.MedicineId && b.Quantity >= i.Quantity)
                .OrderBy(b => b.ExpiryDate).FirstOrDefaultAsync();
            if (balance == null) throw new InvalidOperationException($"Insufficient stock for medicine {i.MedicineId}");
            balance.Quantity -= i.Quantity;
            var issueItem = new StockIssueItem
            {
                StockIssueId = issue.Id, MedicineId = i.MedicineId,
                Quantity = i.Quantity, UnitPrice = i.UnitPrice,
                TotalAmount = i.Quantity * i.UnitPrice, BatchNumber = i.BatchNumber
            };
            await _db.StockIssueItems.AddAsync(issueItem);
            total += issueItem.TotalAmount;
        }
        issue.TotalAmount = total;
        await _db.StockIssues.AddAsync(issue);
        await _uow.SaveChangesAsync();
        return new RetailSaleDto { Id = issue.Id, SaleCode = issue.IssueCode, PatientId = dto.PatientId, PatientName = dto.PatientName, SaleDate = issue.IssueDate, TotalAmount = total, PaymentMethod = dto.PaymentMethod, Status = 1 };
    }

    public async Task<PagedResult<RetailSaleDto>> GetRetailSalesAsync(DateTime? from, DateTime? to, int pageIndex, int pageSize)
    {
        var q = _db.StockIssues.Include(i => i.Warehouse).Where(i => i.IssueType == "BanThuoc");
        if (from.HasValue) q = q.Where(i => i.IssueDate >= from);
        if (to.HasValue) q = q.Where(i => i.IssueDate <= to);
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(i => i.IssueDate).Skip(pageIndex * pageSize).Take(pageSize)
            .Select(i => new RetailSaleDto { Id = i.Id, SaleCode = i.IssueCode, SaleDate = i.IssueDate, TotalAmount = i.TotalAmount, Status = i.Status }).ToListAsync();
        return new PagedResult<RetailSaleDto> { Items = items, TotalCount = total, PageIndex = pageIndex, PageSize = pageSize };
    }

    // ---- Du tru tuyen tren ----

    public async Task<UpperProcurementDto> CreateUpperProcurementAsync(CreateUpperProcurementDto dto)
    {
        var count = await _db.ProcurementRequests.CountAsync() + 1;
        var pr = new ProcurementRequest
        {
            RequestCode = $"DTT{DateTime.Now:yyMMdd}{count:D4}",
            WarehouseId = dto.FacilityId ?? Guid.Empty,
            RequestDate = DateTime.UtcNow, Status = 0,
            Notes = dto.Notes,
            ItemsJson = System.Text.Json.JsonSerializer.Serialize(dto.Items)
        };
        await _db.ProcurementRequests.AddAsync(pr);
        await _uow.SaveChangesAsync();
        return new UpperProcurementDto { Id = pr.Id, RequestCode = pr.RequestCode, RequestDate = pr.RequestDate, Status = pr.Status, Notes = pr.Notes };
    }

    public async Task SendUpperProcurementAsync(Guid id)
    {
        var pr = await _db.ProcurementRequests.FindAsync(id) ?? throw new KeyNotFoundException();
        pr.Status = 1;
        await _uow.SaveChangesAsync();
    }

    public async Task<PagedResult<UpperProcurementDto>> GetUpperProcurementsAsync(int pageIndex, int pageSize)
    {
        var q = _db.ProcurementRequests.AsQueryable();
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(p => p.RequestDate).Skip(pageIndex * pageSize).Take(pageSize)
            .Select(p => new UpperProcurementDto { Id = p.Id, RequestCode = p.RequestCode, RequestDate = p.RequestDate, Status = p.Status, Notes = p.Notes }).ToListAsync();
        return new PagedResult<UpperProcurementDto> { Items = items, TotalCount = total, PageIndex = pageIndex, PageSize = pageSize };
    }

    // ---- The kho ----

    public async Task<StockCardDto> GetStockCardAsync(Guid warehouseId, Guid medicineId, DateTime from, DateTime to)
    {
        var med = await _db.Medicines.FindAsync(medicineId);
        var entries = new List<StockCardEntryDto>();

        // Receipts
        var receiptItems = await _db.StockReceiptItems.Include(ri => ri.StockReceipt)
            .Where(ri => ri.StockReceipt.WarehouseId == warehouseId && ri.MedicineId == medicineId && ri.StockReceipt.Status == 1 && ri.StockReceipt.ReceiptDate >= from && ri.StockReceipt.ReceiptDate <= to)
            .ToListAsync();
        foreach (var ri in receiptItems)
        {
            entries.Add(new StockCardEntryDto { Date = ri.StockReceipt.ReceiptDate, DocumentCode = ri.StockReceipt.ReceiptCode, TransactionType = "Nhap", QuantityIn = ri.Quantity, BatchNumber = ri.BatchNumber });
        }

        // Issues
        var issueItems = await _db.StockIssueItems.Include(ii => ii.StockIssue)
            .Where(ii => ii.StockIssue.WarehouseId == warehouseId && ii.MedicineId == medicineId && ii.StockIssue.Status >= 1 && ii.StockIssue.IssueDate >= from && ii.StockIssue.IssueDate <= to)
            .ToListAsync();
        foreach (var ii in issueItems)
        {
            entries.Add(new StockCardEntryDto { Date = ii.StockIssue.IssueDate, DocumentCode = ii.StockIssue.IssueCode, TransactionType = "Xuat", QuantityOut = ii.Quantity, BatchNumber = ii.BatchNumber });
        }

        // Sort and compute running balance
        entries = entries.OrderBy(e => e.Date).ToList();
        decimal balance = 0;
        // Get opening balance from stock balances that existed before "from"
        var openingBal = await _db.StockBalances.Where(b => b.WarehouseId == warehouseId && b.MedicineId == medicineId).SumAsync(b => b.Quantity);
        // Approximate: current balance minus all movements in period = opening balance
        var totalIn = entries.Sum(e => e.QuantityIn);
        var totalOut = entries.Sum(e => e.QuantityOut);
        balance = openingBal - totalIn + totalOut; // reverse to get opening
        foreach (var e in entries)
        {
            balance += e.QuantityIn - e.QuantityOut;
            e.Balance = balance;
        }

        return new StockCardDto { MedicineId = medicineId, MedicineName = med?.Name, Unit = med?.Unit, Entries = entries };
    }

    // ---- Khoa so ----

    public async Task LockDocumentPeriodAsync(Guid warehouseId, int year, int month)
    {
        var config = await _db.SystemConfigs.FirstOrDefaultAsync(c => c.Key == $"DocLock_{warehouseId}_{year}_{month}");
        if (config == null)
        {
            await _db.SystemConfigs.AddAsync(new SystemConfig { Key = $"DocLock_{warehouseId}_{year}_{month}", Value = "locked", Description = $"Document lock {year}/{month}" });
        }
        else { config.Value = "locked"; }
        await _uow.SaveChangesAsync();
    }

    public async Task UnlockDocumentPeriodAsync(Guid warehouseId, int year, int month)
    {
        var config = await _db.SystemConfigs.FirstOrDefaultAsync(c => c.Key == $"DocLock_{warehouseId}_{year}_{month}");
        if (config != null) { config.Value = "unlocked"; await _uow.SaveChangesAsync(); }
    }

    public async Task RecalculateOpeningBalanceAsync(Guid warehouseId)
    {
        // Recalculate: nothing to do specifically as stock balances are maintained incrementally
        await Task.CompletedTask;
    }

    public async Task<List<DocumentLockDto>> GetDocumentLocksAsync(Guid warehouseId)
    {
        var prefix = $"DocLock_{warehouseId}_";
        var configs = await _db.SystemConfigs.Where(c => c.Key.StartsWith(prefix)).ToListAsync();
        var warehouse = await _db.Warehouses.FindAsync(warehouseId);
        return configs.Select(c =>
        {
            var parts = c.Key.Replace(prefix, "").Split('_');
            return new DocumentLockDto
            {
                WarehouseId = warehouseId, WarehouseName = warehouse?.Name,
                Year = int.TryParse(parts.ElementAtOrDefault(0), out var y) ? y : 0,
                Month = int.TryParse(parts.ElementAtOrDefault(1), out var m) ? m : 0,
                IsLocked = c.Value == "locked",
                LockedAt = c.UpdatedAt ?? c.CreatedAt
            };
        }).OrderByDescending(d => d.Year).ThenByDescending(d => d.Month).ToList();
    }

    // ---- Duyet toa ----

    public async Task ApprovePrescriptionAsync(Guid prescriptionId)
    {
        var rx = await _db.Prescriptions.FindAsync(prescriptionId) ?? throw new KeyNotFoundException();
        rx.Status = 1; // Approved
        await _uow.SaveChangesAsync();
    }

    public async Task<PagedResult<PrescriptionApprovalDto>> GetPendingPrescriptionsAsync(int pageIndex, int pageSize)
    {
        var q = _db.Prescriptions.Include(p => p.Patient).Include(p => p.Items).ThenInclude(i => i.Medicine)
            .Where(p => p.Status == 0 && !p.IsDispensed);
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(p => p.PrescriptionDate).Skip(pageIndex * pageSize).Take(pageSize)
            .Select(p => new PrescriptionApprovalDto
            {
                PrescriptionId = p.Id,
                PatientId = p.PatientId,
                PatientName = p.Patient.FullName,
                PrescriptionDate = p.PrescriptionDate,
                Diagnosis = p.Diagnosis,
                Status = p.Status,
                Items = p.Items.Select(i => new PrescriptionApprovalItemDto
                {
                    MedicineId = i.MedicineId, MedicineName = i.Medicine.Name, Unit = i.Medicine.Unit,
                    Quantity = i.Quantity, Dosage = i.Dosage, Usage = i.Usage, DaysSupply = i.DaysSupply
                }).ToList()
            }).ToListAsync();
        return new PagedResult<PrescriptionApprovalDto> { Items = items, TotalCount = total, PageIndex = pageIndex, PageSize = pageSize };
    }

    // ---- Bao cao ----

    public async Task<DailyDispenseReportDto> GetDailyDispenseReportAsync(DateTime date, Guid? warehouseId)
    {
        var startOfDay = date.Date;
        var endOfDay = startOfDay.AddDays(1);
        var q = _db.StockIssues.Include(i => i.Items).ThenInclude(ii => ii.Medicine)
            .Where(i => i.IssueType == "XuatBanBenh" && i.IssueDate >= startOfDay && i.IssueDate < endOfDay);
        if (warehouseId.HasValue) q = q.Where(i => i.WarehouseId == warehouseId);
        var issues = await q.ToListAsync();
        var reportItems = issues.SelectMany(i => i.Items).GroupBy(ii => new { ii.MedicineId, ii.Medicine?.Name, ii.Medicine?.Unit })
            .Select(g => new DailyDispenseReportItemDto { MedicineId = g.Key.MedicineId, MedicineName = g.Key.Name, Unit = g.Key.Unit, Quantity = g.Sum(x => x.Quantity), Amount = g.Sum(x => x.TotalAmount) }).ToList();
        return new DailyDispenseReportDto { Date = date, WarehouseId = warehouseId, TotalPrescriptions = issues.Count, TotalAmount = issues.Sum(i => i.TotalAmount), Items = reportItems };
    }

    public async Task<List<StockBalanceDto>> GetLowerLevelStockAsync(Guid? facilityId)
    {
        var q = _db.StockBalances.Include(s => s.Warehouse).Include(s => s.Medicine).Where(s => s.Quantity > 0);
        if (facilityId.HasValue) q = q.Where(s => s.Warehouse.FacilityId == facilityId);
        return await q.OrderBy(s => s.Medicine.Name)
            .Select(s => new StockBalanceDto { Id = s.Id, WarehouseId = s.WarehouseId, WarehouseName = s.Warehouse.Name, MedicineId = s.MedicineId, MedicineName = s.Medicine.Name, Unit = s.Medicine.Unit, Quantity = s.Quantity, BatchNumber = s.BatchNumber, ExpiryDate = s.ExpiryDate, UnitPrice = s.UnitPrice }).ToListAsync();
    }
}
