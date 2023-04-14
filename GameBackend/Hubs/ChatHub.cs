using GameBackend.Models;
using GameBackend.Services;
using Microsoft.AspNetCore.SignalR;
using System.Timers;

namespace GameBackend.Hubs;

public class ChatHub : Hub
{
    private readonly ILogger<ChatHub> _logger;
    private readonly BackgroundJobs _backgroundJobs;

    public ChatHub(ILogger<ChatHub> logger, BackgroundJobs backgroundCollisionJobs)
    {
        _logger = logger;
        _backgroundJobs = backgroundCollisionJobs;
    }

    public async Task NewMessage(long username, string message) => await Clients.All.SendAsync("messageReceived", username, message);

    public void UpdatedPosition(int x, int y, string direction) => _backgroundJobs.Positions.Enqueue(new PositionJob
    {
        ConnectionId = Context.ConnectionId,
        X = x,
        Y = y,
        Direction = direction
    });

    public void PlayerStoppedMoving() => _backgroundJobs.PlayersThatStoppedMoving.Enqueue(new IdJob { ConnectionId = Context.ConnectionId });

    public override Task OnConnectedAsync()
    {
        _logger.LogInformation("Client connected: {Id}", Context.ConnectionId);

        _backgroundJobs.NewPlayers.Enqueue(new IdJob { ConnectionId = Context.ConnectionId });

        return Task.CompletedTask;
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Client disconnected: {Id}", Context.ConnectionId);

        _backgroundJobs.DisconnectedUsers.Enqueue(new IdJob { ConnectionId = Context.ConnectionId });

        return Task.CompletedTask;
    }
}
