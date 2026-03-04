namespace CHIS.Application.DTOs;

// ---- Enums stored as strings in DB ----

public static class RecordTypes
{
    public const string OutpatientRecord = "OutpatientRecord";
    public const string InternalMedicine = "InternalMedicine";
    public const string NursingRehab = "NursingRehab";
    public const string Obstetric = "Obstetric";
    public const string Neonatal = "Neonatal";
    public const string Psychiatric = "Psychiatric";
    public const string Hypertension = "Hypertension";
    public const string TraditionalMedicine = "TraditionalMedicine";
    public const string Diabetes = "Diabetes";
    public const string Dental = "Dental";
    public const string HandFootMouth = "HandFootMouth";
    public const string Abortion = "Abortion";
    public const string DetailedRecord = "DetailedRecord";
    public const string ChronicTreatment = "ChronicTreatment";

    public static readonly string[] All = new[]
    {
        OutpatientRecord, InternalMedicine, NursingRehab, Obstetric,
        Neonatal, Psychiatric, Hypertension, TraditionalMedicine,
        Diabetes, Dental, HandFootMouth, Abortion, DetailedRecord, ChronicTreatment
    };

    public static readonly Dictionary<string, string> Labels = new()
    {
        [OutpatientRecord] = "Ngoai tru",
        [InternalMedicine] = "Noi khoa",
        [NursingRehab] = "Dieu duong PHCN",
        [Obstetric] = "San khoa",
        [Neonatal] = "So sinh",
        [Psychiatric] = "Tam than",
        [Hypertension] = "Tang huyet ap",
        [TraditionalMedicine] = "YHCT",
        [Diabetes] = "Tieu duong",
        [Dental] = "Rang ham mat",
        [HandFootMouth] = "Tay chan mieng",
        [Abortion] = "Pha thai",
        [DetailedRecord] = "Chi tiet",
        [ChronicTreatment] = "To dieu tri man tinh",
    };
}

public static class TrackingBookTypes
{
    public const string Tuberculosis = "Tuberculosis";
    public const string Psychiatric = "Psychiatric";
    public const string Malaria = "Malaria";
    public const string HIV = "HIV";
    public const string NCD = "NCD";
    public const string Gynecology = "Gynecology";
    public const string FamilyPlanning = "FamilyPlanning";
    public const string ChronicOutpatient = "ChronicOutpatient";

    public static readonly string[] All = new[]
    {
        Tuberculosis, Psychiatric, Malaria, HIV,
        NCD, Gynecology, FamilyPlanning, ChronicOutpatient
    };

    public static readonly Dictionary<string, string> Labels = new()
    {
        [Tuberculosis] = "Lao",
        [Psychiatric] = "Tam than",
        [Malaria] = "Sot ret",
        [HIV] = "HIV",
        [NCD] = "Benh KLN",
        [Gynecology] = "Phu khoa",
        [FamilyPlanning] = "KHHGD",
        [ChronicOutpatient] = "Ngoai tru man tinh",
    };
}

// ---- DTOs ----

public class SpecializedMedicalRecordDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string? PatientName { get; set; }
    public string? PatientCode { get; set; }
    public Guid MedicalRecordId { get; set; }
    public string RecordType { get; set; } = string.Empty;
    public string? RecordTypeLabel { get; set; }
    public string? RecordData { get; set; }
    public int Status { get; set; }
    public Guid? DoctorId { get; set; }
    public string? DoctorName { get; set; }
    public DateTime? PrintedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateSpecializedRecordDto
{
    public Guid PatientId { get; set; }
    public Guid MedicalRecordId { get; set; }
    public string RecordType { get; set; } = string.Empty;
    public string? RecordData { get; set; }
    public Guid? DoctorId { get; set; }
}

public class TrackingBookEntryDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string? PatientName { get; set; }
    public string? PatientCode { get; set; }
    public string BookType { get; set; } = string.Empty;
    public string? BookTypeLabel { get; set; }
    public DateTime EntryDate { get; set; }
    public string? Notes { get; set; }
    public string? EntryData { get; set; }
    public int Status { get; set; }
    public Guid? DoctorId { get; set; }
    public string? DoctorName { get; set; }
    public Guid? ExaminationId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateTrackingBookEntryDto
{
    public Guid PatientId { get; set; }
    public string BookType { get; set; } = string.Empty;
    public DateTime EntryDate { get; set; }
    public string? Notes { get; set; }
    public string? EntryData { get; set; }
    public Guid? DoctorId { get; set; }
    public Guid? ExaminationId { get; set; }
}

