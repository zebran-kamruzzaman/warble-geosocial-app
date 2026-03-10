using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

// Handles location-based queries.
// No [Authorize] here — reading nearby posts is public.
// Kept separate from PostsController so geo concerns stay isolated.
[ApiController]
[Route("api/posts")]
public class GeoController : ControllerBase
{
    private readonly GeoService _geoService;

    public GeoController(GeoService geoService)
    {
        _geoService = geoService;
    }

    // GET /api/posts/nearby?lat=45.501&lng=-73.567&radius=500
    //
    // lat, lng   — the centre point of the search (user's current location)
    // radius     — search radius in metres (defaults to 500 if not provided)
    //
    // [FromQuery] tells ASP.NET Core to read these from the query string, not the body.
    [HttpGet("nearby")]
    public async Task<IActionResult> GetNearby(
        [FromQuery] double lat,
        [FromQuery] double lng,
        [FromQuery] double radius = 500)
    {
        var posts = await _geoService.GetNearbyPostsAsync(lat, lng, radius);
        return Ok(posts);
    }
}
