using GameBackend.Hubs;
using Microsoft.AspNetCore.SignalR;
using System.Timers;

namespace GameBackend.Services
{
    public class CollisionService : IHostedService, IAsyncDisposable
    {
        private readonly IHubContext<ChatHub> _hub;
        private System.Timers.Timer? _timer;
        private readonly ILogger<CollisionService> _logger;

        private bool _shutDown = false;

        public CollisionService(ILogger<CollisionService> logger, IHubContext<ChatHub> hub) {
            _logger = logger;
            _hub = hub;
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

        public void CheckForCollisions()
        {
            while(!_shutDown)
            {
                _logger.LogInformation("Checking for collisions");
                _hub.Clients.All.SendAsync("collisionCheck");
                Task.Delay(1000).Wait();
            }
        }

        public async ValueTask DisposeAsync()
        {
            if (_timer is IAsyncDisposable timer)
            {
                await timer.DisposeAsync();
            }

            _timer = null;
        }
    }
}
