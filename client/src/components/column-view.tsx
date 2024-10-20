import { DbColumn } from "@/api/db/types";

type Props = {
  column: DbColumn;
};

export function ColumnView({ column }: Props) {
  return (
    <div>
      <h2>{column.name}</h2>
      <p>{column.typeName}</p>
    </div>
  );
}
