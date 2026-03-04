namespace CHIS.Core.Entities;

public class IcdCode : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? NameEnglish { get; set; }
    public string? Chapter { get; set; }
    public string? Group { get; set; }
    public bool IsActive { get; set; } = true;
}

public class ExamDictionary : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? Content { get; set; }
    public Guid? DoctorId { get; set; }
}
