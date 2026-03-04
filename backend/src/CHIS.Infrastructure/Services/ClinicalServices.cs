using CHIS.Application.DTOs;
using CHIS.Application.Services;
using CHIS.Core.Entities;
using CHIS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CHIS.Infrastructure.Services;

// ---- Prescription Service ----
public class PrescriptionService : IPrescriptionService
{
    private readonly CHISDbContext _db;
    private readonly IUnitOfWork _uow;
    public PrescriptionService(CHISDbContext db, IUnitOfWork uow) { _db = db; _uow = uow; }

    public async Task<PrescriptionDto> GetByIdAsync(Guid id)
    {
        var p = await _db.Prescriptions.Include(x => x.Items).ThenInclude(i => i.Medicine).Include(x => x.Patient)
            .FirstOrDefaultAsync(x => x.Id == id) ?? throw new KeyNotFoundException("Prescription not found");
        return MapDto(p);
    }

    public async Task<List<PrescriptionDto>> GetByExaminationAsync(Guid examId)
    {
        var list = await _db.Prescriptions.Include(x => x.Items).ThenInclude(i => i.Medicine).Include(x => x.Patient)
            .Where(p => p.ExaminationId == examId).OrderByDescending(p => p.PrescriptionDate).ToListAsync();
        return list.Select(MapDto).ToList();
    }

    public async Task<PagedResult<PrescriptionDto>> SearchAsync(int pageIndex, int pageSize, string? keyword = null, int? status = null)
    {
        var q = _db.Prescriptions.Include(x => x.Items).ThenInclude(i => i.Medicine).Include(x => x.Patient).AsQueryable();
        if (!string.IsNullOrEmpty(keyword)) q = q.Where(p => p.Patient.FullName.Contains(keyword));
        if (status.HasValue) q = q.Where(p => p.Status == status);
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(p => p.PrescriptionDate).Skip(pageIndex * pageSize).Take(pageSize).ToListAsync();
        return new PagedResult<PrescriptionDto> { Items = items.Select(MapDto).ToList(), TotalCount = total, PageIndex = pageIndex, PageSize = pageSize };
    }

    public async Task<PrescriptionDto> CreateAsync(CreatePrescriptionDto dto)
    {
        var rx = new Prescription
        {
            ExaminationId = dto.ExaminationId, PatientId = dto.PatientId, DoctorId = dto.DoctorId,
            PrescriptionDate = DateTime.UtcNow, Diagnosis = dto.Diagnosis, Notes = dto.Notes, Status = 0
        };
        await _db.Prescriptions.AddAsync(rx);
        foreach (var item in dto.Items)
        {
            var med = await _db.Medicines.FindAsync(item.MedicineId);
            var pi = new PrescriptionItem
            {
                PrescriptionId = rx.Id, MedicineId = item.MedicineId, Quantity = item.Quantity,
                Dosage = item.Dosage, Usage = item.Usage, DaysSupply = item.DaysSupply,
                MorningDose = item.MorningDose, NoonDose = item.NoonDose,
                AfternoonDose = item.AfternoonDose, EveningDose = item.EveningDose,
                UnitPrice = med?.SellPrice ?? med?.BhytPrice ?? 0,
                Notes = item.Notes
            };
            pi.TotalAmount = pi.UnitPrice * pi.Quantity;
            await _db.PrescriptionItems.AddAsync(pi);
        }
        await _uow.SaveChangesAsync();
        return await GetByIdAsync(rx.Id);
    }

