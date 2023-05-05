using GameBackend.Hubs;
using GameBackend.Models;
using Microsoft.AspNetCore.SignalR;
using System.Diagnostics;
using System.Numerics;

namespace GameBackend.Services
{
    public class GameService : IHostedService
    {
        private readonly IHubContext<GameHub> _hub;
        private readonly ILogger<GameService> _logger;
        private readonly BackgroundJobs _backgroundCollisionJobs;
        private Dictionary<string, Player> _players = new();
        private List<string> _disconnectedPlayers = new();
        private double _elapsedTime = 0;
        private double _timeAtLastTag = 0;
        private (string Message, double timeToShow) _serverMessage = (string.Empty, 0);

        private bool _shutDown = false;

        public GameService(ILogger<GameService> logger, IHubContext<GameHub> hub, BackgroundJobs backgroundCollisionJobs)
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
            var startTime = DateTime.Now;

            while (!_shutDown)
            {
                DateTime endTime = DateTime.Now;
                var dt = (endTime - startTime).TotalMilliseconds;
                startTime = endTime;
                _elapsedTime += dt;

                HandleInput();

                UpdateGameState(dt);

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

            while (_backgroundCollisionJobs.Usernames.TryDequeue(out var job))
            {
                _players[job.ConnectionId].Username = job.Username;
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
            });
        }

        #endregion

        #region Update Game State

        private void UpdateGameState(double dt)
        {
            SetPlayerAsIt();

            CheckForPlayerCollisions();

            UpdateServerMessage(dt);
        }

        private void SetPlayerAsIt()
        {
            if (_players.Any(p => p.Value.IsChaser))
                return;

            if (_players.Count == 0)
                return;

            var randomPlayer = _players.ElementAt(new Random().Next(0, _players.Count));
            randomPlayer.Value.IsChaser = true;

            // TODO: Set new chaser message
            _serverMessage = ("New chaser: " + randomPlayer.Value.Username, 5000);
        }

        private void CheckForPlayerCollisions()
        {
            if (_elapsedTime - _timeAtLastTag < 10000) // It hasn't been long enough since the last tag
                return;

            if (!_players.Any(p => p.Value.IsChaser)) // No one has joined yet, or is playing.
                return;

            var chaser = _players.First(p => p.Value.IsChaser);

            foreach (var (id, player) in _players)
            {
                if (id == chaser.Key) // Don't tag ourselves
                    continue;

                var chaserCenterPos = chaser.Value.CenterPosition;
                var otherCenterPos = player.CenterPosition;

                if (Vector2.Distance(chaserCenterPos, otherCenterPos) >= Player.RADIUS)
                    continue;
                
                _timeAtLastTag = _elapsedTime;

                player.IsChaser = true;
                chaser.Value.IsChaser = false;

                _serverMessage = ("New chaser: " + player.Username, 5000);

                return; // Only check for new chaser once per frame
            }
        }

        private void UpdateServerMessage(double dt)
        {
            if (string.IsNullOrEmpty(_serverMessage.Message)) return;

            _serverMessage.timeToShow -= dt;

            if (_serverMessage.timeToShow > 0)
            {
                return;
            }

            _serverMessage = (string.Empty, 0);
        }

        #endregion

        #region Output to clients

        private async Task SendGameStateToClients()
        {
            foreach (var id in _disconnectedPlayers)
                await BroadcastDisconnectedPlayer(id);

            _disconnectedPlayers = new();

            // TODO: Can I just send an array over the wire instead of sending each player individually?
            foreach (var (id, player) in _players)
                await BroadcastPlayerInformation(id, player);

            await BroadcastServerMessage(_serverMessage.Message);
        }

        private async Task BroadcastPlayerInformation(string id, Player player) => await _hub.Clients.All.SendAsync("PlayerMoved", id, player.Username, player.X, player.Y, player.Direction, player.DidMove, player.IsChaser);

        private async Task BroadcastDisconnectedPlayer(string id) => await _hub.Clients.All.SendAsync("PlayerLeft", id);

        private async Task BroadcastServerMessage(string message) => await _hub.Clients.All.SendAsync("ServerMessage", message);

        #endregion
    }
}
