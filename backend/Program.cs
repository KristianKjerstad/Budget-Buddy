
using backend.Data;
using backend.Endpoints;
using backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.AddDatabase();
builder.Services.AddScoped<CsvParserService>();
builder.Services.AddOpenApi("v1", options =>
{
	options.AddDocumentTransformer((document, _, _) =>
	{
		document.Components ??= new OpenApiComponents();
		document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();
		document.Components.SecuritySchemes["Bearer"] = new OpenApiSecurityScheme
		{
			Type = SecuritySchemeType.Http,
			Scheme = "bearer",
			BearerFormat = "JWT",
			In = ParameterLocation.Header,
			Name = "Authorization",
			Description = "Enter JWT as: Bearer {token}",
		};

		document.Security ??= new List<OpenApiSecurityRequirement>();
		document.Security.Add(new OpenApiSecurityRequirement
		{
			[new OpenApiSecuritySchemeReference("Bearer")] = new List<string>()
		});

		return Task.CompletedTask;
	});
});

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

var authority = builder.Configuration["Authentication:Authority"]
	?? throw new InvalidOperationException("Authentication:Authority is not configured.");
var validIssuer = builder.Configuration["Authentication:ValidIssuer"]
	?? throw new InvalidOperationException("Authentication:ValidIssuer is not configured.");
var validAudience = builder.Configuration["Authentication:ValidAudience"]
	?? throw new InvalidOperationException("Authentication:ValidAudience is not configured.");

builder.Services
	.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
	.AddJwtBearer(options =>
	{
		options.Authority = authority;
		options.RequireHttpsMetadata = true;
		options.TokenValidationParameters = new TokenValidationParameters
		{
			ValidateIssuer = true,
			ValidIssuer = validIssuer,
			ValidateAudience = true,
			ValidAudience = validAudience,
			ValidateIssuerSigningKey = true,
		};
		options.Events = new JwtBearerEvents
		{
			OnAuthenticationFailed = context =>
			{
				Console.WriteLine($"[JWT] Authentication failed: {context.Exception.GetType().Name}: {context.Exception.Message}");
				return Task.CompletedTask;
			},
			OnChallenge = context =>
			{
				Console.WriteLine($"[JWT] Challenge: error={context.Error}; description={context.ErrorDescription}");
				return Task.CompletedTask;
			},
		};
	});

builder.Services.AddAuthorization();

var app = builder.Build();

app.MigrateDatabase();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

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
