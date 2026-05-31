using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;
using backend.Models;
using backend.Data;

namespace backend.Services;

public enum CsvFormat
{
    Handelsbanken,
    SasMastercard
}

public class CsvParserService
{
    private readonly BackendContext _db;

    public CsvParserService(BackendContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Parse CSV file and return list of transactions.
    /// Format must be explicitly specified.
    /// </summary>
    public async Task<List<Transaction>> ParseCsvAsync(Stream fileStream, Guid userId, CsvFormat format)
    {
        var transactions = new List<Transaction>();

        using (var reader = new StreamReader(fileStream))
        using (var csv = new CsvReader(reader, new CsvHelper.Configuration.CsvConfiguration(CultureInfo.InvariantCulture)
        {
            Delimiter = ";",
            HasHeaderRecord = true,
            TrimOptions = CsvHelper.Configuration.TrimOptions.Trim
        }))
        {
            await csv.ReadAsync(); // Read header row
            var categories = _db.Categories.ToList();

            // Parse rows by column index
            while (await csv.ReadAsync())
            {
                try
                {
                    var transaction = format switch
                    {
                        CsvFormat.Handelsbanken => ParseHandelsbankenRowByIndex(csv, userId, categories),
                        CsvFormat.SasMastercard => ParseSasMastercardRowByIndex(csv, userId, categories),
                        _ => throw new InvalidOperationException($"Unknown format: {format}")
                    };

                    if (transaction != null)
                        transactions.Add(transaction);
                }
                catch (Exception ex)
                {
                    // Log and skip malformed rows
                    System.Diagnostics.Debug.WriteLine($"Skipped row: {ex.Message}");
                }
            }
        }

        return transactions;
    }

    /// <summary>
    /// Handelsbanken format (current export):
    /// Utført dato; Bokført dato; Rentedato; Beskrivelse; ...; Beløp inn; Beløp ut; ...
    /// </summary>
    private Transaction? ParseHandelsbankenRowByIndex(IReaderRow row, Guid userId, List<Category> categories)
    {
        try
        {
            var dateStr = row.GetField<string?>(0)?.Trim();
            var description = row.GetField<string?>(3)?.Trim();
            var amountOutStr = row.GetField<string?>(11)?.Trim(); // Beløp ut (outgoing)

            // Validate inputs early
            if (string.IsNullOrWhiteSpace(dateStr) || string.IsNullOrWhiteSpace(amountOutStr))
                return null;

            // Skip empty or summary rows, and internal transfers
            if (description?.Contains("Totalbeløp", StringComparison.OrdinalIgnoreCase) == true ||
                description?.Contains("Saldo", StringComparison.OrdinalIgnoreCase) == true ||
                description?.Contains("SEB KORT AB", StringComparison.OrdinalIgnoreCase) == true ||
                description?.Contains("til Sparekonto", StringComparison.OrdinalIgnoreCase) == true ||
                description?.Contains("Til konto:", StringComparison.OrdinalIgnoreCase) == true ||
                description?.Contains("12072209913", StringComparison.OrdinalIgnoreCase) == true)
                return null;

            // Parse date first
            if (!DateTime.TryParseExact(dateStr, "dd.MM.yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime date))
                return null;

            // Parse amount
            if (!TryParseAmount(amountOutStr, out decimal amount))
                return null;

            // Skip positive amounts (that is income, not outgoing transaction)
            if (amount > 0)
                return null;

            // Skip if transaction exists (duplicate check on parsed date, not string)
            var existingTransactions = _db.Transactions.Where(t => t.UserId == userId).ToList();
            var isDuplicate = existingTransactions.Any(t =>
                t.UserId == userId &&
                t.TransactionDate == date &&
                t.Description == description &&
                t.Amount == amount);
            if (isDuplicate) return null;

            var matchingCategory = FindHandelsbankenCategory(new Transaction
            {
                Description = description ?? string.Empty
            }, categories) ?? categories.FirstOrDefault(c => c.Name == "Other");

            return new Transaction
            {
                TransactionDate = date,
                Description = description ?? string.Empty,
                Amount = amount*(-1), // Convert to positive amount for consistency (Handelsbanken uses negative for outgoing)
                CurrencyCode = "NOK",
                Source = "Handelsbanken",
                UserId = userId,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow,
                CategoryId = matchingCategory?.Id
            };
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error parsing Handelsbanken row: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// SAS Mastercard format (by index): Transaksjonsdato, Bokføringsdato, Tekst, Sted, Valuta, ?, Beløp, (empty)
    /// </summary>
    private Transaction? ParseSasMastercardRowByIndex(IReaderRow row, Guid userId, List<Category> categories)
    {
        try
        {
            var dateStr = row.GetField<string?>(0)?.Trim();
            var description = row.GetField<string?>(2)?.Trim();
            var currency = row.GetField<string?>(4)?.Trim();
            var amountStr = row.GetField<string?>(6)?.Trim();

            // Validate inputs early
            if (string.IsNullOrWhiteSpace(dateStr) || string.IsNullOrWhiteSpace(amountStr))
                return null;

            // Skip empty or summary rows
            if (description?.Contains("Total", StringComparison.OrdinalIgnoreCase) == true)
                return null;

            // Parse date first
            if (!DateTime.TryParseExact(dateStr, "dd.MM.yyyy", CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out DateTime date))
                return null;

            // Parse amount
            if (!TryParseAmount(amountStr, out decimal amount))
                return null;

            // Skip negative amounts (income/deposits). SAS uses opposite sign: positive = purchase/expense
            if (amount < 0)
                return null;

            // Skip if transaction exists (duplicate check on parsed date, not string)
            var existingTransactions = _db.Transactions.Where(t => t.UserId == userId).ToList();
            var isDuplicate = existingTransactions.Any(t =>
                t.UserId == userId &&
                t.TransactionDate == date &&
                t.Description == description &&
                t.Amount == amount);
            if (isDuplicate) return null;


            var matchingCategory = FindSasMastercardCategory(new Transaction
            {
                Description = description ?? string.Empty
            }, categories) ?? categories.FirstOrDefault(c => c.Name == "Other");

            return new Transaction
            {
                TransactionDate = date,
                Description = description ?? string.Empty,
                Amount = amount,
                CurrencyCode = currency ?? "NOK",
                Source = "SAS Mastercard",
                UserId = userId,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow,
                CategoryId = matchingCategory?.Id
            };
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error parsing SAS Mastercard row: {ex.Message}");
            return null;
        }
    }

    private static bool TryParseAmount(string? amountStr, out decimal amount)
    {
        amount = 0m;
        if (string.IsNullOrWhiteSpace(amountStr))
            return false;

        // Remove spaces (including non-breaking spaces) used as thousands separators.
        var normalized = amountStr
            .Replace(" ", string.Empty)
            .Replace("\u00A0", string.Empty)
            .Replace(",", ".");

        return decimal.TryParse(normalized, NumberStyles.Number | NumberStyles.AllowLeadingSign, CultureInfo.InvariantCulture, out amount);
    }



    /// <summary>
    /// Save transactions, skipping duplicates (Date + Amount + Description).
    /// </summary>
    public async Task<int> SaveTransactionsAsync(List<Transaction> transactions)
    {
        int saved = 0;

        foreach (var transaction in transactions)
        {
            // Check for duplicate: same date, amount, and description for same user
            var isDuplicate = _db.Transactions.Any(t =>
                t.UserId == transaction.UserId &&
                t.TransactionDate == transaction.TransactionDate &&
                t.Amount == transaction.Amount &&
                t.Description == transaction.Description);

            if (!isDuplicate)
            {
                _db.Transactions.Add(transaction);
                saved++;
            }
        }

        if (saved > 0)
            await _db.SaveChangesAsync();

        return saved;
    }


    private Category? FindSasMastercardCategory(Transaction transaction, List<Category> categories)
    {
        var categoryRules = new List<(string Keyword, string CategoryName)>
        {
            // Food - Grocery stores
            ("REMA", "Food"),
            ("KIWI", "Food"),
            ("COOP", "Food"),
            ("BUNNPRIS", "Food"),
            ("MENY", "Food"),
            ("EXTRA", "Food"),
            ("JOKER", "Food"),
            ("NARVESEN", "Food"),
            
            // Restaurant/Dining
            ("MCDONALD", "Restaurant"),
            ("MCDSOLSIDEN", "Restaurant"),
            ("BURGER KING", "Restaurant"),
            ("UBER EATS", "Restaurant"),
            ("WOLT", "Restaurant"),
            ("FOODORA", "Restaurant"),
            ("YAKI", "Restaurant"),
            ("FUNKY FROZEN", "Restaurant"),
            ("BRASILIA", "Restaurant"),
            ("STARBUCKS", "Restaurant"),
            ("MORMORS STUE", "Restaurant"),
            ("CAFE GRAFEN", "Restaurant"),
            ("SNURRCAFE", "Restaurant"),
            ("BIG BITE", "Restaurant"),
            ("DROMEDAR", "Restaurant"),
            ("TRONDHEIM CATERING", "Restaurant"),
            ("HERR NILSEN", "Restaurant"),
            ("DENNIS GRILL", "Restaurant"),
            ("PARADIS GELATERIA", "Restaurant"),
            ("ESPRESSO HOUSE", "Restaurant"),
            ("EGON", "Restaurant"),
            ("BACKST", "Restaurant"),
            ("LE PALAIS", "Restaurant"),
            ("TRYGSTAD BAKERI", "Restaurant"),
            ("OASEN", "Restaurant"),
            ("ZETTLE_*TRONDER CUT", "Restaurant"),
            ("ZETTLE_*BEYOND", "Restaurant"),
            ("ZETTLE_*WORK-WORK", "Restaurant"),
            
            // Bar/Nightlife
            ("BAR", "Bar"),
            ("HEIDIS BIER", "Bar"),
            ("BAR CIRCUS", "Bar"),
            ("LILLE LONDON", "Bar"),
            ("THREE LIONS", "Bar"),
            ("VINMONOPOLET", "Bar"),
            ("PROUD MARY", "Bar"),
            ("RAADHUSET", "Bar"),
            ("STD26", "Bar"),
            ("OIP NORWAY", "Bar"),
            
            // Transportation
            ("ATB", "Transportation"),
            ("RUTER", "Transportation"),
            ("VY", "Transportation"),
            ("NSB", "Transportation"),
            ("TESLA", "Transportation"),
            ("UBER", "Transportation"),
            ("DOTT SCOOTER", "Transportation"),
            ("ESSO", "Transportation"),
            ("SHELL", "Transportation"),
            ("CIRCLEK", "Transportation"),
            ("APCOA", "Transportation"),
            ("CHARGENODE", "Transportation"),
            ("STAR WASH", "Transportation"),
            ("TRØNDER TAXI", "Transportation"),
            ("NAF", "Transportation"),
            ("TOG SJ", "Transportation"),
            ("FLYBUSS", "Transportation"),
            
            // Entertainment
            ("TRONDHEIM KINO", "Entertainment"),
            ("STEAM", "Entertainment"),
            ("PLAYSTATION", "Entertainment"),
            ("PSYCH", "Entertainment"),
            
            // Clothing/Shopping
            ("BOOZT", "Clothing"),
            ("H&M", "Clothing"),
            ("ZARA", "Clothing"),
            ("LINDEX", "Clothing"),
            ("WEEKDAY", "Clothing"),
            ("NORMAL", "Clothing"),
            ("THANSEN", "Clothing"),
            ("KREMMERHUSET", "Clothing"),
            
            // Travel
            ("HOTELCOM", "Travel"),
            ("QUALITY HOTEL", "Travel"),
            ("SAS", "Travel"),
            ("BILLETTSERVICE", "Travel"),
            ("BOOKING.COM", "Travel"),
            ("AIRBNB", "Travel"),
            ("EXPEDIA", "Travel"),
            ("TRONDHEIM CAMPING", "Travel"),
            ("HOTEL", "Travel"),
            
            // Subscription
            ("SPOTIFY", "Subscription"),
            ("NETFLIX", "Subscription"),
            ("APPLE.COM", "Subscription"),
            ("APPLE", "Subscription"),
            ("SPOND", "Subscription"),
            ("VIAPLAY", "Subscription"),
            ("HBO", "Subscription"),
            ("DISNEY", "Subscription"),
            ("LYDBØKER", "Subscription"),
            
            // Insurance
            ("TEKNA", "Insurance"),
            ("NORGE FF", "Insurance"),
            ("GJENSIDIGE", "Insurance"),
            ("TRY", "Insurance"),
            ("IF SKADE", "Insurance"),
            
            // Vipps
            ("VIPPS", "Vipps"),
            
            // Shopping/Other
            ("IKEA", "Other"),
            ("OBS", "Other"),
            ("XXL", "Other"),
            ("BILTEMA", "Other"),
            ("CL. OHLSON", "Other"),
            ("HABITAT", "Other"),
            ("ZALANDO", "Other"),
            ("AMAZON", "Other"),
            ("ELLKJØP", "Other"),
            ("ELECTRONIA", "Other"),
            ("ARENA", "Other"),
            ("NYX", "Other"),
            ("MECIND", "Other"),
            ("POSE & SEKK", "Other"),
            ("GAUSTA", "Other"),
            ("ROROS", "Other"),
            ("168 BOOTS", "Other"),
            ("APOTEK", "Other"),
        };

        foreach (var rule in categoryRules)
        {
            if (transaction.Description.Contains(rule.Keyword, StringComparison.OrdinalIgnoreCase))
            {
                return categories.Find(c => c.Name == rule.CategoryName) ?? categories.FirstOrDefault(c => c.Name == "Other");
            }
        }
        return null;
    }

    private Category? FindHandelsbankenCategory(Transaction transaction, List<Category> categories)
    {
        var categoryMapper = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            { "REMA", "Food" },
            { "KIWI", "Food" },
            { "COOP", "Food" },
            { "BUNNPRIS", "Food" },
            { "MENY", "Food" },
            { "EXTRA", "Food" },
            { "JOKER", "Food" },
            { "NARVESEN", "Food" },

            { "MCDONALD", "Restaurant" },
            { "MCDSOLSIDEN", "Restaurant" },
            { "BURGER KING", "Restaurant" },
            { "UBER EATS", "Restaurant" },
            { "WOLT", "Restaurant" },
            { "FOODORA", "Restaurant" },
            { "YAKI", "Restaurant" },
            { "FUNKY FROZEN", "Restaurant" },
            { "BRASILIA", "Restaurant" },
            { "STARBUCKS", "Restaurant" },
            { "MORMORS STUE", "Restaurant" },
            { "CAFE GRAFEN", "Restaurant" },
            { "SNURRCAFE", "Restaurant" },
            { "BIG BITE", "Restaurant" },
            { "DROMEDAR", "Restaurant" },
            { "TRONDHEIM CATERING", "Restaurant" },
            { "TRONDHEIM KINO", "Restaurant" },
            { "HERR NILSEN", "Restaurant" },
            { "DENNIS GRILL", "Restaurant" },
            { "PARADIS GELATERIA", "Restaurant" },
            { "ESPRESSO HOUSE", "Restaurant" },
            { "EGON", "Restaurant" },
            { "BACKST", "Restaurant" },
            { "LE PALAIS", "Restaurant" },
            { "TRYGSTAD BAKERI", "Restaurant" },
            { "OASEN", "Restaurant" }
        };

        foreach (var kvp in categoryMapper)
        {
            if (transaction.Description.Contains(kvp.Key, StringComparison.OrdinalIgnoreCase))
                return categories.Find(c => c.Name == kvp.Value) ?? categories.FirstOrDefault(c => c.Name == "Other");
        }
        return null;
    }
}
