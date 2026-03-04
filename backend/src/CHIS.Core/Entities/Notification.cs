namespace CHIS.Core.Entities;

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Content { get; set; }
    public string? Type { get; set; }
    public string? Module { get; set; }
    public string? ActionUrl { get; set; }
    public bool IsRead { get; set; }
    public User User { get; set; } = null!;
}

public class AuditLog : BaseEntity
{
    public Guid? UserId { get; set; }
    public string? Username { get; set; }
    public string? UserFullName { get; set; }
    public string? Action { get; set; }
    public string? EntityType { get; set; }
    public string? EntityId { get; set; }
    public string? Details { get; set; }
    public string? Module { get; set; }
    public string? RequestPath { get; set; }
    public string? RequestMethod { get; set; }
    public int? ResponseStatusCode { get; set; }
}
