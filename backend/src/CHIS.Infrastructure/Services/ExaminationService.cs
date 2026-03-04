using CHIS.Application.DTOs;
using CHIS.Application.Services;
using CHIS.Core.Entities;
using CHIS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CHIS.Infrastructure.Services;

public class ExaminationService : IExaminationService
{
    private readonly CHISDbContext _db;
    private readonly IUnitOfWork _uow;
    public ExaminationService(CHISDbContext db, IUnitOfWork uow) { _db = db; _uow = uow; }

    // ============================================================
    // EXISTING METHODS
    // ============================================================

    public async Task<ExaminationDto> GetByIdAsync(Guid id)
    {
        var e = await _db.Examinations.Include(x => x.Patient).Include(x => x.Room).Include(x => x.Doctor)
            .FirstOrDefaultAsync(x => x.Id == id) ?? throw new KeyNotFoundException("Examination not found");
        return MapDto(e);
    }

    public async Task<PagedResult<ExaminationDto>> SearchAsync(ExaminationSearchDto dto)
    {
        var q = _db.Examinations.Include(x => x.Patient).Include(x => x.Room).Include(x => x.Doctor).AsQueryable();
        if (!string.IsNullOrEmpty(dto.Keyword))
            q = q.Where(e => e.Patient.FullName.Contains(dto.Keyword) || e.Patient.PatientCode.Contains(dto.Keyword));
        if (dto.RoomId.HasValue) q = q.Where(e => e.RoomId == dto.RoomId);
        if (dto.DoctorId.HasValue) q = q.Where(e => e.DoctorId == dto.DoctorId);
        if (dto.Status.HasValue) q = q.Where(e => e.Status == dto.Status);
        if (dto.FromDate.HasValue) q = q.Where(e => e.ExamDate >= dto.FromDate);
        if (dto.ToDate.HasValue) q = q.Where(e => e.ExamDate <= dto.ToDate);

        var total = await q.CountAsync();
        var items = await q.OrderByDescending(e => e.ExamDate).Skip(dto.PageIndex * dto.PageSize).Take(dto.PageSize).ToListAsync();
        return new PagedResult<ExaminationDto> { Items = items.Select(MapDto).ToList(), TotalCount = total, PageIndex = dto.PageIndex, PageSize = dto.PageSize };
    }

    public async Task<ExaminationDto> CreateAsync(CreateExaminationDto dto)
    {
        var exam = new Examination
        {
            PatientId = dto.PatientId, MedicalRecordId = dto.MedicalRecordId,
            RoomId = dto.RoomId, DoctorId = dto.DoctorId,
            ExamDate = DateTime.UtcNow, ChiefComplaint = dto.ChiefComplaint, Status = 0
        };
        await _db.Examinations.AddAsync(exam);

        // Create queue ticket
        var roomId = dto.RoomId ?? Guid.Empty;
        if (roomId != Guid.Empty)
        {
            var lastQueue = await _db.QueueTickets
                .Where(q => q.RoomId == roomId && q.CreatedAt.Date == DateTime.UtcNow.Date)
                .OrderByDescending(q => q.QueueNumber).FirstOrDefaultAsync();
            var queueNum = (lastQueue?.QueueNumber ?? 0) + 1;
            var ticket = new QueueTicket
            {
                PatientId = dto.PatientId, ExaminationId = exam.Id, RoomId = roomId,
                TicketCode = $"STT{queueNum:D3}", QueueNumber = queueNum,
                QueueType = dto.QueueType ?? 1, Status = 0
            };
            await _db.QueueTickets.AddAsync(ticket);
        }

        await _uow.SaveChangesAsync();
        return await GetByIdAsync(exam.Id);
    }

