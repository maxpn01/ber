import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { tStr } from "@/lib/text";

const StartPage = () => {
  const nav = useNavigate();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <p className="mb-2 text-sm uppercase tracking-wide text-wko-red">{tStr("startSubtitle")}</p>
        <h1 className="mb-4 text-4xl font-bold sm:text-5xl">{tStr("startTitle")}</h1>
        <p className="mb-8 max-w-xl text-base text-muted-foreground sm:text-lg">
          {tStr("startDescription")}
        </p>
        <p className="mb-8 max-w-xl text-sm text-muted-foreground">
          <strong>{tStr("startHintTitle")}</strong> {tStr("startHint")}
        </p>
        <Button
          size="lg"
          className="rounded-full bg-wko-red uppercase tracking-wide hover:bg-wko-red-dark"
          onClick={() => nav("/rechner")}
        >
          {tStr("startCta")}
        </Button>
      </main>
      <Footer />
    </div>
  );
};

export default StartPage;
