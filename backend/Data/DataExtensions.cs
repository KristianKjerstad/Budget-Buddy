using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public static class DataExtensions
{

    public static void MigrateDatabase(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<BackendContext>();
        dbContext.Database.Migrate();
    }

    public static void AddDatabase(this WebApplicationBuilder builder)
    {
        var connectionString = builder.Configuration.GetConnectionString("Database")
            ?? throw new InvalidOperationException("ConnectionStrings:Database is not configured.");

        builder.Services.AddDbContext<BackendContext>(options => options.UseSqlite(connectionString));
    }
}