    public async Task<PrescriptionDto> UpdateAsync(Guid id, CreatePrescriptionDto dto)
    {
        var rx = await _db.Prescriptions.Include(p => p.Items).FirstOrDefaultAsync(p => p.Id == id)
            ?? throw new KeyNotFoundException("Prescription not found");
        rx.Diagnosis = dto.Diagnosis; rx.Notes = dto.Notes; rx.DoctorId = dto.DoctorId;
        _db.PrescriptionItems.RemoveRange(rx.Items);
        foreach (var item in dto.Items)
        {
            var med = await _db.Medicines.FindAsync(item.MedicineId);
            var pi = new PrescriptionItem
            {
                PrescriptionId = id, MedicineId = item.MedicineId, Quantity = item.Quantity,
                Dosage = item.Dosage, Usage = item.Usage, DaysSupply = item.DaysSupply,
                MorningDose = item.MorningDose, NoonDose = item.NoonDose,
                AfternoonDose = item.AfternoonDose, EveningDose = item.EveningDose,
                UnitPrice = med?.SellPrice ?? med?.BhytPrice ?? 0, Notes = item.Notes
            };
            pi.TotalAmount = pi.UnitPrice * pi.Quantity;
            await _db.PrescriptionItems.AddAsync(pi);
        }
        await _uow.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task ConfirmAsync(Guid id) { var rx = await _db.Prescriptions.FindAsync(id) ?? throw new KeyNotFoundException(); rx.Status = 1; await _uow.SaveChangesAsync(); }
    public async Task CancelAsync(Guid id) { var rx = await _db.Prescriptions.FindAsync(id) ?? throw new KeyNotFoundException(); rx.Status = 3; await _uow.SaveChangesAsync(); }
    public async Task DeleteAsync(Guid id) { var rx = await _db.Prescriptions.FindAsync(id) ?? throw new KeyNotFoundException(); rx.IsDeleted = true; await _uow.SaveChangesAsync(); }

    public async Task<PagedResult<MedicineDto>> SearchMedicinesAsync(MedicineSearchDto dto)
    {
        var q = _db.Medicines.Where(m => m.IsActive).AsQueryable();
        if (!string.IsNullOrEmpty(dto.Keyword)) q = q.Where(m => m.Name.Contains(dto.Keyword) || m.Code.Contains(dto.Keyword) || (m.ActiveIngredient != null && m.ActiveIngredient.Contains(dto.Keyword)));
        if (!string.IsNullOrEmpty(dto.DrugGroup)) q = q.Where(m => m.DrugGroup == dto.DrugGroup);
        if (!string.IsNullOrEmpty(dto.Route)) q = q.Where(m => m.Route == dto.Route);
        var total = await q.CountAsync();
        var items = await q.OrderBy(m => m.Name).Skip(dto.PageIndex * dto.PageSize).Take(dto.PageSize).ToListAsync();
        return new PagedResult<MedicineDto>
        {
            Items = items.Select(m => new MedicineDto { Id = m.Id, Code = m.Code, Name = m.Name, ActiveIngredient = m.ActiveIngredient, Dosage = m.Dosage, Unit = m.Unit, Packaging = m.Packaging, Route = m.Route, Manufacturer = m.Manufacturer, Country = m.Country, BhytCode = m.BhytCode, BhytPrice = m.BhytPrice, SellPrice = m.SellPrice, DrugGroup = m.DrugGroup, IsActive = m.IsActive }).ToList(),
            TotalCount = total, PageIndex = dto.PageIndex, PageSize = dto.PageSize
        };
    }

    public async Task<MedicineDto> GetMedicineByIdAsync(Guid id)
    {
        var m = await _db.Medicines.FindAsync(id) ?? throw new KeyNotFoundException();
        return new MedicineDto { Id = m.Id, Code = m.Code, Name = m.Name, ActiveIngredient = m.ActiveIngredient, Dosage = m.Dosage, Unit = m.Unit, Packaging = m.Packaging, Route = m.Route, Manufacturer = m.Manufacturer, Country = m.Country, BhytCode = m.BhytCode, BhytPrice = m.BhytPrice, SellPrice = m.SellPrice, DrugGroup = m.DrugGroup, IsActive = m.IsActive };
    }

    public async Task<MedicineDto> CreateMedicineAsync(MedicineDto dto)
    {
        var m = new Medicine { Code = dto.Code, Name = dto.Name, ActiveIngredient = dto.ActiveIngredient, Dosage = dto.Dosage, Unit = dto.Unit, Packaging = dto.Packaging, Route = dto.Route, Manufacturer = dto.Manufacturer, Country = dto.Country, BhytCode = dto.BhytCode, BhytPrice = dto.BhytPrice, SellPrice = dto.SellPrice, DrugGroup = dto.DrugGroup, IsActive = true };
        await _db.Medicines.AddAsync(m);
        await _uow.SaveChangesAsync();
        dto.Id = m.Id; return dto;
    }

    public async Task<MedicineDto> UpdateMedicineAsync(Guid id, MedicineDto dto)
    {
        var m = await _db.Medicines.FindAsync(id) ?? throw new KeyNotFoundException();
        m.Name = dto.Name; m.ActiveIngredient = dto.ActiveIngredient; m.Dosage = dto.Dosage; m.Unit = dto.Unit; m.Packaging = dto.Packaging; m.Route = dto.Route; m.Manufacturer = dto.Manufacturer; m.Country = dto.Country; m.BhytCode = dto.BhytCode; m.BhytPrice = dto.BhytPrice; m.SellPrice = dto.SellPrice; m.DrugGroup = dto.DrugGroup; m.IsActive = dto.IsActive;
        await _uow.SaveChangesAsync();
        dto.Id = m.Id; return dto;
    }

    private static PrescriptionDto MapDto(Prescription p) => new()
    {
        Id = p.Id, ExaminationId = p.ExaminationId, PatientId = p.PatientId, PatientName = p.Patient?.FullName,
        DoctorId = p.DoctorId, PrescriptionDate = p.PrescriptionDate, Diagnosis = p.Diagnosis,
        Notes = p.Notes, Status = p.Status, IsDispensed = p.IsDispensed,
        Items = p.Items.Select(i => new PrescriptionItemDto
        {
            Id = i.Id, MedicineId = i.MedicineId, MedicineName = i.Medicine?.Name, Unit = i.Medicine?.Unit,
            Quantity = i.Quantity, Dosage = i.Dosage, Usage = i.Usage, DaysSupply = i.DaysSupply,
            MorningDose = i.MorningDose, NoonDose = i.NoonDose, AfternoonDose = i.AfternoonDose,
            EveningDose = i.EveningDose, UnitPrice = i.UnitPrice, TotalAmount = i.TotalAmount, Notes = i.Notes
        }).ToList()
    };
}

// ---- Lab Service ----
public class LabService : ILabService
{
    private readonly CHISDbContext _db;
    private readonly IUnitOfWork _uow;
    public LabService(CHISDbContext db, IUnitOfWork uow) { _db = db; _uow = uow; }

