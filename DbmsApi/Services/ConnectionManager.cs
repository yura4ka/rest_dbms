using DbmsApi.Models;

namespace DbmsApi.Services
{
  public interface IConnectionManager
  {
    IDatabase? GetConnectionById(string id);
    string CreateConnection(string fullPath);
  }

  public class ConnectionManager : IConnectionManager
  {
    private readonly Dictionary<string, IDatabase> _connections = [];
    private readonly Dictionary<string, string> _connectionPaths = [];

    public IDatabase? GetConnectionById(string id)
    {
      _connections.TryGetValue(id, out var connection);
      return connection;
    }

    public string CreateConnection(string fullPath)
    {
      if (_connectionPaths.TryGetValue(fullPath, out string? value))
        return value;

      string id = Guid.NewGuid().ToString();
      Console.WriteLine($"Creating connection {fullPath}");
      var database = new SqliteDatabase(fullPath);
      _connections.Add(id, database);
      _connectionPaths.Add(fullPath, id);
      return id;
    }
  }
}