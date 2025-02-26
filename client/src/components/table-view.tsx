import { api, queryKeyFactory } from "@/api";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Table, TableHeader, TableRow, TableBody, TableCell, TableHead } from "./ui/table";
import { generateTableName, getPkIndex } from "@/lib/dbUtils";
import { useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { DeleteRowData, DeleteRowDialog } from "./dialogs/delete-row-dialog";
import { EditRowDialog } from "./dialogs/edit-row-dialog";
import { DropTableDialog } from "./dialogs/drop-table-dialog";

type Props = {
  tableName: string;
  onNotFoundError: () => void;
  onDropTable?: () => void;
};

export function TableView({ tableName, onNotFoundError, onDropTable }: Props) {
  const navigate = useNavigate({ from: "/db/$dbId" });
  const dbId = useParams({ from: "/db/$dbId/", select: (p) => p.dbId });
  const search = useSearch({ from: "/db/$dbId/", select: (s) => s.search });

  const { data, isFetching, error } = useQuery({
    queryKey: queryKeyFactory.db.tableById(dbId, tableName, search),
    queryFn: () => api.db.getTable(dbId, tableName, search),
  });

  const [deleteRowData, setDeleteRowData] = useState<DeleteRowData | null>(null);
  const [editRowData, setEditRowData] = useState(() => ({
    isVisible: false,
    id: null as string | null,
    defaultValue: null as string[] | null,
  }));

  const pkIndex = useMemo(() => getPkIndex(data?.columns ?? []), [data?.columns]);

  const inputRef = useRef<HTMLInputElement>(null);
  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate({ search: { search: inputRef.current?.value.trim() || undefined } });
  };

  if (error?.status === 404) {
    onNotFoundError();
    return null;
  }

  if (isFetching) {
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
          <Button onClick={() => setEditRowData({ isVisible: true, defaultValue: null, id: null })}>
            Add Row
          </Button>
          <DropTableDialog key={tableName} id={dbId} tableName={tableName} onDelete={onDropTable}>
            <Button variant={"destructive"}>Drop Table</Button>
          </DropTableDialog>
        </div>
        <span className="self-stretch border-r border-muted"></span>
        <form onSubmit={onSearch} className="flex flex-1 items-center gap-2">
          <Input ref={inputRef} placeholder="Search" defaultValue={search} name="search" />
          <Button variant={"outline"}>Search</Button>
        </form>
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
                  <Button
                    onClick={() =>
                      setEditRowData({
                        id: row[pkIndex].stringValue,
                        isVisible: true,
                        defaultValue: row.map((c) => c.stringValue),
                      })
                    }
                    size={"sm"}
                    variant={"secondary"}
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() =>
                      setDeleteRowData({
                        id: dbId,
                        tableName,
                        pkValue: `${row[pkIndex].objectValue}`,
                      })
                    }
                    size={"sm"}
                    variant={"destructive"}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <EditRowDialog
        key={editRowData.id}
        id={dbId}
        tableName={tableName}
        isVisible={editRowData.isVisible}
        onVisibleChange={() => setEditRowData((prev) => ({ ...prev, isVisible: false }))}
        columns={data?.columns ?? []}
        defaultValue={editRowData.defaultValue}
      />
      <DeleteRowDialog
        isVisible={!!deleteRowData}
        onVisibleChange={() => setDeleteRowData(null)}
        deleteRowData={deleteRowData}
      />
    </div>
  );
}
