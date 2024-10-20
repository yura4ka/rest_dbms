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

export interface EditRowDto {
  values: Record<string, string>;
}

export interface EditRowError {
  errors: Record<string, string>;
}

export interface ColumnDefinitionDto {
  name: string;
  typeName: string;
  isNotNull: boolean;
  defaultValue: string;
}

export interface EditTableDto {
  tableName: string;
  columns: ColumnDefinitionDto[];
  primaryKey: number;
}
