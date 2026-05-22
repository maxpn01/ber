import { Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { WkoLogo } from "./WkoLogo";

export const Header = () => {
  const { lang, setLang, tStr } = useI18n();
  return (
    <header className="no-print w-full border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" aria-label="WKO Home">
          <WkoLogo />
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLang(lang === "de" ? "en" : "de")}
            className="gap-1"
            aria-label={tStr("languageLabel")}
          >
            <Globe className="h-4 w-4" />
            <span className="font-medium uppercase">{lang}</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
