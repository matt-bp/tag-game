using GameBackend.Hubs;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSignalR();

var MyAllowSpecificOrigins = "_myAllowedSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins, policy =>
    {
        policy.WithOrigins("http://127.0.0.1");
    });
});

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseCors(MyAllowSpecificOrigins);

app.MapHub<ChatHub>("/chat-hub");

app.Run();
