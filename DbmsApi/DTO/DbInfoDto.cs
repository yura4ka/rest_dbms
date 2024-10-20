using DbmsApi.Models;

namespace DbmsApi.DTO
{
  public class DbInfoDto
  {
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required List<Table> Tables { get; set; }
  }
}