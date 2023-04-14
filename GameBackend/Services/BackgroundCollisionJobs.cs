using System.Collections.Concurrent;

namespace GameBackend.Services
{
    public class CollisionJob
    {
        public string ConnectionId { get; set; }
        public int X { get; set; }
        public int Y { get; set; }
        public string Direction { get; set; }
        public bool DidMove { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class BackgroundCollisionJobs
    {
        public ConcurrentQueue<CollisionJob> CollisionJobs { get; set; } = new();
    }
}
