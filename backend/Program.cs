
using backend.Endpoints;
using backend.Data;
using backend.Services;

var builder = WebApplication.CreateBuilder(args);
builder.AddDatabase();
builder.Services.AddScoped<CsvParserService>();
builder.Services.AddOpenApi("v1");

var app = builder.Build();

app.MigrateDatabase();

app.UseSwaggerUI(options =>
{
	options.RoutePrefix = "swagger";
	options.SwaggerEndpoint("/openapi/v1.json", "Budget Buddy API v1");
	options.DocumentTitle = "Budget Buddy API Docs";
});

app.MapOpenApi();
app.MapGet("/", () => "Hello World!");
app.MapTransactionEndpoints();

app.Run();
