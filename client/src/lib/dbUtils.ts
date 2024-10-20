import { DbColumn } from "@/api/db/types";

export function generateTableName(column: DbColumn) {
  let result = column.name;
  if (column.isPk) result += " (pk)";
  if (column.isNotNull) result += " (nn)";
  return result;
}

export function getPkIndex(columns: DbColumn[]) {
  return columns.findIndex((column) => column.isPk);
}