    public async Task<PagedResult<ServiceRequestDto>> GetLabRequestsAsync(ServiceRequestSearchDto dto)
    {
        var q = _db.ServiceRequests.Include(s => s.Patient).Include(s => s.Details)
            .Where(s => s.ServiceType == "XetNghiem").AsQueryable();
        if (!string.IsNullOrEmpty(dto.Keyword)) q = q.Where(s => s.Patient.FullName.Contains(dto.Keyword));
        if (dto.Status.HasValue) q = q.Where(s => s.Status == dto.Status);
        if (dto.FromDate.HasValue) q = q.Where(s => s.CreatedAt >= dto.FromDate);
        if (dto.ToDate.HasValue) q = q.Where(s => s.CreatedAt <= dto.ToDate);
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(s => s.CreatedAt).Skip(dto.PageIndex * dto.PageSize).Take(dto.PageSize).ToListAsync();
        return new PagedResult<ServiceRequestDto> { Items = items.Select(MapSrDto).ToList(), TotalCount = total, PageIndex = dto.PageIndex, PageSize = dto.PageSize };
    }

    public async Task<ServiceRequestDto> CreateLabRequestAsync(CreateServiceRequestDto dto)
    {
        var svc = dto.ServiceId.HasValue ? await _db.Services.FindAsync(dto.ServiceId) : null;
        var sr = new ServiceRequest
        {
            ExaminationId = dto.ExaminationId, PatientId = dto.PatientId,
            ServiceId = dto.ServiceId, ServiceName = svc?.Name, ServiceType = "XetNghiem",
            UnitPrice = svc?.BhytPrice ?? svc?.FeePrice, TotalAmount = svc?.BhytPrice ?? svc?.FeePrice,
            Status = 0, Notes = dto.Notes
        };
        await _db.ServiceRequests.AddAsync(sr);
        await _uow.SaveChangesAsync();
        return MapSrDto(sr);
    }

