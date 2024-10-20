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

type Props = {
  isVisible: boolean;
  onVisibleChange: (isVisible: boolean) => void;
  id: string | null;
};

export function DeleteDatabaseDialog({ isVisible, onVisibleChange, id }: Props) {
  const queryClient = useQueryClient();

  const deleteDatabase = useMutation({
    mutationFn: (id: string) => api.root.deleteDatabase(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeyFactory.root.all }),
  });

  if (!id) return null;

  const handleDeleteDatabase = async () => {
    deleteDatabase
      .mutateAsync(id)
      .then(() => {
        onVisibleChange(false);
        toast.success("Database has been deleted");
      })
      .catch(() => toast.error("Error! Try again later"));
  };

  return (
    <AlertDialog open={isVisible} onOpenChange={onVisibleChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this database
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            disabled={deleteDatabase.isPending}
            variant={"outline"}
            onClick={() => onVisibleChange(false)}
            className="mt-2 sm:mt-0"
          >
            Cancel
          </Button>
          <SubmitButton
            variant={"destructive"}
            isLoading={deleteDatabase.isPending}
            onClick={handleDeleteDatabase}
          >
            Delete
          </SubmitButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
