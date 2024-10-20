import { api, queryKeyFactory } from "@/api";
import { DbColumn, EditRowDto, EditRowError } from "@/api/db/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPkIndex } from "@/lib/dbUtils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SubmitButton } from "../submit-button";
import axios from "axios";

type Props = {
  isVisible: boolean;
  onVisibleChange: (isVisible: boolean) => void;
  id: string;
  tableName: string;
  columns: DbColumn[];
  defaultValue: string[] | null;
};

export function EditRowDialog({
  isVisible,
  onVisibleChange,
  id,
  tableName,
  columns,
  defaultValue,
}: Props) {
  const queryClient = useQueryClient();

  const createRow = useMutation({
    mutationFn: (data: EditRowDto) => api.db.createRow(id, tableName, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeyFactory.db.tableById(id, tableName) }),
  });

  const editRow = useMutation({
    mutationFn: (request: { pk: string; data: EditRowDto }) =>
      api.db.editRow(id, tableName, request.pk, request.data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeyFactory.db.tableById(id, tableName) }),
  });

  const [values, setValues] = useState<string[]>(() => {
    if (defaultValue) return [...defaultValue];
    return columns.map((c) => c.defaultValue || "");
  });

  const onValueChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newValues = [...values];
    newValues[index] = e.target.value;
    setValues(newValues);
  };

  const isCreating = defaultValue === null;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data: EditRowDto = { values: {} };
    for (let i = 0; i < columns.length; i++) {
      data.values[columns[i].name] = values[i].trim();
    }

    const pkIndex = getPkIndex(columns);
    const pk = defaultValue?.[pkIndex];

    const promise =
      pk === undefined
        ? createRow.mutateAsync(data).then(() => toast.success("Row created"))
        : editRow.mutateAsync({ pk, data }).then(() => toast.success("Row edited"));

    promise
      .then(() => onVisibleChange(false))
      .catch((e) => {
        if (axios.isAxiosError<EditRowError>(e)) {
          const error = e.response?.data.errors[""];
          if (error) toast.error(error);
        }
      });
  };

  const isDisabled = values.some((v, i) => v.trim().length === 0 && columns[i].isNotNull);

  const typedErrors = useMemo((): Record<string, string> => {
    const error = createRow.error || editRow.error;
    if (!error) return {};
    if (!axios.isAxiosError<EditRowError>(error)) return {};
    return error.response?.data.errors ?? {};
  }, [createRow.error, editRow.error]);

  return (
    <Dialog open={isVisible} onOpenChange={onVisibleChange}>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>{isCreating ? "Create" : "Edit"} row</DialogTitle>
          <DialogDescription>
            {isCreating ? "Add a new" : "Make changes to the"} row here. Click save when you're
            done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            {columns.map((c, index) => (
              <div key={c.name} className="grid grid-cols-4 items-center gap-x-4">
                <Label htmlFor={`input-${c.name}`}>
                  {c.name}{" "}
                  <span className="font-normal text-muted-foreground">
                    ({c.typeName}){c.isPk && " (pk)"}
                    {c.isNotNull && " (nn)"}
                  </span>
                </Label>
                <Input
                  id={`input-${c.name}`}
                  value={values[index]}
                  onChange={(e) => onValueChange(e, index)}
                  className="col-span-3"
                />
                {typedErrors[c.name] && (
                  <p className="col-span-4 text-sm font-light text-destructive">Error!</p>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <SubmitButton
              disabled={isDisabled}
              isLoading={createRow.isPending || editRow.isPending}
            >
              Save changes
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
