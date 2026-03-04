namespace CHIS.Application.DTOs;

public class AdmissionDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string? PatientName { get; set; }
    public string? PatientCode { get; set; }
    public Guid MedicalRecordId { get; set; }
    public Guid DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public Guid? BedId { get; set; }
    public string? BedName { get; set; }
    public Guid? AdmittingDoctorId { get; set; }
    public string? DoctorName { get; set; }
    public DateTime AdmissionDate { get; set; }
    public string? AdmissionDiagnosis { get; set; }
    public string? AdmissionReason { get; set; }
    public string? AdmissionType { get; set; }
    public int Status { get; set; }
}

public class CreateAdmissionDto
{
    public Guid PatientId { get; set; }
    public Guid MedicalRecordId { get; set; }
    public Guid DepartmentId { get; set; }
    public Guid? BedId { get; set; }
    public Guid? AdmittingDoctorId { get; set; }
    public string? AdmissionDiagnosis { get; set; }
    public string? AdmissionReason { get; set; }
    public string? AdmissionType { get; set; }
}

public class DischargeDto
{
    public Guid Id { get; set; }
    public Guid AdmissionId { get; set; }
    public Guid PatientId { get; set; }
    public string? PatientName { get; set; }
    public DateTime DischargeDate { get; set; }
    public string? DischargeDiagnosis { get; set; }
    public string? DischargeCondition { get; set; }
    public string? DischargeType { get; set; }
    public string? FollowUpPlan { get; set; }
}

public class CreateDischargeDto
{
    public Guid AdmissionId { get; set; }
    public string? DischargeDiagnosis { get; set; }
    public string? DischargeCondition { get; set; }
    public string? DischargeType { get; set; }
    public string? FollowUpPlan { get; set; }
}

public class TreatmentSheetDto
{
    public Guid Id { get; set; }
    public Guid AdmissionId { get; set; }
    public Guid PatientId { get; set; }
    public DateTime TreatmentDate { get; set; }
    public int DayNumber { get; set; }
    public string? Progress { get; set; }
    public string? Orders { get; set; }
    public string? Notes { get; set; }
    public Guid? DoctorId { get; set; }
    public string? DoctorName { get; set; }
}

public class CreateTreatmentSheetDto
{
    public Guid AdmissionId { get; set; }
    public Guid PatientId { get; set; }
    public int DayNumber { get; set; }
    public string? Progress { get; set; }
    public string? Orders { get; set; }
    public string? Notes { get; set; }
}

public class BedDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public Guid RoomId { get; set; }
    public string? RoomName { get; set; }
    public Guid DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public string? Status { get; set; }
    public bool IsActive { get; set; }
}

public class AdmissionSearchDto
{
    public string? Keyword { get; set; }
    public Guid? DepartmentId { get; set; }
    public int? Status { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; } = 20;
}
