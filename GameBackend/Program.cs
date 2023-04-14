using GameBackend.Hubs;
using GameBackend.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSignalR();
builder.Services.AddHostedService<GameService>();
builder.Services.AddSingleton<BackgroundJobs>();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapHub<ChatHub>("/chat-hub");

app.MapGet("/", () => "Hello World!");

app.Run();
