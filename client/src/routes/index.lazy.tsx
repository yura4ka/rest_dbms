import { api, queryKeyFactory } from "@/api";
import { CreateDatabaseDialog } from "@/components/dialogs/create-database-dialog";
import { DeleteDatabaseDialog } from "@/components/dialogs/delete-database-dialog";
import { Button } from "@/components/ui/button";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  const { data: databases, isLoading } = useQuery({
    queryFn: () => api.root.getDatabases(),
    queryKey: queryKeyFactory.root.all,
  });

  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="container">
      <div className="flex items-center justify-between gap-4 py-8">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Available Databases
        </h1>
        <CreateDatabaseDialog>
          <Button className="self-end">Create database</Button>
        </CreateDatabaseDialog>
      </div>
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-background">
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {databases?.map((db) => (
                <TableRow key={db.id} className="hover:bg-background">
                  <TableCell className="font-medium">{db.name}</TableCell>
                  <TableCell className="flex justify-end gap-2 text-right">
                    <Button asChild size={"sm"}>
                      <Link to={`/`}>Connect</Link>
                    </Button>
                    <Button onClick={() => setDeleteId(db.id)} size={"sm"} variant={"destructive"}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
      <DeleteDatabaseDialog
        key={deleteId}
        id={deleteId}
        isVisible={!!deleteId}
        onVisibleChange={() => setDeleteId(null)}
      />
    </div>
  );
}
