using System.Numerics;

namespace GameBackend.Models
{
    public class Player
    {
        public const int RADIUS = 60;
        public const int WIDTH = 48;
        public const int HEIGHT = 68;
        public int X { get; set; }
        public int Y { get; set; }
        public string Direction { get; set; }
        public bool DidMove { get; set; }
        public bool IsChaser { get; set; }
        public Vector2 CenterPosition => new(X + WIDTH / 2, Y + HEIGHT / 2);
    }
}
