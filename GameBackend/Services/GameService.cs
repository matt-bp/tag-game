using GameBackend.Hubs;
using GameBackend.Models;
using Microsoft.AspNetCore.SignalR;
using System.Diagnostics;

namespace GameBackend.Services
{
    public class GameService : IHostedService
    {
        private readonly IHubContext<ChatHub> _hub;
        private readonly ILogger<GameService> _logger;
        private readonly BackgroundJobs _backgroundCollisionJobs;
        private Dictionary<string, Player> _players = new();
        private List<string> _disconnectedPlayers = new();

        private bool _shutDown = false;

        public GameService(ILogger<GameService> logger, IHubContext<ChatHub> hub, BackgroundJobs backgroundCollisionJobs)
        {
            _logger = logger;
            _hub = hub;
            _backgroundCollisionJobs = backgroundCollisionJobs;
        }

        #region Hosted Service Methods

        public Task StartAsync(CancellationToken cancellationToken)
        {
            Task.Run(GameLoop, cancellationToken);

            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _shutDown = true;

            return Task.CompletedTask;
        }

        #endregion

        /// <summary>
        /// Server side game loop update function.
        /// </summary>
        public async void GameLoop()
        {
            while (!_shutDown)
            {
                HandleInput();

                UpdateGameState();

                await SendGameStateToClients();

                Task.Delay(33).Wait(); // 30 fps
            }
        }

        #region Input from clients

        private void HandleInput()
        {
            while (_backgroundCollisionJobs.NewPlayers.TryDequeue(out var job))
            {
                AddNewPlayer(job);
            }

            while (_backgroundCollisionJobs.Positions.TryDequeue(out var job))
            {
                UpdatePlayerMovement(job);
            }

            while (_backgroundCollisionJobs.PlayersThatStoppedMoving.TryDequeue(out var job))
            {
                _players[job.ConnectionId].DidMove = false;
            }

            while (_backgroundCollisionJobs.DisconnectedUsers.TryDequeue(out var job))
            {
                _disconnectedPlayers.Add(job.ConnectionId);
                _players.Remove(job.ConnectionId);
            }
        }

        private void UpdatePlayerMovement(PositionJob job)
        {
            Debug.Assert(_players.ContainsKey(job.ConnectionId));

            if (_players.TryGetValue(job.ConnectionId, out var player))
            {
                player.X = job.X;
                player.Y = job.Y;
                player.Direction = job.Direction;
                player.DidMove = true;
            }
        }

        private void AddNewPlayer(IdJob job)
        {
            Debug.Assert(!_players.ContainsKey(job.ConnectionId));

            _players.Add(job.ConnectionId, new Player
            {
                X = 911,
                Y = 988,
                Direction = "down",
                DidMove = false,
                IsNew = true,
            });
        }

        #endregion

        private void UpdateGameState()
        {
            // No-op
        }

        #region Output to clients

        private async Task SendGameStateToClients()
        {
            foreach (var id in _disconnectedPlayers)
                await BroadcastDisconnectedPlayer(id);

            _disconnectedPlayers = new();

            foreach (var (id, player) in _players)
            {
                if (player.IsNew)
                {
                    player.IsNew = false;
                    await SendPlayerTheirId(id);
                }
            }

            foreach (var (id, player) in _players)
                await BroadcastPlayerInformation(id, player);
        }

        private async Task SendPlayerTheirId(string id) => await _hub.Clients.Client(id).SendAsync("recieveConnectionId", id);

        private async Task BroadcastPlayerInformation(string id, Player player) => await _hub.Clients.All.SendAsync("updatedPlayer", id, player.X, player.Y, player.Direction, player.DidMove);

        private async Task BroadcastDisconnectedPlayer(string id) => await _hub.Clients.All.SendAsync("playerDisconnected", id);

        #endregion
    }
}
