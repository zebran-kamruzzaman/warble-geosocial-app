using Dapper;
using backend.Database;
using backend.Models;

namespace backend.Repositories;

// All SQL that touches the posts table lives here.
// The two key operations are: create a post, fetch nearby posts.
public class PostRepository
{
    private readonly DbConnectionFactory _factory;

    public PostRepository(DbConnectionFactory factory)
    {
        _factory = factory;
    }

    // Inserts a post and simultaneously builds its geography point.
    //
    // ST_MakePoint(longitude, latitude) creates a geometric point.
    //   Note: PostGIS takes (X, Y) which maps to (lng, lat) — not the other way around.
    // ST_SetSRID(..., 4326) assigns the WGS 84 coordinate system (standard GPS).
    // ::geography casts it to a geography type so distance queries use metres.
    public async Task CreateAsync(Post post)
    {
        using var conn = _factory.Create();
        await conn.ExecuteAsync(
            @"INSERT INTO posts (id, user_id, content, latitude, longitude, location, created_at)
              VALUES (
                @Id, @UserId, @Content, @Latitude, @Longitude,
                ST_SetSRID(ST_MakePoint(@Longitude, @Latitude), 4326)::geography,
                @CreatedAt
              )",
            post
        );
    }

    // Fetches all posts within `radiusMeters` of the given coordinates.
    //
    // ST_DWithin(location, point, radius) uses the spatial index automatically.
    // The spatial index (GIST) means the database does NOT scan every row —
    // it narrows the search using a geographic tree structure first.
    public async Task<IEnumerable<Post>> GetNearbyAsync(double lat, double lng, double radiusMeters)
    {
        using var conn = _factory.Create();
        return await conn.QueryAsync<Post>(
            @"SELECT id, user_id, content, latitude, longitude, created_at
              FROM posts
              WHERE ST_DWithin(
                  location,
                  ST_SetSRID(ST_MakePoint(@Lng, @Lat), 4326)::geography,
                  @Radius
              )
              ORDER BY created_at DESC",
            new { Lat = lat, Lng = lng, Radius = radiusMeters }
        );
    }
}
