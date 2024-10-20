using DbmsApi.DTO;
using DbmsApi.Models;
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
      db.MapPost("/{id}/{tableName}", CreateRow);
      db.MapPut("/{id}/{tableName}/{pk}", UpdateRow);
      db.MapDelete("/{id}/{tableName}", DeleteRow);
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

    private static IResult CreateRow(string id, string tableName, EditRowDto request, IConnectionManager connectionManager)
    {
      var database = connectionManager.Connect(id);
      if (database == null) return TypedResults.Json(new { }, statusCode: 404);

      var selectedTable = database.Tables.Find(t => t.Name == tableName);
      if (selectedTable == null) return TypedResults.Json(new { }, statusCode: 404);

      var columnValues = new ColumnValue[selectedTable.Columns.Count];
      var errors = new Dictionary<string, string>();

      foreach (var item in request.Values)
      {
        int index = selectedTable.Columns.FindIndex(c => c.Name == item.Key);
        if (index == -1)
        {
          errors.Add(item.Key, $"Error! {item.Key} column doesn't exists");
          break;
        }

        var c = selectedTable.Columns[index];
        columnValues[index] = c.Type.Instance(null, !c.IsNotNull);
        bool isValid = columnValues[index].ParseString(item.Value);
        if (!isValid) errors.Add(item.Key, $"Wrong value!");
      }

      if (errors.Count != 0)
      {
        return TypedResults.Json(new { Errors = errors }, statusCode: 400);
      }

      try
      {
        bool isValid = selectedTable.AddRow(new Row(columnValues));
        if (!isValid) errors.Add("", "Error!");
      }
      catch (Exception ex)
      {
        errors.Add("", ex.Message);
      }

      if (errors.Count != 0) return TypedResults.Json(new { Errors = errors }, statusCode: 400);
      return TypedResults.Json(new { }, statusCode: 201);
    }

    private static IResult UpdateRow(string id, string tableName, string pk, EditRowDto editRow, IConnectionManager connectionManager)
    {
      var database = connectionManager.Connect(id);
      if (database == null) return TypedResults.Json(new { }, statusCode: 404);

      var selectedTable = database.Tables.Find(t => t.Name == tableName);
      if (selectedTable == null) return TypedResults.Json(new { }, statusCode: 404);

      int pkIndex = selectedTable.GetPkColumnIndex();
      if (pkIndex == -1 || string.IsNullOrEmpty(pk)) return TypedResults.Json(new { }, statusCode: 404);

      var pkValueObject = selectedTable.Columns[pkIndex].Type.Instance(pk, false);
      var rowIndex = selectedTable.Rows.FindIndex(r => pkValueObject.ObjectValue?.Equals(r[pkIndex]?.ObjectValue) ?? false);
      if (rowIndex == -1) return TypedResults.Json(new { }, statusCode: 404);

      bool onlyCheck = false;
      var errors = new Dictionary<string, string>();

      foreach (var item in editRow.Values)
      {
        int index = selectedTable.Columns.FindIndex(c => c.Name == item.Key);
        if (index == -1)
        {
          errors.Add(item.Key, $"Error! {item.Key} column doesn't exists");
          break;
        }

        try
        {
          bool isValid = selectedTable.ChangeCell(rowIndex, index, item.Value, onlyCheck);
          if (!isValid)
          {
            errors.Add(item.Key, $"Wrong value!");
            onlyCheck = true;
          }
        }
        catch (Exception ex)
        {
          errors.Add("", ex.Message);
        }

      }

      if (errors.Count != 0) return TypedResults.Json(new { Errors = errors }, statusCode: 400);
      return TypedResults.Json(new { }, statusCode: 200);
    }

    private static IResult DeleteRow(string id, string tableName, string pkValue, IConnectionManager connectionManager)
    {
      var database = connectionManager.Connect(id);
      if (database == null) return TypedResults.Json(new { }, statusCode: 404);

      var table = database.Tables.Find(t => t.Name == tableName);
      if (table == null) return TypedResults.Json(new { }, statusCode: 404);

      table.DeleteRow(pkValue);
      return TypedResults.NoContent();
    }
  }
}