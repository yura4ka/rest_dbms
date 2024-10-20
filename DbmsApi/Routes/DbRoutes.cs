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
      db.MapGet("/{id}/{tableName}", GetTable);
    }

    private static IResult GetDatabaseInfo(string id, IConnectionManager connectionManager)
    {
      var db = connectionManager.Connect(id);
      if (db == null) return TypedResults.Json(new { }, statusCode: 404);

      return TypedResults.Json(new DbInfoDto { Id = id, Name = db.Name, Tables = db.Tables });
    }

    private static IResult GetTable(string id, string tableName, string? search, IConnectionManager connectionManager)
    {
      var db = connectionManager.Connect(id);
      if (db == null) return TypedResults.Json(new { }, statusCode: 404);

      var table = db.Tables.Find(t => t.Name == tableName);
      if (table == null) return TypedResults.Json(new { }, statusCode: 404);

      table.GetAllRows(search);
      return TypedResults.Json(table);
    }
  }
}