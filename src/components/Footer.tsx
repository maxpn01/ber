import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { tStr } from "@/lib/text";

const footerLinkClass =
  "rounded-sm text-[#212121] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export const Footer = () => {
  const [cookieSettingsOpen, setCookieSettingsOpen] = useState(false);

  return (
    <footer className="no-print mt-12 bg-wko-section">
      <div className="mx-auto flex max-w-[1300px] flex-col items-center justify-end gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:gap-2 sm:px-6">
        <a
          href="https://www.wko.at/offenlegung-oesterreich"
          className={footerLinkClass}
          target="_blank"
          rel="noopener noreferrer"
        >
          {tStr("offenlegung")}
        </a>
        <span className="hidden sm:inline">|</span>
        <a
          href="https://www.wko.at/barrierefreiheitserklaerung-breakevenrechner"
          className={footerLinkClass}
          target="_blank"
          rel="noopener noreferrer"
        >
          {tStr("barrierefreiheit")}
        </a>
        <span className="hidden sm:inline">|</span>
        <a
          href="https://www.wko.at/datenschutzerklaerung"
          className={footerLinkClass}
          target="_blank"
          rel="noopener noreferrer"
        >
          {tStr("datenschutz")}
        </a>
        <span className="hidden sm:inline">|</span>
        <button
          type="button"
          id="edit-cookiesettings"
          className={footerLinkClass}
          onClick={() => setCookieSettingsOpen(true)}
        >
          {tStr("cookies")}
        </button>
        <span className="hidden sm:inline">|</span>
        <span className="text-[#212121]">© 2026 WKO</span>
      </div>
      <Dialog open={cookieSettingsOpen} onOpenChange={setCookieSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tStr("cookieModalTitle")}</DialogTitle>
            <DialogDescription>
              {tStr("cookieModalDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
            {tStr("cookieModalRequired")}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCookieSettingsOpen(false)}
            >
              {tStr("cookieModalSave")}
            </Button>
            <Button onClick={() => setCookieSettingsOpen(false)}>
              {tStr("cookieModalAccept")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </footer>
  );
};
