namespace CHIS.Application.DTOs;

public class ChronicDiseaseRegisterDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string? PatientName { get; set; }
    public string? PatientCode { get; set; }
    public string DiseaseType { get; set; } = string.Empty;
    public DateTime RegisterDate { get; set; }
    public string? Status { get; set; }
    public string? Notes { get; set; }
    public int TreatmentCount { get; set; }
}

public class CreateChronicDiseaseRegisterDto
{
    public Guid PatientId { get; set; }
    public string DiseaseType { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class ChronicDiseaseTreatmentDto
{
    public Guid Id { get; set; }
    public Guid RegisterId { get; set; }
    public DateTime TreatmentDate { get; set; }
    public string? Progress { get; set; }
    public string? Orders { get; set; }
    public string? VitalSigns { get; set; }
    public string? Notes { get; set; }
    public Guid? DoctorId { get; set; }
    public string? DoctorName { get; set; }
}

public class CreateChronicDiseaseTreatmentDto
{
    public Guid RegisterId { get; set; }
    public string? Progress { get; set; }
    public string? Orders { get; set; }
    public string? VitalSigns { get; set; }
    public string? Notes { get; set; }
}

public class ChronicDiseaseSearchDto
{
    public string? Keyword { get; set; }
    public string? DiseaseType { get; set; }
    public string? Status { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; } = 20;
}

// ---- NCD Outpatient Examination ----
public class NcdExaminationDto
{
    public Guid Id { get; set; }
    public Guid RegisterId { get; set; }
    public string? PatientName { get; set; }
    public string? DiseaseType { get; set; }
    public DateTime ExamDate { get; set; }
    // Vital signs
    public int? SystolicBP { get; set; }
    public int? DiastolicBP { get; set; }
    public decimal? HeartRate { get; set; }
    public decimal? Temperature { get; set; }
    public decimal? Weight { get; set; }
    public decimal? Height { get; set; }
    public decimal? BMI { get; set; }
    // Lab
    public decimal? BloodGlucose { get; set; }
    public decimal? HbA1c { get; set; }
    public decimal? Cholesterol { get; set; }
    public decimal? Triglycerides { get; set; }
    public decimal? Creatinine { get; set; }
    // Clinical
    public string? Diagnosis { get; set; }
    public string? IcdCode { get; set; }
    public string? Assessment { get; set; }
    public string? TreatmentPlan { get; set; }
    public string? Medications { get; set; }
    public string? Notes { get; set; }
    public DateTime? NextVisitDate { get; set; }
    public Guid? DoctorId { get; set; }
    public string? DoctorName { get; set; }
}

public class CreateNcdExaminationDto
{
    public Guid RegisterId { get; set; }
    public int? SystolicBP { get; set; }
    public int? DiastolicBP { get; set; }
    public decimal? HeartRate { get; set; }
    public decimal? Temperature { get; set; }
    public decimal? Weight { get; set; }
    public decimal? Height { get; set; }
    public decimal? BloodGlucose { get; set; }
    public decimal? HbA1c { get; set; }
    public decimal? Cholesterol { get; set; }
    public decimal? Triglycerides { get; set; }
    public decimal? Creatinine { get; set; }
    public string? Diagnosis { get; set; }
    public string? IcdCode { get; set; }
    public string? Assessment { get; set; }
    public string? TreatmentPlan { get; set; }
    public string? Medications { get; set; }
    public string? Notes { get; set; }
    public DateTime? NextVisitDate { get; set; }
}

// ---- NCD Referral ----
public class NcdReferralDto
{
    public Guid Id { get; set; }
    public Guid RegisterId { get; set; }
    public string? PatientName { get; set; }
    public DateTime ReferralDate { get; set; }
    public string? ToFacility { get; set; }
    public string? Reason { get; set; }
    public string? Diagnosis { get; set; }
    public string? TreatmentSummary { get; set; }
    public string? Notes { get; set; }
}

public class CreateNcdReferralDto
{
    public Guid RegisterId { get; set; }
    public string? ToFacility { get; set; }
    public string? Reason { get; set; }
    public string? Diagnosis { get; set; }
    public string? TreatmentSummary { get; set; }
    public string? Notes { get; set; }
}

// ---- NCD Sick Leave ----
public class NcdSickLeaveDto
{
    public Guid Id { get; set; }
    public Guid RegisterId { get; set; }
    public string? PatientName { get; set; }
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public int Days { get; set; }
    public string? Diagnosis { get; set; }
    public string? DoctorName { get; set; }
}

public class CreateNcdSickLeaveDto
{
    public Guid RegisterId { get; set; }
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public string? Diagnosis { get; set; }
}

// ---- Tracking books (So theo doi) ----
public class NcdTrackingBookDto
{
    public string BookType { get; set; } = string.Empty; // TB, Mental, NCD
    public int TotalPatients { get; set; }
    public int ActivePatients { get; set; }
    public int TreatedPatients { get; set; }
    public int DefaultedPatients { get; set; }
    public List<NcdTrackingEntryDto> Entries { get; set; } = new();
}

public class NcdTrackingEntryDto
{
    public Guid PatientId { get; set; }
    public string? PatientName { get; set; }
    public string? PatientCode { get; set; }
    public string? DiseaseType { get; set; }
    public DateTime RegisterDate { get; set; }
    public DateTime? LastVisitDate { get; set; }
    public DateTime? NextVisitDate { get; set; }
    public string? Status { get; set; }
    public string? CurrentTreatment { get; set; }
}

// ---- BP / Glucose chart data ----
public class BPChartPointDto
{
    public string Date { get; set; } = string.Empty;
    public int? Systolic { get; set; }
    public int? Diastolic { get; set; }
}

public class GlucoseChartPointDto
{
    public string Date { get; set; } = string.Empty;
    public decimal? Glucose { get; set; }
    public decimal? HbA1c { get; set; }
}
