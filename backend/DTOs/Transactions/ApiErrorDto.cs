namespace backend.DTOs.Transactions;

public class ApiErrorDto
{
    public string Error { get; set; } = string.Empty;
    public string? Details { get; set; }
}