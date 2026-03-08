using CHIS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CHIS.UnitTests;

public static class TestDbContextFactory
{
    public static CHISDbContext Create(string? dbName = null)
    {
        var options = new DbContextOptionsBuilder<CHISDbContext>()
            .UseInMemoryDatabase(databaseName: dbName ?? Guid.NewGuid().ToString())
            .Options;

        var context = new CHISDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }
}
