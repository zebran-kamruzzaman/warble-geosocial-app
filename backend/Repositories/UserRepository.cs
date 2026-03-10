using Dapper;
using backend.Database;
using backend.Models;

namespace backend.Repositories;

// All SQL that touches the users table lives here.
// Dapper maps each column name to the matching property on User.
public class UserRepository
{
    private readonly DbConnectionFactory _factory;

    public UserRepository(DbConnectionFactory factory)
    {
        _factory = factory;
    }

    // Used during login to look up an account by email.
    // Returns null if no match is found.
    public async Task<User?> GetByEmailAsync(string email)
    {
        using var conn = _factory.Create();
        return await conn.QuerySingleOrDefaultAsync<User>(
            "SELECT * FROM users WHERE email = @Email",
            new { Email = email }
        );
    }

    // Inserts a fully-constructed User object into the database.
    // The service layer is responsible for building the object before calling this.
    public async Task CreateAsync(User user)
    {
        using var conn = _factory.Create();
        await conn.ExecuteAsync(
            @"INSERT INTO users (id, username, email, password_hash, created_at)
              VALUES (@Id, @Username, @Email, @PasswordHash, @CreatedAt)",
            user
        );
    }
}
