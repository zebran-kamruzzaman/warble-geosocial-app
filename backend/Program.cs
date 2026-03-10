using System.Text;
using backend.Database;
using backend.Hubs;
using backend.Repositories;
using backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Dapper;

DefaultTypeMap.MatchNamesWithUnderscores = true;

var builder = WebApplication.CreateBuilder(args);

// ── Controllers ────────────────────────────────────────────────────────────────
builder.Services.AddControllers();

// ── CORS ───────────────────────────────────────────────────────────────────────
// Browsers block cross-origin requests by default.
// This policy explicitly allows the frontend (on Vercel) to call the API (on Railway).
// AllowCredentials() is required for SignalR WebSocket connections.
// WithOrigins must be a specific URL — wildcards don't work with AllowCredentials.
var frontendOrigin = 
    Environment.GetEnvironmentVariable("FRONTEND_ORIGIN") ??
    builder.Configuration["Frontend:Origin"] ?? 
    "http://localhost:5173";
    
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(frontendOrigin)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// ── SignalR ────────────────────────────────────────────────────────────────────
// SignalR is built into ASP.NET Core — no extra NuGet package needed.
// It handles WebSocket connections, falls back to long-polling if needed.
builder.Services.AddSignalR();

// ── Database ───────────────────────────────────────────────────────────────────
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")!;
builder.Services.AddSingleton(new DbConnectionFactory(connectionString));

// ── Repositories ───────────────────────────────────────────────────────────────
builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<PostRepository>();

// ── Services ───────────────────────────────────────────────────────────────────
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<PostService>();
builder.Services.AddScoped<GeoService>();

// ── JWT Authentication ─────────────────────────────────────────────────────────
var jwtSecret = builder.Configuration["Jwt:Secret"]!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = false,
            ValidateAudience = false
        };

        // SignalR sends the token via query string, not headers.
        // This tells the JWT middleware where to find it for hub connections.
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                    context.Token = accessToken;
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// ── Build & Middleware ─────────────────────────────────────────────────────────
var app = builder.Build();

// Order is important.
// CORS must come before authentication and routing.
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Map the SignalR hub to a URL path.
// The frontend connects to: wss://your-api.railway.app/hubs/posts
app.MapHub<PostHub>("/hubs/posts");

app.Run();
