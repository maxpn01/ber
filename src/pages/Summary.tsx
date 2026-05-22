import { ArrowLeft, Printer } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCalculator } from "@/lib/calculator/CalculatorContext";
import { formatMoney, formatNumber } from "@/lib/format";
import { showsProvision, showsStunden, showsWareneinsatz } from "@/lib/calculator/branche";
import { tStr, type TextKey } from "@/lib/text";
import type { Branche } from "@/lib/calculator/types";

const brancheLabelKey = (b: Branche): TextKey => {
  const map: Record<Branche, TextKey> = {
    dienstleistung: "branche_dienstleistung",
    gastronomie: "branche_gastronomie",
    handel: "branche_handel",
    gewerbe: "branche_gewerbe",
    provision: "branche_provision",
  };
  return map[b];
};

interface Props {
  onBack: () => void;
}

const Summary = ({ onBack }: Props) => {
  const { input, result } = useCalculator();
  const b = input.branche;
  const showWE = showsWareneinsatz(b);
  const showStunden = showsStunden(b);
  const showProv = showsProvision(b);

  if (!result || result.fehlermeldung) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 text-center">
          <h1 className="mb-4 text-2xl font-bold">{tStr("summaryTitle")}</h1>
          <p className="mb-6 text-muted-foreground">Noch keine Berechnung verfügbar.</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {tStr("zurueck")}
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6">
        <div className="no-print mb-4 flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {tStr("zurueck")}
          </Button>
          <Button onClick={() => window.print()} className="bg-wko-red hover:bg-wko-red-dark">
            <Printer className="mr-2 h-4 w-4" />
            {tStr("drucken")}
          </Button>
        </div>

        <h1 className="mb-6 text-2xl font-bold">{tStr("summaryTitle")}</h1>

        <Card className="mb-6 p-6">
          <h2 className="mb-3 text-lg font-semibold">{tStr("stammdaten")}</h2>
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <div>
              <div className="text-muted-foreground">{tStr("nameUnternehmen")}</div>
              <div className="font-medium">{input.nameDesUnternehmens || "—"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">{tStr("gruendungsjahr")}</div>
              <div className="font-medium">{input.gruendungsjahr || "—"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">{tStr("branche")}</div>
              <div className="font-medium">{tStr(brancheLabelKey(b))}</div>
            </div>
          </div>
        </Card>

        <Card className="mb-6 bg-result p-6 text-result-foreground">
          <h2 className="mb-3 text-lg font-semibold">{tStr("potenzialTitle")}</h2>
          <Table>
            <Row label="" cols={[tStr("potenzialInkl"), tStr("breakEven")]} muted />
            <Row
              label={tStr("gesamtumsatzpotenzial")}
              cols={[
                formatMoney(result.potenzial.umsatzpotenzialMitarbeiter.jahr),
                formatMoney(result.potenzial.umsatzpotenzialBreakEven.jahr),
              ]}
            />
            {showStunden && (
              <Row
                label={tStr("gesamtstunden")}
                cols={[
                  formatNumber(result.potenzial.stundenMitarbeiter.jahr),
                  formatNumber(result.potenzial.stundenBreakEven.jahr),
                ]}
              />
            )}
          </Table>
        </Card>

        <Card className="mb-6 bg-result p-6 text-result-foreground">
          <h2 className="mb-3 text-lg font-semibold">{tStr("umsatzInklTitle")}</h2>
          <Table>
            <Row label="" cols={[tStr("monatlich"), tStr("jaehrlich")]} muted />
            {showProv && (
              <Row
                label={tStr("gesamtumsatz")}
                cols={[formatMoney(result.breakEven.gesamtumsatz.monat), formatMoney(result.breakEven.gesamtumsatz.jahr)]}
              />
            )}
            <Row
              label={showProv ? tStr("breakEvenProvisionsumsatz") : tStr("breakEvenUmsatz")}
              cols={[
                formatMoney(result.breakEven.breakEvenUmsatz.monat),
                formatMoney(result.breakEven.breakEvenUmsatz.jahr),
              ]}
              bold
            />
            {showWE && (
              <Row
                label={`− ${tStr("wareneinsatz")}`}
                cols={[formatMoney(result.breakEven.wareneinsatz.monat), formatMoney(result.breakEven.wareneinsatz.jahr)]}
              />
            )}
            <Row
              label={`− ${tStr("aufwand")}`}
              cols={[formatMoney(result.breakEven.aufwand.monat), formatMoney(result.breakEven.aufwand.jahr)]}
            />
            <Row
              label={`− ${tStr("personalkosten")}`}
              cols={[
                formatMoney(result.breakEven.personalkosten.monat),
                formatMoney(result.breakEven.personalkosten.jahr),
              ]}
            />
            {result.breakEven.mitarbeiter.map((m, i) =>
              m.brutto.jahr > 0 ? (
                <div key={i} className="col-span-3 my-2 rounded bg-result-strong p-3 text-xs">
                  <div className="mb-1 font-semibold">{tStr("datenMitarbeiter")} {i + 1}</div>
                  <SubRow label={tStr("bruttoEntgelt")} m={formatMoney(m.brutto.monat)} j={formatMoney(m.brutto.jahr)} />
                  <SubRow
                    label={tStr("bruttoEntgeltInkl")}
                    m={formatMoney(m.bruttoInklLohnnebenkosten.monat)}
                    j={formatMoney(m.bruttoInklLohnnebenkosten.jahr)}
                  />
                  <SubRow
                    label={m.foerderungText}
                    m={formatMoney(m.foerderung.monat)}
                    j={formatMoney(m.foerderung.jahr)}
                  />
                  {showStunden && (
                    <SubRow
                      label={tStr("arbeitsstunden")}
                      m={formatNumber(m.arbeitsstunden.monat)}
                      j={formatNumber(m.arbeitsstunden.jahr)}
                    />
                  )}
                </div>
              ) : null,
            )}
            <Row
              label={`+ ${tStr("foerderungenGesamt")}`}
              cols={[
                formatMoney(result.breakEven.foerderungenGesamt.monat),
                formatMoney(result.breakEven.foerderungenGesamt.jahr),
              ]}
            />
            <Row
              label={`= ${tStr("gewinn")}`}
              cols={[formatMoney(result.breakEven.gewinn.monat), formatMoney(result.breakEven.gewinn.jahr)]}
              bold
            />
          </Table>
        </Card>

        <Card className="mb-6 bg-result p-6 text-result-foreground">
          <h2 className="mb-3 text-lg font-semibold">{tStr("ausgangssituation")}</h2>
          <Table>
            <Row label="" cols={[tStr("monatlich"), tStr("jaehrlich")]} muted />
            <Row
              label={showProv ? tStr("provisionsumsatz") : tStr("umsatz")}
              cols={[formatMoney(result.ausgangssituation.umsatz.monat), formatMoney(result.ausgangssituation.umsatz.jahr)]}
            />
            {showWE && (
              <Row
                label={`− ${tStr("wareneinsatz")}`}
                cols={[
                  formatMoney(result.ausgangssituation.wareneinsatz.monat),
                  formatMoney(result.ausgangssituation.wareneinsatz.jahr),
                ]}
              />
            )}
            <Row
              label={`− ${tStr("aufwand")}`}
              cols={[formatMoney(result.ausgangssituation.aufwand.monat), formatMoney(result.ausgangssituation.aufwand.jahr)]}
            />
            <Row
              label={`= ${tStr("gewinn")}`}
              cols={[formatMoney(result.ausgangssituation.gewinn.monat), formatMoney(result.ausgangssituation.gewinn.jahr)]}
              bold
            />
          </Table>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

const Table = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">{children}</div>
);

const Row = ({
  label,
  cols,
  muted,
  bold,
}: {
  label: string;
  cols: [string, string];
  muted?: boolean;
  bold?: boolean;
}) => (
  <>
    <div className={bold ? "font-semibold" : ""}>{label}</div>
    <div className={`text-right ${muted ? "text-muted-foreground" : ""} ${bold ? "font-semibold" : ""}`}>
      {cols[0]}
    </div>
    <div className={`text-right ${muted ? "text-muted-foreground" : ""} ${bold ? "font-semibold" : ""}`}>
      {cols[1]}
    </div>
  </>
);

const SubRow = ({ label, m, j }: { label: string; m: string; j: string }) => (
  <div className="grid grid-cols-3 gap-2 py-0.5">
    <div className="text-muted-foreground">{label}</div>
    <div className="text-right">{m}</div>
    <div className="text-right">{j}</div>
  </div>
);

export default Summary;
