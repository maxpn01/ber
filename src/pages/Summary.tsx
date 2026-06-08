import { useEffect, useState } from "react";
import { ArrowLeft, Printer, X } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCalculator } from "@/lib/calculator/CalculatorContext";
import { formatMoney, formatNumber } from "@/lib/format";
import {
  showsProvision,
  showsStunden,
  showsWareneinsatz,
} from "@/lib/calculator/branche";
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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const b = input.branche;
  const showWE = showsWareneinsatz(b);
  const showStunden = showsStunden(b);
  const showProv = showsProvision(b);
  const personnelDetails =
    !result || result.fehlermeldung
      ? []
      : result.breakEven.mitarbeiter
          .map((mitarbeiter, index) => ({ mitarbeiter, index }))
          .filter(({ mitarbeiter }) => mitarbeiter.brutto.jahr > 0);
  const hasPersonnelDetails = personnelDetails.length > 0;

  useEffect(() => {
    if (!hasPersonnelDetails) {
      setDetailsOpen(false);
    }
  }, [hasPersonnelDetails]);

  if (!result || result.fehlermeldung) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 text-center">
          <h1 className="mb-4 text-2xl font-bold">{tStr("summaryTitle")}</h1>
          <p className="mb-6 text-muted-foreground">
            Noch keine Berechnung verfügbar.
          </p>
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
      <main className="mx-auto w-full max-w-4xl flex-1 px-3 py-6 min-[380px]:px-4 sm:px-6">
        <div className="no-print mb-4 flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {tStr("zurueck")}
          </Button>
          <Button
            onClick={() => window.print()}
            className="bg-wko-red hover:bg-wko-red-dark"
          >
            <Printer className="mr-2 h-4 w-4" />
            {tStr("drucken")}
          </Button>
        </div>

        <h1 className="mb-6 text-2xl font-bold">{tStr("summaryTitle")}</h1>

        <Card className="mb-6 p-4 sm:p-6">
          <h2 className="mb-3 text-lg font-semibold">{tStr("stammdaten")}</h2>
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <div>
              <div className="text-muted-foreground">
                {tStr("nameUnternehmen")}
              </div>
              <div className="font-medium">
                {input.nameDesUnternehmens || "—"}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">
                {tStr("gruendungsjahr")}
              </div>
              <div className="font-medium">{input.gruendungsjahr || "—"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">{tStr("branche")}</div>
              <div className="font-medium">{tStr(brancheLabelKey(b))}</div>
            </div>
          </div>
        </Card>

        <Card className="mb-6 bg-result p-4 text-result-foreground sm:p-6">
          <h2 className="mb-3 text-lg font-semibold">
            {tStr("potenzialTitle")}
          </h2>
          <Table>
            <Row
              label=""
              cols={[tStr("potenzialInkl"), tStr("breakEven")]}
              muted
            />
            <Row
              label={<GesamtumsatzpotenzialLabel />}
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

        <Card className="mb-6 bg-result p-4 text-result-foreground sm:p-6">
          <h2 className="mb-3 text-lg font-semibold">
            {tStr("umsatzInklTitle")}
          </h2>
          <Table>
            <Row label="" cols={[tStr("monatlich"), tStr("jaehrlich")]} muted />
            {showProv && (
              <Row
                label={tStr("gesamtumsatz")}
                cols={[
                  formatMoney(result.breakEven.gesamtumsatz.monat),
                  formatMoney(result.breakEven.gesamtumsatz.jahr),
                ]}
              />
            )}
            <Row
              label={
                showProv
                  ? tStr("breakEvenProvisionsumsatz")
                  : tStr("breakEvenUmsatz")
              }
              cols={[
                formatMoney(result.breakEven.breakEvenUmsatz.monat),
                formatMoney(result.breakEven.breakEvenUmsatz.jahr),
              ]}
              bold
            />
            {showWE && (
              <Row
                label={`− ${tStr("wareneinsatz")}`}
                cols={[
                  formatMoney(result.breakEven.wareneinsatz.monat),
                  formatMoney(result.breakEven.wareneinsatz.jahr),
                ]}
              />
            )}
            <Row
              label={`− ${tStr("aufwand")}`}
              cols={[
                formatMoney(result.breakEven.aufwand.monat),
                formatMoney(result.breakEven.aufwand.jahr),
              ]}
            />
            <Row
              label={
                <span className="flex items-center gap-1">
                  − {tStr("personalkosten")}
                  {hasPersonnelDetails && (
                    <button
                      type="button"
                      onClick={() => setDetailsOpen((p) => !p)}
                      className="inline-flex items-center text-[10px] font-medium underline underline-offset-2"
                      aria-expanded={detailsOpen}
                    >
                      ➔ {tStr("details")}
                    </button>
                  )}
                </span>
              }
              cols={[
                formatMoney(result.breakEven.personalkosten.monat),
                formatMoney(result.breakEven.personalkosten.jahr),
              ]}
            />
            {detailsOpen && hasPersonnelDetails && (
              <div className="col-span-full my-2 overflow-hidden rounded bg-white text-xs">
                <div className="space-y-4 py-2">
                  {personnelDetails.map(
                    ({ mitarbeiter: m, index }, detailIndex) => {
                      const rows = [
                        {
                          label: tStr("bruttoEntgelt"),
                          m: formatMoney(m.brutto.monat),
                          j: formatMoney(m.brutto.jahr),
                        },
                        {
                          label: tStr("bruttoEntgeltInkl"),
                          m: formatMoney(m.bruttoInklLohnnebenkosten.monat),
                          j: formatMoney(m.bruttoInklLohnnebenkosten.jahr),
                        },
                        {
                          label: m.foerderungText,
                          m: formatMoney(m.foerderung.monat),
                          j: formatMoney(m.foerderung.jahr),
                        },
                        ...(showStunden
                          ? [
                              {
                                label: tStr("arbeitsstunden"),
                                m: formatNumber(m.arbeitsstunden.monat),
                                j: formatNumber(m.arbeitsstunden.jahr),
                              },
                            ]
                          : []),
                      ];

                      return (
                        <div key={index}>
                          <div className="flex min-h-8 items-center justify-between px-2 font-semibold">
                            <span>
                              {tStr("mitarbeiter")} {index + 1}
                            </span>
                            {detailIndex === 0 && (
                              <button
                                type="button"
                                onClick={() => setDetailsOpen(false)}
                                className="inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-result-foreground text-result-foreground"
                                aria-label={tStr("detailsAusblenden")}
                              >
                                <X className="h-3 w-3" aria-hidden />
                              </button>
                            )}
                          </div>
                          {rows.map((row, rowIndex) => (
                            <SubRow
                              key={row.label}
                              label={row.label}
                              m={row.m}
                              j={row.j}
                              shaded={rowIndex % 2 === 0}
                            />
                          ))}
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
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
              cols={[
                formatMoney(result.breakEven.gewinn.monat),
                formatMoney(result.breakEven.gewinn.jahr),
              ]}
              bold
            />
          </Table>
        </Card>

        <Card className="mb-6 bg-result p-4 text-result-foreground sm:p-6">
          <h2 className="mb-3 text-lg font-semibold">
            {tStr("ausgangssituation")}
          </h2>
          <Table>
            <Row label="" cols={[tStr("monatlich"), tStr("jaehrlich")]} muted />
            <Row
              label={showProv ? tStr("provisionsumsatz") : tStr("umsatz")}
              cols={[
                formatMoney(result.ausgangssituation.umsatz.monat),
                formatMoney(result.ausgangssituation.umsatz.jahr),
              ]}
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
              cols={[
                formatMoney(result.ausgangssituation.aufwand.monat),
                formatMoney(result.ausgangssituation.aufwand.jahr),
              ]}
            />
            <Row
              label={`= ${tStr("gewinn")}`}
              cols={[
                formatMoney(result.ausgangssituation.gewinn.monat),
                formatMoney(result.ausgangssituation.gewinn.jahr),
              ]}
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
  <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm min-[430px]:grid-cols-[minmax(0,1fr)_132px_96px] sm:grid-cols-3 sm:gap-x-4">
    {children}
  </div>
);

const GesamtumsatzpotenzialLabel = () => (
  <span>Gesamtumsatz{"\u00ad"}potenzial</span>
);

const Row = ({
  label,
  cols,
  muted,
  bold,
}: {
  label: React.ReactNode;
  cols: [string, string];
  muted?: boolean;
  bold?: boolean;
}) => {
  const headerOnly = muted && label === "";

  return (
    <>
      <div
        className={`${headerOnly ? "hidden min-[430px]:block" : "col-span-2 min-[430px]:col-span-1"} min-w-0 ${bold ? "font-semibold" : ""}`}
      >
        {label}
      </div>
      <div
        className={`whitespace-nowrap text-right tabular-nums ${muted ? "text-muted-foreground" : ""} ${bold ? "font-semibold" : ""}`}
      >
        {cols[0]}
      </div>
      <div
        className={`whitespace-nowrap text-right tabular-nums ${muted ? "text-muted-foreground" : ""} ${bold ? "font-semibold" : ""}`}
      >
        {cols[1]}
      </div>
    </>
  );
};

const SubRow = ({
  label,
  m,
  j,
  shaded = false,
}: {
  label: string;
  m: string;
  j: string;
  shaded?: boolean;
}) => (
  <div
    className={`grid grid-cols-2 gap-x-2 gap-y-1 px-2 py-1.5 min-[430px]:grid-cols-3 ${shaded ? "bg-[#EFEFEF]" : ""}`}
  >
    <div className="col-span-2 min-w-0 text-result-foreground/80 min-[430px]:col-span-1">
      {label}
    </div>
    <div className="whitespace-nowrap text-right tabular-nums">{m}</div>
    <div className="whitespace-nowrap text-right tabular-nums">{j}</div>
  </div>
);

export default Summary;
