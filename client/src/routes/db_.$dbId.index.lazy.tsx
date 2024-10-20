import { api, queryKeyFactory } from "@/api";
import { DbColumn } from "@/api/db/types";
import { ColumnView } from "@/components/column-view";
import { DbTreeView } from "@/components/db-tree-view";
import { TableView } from "@/components/table-view";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export const Route = createLazyFileRoute("/db/$dbId/")({
  component: DatabasePage,
});

function DatabasePage() {
  const { dbId } = Route.useParams();
  const navigate = useNavigate();

  const { data, isPending, error } = useQuery({
    queryKey: queryKeyFactory.db.dbById(dbId),
    queryFn: () => api.db.getInfo(dbId),
  });

  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<DbColumn | null>(null);

  const onTableClick = (tableName: string) => {
    setSelectedTable(tableName);
    setSelectedColumn(null);
  };

  const onColumnClick = (tableName: string, column: DbColumn) => {
    setSelectedTable(tableName);
    setSelectedColumn(column);
  };

  if (error?.status === 404) {
    navigate({ to: "/" });
    return null;
  }

  return (
    <div className="container grid max-w-screen-2xl grid-cols-[1fr_4fr]">
      <nav className="h-full border-r py-8">
        {isPending ? (
          <div className="grid h-full place-content-center pb-16">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <DbTreeView
            data={data}
            selectedTable={selectedTable}
            selectedColumn={selectedColumn}
            onTableClick={onTableClick}
            onColumnClick={onColumnClick}
          />
        )}
      </nav>
      <div className="py-8 pl-8">
        {selectedColumn !== null ? (
          <ColumnView column={selectedColumn} />
        ) : selectedTable !== null ? (
          <TableView tableName={selectedTable} />
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}
