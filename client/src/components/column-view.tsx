import { DbColumn } from "@/api/db/types";

type Props = {
  column: DbColumn;
};

export function ColumnView({ column }: Props) {
  return (
    <div>
      <table>
        <tr className="py-2 text-lg">
          <td className="pr-4">Name:</td>
          <td>{column.name}</td>
        </tr>
        <tr className="py-2 text-lg">
          <td className="pr-4">Type:</td>
          <td>{column.typeName}</td>
        </tr>
        <tr className="py-2 text-lg">
          <td className="pr-4">Primary key (pk):</td>
          <td>{column.isPk ? "true" : "false"}</td>
        </tr>
        <tr className="py-2 text-lg">
          <td className="pr-4">Not null (nn):</td>
          <td>{column.isNotNull ? "true" : "false"}</td>
        </tr>
        <tr className="py-2 text-lg">
          <td className="pr-4">Default value:</td>
          <td>{column.defaultValue}</td>
        </tr>
      </table>
    </div>
  );
}
