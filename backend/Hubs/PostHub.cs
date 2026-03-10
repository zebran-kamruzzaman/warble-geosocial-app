using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs;

// SignalR hub that the frontend connects to via WebSocket.
// Clients don't call methods on this hub — the server pushes to them.
// When PostService creates a new post, it uses IHubContext<PostHub>
// to broadcast to every connected client simultaneously.
//
// The frontend connects to: /hubs/posts
public class PostHub : Hub
{
    // Called automatically by SignalR when a client connects.
    // Useful for logging or sending an initial payload — left minimal here.
    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
    }
}
