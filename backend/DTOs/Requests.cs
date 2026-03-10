namespace backend.DTOs;

// Shape of the JSON body for POST /api/users/register
public class RegisterUserRequest
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

// Shape of the JSON body for POST /api/users/login
public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

// Shape of the JSON body for POST /api/posts
public class CreatePostRequest
{
    public string Content { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
}
