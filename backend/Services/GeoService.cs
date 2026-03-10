using backend.Models;
using backend.Repositories;

namespace backend.Services;

// Handles spatial / location-based queries.
// Kept separate from PostService so geo logic can grow independently
// (e.g. clustering, tile aggregation) without touching post creation logic.
public class GeoService
{
    private readonly PostRepository _posts;

    public GeoService(PostRepository posts)
    {
        _posts = posts;
    }

    // Default radius is 500 metres if not specified by the caller.
    public async Task<IEnumerable<Post>> GetNearbyPostsAsync(double lat, double lng, double radiusMeters = 500)
    {
        return await _posts.GetNearbyAsync(lat, lng, radiusMeters);
    }
}
