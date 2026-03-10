using backend.Hubs;
using backend.Models;
using backend.Repositories;
using Microsoft.AspNetCore.SignalR;

namespace backend.Services;

// Handles post creation.
// After saving to the database, it broadcasts the new post to all
// connected SignalR clients so their maps update in real time.
public class PostService
{
    private readonly PostRepository _posts;
    private readonly IHubContext<PostHub> _hub;

    // IHubContext<PostHub> is injected by the DI container.
    // It gives us access to the hub without needing an active connection ourselves.
    public PostService(PostRepository posts, IHubContext<PostHub> hub)
    {
        _posts = posts;
        _hub = hub;
    }

    public async Task CreateAsync(Guid userId, string content, double lat, double lng)
    {
        var post = new Post
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Content = content,
            Latitude = lat,
            Longitude = lng,
            CreatedAt = DateTime.UtcNow
        };

        // Save to database first.
        await _posts.CreateAsync(post);

        // Then push to all connected browser clients.
        // "NewPost" is the event name the frontend listens for.
        // The post object is serialized to JSON automatically.
        await _hub.Clients.All.SendAsync("NewPost", post);
    }
}
