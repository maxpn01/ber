import { tStr } from "@/lib/text";

export const Footer = () => {
  return (
    <footer className="no-print mt-12 border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-end gap-2 px-4 py-4 text-sm text-muted-foreground sm:flex-row sm:gap-4 sm:px-6">
        <a
          href="https://www.wko.at/service/Offenlegung_Oesterreich.html"
          className="hover:text-foreground"
        >
          {tStr("offenlegung")}
        </a>
        <span className="hidden sm:inline">|</span>
        <a
          href="https://www.wko.at/service/barrierefreiheitserklaerung-breakevenrechner.html"
          className="hover:text-foreground"
        >
          {tStr("barrierefreiheit")}
        </a>
        <span className="hidden sm:inline">|</span>
        <a href="https://wko.at/dse" className="hover:text-foreground">
          {tStr("datenschutz")}
        </a>
        <span className="hidden sm:inline">|</span>
        <a href="#" id="edit-cookiesettings" className="hover:text-foreground">
          {tStr("cookies")}
        </a>
        <span className="hidden sm:inline">|</span>
        <span>© 2026 WKO</span>
      </div>
    </footer>
  );
};
