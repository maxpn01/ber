import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
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
  const [open, setOpen] = useState(false);
  const pinnedOpenRef = useRef(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !pinnedOpenRef.current) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (
        triggerRef.current?.contains(target) ||
        contentRef.current?.contains(target)
      ) {
        return;
      }
      pinnedOpenRef.current = false;
      triggerRef.current?.blur();
      setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer, true);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
    };
  }, [open]);

  const closeTooltip = () => {
    pinnedOpenRef.current = false;
    triggerRef.current?.blur();
    setOpen(false);
  };

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip
        open={open}
        onOpenChange={(nextOpen) => {
          if (pinnedOpenRef.current && !nextOpen) return;
          setOpen(nextOpen);
        }}
      >
        <TooltipTrigger asChild>
          <button
            ref={triggerRef}
            type="button"
            aria-label="Hilfe"
            onPointerDown={(event) => {
              if (event.pointerType === "mouse") return;
              event.preventDefault();
              const nextOpen = !open;
              pinnedOpenRef.current = nextOpen;
              setOpen(nextOpen);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") closeTooltip();
            }}
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
        <TooltipContent
          ref={contentRef}
          instantClose
          side="top"
          collisionPadding={12}
          className="max-w-[min(calc(100vw-1.5rem),20rem)] whitespace-pre-line rounded-sm border-none bg-[#003C56] px-3 py-2.5 text-xs font-normal leading-relaxed text-white sm:max-w-sm sm:px-4 sm:py-3 lg:max-w-md lg:px-5 lg:py-4"
        >
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
