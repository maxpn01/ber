import { tStr } from "@/lib/text";

const footerLinkClass =
  "rounded-sm text-[#212121] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export const Footer = () => {
  return (
    <footer className="no-print mt-12 bg-wko-section">
      <div className="mx-auto flex max-w-[1200px] flex-row flex-wrap items-center justify-end gap-x-1.5 gap-y-1 px-4 py-4 text-right text-xs leading-relaxed text-muted-foreground sm:gap-x-2 sm:px-6">
        <a
          href="https://www.wko.at/barrierefreiheitserklaerung-breakevenrechner"
          className={footerLinkClass}
          target="_blank"
          rel="noopener noreferrer"
        >
          {tStr("barrierefreiheit")}
        </a>
        <span>|</span>
        <a
          href="https://www.wko.at/datenschutzerklaerung"
          className={footerLinkClass}
          target="_blank"
          rel="noopener noreferrer"
        >
          {tStr("datenschutz")}
        </a>
        <span>|</span>
        <a
          href="#"
          id="edit-cookiesettings"
          className={footerLinkClass}
          onClick={(event) => event.preventDefault()}
        >
          {tStr("cookies")}
        </a>
        <span>|</span>
        <span className="text-[#212121]">© 2026 WKO</span>
      </div>
    </footer>
  );
};
