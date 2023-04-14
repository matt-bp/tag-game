using System.Collections.Concurrent;

namespace GameBackend.Services
{
    public class PositionJob
    {
        public string ConnectionId { get; set; }
        public int X { get; set; }
        public int Y { get; set; }
        public string Direction { get; set; }
    }

    public class IdJob
    {
        public string ConnectionId { get; set; }
    }

    public class BackgroundJobs
    {
        public ConcurrentQueue<PositionJob> Positions { get; set; } = new();
        public ConcurrentQueue<IdJob> DisconnectedUsers { get; set; } = new();
        public ConcurrentQueue<IdJob> NewPlayers { get; set; } = new();
        public ConcurrentQueue<IdJob> PlayersThatStoppedMoving { get; set; } = new();
    }
}
