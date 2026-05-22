import { ChevronRight, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCalculator } from "@/lib/calculator/CalculatorContext";
import { formatMoney, formatNumber } from "@/lib/format";
import { showsProvision, showsStunden, showsWareneinsatz } from "@/lib/calculator/branche";
import { HelpIcon } from "@/components/HelpIcon";
import { tStr } from "@/lib/text";
import { cn } from "@/lib/utils";

interface Props {
  onShowSummary: () => void;
}

export const ResultPanel = ({ onShowSummary }: Props) => {
  const { input, result, activeMitarbeiterCount } = useCalculator();
  const [detailsOpen, setDetailsOpen] = useState(false);

  const b = input.branche;
  const showWE = showsWareneinsatz(b);
  const showStunden = showsStunden(b);
  const showProv = showsProvision(b);

  const empty = !result || !!result.fehlermeldung;

  return (
    <div className="rounded-lg bg-result p-6 text-result-foreground">
      {/* POTENZIAL */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-base font-semibold">
            {tStr("potenzialTitle")}
            <HelpIcon text={tStr("potenzialTitle")} />
          </h3>
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3].map((i) => (
              <User
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < activeMitarbeiterCount ? "text-wko-red fill-wko-red" : "text-muted-foreground/50",
                )}
                aria-hidden
              />
            ))}
          </div>
        </div>
        <div className="border-t border-dashed border-result-foreground/20 pt-3" />
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div />
          <div className="text-right text-muted-foreground">
            {tStr("potenzialInkl")}
          </div>
          <div className="text-right text-muted-foreground">{tStr("breakEven")}</div>

          <div>{tStr("gesamtumsatzpotenzial")}</div>
          <div className="text-right">{empty ? "—" : formatMoney(result!.potenzial.umsatzpotenzialMitarbeiter.jahr)}</div>
          <div className="text-right">{empty ? "—" : formatMoney(result!.potenzial.umsatzpotenzialBreakEven.jahr)}</div>

          {showStunden && (
            <>
              <div>{tStr("gesamtstunden")}</div>
              <div className="text-right">{empty ? "—" : formatNumber(result!.potenzial.stundenMitarbeiter.jahr)}</div>
              <div className="text-right">{empty ? "—" : formatNumber(result!.potenzial.stundenBreakEven.jahr)}</div>
            </>
          )}
        </div>
      </div>

      {/* UMSATZ INKL */}
      <div className="mb-6">
        <h3 className="mb-3 text-base font-semibold">{tStr("umsatzInklTitle")}</h3>
        <div className="border-t border-dashed border-result-foreground/20 pt-3" />
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div />
          <div className="text-right text-muted-foreground">{tStr("monatlich")}</div>
          <div className="flex items-center justify-end gap-1 text-muted-foreground">
            {tStr("jaehrlich")} <HelpIcon text={tStr("jaehrlich")} />
          </div>

          {showProv && (
            <>
              <div>{tStr("gesamtumsatz")}</div>
              <div className="text-right">{empty ? "—" : formatMoney(result!.breakEven.gesamtumsatz.monat)}</div>
              <div className="text-right">{empty ? "—" : formatMoney(result!.breakEven.gesamtumsatz.jahr)}</div>
            </>
          )}

          <div className="font-medium">
            {showProv ? tStr("breakEvenProvisionsumsatz") : tStr("breakEvenUmsatz")}
          </div>
          <div className="text-right">{empty ? "—" : formatMoney(result!.breakEven.breakEvenUmsatz.monat)}</div>
          <div className="text-right">{empty ? "—" : formatMoney(result!.breakEven.breakEvenUmsatz.jahr)}</div>

          {showWE && (
            <>
              <div>− {tStr("wareneinsatz")}</div>
              <div className="text-right">{empty ? "—" : formatMoney(result!.breakEven.wareneinsatz.monat)}</div>
              <div className="text-right">{empty ? "—" : formatMoney(result!.breakEven.wareneinsatz.jahr)}</div>
            </>
          )}

          <div>− {tStr("aufwand")}</div>
          <div className="text-right">{empty ? "—" : formatMoney(result!.breakEven.aufwand.monat)}</div>
          <div className="text-right">{empty ? "—" : formatMoney(result!.breakEven.aufwand.jahr)}</div>

          <div className="flex items-center gap-1">
            − {tStr("personalkosten")}
            <button
              type="button"
              onClick={() => setDetailsOpen((p) => !p)}
              className="inline-flex items-center text-xs underline-offset-2 hover:underline"
            >
              <ChevronRight className={cn("h-3 w-3 transition-transform", detailsOpen && "rotate-90")} />
              {tStr("details")}
            </button>
          </div>
          <div className="text-right">{empty ? "—" : formatMoney(result!.breakEven.personalkosten.monat)}</div>
          <div className="text-right">{empty ? "—" : formatMoney(result!.breakEven.personalkosten.jahr)}</div>

          {detailsOpen && !empty && (
            <div className="col-span-3 my-2 space-y-3 rounded-md bg-result-strong p-3">
              {result!.breakEven.mitarbeiter.map((m, i) => {
                if (m.brutto.jahr === 0) return null;
                return (
                  <div key={i} className="text-xs">
                    <div className="mb-1 font-semibold">
                      {tStr("datenMitarbeiter")} {i + 1}
                    </div>
                    <DetailRow label={tStr("bruttoEntgelt")} m={m.brutto.monat} j={m.brutto.jahr} />
                    <DetailRow
                      label={tStr("bruttoEntgeltInkl")}
                      m={m.bruttoInklLohnnebenkosten.monat}
                      j={m.bruttoInklLohnnebenkosten.jahr}
                    />
                    <DetailRow label={m.foerderungText} m={m.foerderung.monat} j={m.foerderung.jahr} />
                    {showStunden && (
                      <DetailRow
                        label={tStr("arbeitsstunden")}
                        m={m.arbeitsstunden.monat}
                        j={m.arbeitsstunden.jahr}
                        money={false}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div>+ {tStr("foerderungenGesamt")}</div>
          <div className="text-right">{empty ? "—" : formatMoney(result!.breakEven.foerderungenGesamt.monat)}</div>
          <div className="text-right">{empty ? "—" : formatMoney(result!.breakEven.foerderungenGesamt.jahr)}</div>

          <div className="font-semibold">= {tStr("gewinn")}</div>
          <div className="text-right font-semibold">{empty ? "—" : formatMoney(result!.breakEven.gewinn.monat)}</div>
          <div className="text-right font-semibold">{empty ? "—" : formatMoney(result!.breakEven.gewinn.jahr)}</div>
        </div>
      </div>

      {/* AUSGANGSSITUATION */}
      <div className="mb-6">
        <h3 className="mb-3 text-base font-semibold">{tStr("ausgangssituation")}</h3>
        <div className="border-t border-dashed border-result-foreground/20 pt-3" />
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div />
          <div className="text-right text-muted-foreground">{tStr("monatlich")}</div>
          <div className="text-right text-muted-foreground">{tStr("jaehrlich")}</div>

          <div>{showProv ? tStr("provisionsumsatz") : tStr("umsatz")}</div>
          <div className="text-right">{empty ? "—" : formatMoney(result!.ausgangssituation.umsatz.monat)}</div>
          <div className="text-right">{empty ? "—" : formatMoney(result!.ausgangssituation.umsatz.jahr)}</div>

          {showWE && (
            <>
              <div>− {tStr("wareneinsatz")}</div>
              <div className="text-right">{empty ? "—" : formatMoney(result!.ausgangssituation.wareneinsatz.monat)}</div>
              <div className="text-right">{empty ? "—" : formatMoney(result!.ausgangssituation.wareneinsatz.jahr)}</div>
            </>
          )}

          <div>− {tStr("aufwand")}</div>
          <div className="text-right">{empty ? "—" : formatMoney(result!.ausgangssituation.aufwand.monat)}</div>
          <div className="text-right">{empty ? "—" : formatMoney(result!.ausgangssituation.aufwand.jahr)}</div>

          <div className="font-semibold">= {tStr("gewinn")}</div>
          <div className="text-right font-semibold">{empty ? "—" : formatMoney(result!.ausgangssituation.gewinn.monat)}</div>
          <div className="text-right font-semibold">{empty ? "—" : formatMoney(result!.ausgangssituation.gewinn.jahr)}</div>
        </div>
      </div>

      <Button
        onClick={onShowSummary}
        variant="outline"
        className="rounded-full border-foreground/30 bg-transparent"
        disabled={empty}
      >
        {tStr("zusammenfassung")}
      </Button>
    </div>
  );
};

const DetailRow = ({
  label,
  m,
  j,
  money = true,
}: {
  label: string;
  m: number;
  j: number;
  money?: boolean;
}) => (
  <div className="grid grid-cols-3 gap-2 py-0.5">
    <div className="text-muted-foreground">{label}</div>
    <div className="text-right">{money ? formatMoney(m) : formatNumber(m)}</div>
    <div className="text-right">{money ? formatMoney(j) : formatNumber(j)}</div>
  </div>
);
