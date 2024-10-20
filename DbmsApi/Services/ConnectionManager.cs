using DbmsApi.Models;

namespace DbmsApi.Services
{
  public class DbInfo
  {
    public required string Id { get; set; }
    public required string FullPath { get; set; }
    public IDatabase? Database { get; set; } = null;
  }

  public interface IConnectionManager
  {
    DbInfo? GetById(string id);
    IDatabase? Connect(string id);
    string CreateConnection(string fullPath);
    void DeleteConnection(string id);
    static string GetFullPath(string name) => Path.Combine(Directory.GetCurrentDirectory(), @"..\..\dbs", name);
  }

  public class ConnectionManager : IConnectionManager
  {
    private readonly Dictionary<string, DbInfo> _connections = [];
    private readonly Dictionary<string, string> _connectionPaths = [];

    public DbInfo? GetById(string id)
    {
      _connections.TryGetValue(id, out var db);
      return db;
    }

    public IDatabase? Connect(string id)
    {
      _connections.TryGetValue(id, out var db);
      if (db == null) return null;
      if (db.Database != null) return db.Database;

      db.Database = new SqliteDatabase(db.FullPath);
      return db.Database;
    }

    public string CreateConnection(string fullPath)
    {
      if (_connectionPaths.TryGetValue(fullPath, out string? value))
        return value;

      string id = Guid.NewGuid().ToString();
      _connectionPaths.Add(fullPath, id);
      _connections.Add(id, new DbInfo { Id = id, FullPath = fullPath });
      return id;
    }

    public void DeleteConnection(string id)
    {
      if (_connections.TryGetValue(id, out var db))
      {
        db.Database?.Dispose();
        _connections.Remove(id);
        _connectionPaths.Remove(db.FullPath);
      }
    }
  }
}