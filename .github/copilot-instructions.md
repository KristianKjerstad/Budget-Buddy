# Copilot Instructions — Budget Buddy

## Project Overview

Budget Buddy is a personal finance web application. Users can import bank transactions via CSV export, automatically categorize spending, view spending dashboards, and track their net worth over time.

The app consists of two parts:
- **Backend**: ASP.NET Core Web API (.NET 10) with Entity Framework Core for data access and JWT-based authentication
- **Frontend**: Next.js (App Router) + React 19 + TypeScript + Tailwind CSS v4

---

## Backend Architecture

### Core Principles

- **Minimal API**: Endpoints are defined using ASP.NET Core's minimal API style for simplicity and clarity.
- **Separation of Concerns**: Models, DTOs, endpoints, and data access are organized in separate folders.
- **Dependency Injection**: Services and DbContext are registered and injected using .NET's built-in DI container.
- **Entity Framework Core**: Used for data access and migrations, with a SQLite database for local development and PostgreSQL in production.
- **Validation**: DataAnnotations and endpoint filters are used for validating incoming requests.

### Folder Structure

```
Backend/
├── Data/
│   ├── AppDbContext.cs
│   └── Migrations/
├── Models/
│   ├── User.cs
│   ├── Transaction.cs
│   ├── Category.cs
│   ├── Account.cs
│   ├── NetWorthEntry.cs
│   └── MonthlyNetWorth.cs
├── DTOs/
│   ├── Auth/
│   ├── Transactions/
│   ├── Categories/
│   └── NetWorth/
├── Endpoints/
│   ├── AuthEndpoints.cs
│   ├── TransactionEndpoints.cs
│   ├── CategoryEndpoints.cs
│   └── NetWorthEndpoints.cs
├── Services/
│   ├── AuthService.cs
│   ├── CsvParserService.cs
│   ├── CategorizationService.cs
│   └── NetWorthService.cs
├── appsettings.json
├── appsettings.Development.json
└── Program.cs
```

### Endpoint Style

Always use minimal API endpoint style. Register endpoints in dedicated `*Endpoints.cs` files and call them from `Program.cs`.

```csharp
// Endpoints/TransactionEndpoints.cs
public static class TransactionEndpoints
{
    public static void MapTransactionEndpoints(this WebApplication app)
    {
        app.MapGet("/api/transactions", async (AppDbContext db, ClaimsPrincipal user) =>
        {
            // implementation
        }).RequireAuthorization();

        app.MapPost("/api/transactions/import", async (IFormFile file, CsvParserService parser) =>
        {
            // implementation
        }).RequireAuthorization();
    }
}

// Program.cs
app.MapTransactionEndpoints();
app.MapAuthEndpoints();
app.MapNetWorthEndpoints();
```

### Models

Models are plain C# classes mapped to database tables via EF Core. Always include a primary key named `Id`.

```csharp
public class Transaction
{
    public int Id { get; set; }
    public int AccountId { get; set; }
    public Account Account { get; set; } = null!;
    public DateTime Date { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public bool IsManualCategory { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
```

### DTOs

Use DTOs for all request and response bodies. Never expose EF Core models directly in endpoints.

```csharp
// DTOs/Transactions/CreateTransactionDto.cs
public class CreateTransactionDto
{
    [Required]
    public DateTime Date { get; set; }

    [Required]
    public decimal Amount { get; set; }

    [Required]
    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    public int? CategoryId { get; set; }
}
```

### Validation

Use `DataAnnotations` on DTOs and `.WithParameterValidation()` on endpoints to trigger automatic validation.

```csharp
app.MapPost("/api/transactions", async ([FromBody] CreateTransactionDto dto, AppDbContext db) =>
{
    // dto is already validated
}).RequireAuthorization()
  .WithParameterValidation();
```

### Services

Business logic lives in service classes, not in endpoints. Services are registered in `Program.cs` and injected via DI.

