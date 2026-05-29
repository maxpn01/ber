import type { ReactNode } from "react";

type HeaderProps = {
  title?: ReactNode;
};

export const Header = ({ title }: HeaderProps) => {
  return (
    <header className="no-print w-full border-b border-border bg-background">
      <div className="mx-auto flex max-w-[1350px] items-center justify-between gap-3 px-3 py-4 min-[380px]:px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <a
            href="https://www.wko.at/oe/epu/ein-personen-unternehmen"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WKO Startseite"
            className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <img
              src="/wko_logo.png"
              alt="Wirtschaftskammer Österreich"
              className="h-auto w-[120px] min-[380px]:w-[120px] sm:w-[216px]"
            />
          </a>
          {title}
        </div>
      </div>
    </header>
  );
};
