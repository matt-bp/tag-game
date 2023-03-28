# Pokemon Game

Using Tiled, create a map, and add obstacles.

I'm thinking of having this game be multiplayer as well.

## Web Sockets

Using WebSockets, I'll send each player's position to the server, and everyone will render them on their end. I'll also do some sort of chat thingy? Text bubbles above people's heads.

Resouces:

- https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_server
- https://learn.microsoft.com/en-us/aspnet/core/fundamentals/websockets?view=aspnetcore-7.0
- https://learn.microsoft.com/en-us/aspnet/core/signalr/hubs?source=recommendations&view=aspnetcore-7.0

https://learn.microsoft.com/en-us/iis/get-started/whats-new-in-iis-10/http2-on-iis, websocket stuff support?

I want to run this on the dev server. People can go to the url, see the webpage, and the websocket server will handle the game and everything.

I might just want to start with signalR, and then dive deeper if it's not what I need.
