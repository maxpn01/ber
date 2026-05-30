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
    <h1 className="flex items-center gap-2 text-[17px] font-medium sm:text-[24px] min-[640px]:mb-8">
      {tStr("appTitle")}
      <AppHelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </h1>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header title={isMobile ? title : undefined} />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-3 py-3 min-[380px]:px-4 sm:px-6">
        {!isMobile && title}
        <AppHelpDialogSlot />

        {!helpOpen && (
          <>
            <div className="rounded-xl bg-wko-section p-2 sm:p-4">
              <div className="grid grid-cols-1 gap-5 sm:gap-6 min-[1120px]:grid-cols-2">
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
                {!isMobile && (
                  <div className="h-full min-[1120px]:sticky min-[1120px]:top-6 min-[1120px]:self-stretch">
                    <ResultPanel />
                  </div>
                )}
              </div>
            </div>
            {isMobile && (
              <div className="mt-4">
                <ResultPanel />
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Calculator;
