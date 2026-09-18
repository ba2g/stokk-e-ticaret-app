using Microsoft.EntityFrameworkCore;
using Stokk.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Controllers with JSON formatting
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// 2. Pluggable Multi-Database Configuration
var dbProvider = builder.Configuration.GetValue<string>("DatabaseProvider")?.ToLowerInvariant() ?? "sqlite";
Console.WriteLine($"[Stokk.Api] Aktif Veritabanı Sağlayıcısı (DatabaseProvider): {dbProvider.ToUpper()}");

builder.Services.AddDbContext<StokkDbContext>(options =>
{
    switch (dbProvider)
    {
        case "postgresql":
        case "postgres":
            var pgConn = builder.Configuration.GetConnectionString("PostgreSql") 
                ?? "Host=localhost;Port=5432;Database=stokk_db;Username=postgres;Password=postgres";
            options.UseNpgsql(pgConn);
            break;

        case "sqlserver":
        case "mssql":
            var sqlConn = builder.Configuration.GetConnectionString("SqlServer") 
                ?? "Server=(localdb)\\mssqllocaldb;Database=StokkDb;Trusted_Connection=True;TrustServerCertificate=True";
            options.UseSqlServer(sqlConn);
            break;

        case "inmemory":
            options.UseInMemoryDatabase("StokkInMemoryDb");
            break;

        case "sqlite":
        default:
            var sqliteConn = builder.Configuration.GetConnectionString("Sqlite") ?? "Data Source=stokk_app.db";
            options.UseSqlite(sqliteConn);
            break;
    }
});

// 3. CORS Configuration (Allows frontend on port 3000 to interact seamlessly)
var corsOrigins = builder.Configuration.GetSection("CorsOrigins").Get<string[]>() ?? new[] { "http://localhost:3000", "http://127.0.0.1:3000" };
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(corsOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 4. Swagger / OpenAPI Documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Stokk B2B & E-Ticaret Yönetim Portalı API",
        Version = "v1",
        Description = "Çoklu veritabanı (PostgreSQL, SQL Server, SQLite) destekli mikroservis B2B REST API backend servisi."
    });
});

var app = builder.Build();

// 5. Automatic Database Creation & Seeding on Startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<StokkDbContext>();
        await DbInitializer.InitializeAsync(context);
        Console.WriteLine("[Stokk.Api] Veritabanı tabloları ve ilk tohum (seed) veriler başarıyla yüklendi.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[Stokk.Api] Veritabanı ilklendirme hatası: {ex.Message}");
    }
}

// 6. Middleware Pipeline
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Stokk API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowFrontend");

// Global exception handling
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception ex)
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new { message = "Sunucu içi bir hata oluştu.", detail = ex.Message });
    }
});

app.MapControllers();

// Healthcheck root endpoint
app.MapGet("/", () => Results.Ok(new
{
    name = "Stokk B2B Management API",
    version = "1.0.0",
    status = "Active",
    databaseProvider = dbProvider,
    swagger = "/swagger"
}));

app.Run();

