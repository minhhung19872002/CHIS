namespace CHIS.Core.Entities;

public class Admission : BaseEntity
{
    public Guid PatientId { get; set; }
    public Guid MedicalRecordId { get; set; }
    public Guid DepartmentId { get; set; }
    public Guid? BedId { get; set; }
    public Guid? AdmittingDoctorId { get; set; }
    public DateTime AdmissionDate { get; set; }
    public string? AdmissionDiagnosis { get; set; }
    public string? AdmissionReason { get; set; }
    public string? AdmissionType { get; set; }
    public int Status { get; set; }
    public Patient Patient { get; set; } = null!;
    public MedicalRecord MedicalRecord { get; set; } = null!;
    public Department Department { get; set; } = null!;
    public Bed? Bed { get; set; }
}

public class Discharge : BaseEntity
{
    public Guid AdmissionId { get; set; }
    public Guid PatientId { get; set; }
    public DateTime DischargeDate { get; set; }
    public string? DischargeDiagnosis { get; set; }
    public string? DischargeCondition { get; set; }
    public string? DischargeType { get; set; }
    public string? FollowUpPlan { get; set; }
    public Guid? DischargedBy { get; set; }
    public Admission Admission { get; set; } = null!;
    public Patient Patient { get; set; } = null!;
}

public class TreatmentSheet : BaseEntity
{
    public Guid AdmissionId { get; set; }
    public Guid PatientId { get; set; }
    public DateTime TreatmentDate { get; set; }
    public int DayNumber { get; set; }
    public string? Progress { get; set; }
    public string? Orders { get; set; }
    public string? Notes { get; set; }
    public Guid? DoctorId { get; set; }
    public Admission Admission { get; set; } = null!;
}

public class NursingCareSheet : BaseEntity
{
    public Guid AdmissionId { get; set; }
    public Guid PatientId { get; set; }
    public DateTime CareDate { get; set; }
    public string? Shift { get; set; }
    public string? PatientCondition { get; set; }
    public string? NursingAssessment { get; set; }
    public string? Interventions { get; set; }
    public string? Response { get; set; }
    public Guid? NurseId { get; set; }
    public Admission Admission { get; set; } = null!;
}

public class InfusionRecord : BaseEntity
{
    public Guid AdmissionId { get; set; }
    public Guid PatientId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public string? SolutionName { get; set; }
    public decimal? Volume { get; set; }
    public decimal? FlowRate { get; set; }
    public string? Notes { get; set; }
    public int Status { get; set; }
    public Guid? NurseId { get; set; }
    public Admission Admission { get; set; } = null!;
}
