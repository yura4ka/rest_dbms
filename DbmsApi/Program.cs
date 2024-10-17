using DbmsApi.Services;
using DbmsApi.Routes;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<IConnectionManager, ConnectionManager>();

var app = builder.Build();

app.RegisterHomeRoutes();

app.Run();
