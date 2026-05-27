import {
  Dialog,
  DialogContent,
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

export const AppHelpDialog = () => {
  return (
    <Dialog modal={false}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Allgemeine Hilfe öffnen"
          className="mt-1 inline-flex h-[26px] w-[26px] items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <img src="/title_tooltip_icon.svg" alt="" className="h-full w-full" />
        </button>
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        overlayClassName="pointer-events-none bg-transparent data-[state=open]:!animate-none data-[state=closed]:!animate-none"
        className="!absolute left-1/2 top-[8.5rem] w-[calc(100vw-2rem)] max-w-[1252px] translate-y-0 gap-0 rounded-lg border-none bg-[#003C56] px-8 py-9 text-white shadow-none data-[state=closed]:!animate-none data-[state=open]:!animate-none sm:w-[calc(100vw-3rem)] sm:px-11 [&>button]:right-8 [&>button]:top-7 [&>button]:rounded-full [&>button]:bg-white/15 [&>button]:p-1.5 [&>button]:text-white [&>button]:opacity-100 [&>button]:ring-offset-[#003C56] [&>button]:hover:bg-white/25 [&>button_svg]:h-5 [&>button_svg]:w-5"
      >
        <DialogTitle className="mb-7 pr-12 text-xl font-medium leading-none tracking-normal text-white">
          {tStr("appHelpTitle")}
        </DialogTitle>
        <div className="space-y-7 pr-2 text-xs leading-[1.45] text-white/90">
          {text.appHelpSections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="text-xs font-bold leading-none text-white">
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
      </DialogContent>
    </Dialog>
  );
};

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
