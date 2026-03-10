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

builder.Services.AddControllers();

// ── CORS ───────────────────────────────────────────────────────────────────────
// Read from flat env var first (Railway), fall back to config (local)
var frontendOrigin = 
    Environment.GetEnvironmentVariable("FRONTEND_ORIGIN") ??
    builder.Configuration["Frontend:Origin"] ?? 
    "http://localhost:5173";

Console.WriteLine($">>> CORS origin set to: {frontendOrigin}");

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// ── SignalR ────────────────────────────────────────────────────────────────────
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

// ── JWT ────────────────────────────────────────────────────────────────────────
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

var app = builder.Build();

// Order matters — CORS must be first
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<PostHub>("/hubs/posts");

app.Run();