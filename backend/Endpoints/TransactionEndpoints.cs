
namespace backend.Endpoints;

public static class TransactionEndpoints
{

    public static void MapTransactionEndpoints(this WebApplication app)
    {

        var group = app.MapGroup("/transactions").WithTags("Transactions");
        group.MapGet("/", () =>
        {
            var mockTransactions = new List<object>
            {
                new { Id = 1, Amount = 100.0, Description = "Groceries" },
                new { Id = 2, Amount = 50.0, Description = "Utilities" },
                new { Id = 3, Amount = 200.0, Description = "Rent" },
                new { Id = 4, Amount = 75.0, Description = "Entertainment" }
            };
            return Results.Ok(mockTransactions);
        });
    }
    
}
