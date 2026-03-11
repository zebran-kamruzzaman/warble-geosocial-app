using System.Security.Claims;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

// Handles creating posts.
// [Authorize] means every endpoint here requires a valid JWT in the Authorization header.
// If no token (or an invalid one) is provided, ASP.NET Core returns 401 automatically.
[ApiController]
[Route("api/posts")]
[Authorize]
public class PostsController : ControllerBase
{
    private readonly PostService _postService;

    public PostsController(PostService postService)
    {
        _postService = postService;
    }

    // POST /api/posts
    // Header: Authorization: Bearer <token>
    // Body: { content, latitude, longitude }
    //
    // User.FindFirstValue(ClaimTypes.NameIdentifier) reads the user's id
    // from the JWT claims that were set during login.
    [HttpPost]
    public async Task<IActionResult> Create(CreatePostRequest request)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userIdString == null)
            return Unauthorized();

        var userId = Guid.Parse(userIdString);

        await _postService.CreateAsync(userId, request.Content, request.Latitude, request.Longitude);

        return Ok(new { message = "Post created." });
    }

    // DELETE /api/posts/{id}
    // Requires authentication — the user can only delete their own posts.
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdString == null) return Unauthorized();

        var userId = Guid.Parse(userIdString);
        var deleted = await _postService.DeleteAsync(id, userId);

        if (!deleted)
            return NotFound(new { message = "Post not found or not yours." });

        return Ok(new { message = "Post deleted." });
    }
}
