namespace CHIS.Core.Entities;

public class Service : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? ServiceType { get; set; }
    public string? ServiceGroup { get; set; }
    public decimal? BhytPrice { get; set; }
    public decimal? FeePrice { get; set; }
    public Guid? DepartmentId { get; set; }
    public bool IsApproved { get; set; } = true;
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
}

public class ServiceRequest : BaseEntity
{
    public Guid ExaminationId { get; set; }
    public Guid PatientId { get; set; }
    public Guid? ServiceId { get; set; }
    public string? ServiceName { get; set; }
    public string? ServiceType { get; set; }
    public Guid? RequestDoctorId { get; set; }
    public int Status { get; set; }
    public decimal? UnitPrice { get; set; }
    public decimal? TotalAmount { get; set; }
    public string? Result { get; set; }
    public string? ResultDescription { get; set; }
    public DateTime? ResultDate { get; set; }
    public Guid? ResultDoctorId { get; set; }
    public string? Notes { get; set; }
    public Examination Examination { get; set; } = null!;
    public Patient Patient { get; set; } = null!;
    public Service? Service { get; set; }
    public ICollection<ServiceRequestDetail> Details { get; set; } = new List<ServiceRequestDetail>();
}

public class ServiceRequestDetail : BaseEntity
{
    public Guid ServiceRequestId { get; set; }
    public string? TestName { get; set; }
    public string? Result { get; set; }
    public string? Unit { get; set; }
    public string? ReferenceRange { get; set; }
    public string? AbnormalFlag { get; set; }
    public int Status { get; set; }
    public ServiceRequest ServiceRequest { get; set; } = null!;
}

public class LabReferenceValue : BaseEntity
{
    public Guid ServiceId { get; set; }
    public string? TestName { get; set; }
    public string? Unit { get; set; }
    public string? NormalRange { get; set; }
    public string? Gender { get; set; }
    public string? AgeGroup { get; set; }
}

public class ImagingTemplate : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? ServiceType { get; set; }
    public string? TemplateContent { get; set; }
    public Guid? DoctorId { get; set; }
}
