import { DbColumn, DbInfoDto } from "@/api/db/types";
import { Accordion, AccordionItem, AccordionContent } from "@/components/ui/accordion";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

type Props = {
  data: DbInfoDto | undefined;
  selectedTable?: string | null;
  selectedColumn?: DbColumn | null;
  onTableClick?: (tableName: string) => void;
  onColumnClick?: (tableName: string, column: DbColumn) => void;
};

export function DbTreeView({
  data,
  selectedTable,
  selectedColumn,
  onTableClick,
  onColumnClick,
}: Props) {
  return (
    <Accordion type="multiple" className="w-full">
      {data?.tables.map((t) => (
        <AccordionItem key={t.name} value={t.name}>
          <AccordionPrimitive.Header
            className={cn(
              "flex flex-1 items-center justify-between pl-4 pr-8 font-medium transition-all [&[data-state=open]>button>svg]:rotate-180",
              selectedTable === t.name && "bg-muted",
            )}
          >
            <button className="flex-1 text-left" onClick={() => onTableClick?.(t.name)}>
              {t.name}
            </button>
            <AccordionPrimitive.Trigger className="group py-4">
              <ChevronDown className="h-4 w-4 shrink-0 transition-all duration-200 group-hover:text-secondary" />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionContent className="space-y-1 pl-4">
            {t.columns.map((c) => (
              <button
                key={c.name}
                onClick={() => onColumnClick?.(t.name, c)}
                className={cn(
                  "w-full py-2 pl-4 text-left hover:text-secondary",
                  selectedColumn === c && "bg-muted",
                )}
              >
                {c.name}
              </button>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
