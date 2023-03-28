using Microsoft.AspNetCore.SignalR;

namespace GameBackend.Hubs;

public class ChatHub : Hub
{
    public async Task NewMessage(long username, string message) => await Clients.All.SendAsync("messageReceived", username, message);

    public async Task UpdatedPosition(long username, int x, int y) => await Clients.All.SendAsync("updatedPosition", username, x, y);
}
