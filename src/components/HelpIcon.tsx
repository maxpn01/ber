import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  text: string;
  className?: string;
  iconSrc?: string;
}

export const HelpIcon = ({
  text,
  className,
  iconSrc = "/tooltip_icon.svg",
}: Props) => {
  const isTitleIcon = iconSrc === "/title_tooltip_icon.svg";

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Hilfe"
            className={cn(
              "inline-flex items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isTitleIcon ? "mt-1 h-[26px] w-[26px]" : "h-6 w-6",
              className,
            )}
          >
            <img
              src={iconSrc}
              alt=""
              className={isTitleIcon ? "h-full w-full" : "h-[12px] w-[12px]"}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-sm">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