```csharp
// Services/CategorizationService.cs
public class CategorizationService
{
    private readonly AppDbContext _db;

    public CategorizationService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<int> GetCategoryIdAsync(string description)
    {
        // Match description against category keywords
    }
}

// Program.cs
builder.Services.AddScoped<CategorizationService>();
builder.Services.AddScoped<CsvParserService>();
```

### AppDbContext

```csharp
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<NetWorthEntry> NetWorthEntries => Set<NetWorthEntry>();
    public DbSet<MonthlyNetWorth> MonthlyNetWorths => Set<MonthlyNetWorth>();
}
```

### Authentication

JWT-based authentication using ASP.NET Core Identity. All endpoints except `/api/auth/register` and `/api/auth/login` require authorization.

```csharp
// Always protect endpoints unless explicitly public
app.MapGet("/api/transactions", handler).RequireAuthorization();

// Extract user ID from claims like this
var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
```

### Database

- **Local development**: SQLite (`budgetbuddy.db` in project root)
- **Production**: PostgreSQL via Railway

Switch is handled via environment config in `appsettings.json` vs `appsettings.Development.json`.

```csharp
// Program.cs — local dev uses SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
```

### EF Core Migrations

Always use migrations for database changes. Never modify the database manually.

```bash
dotnet ef migrations add <MigrationName>
dotnet ef database update
```

### CSV Parsing

Two supported formats: Handelsbanken and SAS Mastercard. Both use semicolon as separator.

Handelsbanken columns: `Bokføringsdato`, `Tekst`, `Beløp`, `Saldo`
SAS Mastercard columns: `Transaksjonsdato`, `Tekst`, `Beløp`, `Valuta`

The parser detects format automatically based on header row content.

Duplicate detection: a transaction is considered a duplicate if `Date + Amount + Description` already exists for the same account.

---

## Frontend Architecture

- **Framework**: Next.js 16 (App Router) with React 19 + TypeScript
- **Styling**: Tailwind CSS v4 (`app/globals.css`) with CSS variables and custom theme tokens
- **UI Components**: shadcn/ui (`new-york` style) + Radix UI primitives + Lucide icons
- **Charts**: Recharts
- **Routing**: File-based routing under `frontend/app`
- **Build/Run Scripts**:
    - `npm run dev` uses `next dev --webpack` (local workaround for Turbopack root detection issues)
    - `npm run dev:turbo` uses Turbopack
    - `npm run build` uses `next build`

### Current Frontend State

- The current frontend is mostly UI-first and uses local/mock data in page components.
- API integration with the backend is not implemented yet in the current Next.js pages.
- There is no `app/login/page.tsx` route yet.

### Pages

- `/` — redirects to `/dashboard`
- `/dashboard` — spending overview with charts and recent transactions
- `/transactions` — upload CSV, view and categorize transactions
- `/networth` — manage assets and liabilities, view net worth over time

### Layout and Navigation

- Global layout is defined in `app/layout.tsx`.
- Desktop navigation uses `components/sidebar.tsx`.
- Mobile navigation uses `components/mobile-header.tsx`.
- Vercel Analytics is enabled in production (`@vercel/analytics/next`).

### API Communication

When integrating the backend API, use a shared API client module (for example `lib/api.ts`) and centralize auth/header handling in one place.

If using Axios in Next.js, prefer `NEXT_PUBLIC_API_URL` for client-side base URL configuration:

```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

### Frontend Deployment (Vercel)

- Deploy from the repo root with **Root Directory** set to `frontend`.
- Framework preset must be **Next.js**.
- Build command: `npm run build`.
- Output directory: leave empty (Next.js default).

---

## General Coding Guidelines

- Use `async/await` throughout — no `.Result` or `.Wait()`
- Return `Results.Ok()`, `Results.NotFound()`, `Results.BadRequest()` from endpoints
- Never hardcode secrets — use environment variables and `appsettings.json`
- Keep endpoints thin — delegate logic to services
- Use `string.Empty` instead of `""`
- Prefer `var` for local variables when type is obvious
- Always use `null!` for required navigation properties on EF Core models
- All dates stored as `DateTime.UtcNow`