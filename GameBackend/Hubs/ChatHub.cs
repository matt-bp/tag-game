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

    public async Task UpdatedPosition(int x, int y, string direction, bool didMove) => 
        await Clients.All.SendAsync("updatedPosition", Context.ConnectionId, x, y, direction, didMove);

    public async Task PlayerStoppedMoving() => 
        await Clients.All.SendAsync("playerStoppedMoving", Context.ConnectionId);

    public override Task OnConnectedAsync()
    {
        _logger.LogInformation("Client connected: {Id}", Context.ConnectionId);

        Clients.Client(Context.ConnectionId).SendAsync("recieveConnectionId", Context.ConnectionId);

        return base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Client disconnected: {Id}", Context.ConnectionId);

        await Clients.All.SendAsync("playerDisconnected", Context.ConnectionId);
    }

    public void CheckForCollisions()
    {
        _logger.LogInformation("Checking for collisions");
        Clients.All.SendAsync("collisionCheck");
    }
}
