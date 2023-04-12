using Microsoft.AspNetCore.SignalR;
using System.Timers;

namespace GameBackend.Hubs;

public class ChatHub : Hub
{
    private readonly ILogger<ChatHub> _logger;

    public ChatHub(ILogger<ChatHub> logger)
    {
        _logger = logger;
    }

    public async Task NewMessage(long username, string message) => await Clients.All.SendAsync("messageReceived", username, message);

    public async Task UpdatedPosition(long username, int x, int y, string direction, bool didMove) => await Clients.All.SendAsync("updatedPosition", username, x, y, direction, didMove);

    public async Task PlayerStoppedMoving(long username) => await Clients.All.SendAsync("playerStoppedMoving", username);

    public override Task OnConnectedAsync()
    {
        _logger.LogInformation("Client connected: {Id}", Context.ConnectionId);
        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Client disconnected: {Id}", Context.ConnectionId);
        return base.OnDisconnectedAsync(exception);
    }

    public void CheckForCollisions()
    {
        _logger.LogInformation("Checking for collisions");
        Clients.All.SendAsync("collisionCheck");
    }
}
