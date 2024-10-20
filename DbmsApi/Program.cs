using DbmsApi.Services;
using DbmsApi.Routes;

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
  options.AddPolicy(name: MyAllowSpecificOrigins, policy =>
  {
    policy.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod();
  });
});

builder.Services.AddSingleton<IConnectionManager, ConnectionManager>();

var app = builder.Build();

app.UseCors(MyAllowSpecificOrigins);

app.RegisterHomeRoutes();
app.RegisterDbRoutes();

app.Run();
