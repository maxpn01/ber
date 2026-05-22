import { Link } from "react-router-dom";
import { WkoLogo } from "./WkoLogo";

export const Header = () => {
  return (
    <header className="no-print w-full border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" aria-label="WKO Startseite">
          <WkoLogo />
        </Link>
      </div>
    </header>
  );
};
