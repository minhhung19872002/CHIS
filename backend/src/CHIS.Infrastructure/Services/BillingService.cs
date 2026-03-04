using CHIS.Application.DTOs;
using CHIS.Application.Services;
using CHIS.Core.Entities;
using CHIS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CHIS.Infrastructure.Services;

public class BillingService : IBillingService
{
    private readonly CHISDbContext _db;
    private readonly IUnitOfWork _uow;
    public BillingService(CHISDbContext db, IUnitOfWork uow) { _db = db; _uow = uow; }

    public async Task<ReceiptDto> GetByIdAsync(Guid id)
    {
        var r = await _db.Receipts.Include(x => x.Patient).Include(x => x.Details)
            .FirstOrDefaultAsync(x => x.Id == id) ?? throw new KeyNotFoundException("Receipt not found");
        return MapDto(r);
    }

    public async Task<PagedResult<ReceiptDto>> SearchAsync(ReceiptSearchDto dto)
    {
        var q = _db.Receipts.Include(x => x.Patient).Include(x => x.Details).AsQueryable();
        if (!string.IsNullOrEmpty(dto.Keyword)) q = q.Where(r => r.Patient.FullName.Contains(dto.Keyword) || r.ReceiptNumber.Contains(dto.Keyword));
        if (dto.Status.HasValue) q = q.Where(r => r.Status == dto.Status);
        if (!string.IsNullOrEmpty(dto.ReceiptType)) q = q.Where(r => r.ReceiptType == dto.ReceiptType);
        if (dto.FromDate.HasValue) q = q.Where(r => r.ReceiptDate >= dto.FromDate);
        if (dto.ToDate.HasValue) q = q.Where(r => r.ReceiptDate <= dto.ToDate);
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(r => r.ReceiptDate).Skip(dto.PageIndex * dto.PageSize).Take(dto.PageSize).ToListAsync();
        return new PagedResult<ReceiptDto> { Items = items.Select(MapDto).ToList(), TotalCount = total, PageIndex = dto.PageIndex, PageSize = dto.PageSize };
    }

    public async Task<ReceiptDto> CreateAsync(CreateReceiptDto dto)
    {
        var count = await _db.Receipts.CountAsync() + 1;
        var receipt = new Receipt
        {
            ReceiptNumber = $"PT{DateTime.Now:yyMMdd}{count:D4}",
            PatientId = dto.PatientId, MedicalRecordId = dto.MedicalRecordId,
            ReceiptDate = DateTime.UtcNow, PaymentMethod = dto.PaymentMethod,
            ReceiptType = dto.ReceiptType, DiscountAmount = dto.DiscountAmount, Status = 0
        };
        decimal total = 0, bhytTotal = 0;
        foreach (var d in dto.Details)
        {
            var amount = d.Quantity * d.UnitPrice;
            var bhytAmt = d.BhytPercent.HasValue ? amount * d.BhytPercent.Value / 100 : 0;
            var detail = new ReceiptDetail
            {
                ReceiptId = receipt.Id, ItemType = d.ItemType, ItemName = d.ItemName,
                Quantity = d.Quantity, UnitPrice = d.UnitPrice, TotalAmount = amount,
                BhytPercent = d.BhytPercent, BhytAmount = bhytAmt, PatientAmount = amount - bhytAmt
            };
            await _db.ReceiptDetails.AddAsync(detail);
            total += amount; bhytTotal += bhytAmt;
        }
        receipt.TotalAmount = total;
        receipt.BhytAmount = bhytTotal;
        receipt.PatientAmount = total - bhytTotal - (dto.DiscountAmount ?? 0);
        await _db.Receipts.AddAsync(receipt);
        await _uow.SaveChangesAsync();
        return await GetByIdAsync(receipt.Id);
    }

    public async Task<ReceiptDto> PayAsync(Guid id, string? paymentMethod)
    {
        var r = await _db.Receipts.FindAsync(id) ?? throw new KeyNotFoundException();
        r.Status = 1; r.PaymentMethod = paymentMethod ?? r.PaymentMethod;
        await _uow.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task CancelAsync(Guid id)
    {
        var r = await _db.Receipts.FindAsync(id) ?? throw new KeyNotFoundException();
        r.Status = 2; await _uow.SaveChangesAsync();
    }

    public async Task<RevenueReportDto> GetRevenueReportAsync(DateTime fromDate, DateTime toDate, Guid? facilityId = null)
    {
        var q = _db.Receipts.Where(r => r.Status == 1 && r.ReceiptDate >= fromDate && r.ReceiptDate <= toDate);
        var receipts = await q.ToListAsync();
        var daily = receipts.GroupBy(r => r.ReceiptDate.Date).Select(g => new RevenueByDayDto
        {
            Date = g.Key, Amount = g.Sum(r => r.TotalAmount), Count = g.Count()
        }).OrderBy(d => d.Date).ToList();

        return new RevenueReportDto
        {
            TotalRevenue = receipts.Sum(r => r.TotalAmount),
            BhytRevenue = receipts.Sum(r => r.BhytAmount),
            FeeRevenue = receipts.Sum(r => r.PatientAmount),
            TotalReceipts = receipts.Count,
            DailyBreakdown = daily
        };
    }

    public async Task<List<ReceiptDto>> GetByPatientAsync(Guid patientId)
    {
        var list = await _db.Receipts.Include(r => r.Patient).Include(r => r.Details)
            .Where(r => r.PatientId == patientId).OrderByDescending(r => r.ReceiptDate).ToListAsync();
        return list.Select(MapDto).ToList();
    }

    public async Task<List<ReceiptDto>> GetByMedicalRecordAsync(Guid medicalRecordId)
    {
        var list = await _db.Receipts.Include(r => r.Patient).Include(r => r.Details)
            .Where(r => r.MedicalRecordId == medicalRecordId).OrderByDescending(r => r.ReceiptDate).ToListAsync();
        return list.Select(MapDto).ToList();
    }

    private static ReceiptDto MapDto(Receipt r) => new()
    {
        Id = r.Id, ReceiptNumber = r.ReceiptNumber, PatientId = r.PatientId, PatientName = r.Patient?.FullName,
        MedicalRecordId = r.MedicalRecordId, ReceiptDate = r.ReceiptDate, TotalAmount = r.TotalAmount,
        BhytAmount = r.BhytAmount, PatientAmount = r.PatientAmount, DiscountAmount = r.DiscountAmount,
        PaymentMethod = r.PaymentMethod, Status = r.Status, ReceiptType = r.ReceiptType,
        Details = r.Details?.Select(d => new ReceiptDetailDto
        {
            Id = d.Id, ItemType = d.ItemType, ItemName = d.ItemName, Quantity = d.Quantity,
            UnitPrice = d.UnitPrice, TotalAmount = d.TotalAmount, BhytPercent = d.BhytPercent,
            BhytAmount = d.BhytAmount, PatientAmount = d.PatientAmount
        }).ToList() ?? new()
    };
}
