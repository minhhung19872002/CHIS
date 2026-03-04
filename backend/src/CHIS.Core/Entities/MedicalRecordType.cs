namespace CHIS.Core.Entities;

public class SpecializedMedicalRecord : BaseEntity
{
    public Guid PatientId { get; set; }
    public Guid MedicalRecordId { get; set; }
    public string RecordType { get; set; } = string.Empty;
    public string? RecordData { get; set; }
    public int Status { get; set; }
    public Guid? DoctorId { get; set; }
    public DateTime? PrintedAt { get; set; }
    public Patient Patient { get; set; } = null!;
    public MedicalRecord MedicalRecord { get; set; } = null!;
    public User? Doctor { get; set; }
}

public class TrackingBookEntry : BaseEntity
{
    public Guid PatientId { get; set; }
    public string BookType { get; set; } = string.Empty;
    public DateTime EntryDate { get; set; }
    public string? Notes { get; set; }
    public string? EntryData { get; set; }
    public int Status { get; set; }
    public Guid? DoctorId { get; set; }
    public Guid? ExaminationId { get; set; }
    public Patient Patient { get; set; } = null!;
    public User? Doctor { get; set; }
}

public class OxytocinRecord : BaseEntity
{
    public Guid PatientId { get; set; }
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
    public Patient Patient { get; set; } = null!;
}

public class OnlineBooking : BaseEntity
{
    public Guid PatientId { get; set; }
    public DateTime BookingDate { get; set; }
    public string? BookingTime { get; set; }
    public Guid? RoomId { get; set; }
    public int Status { get; set; }
    public string? Notes { get; set; }
    public string? Source { get; set; }
    public Patient Patient { get; set; } = null!;
    public Room? Room { get; set; }
}

public class SurgeryRecord : BaseEntity
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
    public Patient Patient { get; set; } = null!;
}

public class DriverLicenseExam : BaseEntity
{
    public Guid PatientId { get; set; }
    public DateTime ExamDate { get; set; }
    public string? LicenseClass { get; set; }
    public string? GeneralHealth { get; set; }
    public string? InternalMedicine { get; set; }
    public string? Surgery { get; set; }
    public string? Ophthalmology { get; set; }
    public string? ENT { get; set; }
    public string? Psychiatry { get; set; }
    public string? Conclusion { get; set; }
    public bool? IsEligible { get; set; }
    public string? DigitalSignatureId { get; set; }
    public bool IsSynced { get; set; }
    public Patient Patient { get; set; } = null!;
}

public class Referral : BaseEntity
{
    public Guid PatientId { get; set; }
    public Guid? ExaminationId { get; set; }
    public DateTime ReferralDate { get; set; }
    public string? FromFacility { get; set; }
    public string? ToFacility { get; set; }
    public string? Diagnosis { get; set; }
    public string? Reason { get; set; }
    public string? Summary { get; set; }
    public string? TransportMethod { get; set; }
    public Patient Patient { get; set; } = null!;
}

public class SickLeave : BaseEntity
{
    public Guid PatientId { get; set; }
    public Guid? ExaminationId { get; set; }
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public string? Diagnosis { get; set; }
    public string? Notes { get; set; }
    public Guid? DoctorId { get; set; }
    public Patient Patient { get; set; } = null!;
}
