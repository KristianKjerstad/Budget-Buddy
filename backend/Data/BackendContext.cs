using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data;

public class BackendContext(DbContextOptions<BackendContext> options) : DbContext(options)
{
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Category> Categories => Set<Category>();
}