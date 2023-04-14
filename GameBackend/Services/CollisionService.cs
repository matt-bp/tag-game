using GameBackend.Hubs;
using Microsoft.AspNetCore.SignalR;
using System.Timers;

namespace GameBackend.Services
{
    public class CollisionService : IHostedService
    {
        private readonly IHubContext<ChatHub> _hub;
        private readonly ILogger<CollisionService> _logger;
        private readonly BackgroundCollisionJobs _backgroundCollisionJobs;

        private bool _shutDown = false;

        public CollisionService(ILogger<CollisionService> logger, IHubContext<ChatHub> hub, BackgroundCollisionJobs backgroundCollisionJobs)
        {
            _logger = logger;
            _hub = hub;
            _backgroundCollisionJobs = backgroundCollisionJobs;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            Task.Run(CheckForCollisions, cancellationToken);

            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _shutDown = true;

            return Task.CompletedTask;
        }

        public async void CheckForCollisions()
        {
            while (!_shutDown)
            {
                var messagesToSend = new Dictionary<string, CollisionJob>();

                _logger.LogInformation("Checking for collisions");
                //_hub.Clients.All.SendAsync("collisionCheck");

                while(_backgroundCollisionJobs.CollisionJobs.TryDequeue(out var job))
                {
                    messagesToSend[job.ConnectionId] = job;
                }

                foreach (var message in messagesToSend.Values)
                {
                    await _hub.Clients.All.SendAsync("updatedPosition", message.ConnectionId, message.X, message.Y, message.Direction, message.DidMove);
                }

                Task.Delay(33).Wait();
            }
        }
    }
}
