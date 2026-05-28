import { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { text, tStr } from "@/lib/text";

const accentedPrefixes = [
  "Angestellte:",
  "Arbeiter:",
  "Geringfügiges Dienstverhältnis:",
  "Freier Dienstvertrag:",
];

const appHelpDialogSlotId = "app-help-dialog-slot";

type AppHelpDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const AppHelpDialog = ({ open, onOpenChange }: AppHelpDialogProps) => {
  const [dialogSlot, setDialogSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setDialogSlot(document.getElementById(appHelpDialogSlotId));
  }, []);

  return (
    <Dialog modal={false} open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Allgemeine Hilfe öffnen"
          className="mt-1 inline-flex h-[26px] w-[26px] items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <img src="/title_tooltip_icon.svg" alt="" className="h-full w-full" />
        </button>
      </DialogTrigger>
      {dialogSlot
        ? createPortal(
            <DialogPrimitive.Content
              aria-describedby={undefined}
              className="relative mb-10 grid w-full gap-5 rounded-lg border-none bg-[#003C56] px-8 py-9 text-white shadow-none outline-none sm:px-11"
            >
              <DialogTitle className="mb-7 pr-12 text-xl font-medium leading-none tracking-normal text-white">
                {tStr("appHelpTitle")}
              </DialogTitle>
              <DialogClose className="absolute right-8 top-7 rounded-full bg-white/15 p-1.5 text-white opacity-100 ring-offset-[#003C56] transition-colors hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </DialogClose>
              <div className="space-y-9 pr-2 text-sm leading-[1.45] text-white/90">
                {text.appHelpSections.map((section) => (
                  <section key={section.title} className="space-y-3">
                    <h2 className="font-medium leading-none text-white">
                      {section.title}
                    </h2>
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="whitespace-pre-line">
                        <AccentedParagraphText text={paragraph} />
                      </p>
                    ))}
                  </section>
                ))}
              </div>
            </DialogPrimitive.Content>,
            dialogSlot,
          )
        : null}
    </Dialog>
  );
};

export const AppHelpDialogSlot = () => <div id={appHelpDialogSlotId} />;

const AccentedParagraphText = ({ text }: { text: string }) => {
  const prefix = accentedPrefixes.find((item) => text.startsWith(item));

  if (!prefix) {
    return <>{text}</>;
  }

  return (
    <>
      <strong className="font-bold text-white">{prefix}</strong>
      {text.slice(prefix.length)}
    </>
  );
};
