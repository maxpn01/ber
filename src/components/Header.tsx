export const Header = () => {
  return (
    <header className="no-print w-full border-b border-border bg-background">
      <div className="mx-auto flex max-w-[1350px] items-center justify-between px-4 py-4 sm:px-6">
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
            className="h-auto w-[216px]"
          />
        </a>
      </div>
    </header>
  );
};
