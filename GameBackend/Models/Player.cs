namespace GameBackend.Models
{
    public class Player
    {
        public int X { get; set; }
        public int Y { get; set; }
        public string Direction { get; set; }
        public bool DidMove { get; set; }
        public bool IsNew { get; set; }
    }
}
