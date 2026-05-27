import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HelpIcon } from "@/components/HelpIcon";
import { AllgemeinCard } from "@/components/calculator/AllgemeinCard";
import { ErzielbarerGewinnSlider } from "@/components/calculator/ErzielbarerGewinnSlider";
import { MitarbeiterCard } from "@/components/calculator/MitarbeiterCard";
import { SubsidyCard } from "@/components/calculator/SubsidyCard";
import { ResultPanel } from "@/components/calculator/ResultPanel";
import { tStr } from "@/lib/text";

const Calculator = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-[1300px] flex-1 px-4 py-3 sm:px-6">
        <h1 className="mb-10 flex items-center gap-2 text-xl font-medium">
          {tStr("appTitle")}
          <HelpIcon
            text={tStr("appShortDesc")}
            iconSrc="/title_tooltip_icon.svg"
          />
        </h1>

        <div className="rounded-xl bg-wko-section p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <AllgemeinCard />
              <ErzielbarerGewinnSlider />
              <MitarbeiterCard index={0} />
              <MitarbeiterCard index={1} />
              <MitarbeiterCard index={2} />
              <MitarbeiterCard index={3} />
              <SubsidyCard kind="epu" />
              {/* INTENTIONALLY HIDDEN IN THE ORIGINAL CODE */}
              {/* <SubsidyCard kind="bonus" />
              <SubsidyCard kind="startup" /> */}
            </div>
            <div className="h-full lg:sticky lg:top-6 lg:self-stretch">
              <ResultPanel />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Calculator;
