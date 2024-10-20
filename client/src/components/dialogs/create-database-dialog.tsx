import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, queryKeyFactory } from "@/api";
import { useNavigate } from "@tanstack/react-router";
import { CreateDatabaseError } from "@/api/root/types";
import axios from "axios";
import { SubmitButton } from "../submit-button";

type Props = {
  children: React.ReactNode;
};

export function CreateDatabaseDialog({ children }: Props) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isVisible, setIsVisible] = useState(false);
  const [name, setName] = useState("");

  const createDatabase = useMutation({
    mutationFn: () => api.root.createDatabase({ name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeyFactory.root.all }),
  });

  const changeIsOpen = (open: boolean) => {
    if (!open) onClose();
    setIsVisible(open);
  };

  const onClose = () => {
    if (createDatabase.isIdle) return;
    createDatabase.reset();
    setName("");
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { id } = await createDatabase.mutateAsync();
    changeIsOpen(false);
    navigate({ to: `/db/${id}` });
  };

  const isDisabled = name.trim().length === 0;

  return (
    <Dialog open={isVisible} onOpenChange={changeIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create database</DialogTitle>
          <DialogDescription>Create a new database</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="CoolDb"
                autoComplete="off"
              />
              <p className="text-sm text-destructive">
                {axios.isAxiosError<CreateDatabaseError>(createDatabase.error) &&
                  createDatabase.error.response?.data.message}
              </p>
            </div>
          </div>
          <DialogFooter>
            <SubmitButton isLoading={createDatabase.isPending} disabled={isDisabled}>
              Create
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
