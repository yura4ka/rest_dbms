import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

type Props = React.ComponentProps<typeof Button> & {
  isLoading?: boolean;
};

export function SubmitButton({ isLoading, disabled, className, children, ...rest }: Props) {
  return (
    <Button
      disabled={disabled || isLoading}
      type="submit"
      className={cn("relative", className)}
      {...rest}
    >
      <Loader2
        className={cn(
          "absolute left-0 animate-spin opacity-0 transition-all",
          isLoading && "left-4 opacity-100",
        )}
      />
      <span className={cn("ml-0 transition-all", isLoading && "ml-6")}>{children}</span>
    </Button>
  );
}
