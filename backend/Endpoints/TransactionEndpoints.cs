
using backend.Models;

namespace backend.Endpoints;

public static class TransactionEndpoints
{

    public static void MapTransactionEndpoints(this WebApplication app)
    {

        var group = app.MapGroup("/transactions").WithTags("Transactions");
        group.MapGet("/", () =>
        {
            var mockTransactions = new List<Transaction>
            {
                new Transaction { Id = Guid.NewGuid(), Source = "Salary", TransactionDate = DateTime.UtcNow, Description = "Monthly salary", Amount = 5000, CurrencyCode = "NOK", UserId = Guid.NewGuid() },
                new Transaction { Id = Guid.NewGuid(), Source = "Groceries", TransactionDate = DateTime.UtcNow, Description = "Weekly groceries", Amount = -1500, CurrencyCode = "NOK", UserId = Guid.NewGuid() }
            };
            return Results.Ok(mockTransactions);
        });
    }
    
}
