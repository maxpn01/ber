import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  text: string;
  className?: string;
  variant?: "dark" | "red";
}

export const HelpIcon = ({ text, className, variant = "dark" }: Props) => (
  <TooltipProvider delayDuration={150}>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="Hilfe"
          className={cn(
            "inline-flex h-4 w-4 items-center justify-center rounded-full text-white",
            variant === "dark" ? "bg-foreground/80" : "bg-wko-red",
            className,
          )}
        >
          <Info className="h-3 w-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-sm">
        {text}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
