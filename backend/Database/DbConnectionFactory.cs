using Npgsql;
using System.Data;

namespace backend.Database;

// Single responsibility: create and return a database connection.
// Registered as a singleton so the connection string is read once from config.
// Controllers and repositories never touch the connection string directly.
public class DbConnectionFactory
{
    private readonly string _connectionString;

    public DbConnectionFactory(string connectionString)
    {
        _connectionString = connectionString;
    }

    public IDbConnection Create() => new NpgsqlConnection(_connectionString);
}
