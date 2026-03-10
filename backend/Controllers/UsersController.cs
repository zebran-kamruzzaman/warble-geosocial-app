using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

// Handles user registration and login.
// Controllers are thin: validate the request shape, call the service, return a response.
// No business logic, no SQL, no password handling lives here.
[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly UserService _userService;

    public UsersController(UserService userService)
    {
        _userService = userService;
    }

    // POST /api/users/register
    // Body: { username, email, password }
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterUserRequest request)
    {
        var success = await _userService.RegisterAsync(
            request.Username,
            request.Email,
            request.Password
        );

        if (!success)
            return Conflict(new { message = "Email is already registered." });

        return Ok(new { message = "User registered successfully." });
    }

    // POST /api/users/login
    // Body: { email, password }
    // Returns a JWT token on success.
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var token = await _userService.LoginAsync(request.Email, request.Password);

        if (token == null)
            return Unauthorized(new { message = "Invalid email or password." });

        return Ok(new { token });
    }
}
