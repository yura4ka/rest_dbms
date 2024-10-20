using DbmsApi.DTO;
using DbmsApi.Services;

namespace DbmsApi.Routes
{
  public static class DbRoutes
  {
    public static void RegisterDbRoutes(this WebApplication app)
    {
      var db = app.MapGroup("/db");
      db.MapGet("/{id}", GetDatabaseInfo);
    }

    private static IResult GetDatabaseInfo(string id, IConnectionManager connectionManager)
    {
      var db = connectionManager.Connect(id);
      if (db == null) return TypedResults.Json(new { }, statusCode: 404);

      return TypedResults.Json(new DbInfoDto { Id = id, Name = db.Name, Tables = db.Tables });
    }
  }
}