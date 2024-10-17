using DbmsApi.DTO;
using DbmsApi.Services;

namespace DbmsApi.Routes
{
  public static class HomeRoutes
  {
    public static void RegisterHomeRoutes(this WebApplication app)
    {
      app.MapGet("/", GetDatabases);
    }

    private static IResult GetDatabases(IConnectionManager connectionManager)
    {
      var files = Directory.GetFiles(Path.Combine(Directory.GetCurrentDirectory(), @"..\..\dbs"), "*.db")
                  .Select(f => new DbDto { Name = Path.GetFileName(f) })
                  .ToList();
      return TypedResults.Ok(files);
    }
  }
}