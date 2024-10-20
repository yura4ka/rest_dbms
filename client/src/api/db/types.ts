export interface DbInfoDto {
  id: string;
  name: string;
  tables: DbTable[];
}

export interface DbTable {
  name: string;
  columns: DbColumn[];
  rows: DbValue[][];
}

export interface DbColumn {
  name: string;
  typeName: string;
  isNotNull: boolean;
  defaultValue: string | null;
  isPk: boolean;
}

export interface DbValue {
  isNullable: boolean;
  stringValue: string;
  objectValue: unknown;
  isNull: boolean;
}
