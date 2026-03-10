using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Models;
using backend.Repositories;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services;

// Handles user registration and login.
// This is the only layer that knows about passwords and JWT tokens.
// The controller calls this and receives simple results — no SQL, no crypto details leak up.
public class UserService
{
    private readonly UserRepository _users;
    private readonly string _jwtSecret;

    public UserService(UserRepository users, IConfiguration config)
    {
        _users = users;
        _jwtSecret = config["Jwt:Secret"]!;
    }

    // Returns false if the email is already taken.
    // Hashes the password with BCrypt before storing — never store plain text.
    public async Task<bool> RegisterAsync(string username, string email, string password)
    {
        var existing = await _users.GetByEmailAsync(email);
        if (existing != null) return false;

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = username,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            CreatedAt = DateTime.UtcNow
        };

        await _users.CreateAsync(user);
        return true;
    }

    // Returns a signed JWT if credentials are valid, null otherwise.
    // BCrypt.Verify compares the plain password against the stored hash.
    public async Task<string?> LoginAsync(string email, string password)
    {
        var user = await _users.GetByEmailAsync(email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            return null;

        return GenerateToken(user);
    }

    // Builds a signed JWT containing the user's id and username as claims.
    // The token expires after 7 days. The secret key is read from appsettings.json.
    private string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username)
            },
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
