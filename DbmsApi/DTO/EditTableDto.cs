namespace DbmsApi.DTO
{
  public class ColumnDefinitionDto
  {
    public required string Name { get; set; }
    public required string TypeName { get; set; }
    public required bool IsNotNull { get; set; }
    public required string DefaultValue { get; set; }
  }

  public class EditTableDto
  {
    public required string TableName { get; set; }
    public required List<ColumnDefinitionDto> Columns { get; set; }
    public required int PrimaryKey { get; set; }
  }
}