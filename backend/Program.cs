using backend.Endpoints;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "Hello World!");
app.MapTransactionEndpoints();

app.Run();
