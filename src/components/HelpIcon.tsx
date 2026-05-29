import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
  text: React.ReactNode;
  className?: string;
  contentClassName?: string;
  iconSrc?: string;
  inlineContent?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export const HelpIcon = ({
  text,
  className,
  contentClassName,
  iconSrc = "/tooltip_icon.svg",
  inlineContent = false,
  side = "top",
  align = "center",
}: Props) => {
  const isTitleIcon = iconSrc === "/title_tooltip_icon.svg";
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open || !inlineContent) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (rootRef.current?.contains(target)) return;
      triggerRef.current?.blur();
      setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer, true);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
    };
  }, [inlineContent, open]);

  const closeTooltip = () => {
    triggerRef.current?.blur();
    setOpen(false);
  };

  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      aria-label="Hilfe"
      aria-expanded={open}
      onClick={inlineContent ? () => setOpen((prev) => !prev) : undefined}
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
  );

  const content = (
    <>
      <button
        type="button"
        aria-label="Hilfe schließen"
        onClick={closeTooltip}
        className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
      <div className="pr-5">{text}</div>
    </>
  );

  if (inlineContent) {
    return (
      <span ref={rootRef} className="contents">
        {trigger}
        {open && (
          <span
            className={cn(
              "relative block max-w-[min(calc(100vw-1.5rem),20rem)] whitespace-pre-line rounded-sm border-none bg-[#003C56] px-3 py-2.5 text-xs font-normal leading-relaxed text-white shadow-md sm:max-w-sm sm:px-4 sm:py-3 lg:max-w-md lg:px-5 lg:py-4",
              contentClassName,
            )}
          >
            {content}
          </span>
        )}
      </span>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        sideOffset={8}
        className={cn(
          "relative w-auto max-w-[min(calc(100vw-1.5rem),20rem)] whitespace-pre-line rounded-sm border-none bg-[#003C56] px-3 py-2.5 text-xs font-normal leading-relaxed text-white shadow-md sm:max-w-sm sm:px-4 sm:py-3 lg:max-w-md lg:px-5 lg:py-4",
          contentClassName,
        )}
      >
        {content}
      </PopoverContent>
    </Popover>
  );
};