public class VitalSignChartDto
{
    public string ChartType { get; set; } = string.Empty;
    public List<VitalSignChartPoint> DataPoints { get; set; } = new();
}

public class VitalSignChartPoint
{
    public DateTime Date { get; set; }
    public decimal? SystolicBP { get; set; }
    public decimal? DiastolicBP { get; set; }
    public decimal? HeartRate { get; set; }
    public decimal? Temperature { get; set; }
    public decimal? Weight { get; set; }
    public decimal? Glucose { get; set; }
    public decimal? SpO2 { get; set; }
}

public class InfusionRecordDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string? PatientName { get; set; }
    public Guid? ExaminationId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public string? SolutionName { get; set; }
    public decimal? Volume { get; set; }
    public decimal? FlowRate { get; set; }
    public string? Notes { get; set; }
    public int Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateInfusionRecordDto
{
    public Guid PatientId { get; set; }
    public Guid? ExaminationId { get; set; }
    public DateTime StartTime { get; set; }
    public string? SolutionName { get; set; }
    public decimal? Volume { get; set; }
    public decimal? FlowRate { get; set; }
    public string? Notes { get; set; }
}

public class OxytocinRecordDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string? PatientName { get; set; }
    public Guid? ExaminationId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public decimal? InitialDose { get; set; }
    public decimal? CurrentDose { get; set; }
    public decimal? MaxDose { get; set; }
    public string? DilutionInfo { get; set; }
    public int? FetalHeartRate { get; set; }
    public string? ContractionPattern { get; set; }
    public int? SystolicBP { get; set; }
    public int? DiastolicBP { get; set; }
    public string? Notes { get; set; }
    public int Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateOxytocinRecordDto
{
    public Guid PatientId { get; set; }
    public Guid? ExaminationId { get; set; }
    public DateTime StartTime { get; set; }
    public decimal? InitialDose { get; set; }
    public decimal? MaxDose { get; set; }
    public string? DilutionInfo { get; set; }
    public string? Notes { get; set; }
}

public class SurgeryRecordDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string? PatientName { get; set; }
    public Guid? ExaminationId { get; set; }
    public DateTime ProcedureDate { get; set; }
    public string? ProcedureName { get; set; }
    public string? ProcedureType { get; set; }
    public string? Surgeon { get; set; }
    public string? Assistant { get; set; }
    public string? Anesthesia { get; set; }
    public string? Findings { get; set; }
    public string? Complications { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateSurgeryRecordDto
{
    public Guid PatientId { get; set; }
    public Guid? ExaminationId { get; set; }
    public DateTime ProcedureDate { get; set; }
    public string? ProcedureName { get; set; }
    public string? ProcedureType { get; set; }
    public string? Surgeon { get; set; }
    public string? Assistant { get; set; }
    public string? Anesthesia { get; set; }
    public string? Findings { get; set; }
    public string? Complications { get; set; }
    public string? Notes { get; set; }
}

public class OnlineBookingDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string? PatientName { get; set; }
    public string? PatientCode { get; set; }
    public string? PatientPhone { get; set; }
    public DateTime BookingDate { get; set; }
    public string? BookingTime { get; set; }
    public Guid? RoomId { get; set; }
    public string? RoomName { get; set; }
    public int Status { get; set; }
    public string? Notes { get; set; }
    public string? Source { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class OnlineBookingSearchDto
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int? Status { get; set; }
    public string? Keyword { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; } = 20;
}

public class ExamPatientByLevelDto
{
    public Guid PatientId { get; set; }
    public string? PatientName { get; set; }
    public string? PatientCode { get; set; }
    public string? Level { get; set; }
    public string? Diagnosis { get; set; }
    public DateTime? LastVisit { get; set; }
    public int VisitCount { get; set; }
}

public class ChangePatientTypeDto
{
    public string NewType { get; set; } = string.Empty;
    public string? Reason { get; set; }
}