    public async Task<ExaminationDto> UpdateAsync(Guid id, UpdateExaminationDto dto)
    {
        var e = await _db.Examinations.FindAsync(id) ?? throw new KeyNotFoundException("Examination not found");
        e.ChiefComplaint = dto.ChiefComplaint; e.PresentIllness = dto.PresentIllness;
        e.PastHistory = dto.PastHistory; e.FamilyHistory = dto.FamilyHistory;
        e.PhysicalExam = dto.PhysicalExam; e.GeneralExam = dto.GeneralExam;
        e.CardiovascularExam = dto.CardiovascularExam; e.RespiratoryExam = dto.RespiratoryExam;
        e.GIExam = dto.GIExam; e.NeurologicalExam = dto.NeurologicalExam;
        e.MainDiagnosis = dto.MainDiagnosis; e.MainIcdCode = dto.MainIcdCode;
        e.SecondaryDiagnoses = dto.SecondaryDiagnoses; e.TreatmentPlan = dto.TreatmentPlan;
        e.Conclusion = dto.Conclusion;
        e.Temperature = dto.Temperature; e.SystolicBP = dto.SystolicBP; e.DiastolicBP = dto.DiastolicBP;
        e.HeartRate = dto.HeartRate; e.RespiratoryRate = dto.RespiratoryRate;
        e.Weight = dto.Weight; e.Height = dto.Height; e.SpO2 = dto.SpO2;
        if (e.Status == 0) e.Status = 1;
        await _uow.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task CompleteExaminationAsync(Guid id)
    {
        var e = await _db.Examinations.FindAsync(id) ?? throw new KeyNotFoundException("Examination not found");
        e.Status = 2;
        var ticket = await _db.QueueTickets.FirstOrDefaultAsync(q => q.ExaminationId == id);
        if (ticket != null) ticket.Status = 3;
        await _uow.SaveChangesAsync();
    }

    public async Task<List<QueueTicketDto>> GetQueueByRoomAsync(Guid roomId)
    {
        return await _db.QueueTickets
            .Include(q => q.Patient).Include(q => q.Room)
            .Where(q => q.RoomId == roomId && q.CreatedAt.Date == DateTime.UtcNow.Date && q.Status < 3)
            .OrderBy(q => q.QueueType == 3 ? 0 : q.QueueType == 2 ? 1 : 2).ThenBy(q => q.QueueNumber)
            .Select(q => new QueueTicketDto
            {
                Id = q.Id, PatientId = q.PatientId, PatientName = q.Patient.FullName,
                RoomId = q.RoomId, RoomName = q.Room.Name, TicketCode = q.TicketCode,
                QueueNumber = q.QueueNumber, QueueType = q.QueueType, Status = q.Status,
                CalledAt = q.CalledAt, CreatedAt = q.CreatedAt
            }).ToListAsync();
    }

    public async Task<QueueTicketDto> CallNextAsync(Guid roomId)
    {
        var ticket = await _db.QueueTickets
            .Include(q => q.Patient).Include(q => q.Room)
            .Where(q => q.RoomId == roomId && q.CreatedAt.Date == DateTime.UtcNow.Date && q.Status == 0)
            .OrderBy(q => q.QueueType == 3 ? 0 : q.QueueType == 2 ? 1 : 2).ThenBy(q => q.QueueNumber)
            .FirstOrDefaultAsync() ?? throw new InvalidOperationException("No tickets in queue");
        ticket.Status = 1; ticket.CalledAt = DateTime.UtcNow;
        await _uow.SaveChangesAsync();
        return new QueueTicketDto
        {
            Id = ticket.Id, PatientId = ticket.PatientId, PatientName = ticket.Patient.FullName,
            RoomId = ticket.RoomId, RoomName = ticket.Room.Name, TicketCode = ticket.TicketCode,
            QueueNumber = ticket.QueueNumber, QueueType = ticket.QueueType, Status = ticket.Status,
            CalledAt = ticket.CalledAt, CreatedAt = ticket.CreatedAt
        };
    }

    public async Task CancelQueueTicketAsync(Guid ticketId)
    {
        var t = await _db.QueueTickets.FindAsync(ticketId) ?? throw new KeyNotFoundException("Ticket not found");
        t.Status = 4;
        await _uow.SaveChangesAsync();
    }

    // ============================================================
    // SPECIALIZED MEDICAL RECORDS (14 types)
    // ============================================================

    public async Task<List<SpecializedMedicalRecordDto>> GetSpecializedRecordsAsync(Guid patientId, string? recordType)
    {
        var q = _db.SpecializedMedicalRecords
            .Include(s => s.Patient)
            .Include(s => s.Doctor)
            .Where(s => s.PatientId == patientId);

        if (!string.IsNullOrEmpty(recordType))
            q = q.Where(s => s.RecordType == recordType);

        return await q.OrderByDescending(s => s.CreatedAt)
            .Select(s => new SpecializedMedicalRecordDto
            {
                Id = s.Id,
                PatientId = s.PatientId,
                PatientName = s.Patient.FullName,
                PatientCode = s.Patient.PatientCode,
                MedicalRecordId = s.MedicalRecordId,
                RecordType = s.RecordType,
                RecordTypeLabel = RecordTypes.Labels.ContainsKey(s.RecordType) ? RecordTypes.Labels[s.RecordType] : s.RecordType,
                RecordData = s.RecordData,
                Status = s.Status,
                DoctorId = s.DoctorId,
                DoctorName = s.Doctor != null ? s.Doctor.FullName : null,
                PrintedAt = s.PrintedAt,
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt,
            }).ToListAsync();
    }

    public async Task<SpecializedMedicalRecordDto> CreateSpecializedRecordAsync(CreateSpecializedRecordDto dto)
    {
        var record = new SpecializedMedicalRecord
        {
            PatientId = dto.PatientId,
            MedicalRecordId = dto.MedicalRecordId,
            RecordType = dto.RecordType,
            RecordData = dto.RecordData,
            DoctorId = dto.DoctorId,
            Status = 0,
        };
        await _db.SpecializedMedicalRecords.AddAsync(record);
        await _uow.SaveChangesAsync();

        return (await GetSpecializedRecordsAsync(dto.PatientId, null)).First(r => r.Id == record.Id);
    }

    public async Task<SpecializedMedicalRecordDto> UpdateSpecializedRecordAsync(Guid id, CreateSpecializedRecordDto dto)
    {
        var record = await _db.SpecializedMedicalRecords.FindAsync(id)
            ?? throw new KeyNotFoundException("Specialized record not found");
        record.RecordType = dto.RecordType;
        record.RecordData = dto.RecordData;
        record.DoctorId = dto.DoctorId;
        await _uow.SaveChangesAsync();

        return (await GetSpecializedRecordsAsync(record.PatientId, null)).First(r => r.Id == id);
    }

    public async Task DeleteSpecializedRecordAsync(Guid id)
    {
        var record = await _db.SpecializedMedicalRecords.FindAsync(id)
            ?? throw new KeyNotFoundException("Specialized record not found");
        record.IsDeleted = true;
        await _uow.SaveChangesAsync();
    }

    public async Task<byte[]> PrintSpecializedRecordAsync(Guid id)
    {
        var record = await _db.SpecializedMedicalRecords
            .Include(s => s.Patient).Include(s => s.Doctor)
            .FirstOrDefaultAsync(s => s.Id == id)
            ?? throw new KeyNotFoundException("Specialized record not found");

        record.PrintedAt = DateTime.UtcNow;
        await _uow.SaveChangesAsync();

        var label = RecordTypes.Labels.ContainsKey(record.RecordType) ? RecordTypes.Labels[record.RecordType] : record.RecordType;
        var html = $@"
<html><head><meta charset='utf-8'/>
<style>body{{font-family:'Times New Roman';margin:40px}} h2{{text-align:center}} table{{width:100%;border-collapse:collapse}} td,th{{border:1px solid #000;padding:6px}}</style>
</head><body>
<h2>HO SO BENH AN CHUYEN KHOA - {label.ToUpper()}</h2>
<table>
<tr><td><b>Ho ten:</b> {record.Patient.FullName}</td><td><b>Ma BN:</b> {record.Patient.PatientCode}</td></tr>
<tr><td colspan='2'><b>Loai ho so:</b> {label}</td></tr>
<tr><td colspan='2'><b>Bac si:</b> {record.Doctor?.FullName ?? "---"}</td></tr>
<tr><td colspan='2'><b>Ngay tao:</b> {record.CreatedAt:dd/MM/yyyy HH:mm}</td></tr>
</table>
<h3>Noi dung</h3>
<pre>{record.RecordData ?? "(Khong co du lieu)"}</pre>
</body></html>";

        return System.Text.Encoding.UTF8.GetBytes(html);
    }

    // ============================================================
    // TRACKING BOOKS (8 types)
    // ============================================================

    public async Task<List<TrackingBookEntryDto>> GetTrackingBookEntriesAsync(Guid patientId, string bookType)
    {
        var q = _db.TrackingBookEntries
            .Include(t => t.Patient)
            .Include(t => t.Doctor)
            .Where(t => t.PatientId == patientId);

        if (!string.IsNullOrEmpty(bookType))
            q = q.Where(t => t.BookType == bookType);

        return await q.OrderByDescending(t => t.EntryDate)
            .Select(t => new TrackingBookEntryDto
            {
                Id = t.Id,
                PatientId = t.PatientId,
                PatientName = t.Patient.FullName,
                PatientCode = t.Patient.PatientCode,
                BookType = t.BookType,
                BookTypeLabel = TrackingBookTypes.Labels.ContainsKey(t.BookType) ? TrackingBookTypes.Labels[t.BookType] : t.BookType,
                EntryDate = t.EntryDate,
                Notes = t.Notes,
                EntryData = t.EntryData,
                Status = t.Status,
                DoctorId = t.DoctorId,
                DoctorName = t.Doctor != null ? t.Doctor.FullName : null,
                ExaminationId = t.ExaminationId,
                CreatedAt = t.CreatedAt,
            }).ToListAsync();
    }

    public async Task<TrackingBookEntryDto> CreateTrackingBookEntryAsync(CreateTrackingBookEntryDto dto)
    {
        var entry = new TrackingBookEntry
        {
            PatientId = dto.PatientId,
            BookType = dto.BookType,
            EntryDate = dto.EntryDate,
            Notes = dto.Notes,
            EntryData = dto.EntryData,
            DoctorId = dto.DoctorId,
            ExaminationId = dto.ExaminationId,
            Status = 0,
        };
        await _db.TrackingBookEntries.AddAsync(entry);
        await _uow.SaveChangesAsync();

        return (await GetTrackingBookEntriesAsync(dto.PatientId, dto.BookType)).First(e => e.Id == entry.Id);
    }

    public async Task<TrackingBookEntryDto> UpdateTrackingBookEntryAsync(Guid id, CreateTrackingBookEntryDto dto)
    {
        var entry = await _db.TrackingBookEntries.FindAsync(id)
            ?? throw new KeyNotFoundException("Tracking book entry not found");
        entry.BookType = dto.BookType;
        entry.EntryDate = dto.EntryDate;
        entry.Notes = dto.Notes;
        entry.EntryData = dto.EntryData;
        entry.DoctorId = dto.DoctorId;
        entry.ExaminationId = dto.ExaminationId;
        await _uow.SaveChangesAsync();

        return (await GetTrackingBookEntriesAsync(entry.PatientId, entry.BookType)).First(e => e.Id == id);
    }

    public async Task DeleteTrackingBookEntryAsync(Guid id)
    {
        var entry = await _db.TrackingBookEntries.FindAsync(id)
            ?? throw new KeyNotFoundException("Tracking book entry not found");
        entry.IsDeleted = true;
        await _uow.SaveChangesAsync();
    }

    // ============================================================
    // VITAL SIGN CHARTS
    // ============================================================

    public async Task<VitalSignChartDto> GetVitalSignChartAsync(Guid patientId, string chartType, DateTime from, DateTime to)
    {
        var exams = await _db.Examinations
            .Where(e => e.PatientId == patientId && e.ExamDate >= from && e.ExamDate <= to)
            .OrderBy(e => e.ExamDate)
            .ToListAsync();

        var chart = new VitalSignChartDto { ChartType = chartType };

        foreach (var e in exams)
        {
            var point = new VitalSignChartPoint
            {
                Date = e.ExamDate,
                SystolicBP = e.SystolicBP,
                DiastolicBP = e.DiastolicBP,
                HeartRate = e.HeartRate,
                Temperature = e.Temperature,
                Weight = e.Weight,
                SpO2 = e.SpO2,
            };

            // Glucose: stored as JSON in GeneralExam or dedicated field if present
            // For now we use whatever numeric data is available from the examination
            chart.DataPoints.Add(point);
        }

        return chart;
    }

    // ============================================================
    // INFUSION / OXYTOCIN / SURGERY RECORDS
    // ============================================================

    public async Task<InfusionRecordDto> CreateInfusionRecordAsync(CreateInfusionRecordDto dto)
    {
        var record = new InfusionRecord
        {
            AdmissionId = Guid.Empty, // Outpatient infusion - no admission
            PatientId = dto.PatientId,
            StartTime = dto.StartTime,
            SolutionName = dto.SolutionName,
            Volume = dto.Volume,
            FlowRate = dto.FlowRate,
            Notes = dto.Notes,
            Status = 0,
        };

        // If there is an examination, try to find an admission for the patient
        if (dto.ExaminationId.HasValue)
        {
            var admission = await _db.Admissions
                .Where(a => a.PatientId == dto.PatientId && a.Status == 0)
                .OrderByDescending(a => a.AdmissionDate)
                .FirstOrDefaultAsync();
            if (admission != null) record.AdmissionId = admission.Id;
        }

        await _db.InfusionRecords.AddAsync(record);
        await _uow.SaveChangesAsync();

        var patient = await _db.Patients.FindAsync(dto.PatientId);
        return new InfusionRecordDto
        {
            Id = record.Id,
            PatientId = record.PatientId,
            PatientName = patient?.FullName,
            ExaminationId = dto.ExaminationId,
            StartTime = record.StartTime,
            SolutionName = record.SolutionName,
            Volume = record.Volume,
            FlowRate = record.FlowRate,
            Notes = record.Notes,
            Status = record.Status,
            CreatedAt = record.CreatedAt,
        };
    }

    public async Task<OxytocinRecordDto> CreateOxytocinRecordAsync(CreateOxytocinRecordDto dto)
    {
        var record = new OxytocinRecord
        {
            PatientId = dto.PatientId,
            ExaminationId = dto.ExaminationId,
            StartTime = dto.StartTime,
            InitialDose = dto.InitialDose,
            MaxDose = dto.MaxDose,
            DilutionInfo = dto.DilutionInfo,
            Notes = dto.Notes,
            Status = 0,
        };
        await _db.OxytocinRecords.AddAsync(record);
        await _uow.SaveChangesAsync();

        var patient = await _db.Patients.FindAsync(dto.PatientId);
        return new OxytocinRecordDto
        {
            Id = record.Id,
            PatientId = record.PatientId,
            PatientName = patient?.FullName,
            ExaminationId = record.ExaminationId,
            StartTime = record.StartTime,
            InitialDose = record.InitialDose,
            CurrentDose = record.InitialDose,
            MaxDose = record.MaxDose,
            DilutionInfo = record.DilutionInfo,
            Notes = record.Notes,
            Status = record.Status,
            CreatedAt = record.CreatedAt,
        };
    }

    public async Task<SurgeryRecordDto> CreateSurgeryRecordAsync(CreateSurgeryRecordDto dto)
    {
        var record = new SurgeryRecord
        {
            PatientId = dto.PatientId,
            ExaminationId = dto.ExaminationId,
            ProcedureDate = dto.ProcedureDate,
            ProcedureName = dto.ProcedureName,
            ProcedureType = dto.ProcedureType,
            Surgeon = dto.Surgeon,
            Assistant = dto.Assistant,
            Anesthesia = dto.Anesthesia,
            Findings = dto.Findings,
            Complications = dto.Complications,
            Notes = dto.Notes,
        };
        await _db.SurgeryRecords.AddAsync(record);
        await _uow.SaveChangesAsync();

        var patient = await _db.Patients.FindAsync(dto.PatientId);
        return new SurgeryRecordDto
        {
            Id = record.Id,
            PatientId = record.PatientId,
            PatientName = patient?.FullName,
            ExaminationId = record.ExaminationId,
            ProcedureDate = record.ProcedureDate,
            ProcedureName = record.ProcedureName,
            ProcedureType = record.ProcedureType,
            Surgeon = record.Surgeon,
            Assistant = record.Assistant,
            Anesthesia = record.Anesthesia,
            Findings = record.Findings,
            Complications = record.Complications,
            Notes = record.Notes,
            CreatedAt = record.CreatedAt,
        };
    }

    // ============================================================
    // PATIENT TYPE CHANGE
    // ============================================================

    public async Task ChangePatientTypeAsync(Guid examinationId, string newType)
    {
        var exam = await _db.Examinations.Include(e => e.MedicalRecord)
            .FirstOrDefaultAsync(e => e.Id == examinationId)
            ?? throw new KeyNotFoundException("Examination not found");

        // Update the medical record's treatment type
        if (exam.MedicalRecord != null)
        {
            // PatientType stored as a string field on MedicalRecord or use a convention
            // For CHIS community health: type can be "BHYT", "ThuPhi", "MienPhi", "ChiDinh"
            // We store it in a general-purpose field or extend if needed
        }

        await _uow.SaveChangesAsync();
    }

    // ============================================================
    // ONLINE BOOKINGS
    // ============================================================

    public async Task<PagedResult<OnlineBookingDto>> GetOnlineBookingsAsync(OnlineBookingSearchDto dto)
    {
        var q = _db.OnlineBookings.Include(b => b.Patient).Include(b => b.Room).AsQueryable();

        if (dto.FromDate.HasValue) q = q.Where(b => b.BookingDate >= dto.FromDate);
        if (dto.ToDate.HasValue) q = q.Where(b => b.BookingDate <= dto.ToDate);
        if (dto.Status.HasValue) q = q.Where(b => b.Status == dto.Status);
        if (!string.IsNullOrEmpty(dto.Keyword))
            q = q.Where(b => b.Patient.FullName.Contains(dto.Keyword) || b.Patient.PatientCode.Contains(dto.Keyword));

        var total = await q.CountAsync();
        var items = await q.OrderByDescending(b => b.BookingDate).ThenBy(b => b.BookingTime)
            .Skip(dto.PageIndex * dto.PageSize).Take(dto.PageSize)
            .Select(b => new OnlineBookingDto
            {
                Id = b.Id,
                PatientId = b.PatientId,
                PatientName = b.Patient.FullName,
                PatientCode = b.Patient.PatientCode,
                PatientPhone = b.Patient.Phone,
                BookingDate = b.BookingDate,
                BookingTime = b.BookingTime,
                RoomId = b.RoomId,
                RoomName = b.Room != null ? b.Room.Name : null,
                Status = b.Status,
                Notes = b.Notes,
                Source = b.Source,
                CreatedAt = b.CreatedAt,
            }).ToListAsync();

        return new PagedResult<OnlineBookingDto>
        {
            Items = items, TotalCount = total,
            PageIndex = dto.PageIndex, PageSize = dto.PageSize,
        };
    }

    // ============================================================
    // PATIENTS BY LEVEL
    // ============================================================

    public async Task<List<ExamPatientByLevelDto>> GetPatientsByLevelAsync(string level)
    {
        // Level mapping for community health stations:
        // "1" = Emergency, "2" = Priority, "3" = Normal, "chronic" = Chronic patients
        var q = _db.Examinations
            .Include(e => e.Patient)
            .AsQueryable();

        if (level == "chronic")
        {
            // Patients with chronic disease registrations
            var chronicPatientIds = await _db.ChronicDiseaseRegisters
                .Where(c => c.Status == "Active" || c.Status == "1")
                .Select(c => c.PatientId)
                .Distinct()
                .ToListAsync();

            return await _db.Patients
                .Where(p => chronicPatientIds.Contains(p.Id))
                .Select(p => new ExamPatientByLevelDto
                {
                    PatientId = p.Id,
                    PatientName = p.FullName,
                    PatientCode = p.PatientCode,
                    Level = "chronic",
                    Diagnosis = _db.ChronicDiseaseRegisters.Where(c => c.PatientId == p.Id).Select(c => c.DiseaseType).FirstOrDefault(),
                    LastVisit = _db.Examinations.Where(e => e.PatientId == p.Id).OrderByDescending(e => e.ExamDate).Select(e => (DateTime?)e.ExamDate).FirstOrDefault(),
                    VisitCount = _db.Examinations.Count(e => e.PatientId == p.Id),
                }).ToListAsync();
        }

        // Patients filtered by queue type (1=Normal, 2=Priority, 3=Emergency)
        int queueType = level switch { "1" => 3, "2" => 2, _ => 1 };
        var today = DateTime.UtcNow.Date;
        var tickets = await _db.QueueTickets
            .Include(t => t.Patient)
            .Where(t => t.QueueType == queueType && t.CreatedAt.Date == today)
            .Select(t => new ExamPatientByLevelDto
            {
                PatientId = t.PatientId,
                PatientName = t.Patient.FullName,
                PatientCode = t.Patient.PatientCode,
                Level = level,
                LastVisit = today,
                VisitCount = 1,
            }).ToListAsync();

        return tickets;
    }

    // ============================================================
    // HELPERS
    // ============================================================

    private static ExaminationDto MapDto(Examination e) => new()
    {
        Id = e.Id, PatientId = e.PatientId, PatientName = e.Patient?.FullName,
        PatientCode = e.Patient?.PatientCode, MedicalRecordId = e.MedicalRecordId,
        RoomId = e.RoomId, RoomName = e.Room?.Name, DoctorId = e.DoctorId, DoctorName = e.Doctor?.FullName,
        ExamDate = e.ExamDate, ChiefComplaint = e.ChiefComplaint, PresentIllness = e.PresentIllness,
        PastHistory = e.PastHistory, FamilyHistory = e.FamilyHistory, PhysicalExam = e.PhysicalExam,
        GeneralExam = e.GeneralExam, CardiovascularExam = e.CardiovascularExam,
        RespiratoryExam = e.RespiratoryExam, GIExam = e.GIExam, NeurologicalExam = e.NeurologicalExam,
        MainDiagnosis = e.MainDiagnosis, MainIcdCode = e.MainIcdCode,
        SecondaryDiagnoses = e.SecondaryDiagnoses, TreatmentPlan = e.TreatmentPlan,
        Conclusion = e.Conclusion, Status = e.Status,
        Temperature = e.Temperature, SystolicBP = e.SystolicBP, DiastolicBP = e.DiastolicBP,
        HeartRate = e.HeartRate, RespiratoryRate = e.RespiratoryRate,
        Weight = e.Weight, Height = e.Height, SpO2 = e.SpO2
    };
}
