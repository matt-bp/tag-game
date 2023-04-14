using GameBackend.Hubs;
using GameBackend.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSignalR();
builder.Services.AddHostedService<CollisionService>();
builder.Services.AddSingleton<BackgroundCollisionJobs>();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapHub<ChatHub>("/chat-hub");

app.MapGet("/", () => "Hello World!");

app.Run();
