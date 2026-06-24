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
import { publicAssetUrl } from "@/lib/basePath";
import { text, tStr } from "@/lib/text";

const accentedPrefixes = [
  "Angestellte:r:",
  "Arbeiter:in:",
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
          className="inline-flex h-[14px] w-[14px] items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:mt-1 sm:h-[16px] sm:w-[16px]"
        >
          <img
            src={publicAssetUrl("/tooltip_icon.svg")}
            alt=""
            className="h-full w-full"
          />
        </button>
      </DialogTrigger>
      {dialogSlot
        ? createPortal(
            <DialogPrimitive.Content
              aria-describedby={undefined}
              className="relative mx-auto mb-8 grid w-full max-w-[min(100%,32rem)] gap-5 overflow-hidden rounded-lg border-none bg-[#003C56] px-4 py-5 text-white shadow-none outline-none sm:mb-10 sm:max-w-none sm:px-11 sm:py-9"
            >
              <DialogTitle className="mb-4 pr-8 text-[17px] font-medium leading-snug tracking-normal text-white sm:mb-7 sm:pr-12 sm:text-[22px] sm:leading-none">
                {tStr("appHelpTitle")}
              </DialogTitle>
              <DialogClose className="absolute right-4 top-5 rounded-full bg-white/15 p-1 text-white opacity-100 ring-offset-[#003C56] transition-colors hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:right-8 sm:top-7 sm:p-1.5">
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Close</span>
              </DialogClose>
              <div className="min-w-0 space-y-7 text-[16px] leading-[24px] text-white/90 [overflow-wrap:anywhere] sm:space-y-9 sm:pr-2">
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
