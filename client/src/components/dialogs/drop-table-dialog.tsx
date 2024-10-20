import { api, queryKeyFactory } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { SubmitButton } from "../submit-button";
import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog";
import { useState } from "react";

type Props = {
  id: string;
  tableName: string;
  onDelete?: () => void;
  children?: React.ReactNode;
};

export function DropTableDialog({ id, tableName, children, onDelete }: Props) {
  const queryClient = useQueryClient();
  const [isVisible, setIsVisible] = useState(false);

  const dropTable = useMutation({
    mutationFn: () => api.db.dropTable(id, tableName),
    onSuccess: () => {
      onDelete?.();
      queryClient.removeQueries({
        queryKey: queryKeyFactory.db.tableById(id, tableName),
      });
      queryClient.refetchQueries({
        queryKey: queryKeyFactory.db.dbById(id),
      });
    },
  });

  const handleDropTable = async () => {
    dropTable
      .mutateAsync()
      .then(() => {
        toast.success("Table has been deleted");
        setIsVisible(false);
      })
      .catch(() => toast.error("Error! Try again later"));
  };

  return (
    <AlertDialog open={isVisible} onOpenChange={setIsVisible}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this table
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            disabled={dropTable.isPending}
            variant={"outline"}
            onClick={() => setIsVisible(false)}
            className="mt-2 sm:mt-0"
          >
            Cancel
          </Button>
          <SubmitButton
            variant={"destructive"}
            isLoading={dropTable.isPending}
            onClick={handleDropTable}
          >
            Drop
          </SubmitButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
