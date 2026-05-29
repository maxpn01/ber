import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AppHelpDialog, AppHelpDialogSlot } from "@/components/AppHelpDialog";
import { AllgemeinCard } from "@/components/calculator/AllgemeinCard";
import { MitarbeiterCard } from "@/components/calculator/MitarbeiterCard";
import { SubsidyCard } from "@/components/calculator/SubsidyCard";
import { ResultPanel } from "@/components/calculator/ResultPanel";
import { tStr } from "@/lib/text";
import { useIsMobile } from "@/hooks/use-mobile";

const Calculator = () => {
  const [helpOpen, setHelpOpen] = useState(false);
  const isMobile = useIsMobile();

  const title = (
    <h1 className="flex items-center gap-2 text-sm font-medium min-[640px]:mb-8 min-[640px]:text-lg">
      {tStr("appTitle")}
      <AppHelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </h1>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header title={isMobile ? title : undefined} />
      <main className="mx-auto w-full max-w-[1350px] flex-1 px-3 py-3 min-[380px]:px-4 sm:px-6">
        {!isMobile && title}
        <AppHelpDialogSlot />

        {!helpOpen && (
          <div className="rounded-xl bg-wko-section p-3 min-[380px]:p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <AllgemeinCard />
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
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Calculator;
