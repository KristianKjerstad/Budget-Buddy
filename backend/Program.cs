
using backend.Endpoints;
using backend.Data;
using backend.Services;

var builder = WebApplication.CreateBuilder(args);
builder.AddDatabase();
builder.Services.AddScoped<CsvParserService>();
builder.Services.AddOpenApi("v1");
builder.Services.AddCors(options =>
{
	options.AddPolicy("Frontend", policy =>
	{
		policy
			.WithOrigins(
				"http://localhost:3000",
				"http://127.0.0.1:3000",
				"http://localhost:3001",
				"http://127.0.0.1:3001")
			.AllowAnyHeader()
			.AllowAnyMethod();
	});
});

var app = builder.Build();

app.MigrateDatabase();
app.UseCors("Frontend");

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
