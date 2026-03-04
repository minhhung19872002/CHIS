namespace CHIS.Application.DTOs;

public class ServiceRequestDto
{
    public Guid Id { get; set; }
    public Guid ExaminationId { get; set; }
    public Guid PatientId { get; set; }
    public string? PatientName { get; set; }
    public Guid? ServiceId { get; set; }
    public string? ServiceName { get; set; }
    public string? ServiceType { get; set; }
    public Guid? RequestDoctorId { get; set; }
    public string? DoctorName { get; set; }
    public int Status { get; set; }
    public decimal? UnitPrice { get; set; }
    public decimal? TotalAmount { get; set; }
    public string? Result { get; set; }
    public string? ResultDescription { get; set; }
    public DateTime? ResultDate { get; set; }
    public string? Notes { get; set; }
    public List<ServiceRequestDetailDto> Details { get; set; } = new();
}

public class ServiceRequestDetailDto
{
    public Guid Id { get; set; }
    public string? TestName { get; set; }
    public string? Result { get; set; }
    public string? Unit { get; set; }
    public string? ReferenceRange { get; set; }
    public string? AbnormalFlag { get; set; }
    public int Status { get; set; }
}

public class CreateServiceRequestDto
{
    public Guid ExaminationId { get; set; }
    public Guid PatientId { get; set; }
    public Guid? ServiceId { get; set; }
    public string? ServiceType { get; set; }
    public string? Notes { get; set; }
}

public class UpdateServiceResultDto
{
    public string? Result { get; set; }
    public string? ResultDescription { get; set; }
    public List<UpdateServiceDetailResultDto>? Details { get; set; }
}

public class UpdateServiceDetailResultDto
{
    public Guid? Id { get; set; }
    public string? TestName { get; set; }
    public string? Result { get; set; }
    public string? Unit { get; set; }
    public string? ReferenceRange { get; set; }
    public string? AbnormalFlag { get; set; }
}

public class ServiceDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? ServiceType { get; set; }
    public string? ServiceGroup { get; set; }
    public decimal? BhytPrice { get; set; }
    public decimal? FeePrice { get; set; }
    public Guid? DepartmentId { get; set; }
    public bool IsActive { get; set; }
}

public class ServiceSearchDto
{
    public string? Keyword { get; set; }
    public string? ServiceType { get; set; }
    public string? ServiceGroup { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; } = 20;
}

public class ServiceRequestSearchDto
{
    public string? Keyword { get; set; }
    public string? ServiceType { get; set; }
    public int? Status { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; } = 20;
}
