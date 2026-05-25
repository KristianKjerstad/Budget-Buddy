
using backend.Models;
using backend.Services;
using backend.Data;
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
            var transactions = await Task.FromResult(db.Transactions
                .Where(t => t.UserId == userId)
                .Include(t => t.Category)
                .ToList());
            return Results.Ok(transactions);
        }).WithName("GetTransactions");

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
                    return Results.Ok(new
                    {
                        message = $"Parsed {transactions.Count} transaction(s), imported {saved}, skipped {skippedDuplicates} duplicate(s).",
                        parsed = transactions.Count,
                        imported = saved,
                        skippedDuplicates
                    });
                }
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return Results.Json(new { error = "Failed to parse CSV file.", details = ex.Message }, statusCode: 500);
            }
        }).WithName("ImportTransactions")
          .DisableAntiforgery();
    }
}
