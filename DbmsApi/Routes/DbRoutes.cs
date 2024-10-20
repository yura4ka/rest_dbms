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
      db.MapPost("/{id}", CreateTable);
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

    private static IResult CreateTable(string id, EditTableDto editTable, IConnectionManager connectionManager)
    {
      var database = connectionManager.Connect(id);
      if (database == null) return TypedResults.Json(new { }, statusCode: 404);

      var pkColumn = editTable.Columns[editTable.PrimaryKey];

      int newPkIndex = editTable.Columns.IndexOf(pkColumn);
      editTable.PrimaryKey = newPkIndex;
      editTable.Columns = [.. editTable.Columns];

      var table = new Table(database.TableController, editTable.TableName ?? "");
      var errors = new Dictionary<string, string>();

      for (int i = 0; i < editTable.Columns.Count; i++)
      {
        var c = editTable.Columns[i];

        if (string.IsNullOrWhiteSpace(c.TypeName))
          errors.Add($"Columns[{i}].TypeName", "Invalid value");
        else if (!TypeManager.TypeMappings.ContainsKey(c.TypeName.ToUpper()))
          errors.Add($"Columns[{i}].TypeName", "Type doesn't exists");

        if (errors.Count != 0) continue;

        if (string.IsNullOrWhiteSpace(c.Name))
          errors.Add($"Columns[{i}].Name", "Invalid value");

        var typeObject = TypeManager.TypeMappings[c.TypeName!.ToUpper()]();
        var defaultValueObject = typeObject.Instance(null, false);
        bool isValid = defaultValueObject.ParseString(c.DefaultValue ?? "");

        if (!isValid && !string.IsNullOrEmpty(c.DefaultValue))
          errors.Add($"Columns[{i}].DefaultValue", "Invalid value for the selected type");

        for (int j = 0; j < editTable.Columns.Count; j++)
        {
          if (i == j) continue;
          if
          (
            !string.IsNullOrWhiteSpace(c.Name)
            && !string.IsNullOrWhiteSpace(editTable.Columns[j].Name)
            && c.Name == editTable.Columns[j].Name
          )
            errors.Add($"Columns[{i}].Name", "Column name must be unique");
        }

        if (string.IsNullOrWhiteSpace(editTable.TableName))
          errors.Add("TableName", "Invalid value");

        if (database.Tables.Exists(t => t.Name == editTable.TableName?.Trim()))
          errors.Add("TableName", "Table with this name already exists");

        if (errors.Count != 0) continue;

        var column = new Column(c.Name!.Trim(),
              typeObject,
              c.IsNotNull,
              defaultValueObject.ObjectValue,
              editTable.PrimaryKey == i);
        table.AddColumn(column);
      }

      editTable.PrimaryKey = editTable.PrimaryKey == -1 ? 0 : editTable.PrimaryKey;

      if (errors.Count != 0)
        return TypedResults.Json(new { Errors = errors }, statusCode: 400);

      try
      {
        bool isValid = database.CreateTable(table);
        if (!isValid) errors.Add("", "Error!");
      }
      catch (Exception ex)
      {
        errors.Add("", ex.Message);
      }

      if (errors.Count != 0)
        return TypedResults.Json(new { Errors = errors }, statusCode: 400);
      return TypedResults.Json(new { }, statusCode: 201);
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