namespace CHIS.Core.Entities;

public class PrenatalRecord : BaseEntity
{
    public Guid PatientId { get; set; }
    public DateTime ExamDate { get; set; }
    public int? GestationalWeek { get; set; }
    public decimal? Weight { get; set; }
    public int? SystolicBP { get; set; }
    public int? DiastolicBP { get; set; }
    public decimal? FundalHeight { get; set; }
    public string? FetalHeartRate { get; set; }
    public string? FetalPosition { get; set; }
    public string? Edema { get; set; }
    public string? UltrasoundResult { get; set; }
    public string? Diagnosis { get; set; }
    public string? Notes { get; set; }
    public Guid? DoctorId { get; set; }
    public Guid? FacilityId { get; set; }
    public Patient Patient { get; set; } = null!;
}

public class DeliveryRecord : BaseEntity
{
    public Guid PatientId { get; set; }
    public DateTime DeliveryDate { get; set; }
    public int? GestationalWeek { get; set; }
    public string? DeliveryType { get; set; }
    public string? Complications { get; set; }
    public string? ChildGender { get; set; }
    public decimal? ChildWeight { get; set; }
    public decimal? ChildLength { get; set; }
    public int? ApgarScore1Min { get; set; }
    public int? ApgarScore5Min { get; set; }
    public string? ChildStatus { get; set; }
    public string? MotherStatus { get; set; }
    public string? Notes { get; set; }
    public Guid? FacilityId { get; set; }
    public Patient Patient { get; set; } = null!;
}

public class AbortionRecord : BaseEntity
{
    public Guid PatientId { get; set; }
    public DateTime ProcedureDate { get; set; }
    public int? GestationalWeek { get; set; }
    public string? ProcedureType { get; set; }
    public string? Reason { get; set; }
    public string? Complications { get; set; }
    public string? Notes { get; set; }
    public Guid? FacilityId { get; set; }
    public Patient Patient { get; set; } = null!;
}

public class FamilyPlanningRecord : BaseEntity
{
    public Guid PatientId { get; set; }
    public DateTime RecordDate { get; set; }
    public string? Method { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Notes { get; set; }
    public Guid? FacilityId { get; set; }
    public Patient Patient { get; set; } = null!;
}

public class GynecologyExam : BaseEntity
{
    public Guid PatientId { get; set; }
    public DateTime ExamDate { get; set; }
    public string? ExamResult { get; set; }
    public string? Diagnosis { get; set; }
    public string? Treatment { get; set; }
    public string? Notes { get; set; }
    public Guid? FacilityId { get; set; }
    public Patient Patient { get; set; } = null!;
}
