export interface DbInfoDto {
  id: string;
  name: string;
  tables: DbTable[];
}

export interface DbTable {
  name: string;
  columns: DbColumn[];
}

export interface DbColumn {
  name: string;
  typeName: string;
  isNotNull: boolean;
  defaultValue: string | null;
  isPk: boolean;
}
