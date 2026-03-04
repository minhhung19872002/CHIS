namespace CHIS.Core.Entities;

public class NutritionReport : BaseEntity
{
    public int Year { get; set; }
    public int Period { get; set; }
    public Guid FacilityId { get; set; }
    public string? ReportData { get; set; }
    public int Status { get; set; }
    public DateTime? SentDate { get; set; }
}