    public async Task<ServiceRequestDto> UpdateLabResultAsync(Guid id, UpdateServiceResultDto dto)
    {
        var sr = await _db.ServiceRequests.Include(s => s.Details).FirstOrDefaultAsync(s => s.Id == id)
            ?? throw new KeyNotFoundException();
        sr.Result = dto.Result; sr.ResultDescription = dto.ResultDescription; sr.ResultDate = DateTime.UtcNow; sr.Status = 1;
        if (dto.Details != null)
        {
            _db.ServiceRequestDetails.RemoveRange(sr.Details);
            foreach (var d in dto.Details)
            {
                await _db.ServiceRequestDetails.AddAsync(new ServiceRequestDetail
                {
                    ServiceRequestId = id, TestName = d.TestName, Result = d.Result,
                    Unit = d.Unit, ReferenceRange = d.ReferenceRange, AbnormalFlag = d.AbnormalFlag, Status = 1
                });
            }
        }
        await _uow.SaveChangesAsync();
        return MapSrDto(sr);
    }

    public async Task ApproveLabResultAsync(Guid id)
    {
        var sr = await _db.ServiceRequests.FindAsync(id) ?? throw new KeyNotFoundException();
        sr.Status = 2; await _uow.SaveChangesAsync();
    }

    public async Task<List<ServiceDto>> GetLabServicesAsync(string? keyword = null)
    {
        var q = _db.Services.Where(s => s.ServiceType == "XetNghiem" && s.IsActive);
        if (!string.IsNullOrEmpty(keyword)) q = q.Where(s => s.Name.Contains(keyword) || s.Code.Contains(keyword));
        return await q.OrderBy(s => s.SortOrder).Select(s => new ServiceDto { Id = s.Id, Code = s.Code, Name = s.Name, ServiceType = s.ServiceType, ServiceGroup = s.ServiceGroup, BhytPrice = s.BhytPrice, FeePrice = s.FeePrice, IsActive = s.IsActive }).ToListAsync();
    }

    private static ServiceRequestDto MapSrDto(ServiceRequest sr) => new()
    {
        Id = sr.Id, ExaminationId = sr.ExaminationId, PatientId = sr.PatientId,
        PatientName = sr.Patient?.FullName, ServiceId = sr.ServiceId, ServiceName = sr.ServiceName,
        ServiceType = sr.ServiceType, Status = sr.Status, UnitPrice = sr.UnitPrice,
        TotalAmount = sr.TotalAmount, Result = sr.Result, ResultDescription = sr.ResultDescription,
        ResultDate = sr.ResultDate, Notes = sr.Notes,
        Details = sr.Details?.Select(d => new ServiceRequestDetailDto
        {
            Id = d.Id, TestName = d.TestName, Result = d.Result, Unit = d.Unit,
            ReferenceRange = d.ReferenceRange, AbnormalFlag = d.AbnormalFlag, Status = d.Status
        }).ToList() ?? new()
    };
}

// ---- Radiology Service ----
public class RadiologyService : IRadiologyService
{
    private readonly CHISDbContext _db;
    private readonly IUnitOfWork _uow;
    public RadiologyService(CHISDbContext db, IUnitOfWork uow) { _db = db; _uow = uow; }

