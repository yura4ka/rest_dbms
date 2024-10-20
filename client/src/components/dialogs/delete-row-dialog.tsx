import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SubmitButton } from "../submit-button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, queryKeyFactory } from "@/api";
import { Button } from "../ui/button";
import { toast } from "sonner";

export type DeleteRowData = {
  id: string;
  tableName: string;
  pkValue: string;
};

type Props = {
  isVisible: boolean;
  onVisibleChange: (isVisible: boolean) => void;
  deleteRowData: DeleteRowData | null;
};

export function DeleteRowDialog({ isVisible, onVisibleChange, deleteRowData }: Props) {
  const queryClient = useQueryClient();

  const deleteRow = useMutation({
    mutationFn: (data: DeleteRowData) => api.db.deleteRow(data.id, data.tableName, data.pkValue),
    onSuccess: (_, data) =>
      queryClient.invalidateQueries({
        queryKey: queryKeyFactory.db.tableById(data.id, data.tableName),
      }),
  });

  if (!deleteRowData) return null;

  const handleDeleteRow = async () => {
    deleteRow
      .mutateAsync(deleteRowData)
      .then(() => {
        onVisibleChange(false);
        toast.success("Row has been deleted");
      })
      .catch(() => toast.error("Error! Try again later"));
  };

  return (
    <AlertDialog open={isVisible} onOpenChange={onVisibleChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this row from the table
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            disabled={deleteRow.isPending}
            variant={"outline"}
            onClick={() => onVisibleChange(false)}
            className="mt-2 sm:mt-0"
          >
            Cancel
          </Button>
          <SubmitButton
            variant={"destructive"}
            isLoading={deleteRow.isPending}
            onClick={handleDeleteRow}
          >
            Delete
          </SubmitButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
