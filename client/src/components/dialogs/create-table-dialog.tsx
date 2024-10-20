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
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, queryKeyFactory } from "@/api";
import axios from "axios";
import { SubmitButton } from "../submit-button";
import { ColumnDefinitionDto, EditRowError, EditTableDto } from "@/api/db/types";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "../ui/select";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  children: React.ReactNode;
};

export function CreateTableDialog({ id, children }: Props) {
  const queryClient = useQueryClient();

  const [isVisible, setIsVisible] = useState(false);
  const [data, setData] = useState<EditTableDto>(() => ({
    tableName: "",
    primaryKey: 0,
    columns: [],
  }));

  const onColumnChange = (patch: Partial<ColumnDefinitionDto>, index: number) => {
    const newColumns = [...data.columns];
    newColumns[index] = { ...newColumns[index], ...patch };
    setData((prev) => ({ ...prev, columns: newColumns }));
  };

  const { data: types, isFetching: areTypesFetching } = useQuery({
    queryKey: queryKeyFactory.root.types,
    queryFn: api.root.getTypes,
  });

  const createTable = useMutation({
    mutationFn: () => api.db.createTable(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeyFactory.db.dbById(id) }),
  });

  const changeIsOpen = (open: boolean) => {
    if (!open) onClose();
    setIsVisible(open);
  };

  const onClose = () => {
    if (createTable.isIdle) return;
    createTable.reset();
    setData({ tableName: "", primaryKey: 0, columns: [] });
  };

  const typedErrors = useMemo((): Record<string, string> => {
    if (!axios.isAxiosError<EditRowError>(createTable.error)) return {};
    return createTable.error.response?.data.errors ?? {};
  }, [createTable.error]);

  if (!types || areTypesFetching) {
    return (
      <Dialog open={isVisible} onOpenChange={changeIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create table</DialogTitle>
            <DialogDescription>Create a new table</DialogDescription>
          </DialogHeader>
          <div className="grid place-content-center py-4">
            <Loader2 className="animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const addColumn = () => {
    const newColumns = [...data.columns];
    newColumns.push({ name: "", typeName: types[0], isNotNull: false, defaultValue: "" });
    setData((prev) => ({ ...prev, columns: newColumns }));
  };

  const removeColumn = (index: number) => {
    setData((prev) => ({ ...prev, columns: prev.columns.filter((_, i) => i !== index) }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createTable
      .mutateAsync()
      .then(() => {
        toast.success("Table created");
        changeIsOpen(false);
      })
      .catch(() => {
        const error = typedErrors[""];
        if (error) toast.error(error);
      });
  };

  const isDisabled =
    createTable.isPending ||
    data.tableName.trim() === "" ||
    data.columns.length === 0 ||
    data.columns.some((c) => !c.name.trim() || !c.typeName);

  return (
    <Dialog open={isVisible} onOpenChange={changeIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create table</DialogTitle>
          <DialogDescription>Create a new table</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <RadioGroup
            value={data.primaryKey.toString()}
            onValueChange={(value) => setData((prev) => ({ ...prev, primaryKey: +value }))}
            className="scrollbar max-h-[70dvh] overflow-y-auto px-1"
          >
            <div className="grid gap-4 py-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="tableName">Table Name</Label>
                <Input
                  id="tableName"
                  value={data.tableName}
                  onChange={(e) => setData((prev) => ({ ...prev, tableName: e.target.value }))}
                  className={cn(
                    typedErrors["TableName"] && "border-destructive focus-visible:ring-destructive",
                  )}
                  placeholder="Table1"
                  autoComplete="off"
                />
                <p className="text-sm text-destructive">{typedErrors["TableName"]}</p>
              </div>
              {data.columns.map((column, index) => (
                <div className="grid gap-4 rounded-md border border-muted p-4">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor={`$name_{index}`}>Column Name</Label>
                    <Input
                      id={`$name_{index}`}
                      value={column.name}
                      onChange={(e) => onColumnChange({ name: e.target.value }, index)}
                      className={cn(
                        typedErrors[`Columns[${index}].Name`] &&
                          "border-destructive focus-visible:ring-destructive",
                      )}
                      autoComplete="off"
                    />
                    <p className="text-sm text-destructive">
                      {typedErrors[`Columns[${index}].Name`]}
                    </p>
                  </div>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label>Type</Label>
                    <Select
                      value={column.typeName}
                      onValueChange={(value) => onColumnChange({ typeName: value }, index)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {types?.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-destructive">
                      {typedErrors[`Columns[${index}].TypeName`]}
                    </p>
                  </div>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor={`$defaultValue_{index}`}>Default Value</Label>
                    <Input
                      id={`$defaultValue_{index}`}
                      value={column.defaultValue}
                      onChange={(e) => onColumnChange({ defaultValue: e.target.value }, index)}
                      className={cn(
                        typedErrors[`Columns[${index}].DefaultValue`] &&
                          "border-destructive focus-visible:ring-destructive",
                      )}
                      autoComplete="off"
                    />
                    <p className="text-sm text-destructive">
                      {typedErrors[`Columns[${index}].DefaultValue`]}
                    </p>
                  </div>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id={`$primaryKey_{index}`} value={index.toString()} />
                      <Label htmlFor={`$primaryKey_{index}`}>Primary Key</Label>
                    </div>
                    <p className="text-sm text-destructive">{typedErrors[`PrimaryKey`]}</p>
                  </div>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`isNotNull_${index}`}
                        checked={column.isNotNull}
                        onCheckedChange={(checked) =>
                          onColumnChange({ isNotNull: !!checked }, index)
                        }
                      />
                      <Label htmlFor={`isNotNull_${index}`}>Not Null</Label>
                    </div>
                    <p className="text-sm text-destructive">
                      {typedErrors[`Columns[${index}].IsNotNull`]}
                    </p>
                  </div>
                  <Button type="button" variant={"destructive"} onClick={() => removeColumn(index)}>
                    Delete
                  </Button>
                </div>
              ))}
              <Button type="button" variant={"secondary"} onClick={() => addColumn()}>
                Add Column
              </Button>
            </div>
          </RadioGroup>
          <DialogFooter>
            <SubmitButton isLoading={createTable.isPending} disabled={isDisabled}>
              Create
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