    public async Task<PagedResult<ServiceRequestDto>> GetImagingRequestsAsync(ServiceRequestSearchDto dto)
    {
        var q = _db.ServiceRequests.Include(s => s.Patient).Include(s => s.Details)
            .Where(s => s.ServiceType == "CDHA").AsQueryable();
        if (!string.IsNullOrEmpty(dto.Keyword)) q = q.Where(s => s.Patient.FullName.Contains(dto.Keyword));
        if (dto.Status.HasValue) q = q.Where(s => s.Status == dto.Status);
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(s => s.CreatedAt).Skip(dto.PageIndex * dto.PageSize).Take(dto.PageSize).ToListAsync();
        return new PagedResult<ServiceRequestDto> { Items = items.Select(ServiceRequestMapper.MapSrDtoStatic).ToList(), TotalCount = total, PageIndex = dto.PageIndex, PageSize = dto.PageSize };
    }

    public async Task<ServiceRequestDto> CreateImagingRequestAsync(CreateServiceRequestDto dto)
    {
        var svc = dto.ServiceId.HasValue ? await _db.Services.FindAsync(dto.ServiceId) : null;
        var sr = new ServiceRequest
        {
            ExaminationId = dto.ExaminationId, PatientId = dto.PatientId,
            ServiceId = dto.ServiceId, ServiceName = svc?.Name, ServiceType = "CDHA",
            UnitPrice = svc?.BhytPrice ?? svc?.FeePrice, TotalAmount = svc?.BhytPrice ?? svc?.FeePrice,
            Status = 0, Notes = dto.Notes
        };
        await _db.ServiceRequests.AddAsync(sr);
        await _uow.SaveChangesAsync();
        return ServiceRequestMapper.MapSrDtoStatic(sr);
    }

    public async Task<ServiceRequestDto> UpdateImagingResultAsync(Guid id, UpdateServiceResultDto dto)
    {
        var sr = await _db.ServiceRequests.Include(s => s.Details).FirstOrDefaultAsync(s => s.Id == id)
            ?? throw new KeyNotFoundException();
        sr.Result = dto.Result; sr.ResultDescription = dto.ResultDescription; sr.ResultDate = DateTime.UtcNow; sr.Status = 1;
        await _uow.SaveChangesAsync();
        return ServiceRequestMapper.MapSrDtoStatic(sr);
    }

    public async Task ApproveImagingResultAsync(Guid id)
    {
        var sr = await _db.ServiceRequests.FindAsync(id) ?? throw new KeyNotFoundException();
        sr.Status = 2; await _uow.SaveChangesAsync();
    }

    public async Task<List<ServiceDto>> GetImagingServicesAsync(string? keyword = null)
    {
        var q = _db.Services.Where(s => s.ServiceType == "CDHA" && s.IsActive);
        if (!string.IsNullOrEmpty(keyword)) q = q.Where(s => s.Name.Contains(keyword) || s.Code.Contains(keyword));
        return await q.OrderBy(s => s.SortOrder).Select(s => new ServiceDto { Id = s.Id, Code = s.Code, Name = s.Name, ServiceType = s.ServiceType, ServiceGroup = s.ServiceGroup, BhytPrice = s.BhytPrice, FeePrice = s.FeePrice, IsActive = s.IsActive }).ToListAsync();
    }
}

// Static helper to avoid duplication
public static class ServiceRequestMapper
{
    public static ServiceRequestDto MapSrDtoStatic(ServiceRequest sr) => new()
    {
        Id = sr.Id, ExaminationId = sr.ExaminationId, PatientId = sr.PatientId,
        PatientName = sr.Patient?.FullName, ServiceId = sr.ServiceId, ServiceName = sr.ServiceName,
        ServiceType = sr.ServiceType, Status = sr.Status, UnitPrice = sr.UnitPrice,
        TotalAmount = sr.TotalAmount, Result = sr.Result, ResultDescription = sr.ResultDescription,
        ResultDate = sr.ResultDate, Notes = sr.Notes,
        Details = sr.Details?.Select(d => new ServiceRequestDetailDto
        {
            Id = d.Id, TestName = d.TestName, Result = d.Result, Unit = d.Unit,
            ReferenceRange = d.ReferenceRange, AbnormalFlag = d.AbnormalFlag, Status = d.Status
        }).ToList() ?? new()
    };
}
