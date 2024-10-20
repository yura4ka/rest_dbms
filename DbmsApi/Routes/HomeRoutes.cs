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
      app.MapPost("/", CreateDatabase);
      app.MapDelete("/{id}", DeleteDatabase);
    }

    private static JsonHttpResult<List<DbDto>> GetDatabases(IConnectionManager connectionManager)
    {
      var files = Directory.GetFiles(IConnectionManager.GetFullPath(""), "*.db")
          .Select(f =>
          {
            string id = connectionManager.CreateConnection(f);
            return new DbDto { Id = id, Name = Path.GetFileName(f) };
          })
          .ToList();

      return TypedResults.Json(files);
    }

    private static IResult CreateDatabase(CreateDatabaseDto request, IConnectionManager connectionManager)
    {
      string fullPath = IConnectionManager.GetFullPath(request.Name);
      if (!fullPath.EndsWith(".db")) fullPath += ".db";

      if (Path.Exists(fullPath))
        return TypedResults.Json(new { message = "Database with this name already exists!" }, statusCode: 400);

      string id = connectionManager.CreateConnection(fullPath);
      return TypedResults.Json(new { id });
    }

    private static IResult DeleteDatabase(string id, IConnectionManager connectionManager)
    {
      var fullPath = connectionManager.GetById(id)?.FullPath;
      if (fullPath == null) return TypedResults.Json(new { }, statusCode: 404);
      if (!File.Exists(fullPath)) return TypedResults.Json(new { }, statusCode: 404);

      connectionManager.DeleteConnection(id);
      File.Delete(fullPath);
      return TypedResults.NoContent();
    }
  }
}