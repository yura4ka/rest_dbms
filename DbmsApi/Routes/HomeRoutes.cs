using DbmsApi.DTO;
using DbmsApi.Services;
using Microsoft.AspNetCore.Http.HttpResults;

namespace DbmsApi.Routes
{
  public static class HomeRoutes
  {
    public static void RegisterHomeRoutes(this WebApplication app)
    {
      app.MapGet("/", GetDatabases);
    }

    private static JsonHttpResult<List<DbDto>> GetDatabases(IConnectionManager connectionManager)
    {
      var files = Directory.GetFiles(Path.Combine(Directory.GetCurrentDirectory(), @"..\..\dbs"), "*.db")
          .Select(f =>
          {
            string id = connectionManager.CreateConnection(f);
            return new DbDto { Id = id, Name = Path.GetFileName(f) };
          })
          .ToList();

      return TypedResults.Json(files);
    }
  }
}