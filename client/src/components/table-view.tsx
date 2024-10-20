import { api, queryKeyFactory } from "@/api";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Table, TableHeader, TableRow, TableBody, TableCell, TableHead } from "./ui/table";
import { generateTableName, getPkIndex } from "@/lib/dbUtils";
import { useMemo } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";

type Props = {
  tableName: string;
  onNotFoundError: () => void;
};

export function TableView({ tableName, onNotFoundError }: Props) {
  const dbId = useParams({ from: "/db/$dbId/", select: (p) => p.dbId });

  const { data, isPending, error } = useQuery({
    queryKey: queryKeyFactory.db.tableById(dbId, tableName),
    queryFn: () => api.db.getTable(dbId, tableName),
  });

  const pkIndex = useMemo(() => getPkIndex(data?.columns ?? []), [data?.columns]);

  if (error?.status === 404) {
    onNotFoundError();
    return null;
  }

  if (isPending) {
    return (
      <div className="grid place-content-center pb-16">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        <div className="flex gap-2">
          <Button>Add Row</Button>
          <Button variant={"destructive"}>Drop Table</Button>
        </div>
        <span className="self-stretch border-r border-muted"></span>
        <Input placeholder="Search" name="search" />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {data?.columns.map((column, index) => (
                <TableHead key={column.name} className={cn(pkIndex === index && "font-bold")}>
                  {generateTableName(column)}
                </TableHead>
              ))}
              <TableHead className="text-right italic">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.rows.map((row) => (
              <TableRow key={row[pkIndex].stringValue}>
                {row.map((cell, index) => (
                  <TableCell
                    key={data.columns[index].name}
                    className={cn(pkIndex === index && "font-medium")}
                  >
                    {cell.stringValue}
                  </TableCell>
                ))}
                <TableCell className="flex justify-end gap-2 text-right">
                  <Button size={"sm"} variant={"secondary"}>
                    Edit
                  </Button>
                  <Button size={"sm"} variant={"destructive"}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
