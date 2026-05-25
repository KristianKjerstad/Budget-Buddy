
using backend.Endpoints;
using backend.Data;
using backend.Services;

var builder = WebApplication.CreateBuilder(args);
builder.AddDatabase();
builder.Services.AddScoped<CsvParserService>();

var app = builder.Build();

app.MigrateDatabase();

app.MapGet("/", () => "Hello World!");
app.MapTransactionEndpoints();

app.Run();
