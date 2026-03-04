namespace CHIS.Core.Entities;

public class HealthCampaign : BaseEntity
{
    public string CampaignName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Location { get; set; }
    public string? Topic { get; set; }
    public int? Participants { get; set; }
    public string? Content { get; set; }
    public string? Notes { get; set; }
    public Guid? FacilityId { get; set; }
}
