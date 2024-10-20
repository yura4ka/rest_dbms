import { api, queryKeyFactory } from "@/api";
import { DbColumn } from "@/api/db/types";
import { ColumnView } from "@/components/column-view";
import { DbTreeView } from "@/components/db-tree-view";
import { CreateTableDialog } from "@/components/dialogs/create-table-dialog";
import { TableView } from "@/components/table-view";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type DbSearch = {
  search?: string;
};

export const Route = createFileRoute("/db/$dbId/")({
  validateSearch: (search: Record<string, unknown>): DbSearch => {
    return {
      search: search.search as string,
    };
  },
  component: DatabasePage,
});

function DatabasePage() {
  const { dbId } = Route.useParams();
  const navigate = useNavigate();

  const { data, isFetching, error } = useQuery({
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

  const onNotFoundError = () => {
    navigate({ to: "/" });
  };

  if (error?.status === 404) {
    onNotFoundError();
    return null;
  }

  return (
    <div className="container grid max-w-screen-2xl grid-cols-[1fr_4fr]">
      <nav className="h-full border-r py-8">
        <div className="mx-auto mb-4 px-4">
          <CreateTableDialog id={dbId}>
            <Button className="w-full">Create Table</Button>
          </CreateTableDialog>
        </div>
        {isFetching ? (
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
      <div className="grid py-8 pl-8">
        {selectedColumn !== null ? (
          <ColumnView column={selectedColumn} />
        ) : selectedTable !== null ? (
          <TableView
            tableName={selectedTable}
            onNotFoundError={onNotFoundError}
            onDropTable={() => {
              setSelectedColumn(null);
              setSelectedTable(null);
            }}
          />
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}
