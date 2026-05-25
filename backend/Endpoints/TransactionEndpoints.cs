
using backend.Models;
using backend.Services;
using backend.Data;
using backend.DTOs.Transactions;
using Microsoft.EntityFrameworkCore;

namespace backend.Endpoints;

public static class TransactionEndpoints
{
    public static void MapTransactionEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/transactions").WithTags("Transactions");

        // GET all transactions for a user
        group.MapGet("/", async (BackendContext db, Guid userId) =>
        {
            var transactions = await db.Transactions
                .Where(t => t.UserId == userId)
                .Include(t => t.Category)
                .Select(t => new TransactionResponseDto
                {
                    Id = t.Id,
                    Source = t.Source,
                    TransactionDate = t.TransactionDate,
                    Description = t.Description,
                    Amount = t.Amount,
                    CurrencyCode = t.CurrencyCode,
                    CategoryId = t.CategoryId,
                    Category = t.Category == null
                        ? null
                        : new TransactionCategoryDto
                        {
                            Id = t.Category.Id,
                            Name = t.Category.Name,
                            Description = t.Category.Description,
                        },
                    UserId = t.UserId,
                    CreatedAtUtc = t.CreatedAtUtc,
                    UpdatedAtUtc = t.UpdatedAtUtc,
                })
                .ToListAsync();

            return Results.Ok(transactions);
        })
        .WithName("GetTransactions")
        .Produces<List<TransactionResponseDto>>(StatusCodes.Status200OK);

        // POST CSV file upload
        group.MapPost("/import", async (
            IFormFile file,
            string format,
            BackendContext db,
            CsvParserService csvParser,
            Guid userId) =>
        {
            if (file == null || file.Length == 0)
                return Results.BadRequest(new { error = "No file provided." });

            if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
                return Results.BadRequest(new { error = "File must be a CSV file." });

            if (!Enum.TryParse<CsvFormat>(format, ignoreCase: true, out var csvFormat))
            {
                var validFormats = string.Join(", ", Enum.GetNames(typeof(CsvFormat)));
                return Results.BadRequest(new { error = $"Invalid format. Supported formats: {validFormats}" });
            }

            try
            {
                using (var stream = file.OpenReadStream())
                {
                    var transactions = await csvParser.ParseCsvAsync(stream, userId, csvFormat);
                    var saved = await csvParser.SaveTransactionsAsync(transactions);
                    var skippedDuplicates = transactions.Count - saved;
                    return Results.Ok(new ImportTransactionsResponseDto
                    {
                        Message = $"Parsed {transactions.Count} transaction(s), imported {saved}, skipped {skippedDuplicates} duplicate(s).",
                        Parsed = transactions.Count,
                        Imported = saved,
                        SkippedDuplicates = skippedDuplicates,
                    });
                }
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new ApiErrorDto { Error = ex.Message });
            }
            catch (Exception ex)
            {
                return Results.Json(
                    new ApiErrorDto
                    {
                        Error = "Failed to parse CSV file.",
                        Details = ex.Message,
                    },
                    statusCode: StatusCodes.Status500InternalServerError);
            }
        }).WithName("ImportTransactions")
          .Produces<ImportTransactionsResponseDto>(StatusCodes.Status200OK)
          .Produces<ApiErrorDto>(StatusCodes.Status400BadRequest)
          .Produces<ApiErrorDto>(StatusCodes.Status500InternalServerError)
          .DisableAntiforgery();
    }
}
