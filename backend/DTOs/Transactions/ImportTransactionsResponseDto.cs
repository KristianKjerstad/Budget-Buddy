namespace backend.DTOs.Transactions;

public class ImportTransactionsResponseDto
{
    public string Message { get; set; } = string.Empty;
    public int Parsed { get; set; }
    public int Imported { get; set; }
    public int SkippedDuplicates { get; set; }
}