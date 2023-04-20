using GameBackend.Models;
using GameBackend.Services;
using Microsoft.AspNetCore.SignalR;
using System.Timers;

namespace GameBackend.Hubs;

public class GameHub : Hub
{
    private readonly ILogger<GameHub> _logger;
    private readonly BackgroundJobs _backgroundJobs;

    public GameHub(ILogger<GameHub> logger, BackgroundJobs backgroundCollisionJobs)
    {
        _logger = logger;
        _backgroundJobs = backgroundCollisionJobs;
    }

    public async Task NewMessage(string message) => await Clients.All.SendAsync("IncomingMessage", Context.ConnectionId, message);

    public void Move(int x, int y, string direction) => _backgroundJobs.Positions.Enqueue(new PositionJob
    {
        ConnectionId = Context.ConnectionId,
        X = x,
        Y = y,
        Direction = direction
    });

    public void Stop() => _backgroundJobs.PlayersThatStoppedMoving.Enqueue(new IdJob { ConnectionId = Context.ConnectionId });

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
