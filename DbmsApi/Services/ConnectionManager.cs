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

    public IDatabase? GetConnectionById(string id)
    {
      _connections.TryGetValue(id, out var connection);
      return connection;
    }


    public string CreateConnection(string fullPath)
    {
      string id = Guid.NewGuid().ToString();
      var database = new SqliteDatabase(fullPath);
      _connections.Add(id, database);
      return id;
    }
  }
}