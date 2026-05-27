import { useState } from "react";
import type { ReactNode } from "react";
import { HelpIcon } from "@/components/HelpIcon";
import { EmployeeIcon } from "@/components/icons/EmployeeIcon";
import {
  showsProvision,
  showsStunden,
  showsWareneinsatz,
} from "@/lib/calculator/branche";
import { useCalculator } from "@/lib/calculator/CalculatorContext";
import { formatMoney, formatNumber } from "@/lib/format";
import { tStr } from "@/lib/text";
import { cn } from "@/lib/utils";

export const ResultPanel = () => {
  const { input, result, activeMitarbeiterCount, hasCalculatedOnce } =
    useCalculator();
  const [detailsOpen, setDetailsOpen] = useState(false);

  const b = input.branche;
  const showWE = showsWareneinsatz(b);
  const showStunden = showsStunden(b);
  const showProv = showsProvision(b);

  const empty = !result || !!result.fehlermeldung;
  const emptyValue = "-";

  if (!hasCalculatedOnce && !result) {
    return (
      <div className="h-full min-h-[520px] rounded-lg bg-result p-4 text-result-foreground">
        <div className="rounded bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-start justify-between gap-3">
            <h3 className="text-[18px] font-semibold leading-snug">
              {tStr("landingInfoTitle")}
            </h3>
            <EmployeeIcons
              activeCount={activeMitarbeiterCount}
              activeClassName="text-foreground fill-foreground"
            />
          </div>
          <div className="mb-4 border-t border-dashed border-result-foreground/20 pt-3" />
          <div className="space-y-4 text-[16px] leading-relaxed text-wko-gray-dark">
            <p>{tStr("landingInfoIntro")}</p>
            <div>
              <p>{tStr("landingInfoNoticeTitle")}</p>
              <p>{tStr("landingInfoNotice")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full rounded-lg bg-result px-4 py-6 text-result-foreground sm:px-8">
      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h3 className="flex items-center gap-1.5 text-lg font-medium leading-tight xl:whitespace-nowrap">
            {tStr("potenzialTitle")}
            <HelpIcon text={tStr("potenzialHelp")} />
          </h3>
          <EmployeeIcons
            activeCount={activeMitarbeiterCount}
            activeClassName="text-foreground fill-foreground"
          />
        </div>
        <SectionDivider />
        <ResultRows>
          <ResultHeaderRow
            columns={[
              "",
              <span className="inline-flex items-center justify-end gap-1">
                {tStr("potenzialInkl")}
                <HelpIcon
                  text={tStr("potenzialHelp")}
                  className="h-4 w-4 shrink-0"
                />
              </span>,
              tStr("breakEven"),
            ]}
          />
          <ResultDataRow
            label={tStr("gesamtumsatzpotenzial")}
            values={[
              empty
                ? emptyValue
                : formatMoney(
                    result!.potenzial.umsatzpotenzialMitarbeiter.jahr,
                  ),
              empty
                ? emptyValue
                : formatMoney(result!.potenzial.umsatzpotenzialBreakEven.jahr),
            ]}
            medium
          />
          {showStunden && (
            <ResultDataRow
              label={tStr("gesamtstunden")}
              values={[
                empty
                  ? emptyValue
                  : formatNumber(result!.potenzial.stundenMitarbeiter.jahr),
                empty
                  ? emptyValue
                  : formatNumber(result!.potenzial.stundenBreakEven.jahr),
              ]}
            />
          )}
        </ResultRows>
      </section>

      <section className="mb-8">
        <h3 className="mb-3 text-lg font-medium leading-tight">
          {tStr("umsatzInklTitle")}
        </h3>
        <SectionDivider />
        <ResultRows>
          <ResultHeaderRow
            columns={[
              "",
              tStr("monatlich"),
              <span className="inline-flex items-center justify-end gap-1">
                {tStr("jaehrlich")}
                <HelpIcon
                  text={tStr("jaehrlich")}
                  className="h-4 w-4 shrink-0"
                />
              </span>,
            ]}
          />
          {showProv && (
            <ResultDataRow
              label={tStr("gesamtumsatz")}
              values={[
                empty
                  ? emptyValue
                  : formatMoney(result!.breakEven.gesamtumsatz.monat),
                empty
                  ? emptyValue
                  : formatMoney(result!.breakEven.gesamtumsatz.jahr),
              ]}
            />
          )}
          <ResultDataRow
            label={
              showProv
                ? tStr("breakEvenProvisionsumsatz")
                : tStr("breakEvenUmsatz")
            }
            values={[
              empty
                ? emptyValue
                : formatMoney(result!.breakEven.breakEvenUmsatz.monat),
              empty
                ? emptyValue
                : formatMoney(result!.breakEven.breakEvenUmsatz.jahr),
            ]}
            medium
          />
          {showWE && (
            <ResultDataRow
              label={`- ${tStr("wareneinsatz")}`}
              values={[
                empty
                  ? emptyValue
                  : formatMoney(result!.breakEven.wareneinsatz.monat),
                empty
                  ? emptyValue
                  : formatMoney(result!.breakEven.wareneinsatz.jahr),
              ]}
            />
          )}
          <ResultDataRow
            label={`- ${tStr("aufwand")}`}
            values={[
              empty ? emptyValue : formatMoney(result!.breakEven.aufwand.monat),
              empty ? emptyValue : formatMoney(result!.breakEven.aufwand.jahr),
            ]}
          />
          <ResultDataRow
            label={
              <span className="flex items-center gap-1">
                - {tStr("personalkosten")}
                <button
                  type="button"
                  onClick={() => setDetailsOpen((p) => !p)}
                  className="inline-flex items-center text-[10px] font-medium underline underline-offset-2"
                >
                  ➔ {tStr("details")}
                </button>
              </span>
            }
            values={[
              empty
                ? emptyValue
                : formatMoney(result!.breakEven.personalkosten.monat),
              empty
                ? emptyValue
                : formatMoney(result!.breakEven.personalkosten.jahr),
            ]}
          />
          {detailsOpen && !empty && (
            <div className="my-1 space-y-3 rounded bg-white/45 p-3">
              {result!.breakEven.mitarbeiter.map((m, i) => {
                if (m.brutto.jahr === 0) return null;
                return (
                  <div key={i} className="text-xs">
                    <div className="mb-1 font-semibold">
                      {tStr("datenMitarbeiter")} {i + 1}
                    </div>
                    <DetailHeaderRow />
                    <DetailRow
                      label={tStr("bruttoEntgelt")}
                      m={m.brutto.monat}
                      j={m.brutto.jahr}
                    />
                    <DetailRow
                      label={tStr("bruttoEntgeltInkl")}
                      m={m.bruttoInklLohnnebenkosten.monat}
                      j={m.bruttoInklLohnnebenkosten.jahr}
                    />
                    <DetailRow
                      label={m.foerderungText}
                      m={m.foerderung.monat}
                      j={m.foerderung.jahr}
                    />
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
          <ResultDataRow
            label={`+ ${tStr("foerderungenGesamt")}`}
            values={[
              empty
                ? emptyValue
                : formatMoney(result!.breakEven.foerderungenGesamt.monat),
              empty
                ? emptyValue
                : formatMoney(result!.breakEven.foerderungenGesamt.jahr),
            ]}
          />
          <ResultDataRow
            label={`= ${tStr("gewinn")}`}
            values={[
              empty ? emptyValue : formatMoney(result!.breakEven.gewinn.monat),
              empty ? emptyValue : formatMoney(result!.breakEven.gewinn.jahr),
            ]}
          />
        </ResultRows>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-medium leading-tight">
          {tStr("ausgangssituation")}
        </h3>
        <SectionDivider />
        <ResultRows>
          <ResultHeaderRow
            columns={["", tStr("monatlich"), tStr("jaehrlich")]}
          />
          <ResultDataRow
            label={showProv ? tStr("provisionsumsatz") : tStr("umsatz")}
            values={[
              empty
                ? emptyValue
                : formatMoney(result!.ausgangssituation.umsatz.monat),
              empty
                ? emptyValue
                : formatMoney(result!.ausgangssituation.umsatz.jahr),
            ]}
          />
          {showWE && (
            <ResultDataRow
              label={`- ${tStr("wareneinsatz")}`}
              values={[
                empty
                  ? emptyValue
                  : formatMoney(result!.ausgangssituation.wareneinsatz.monat),
                empty
                  ? emptyValue
                  : formatMoney(result!.ausgangssituation.wareneinsatz.jahr),
              ]}
            />
          )}
          <ResultDataRow
            label={`- ${tStr("aufwand")}`}
            values={[
              empty
                ? emptyValue
                : formatMoney(result!.ausgangssituation.aufwand.monat),
              empty
                ? emptyValue
                : formatMoney(result!.ausgangssituation.aufwand.jahr),
            ]}
          />
          <ResultDataRow
            label={`= ${tStr("gewinn")}`}
            values={[
              empty
                ? emptyValue
                : formatMoney(result!.ausgangssituation.gewinn.monat),
              empty
                ? emptyValue
                : formatMoney(result!.ausgangssituation.gewinn.jahr),
            ]}
          />
        </ResultRows>
      </section>
    </div>
  );
};

const SectionDivider = () => (
  <div className="border-t border-dashed border-result-foreground/20 pt-4" />
);

const ResultRows = ({ children }: { children: ReactNode }) => (
  <div className="space-y-2 text-[14px] leading-tight">{children}</div>
);

const resultGridClass =
  "grid grid-cols-[minmax(0,1fr)_132px_96px] items-center gap-3 xl:grid-cols-[minmax(0,1fr)_150px_112px] max-[420px]:grid-cols-[minmax(0,1fr)_82px_80px] max-[420px]:gap-2";

const detailGridClass =
  "grid grid-cols-[minmax(0,1fr)_82px_82px] items-start gap-2 sm:grid-cols-[minmax(0,1fr)_96px_96px] xl:grid-cols-[minmax(0,1fr)_104px_104px]";

const ResultHeaderRow = ({
  columns,
}: {
  columns: [ReactNode, ReactNode, ReactNode];
}) => (
  <div
    className={cn(
      resultGridClass,
      "pb-1 text-[14px] font-normal text-result-foreground",
    )}
  >
    <div>{columns[0]}</div>
    <div className="text-right whitespace-nowrap">{columns[1]}</div>
    <div className="text-right whitespace-nowrap">{columns[2]}</div>
  </div>
);

const ResultDataRow = ({
  label,
  values,
  medium = false,
}: {
  label: ReactNode;
  values: [ReactNode, ReactNode];
  medium?: boolean;
}) => (
  <div
    className={cn(
      resultGridClass,
      "min-h-[25px] rounded px-2 py-1",
      medium ? "bg-white font-medium" : "bg-[#FFF7F1]",
    )}
  >
    <div className="min-w-0 xl:whitespace-nowrap">{label}</div>
    <div className="text-right">{values[0]}</div>
    <div className="text-right">{values[1]}</div>
  </div>
);

const EmployeeIcons = ({
  activeCount,
  activeClassName,
}: {
  activeCount: number;
  activeClassName: string;
}) => (
  <div className="flex shrink-0 items-center gap-1.5">
    {[0, 1, 2, 3].map((i) => (
      <EmployeeIcon
        key={i}
        className={cn(
          i < activeCount ? activeClassName : "text-muted-foreground/50",
        )}
        aria-hidden
      />
    ))}
  </div>
);

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
  <div className={cn(detailGridClass, "py-0.5")}>
    <div className="min-w-0 text-muted-foreground">{label}</div>
    <div className="text-right">{money ? formatMoney(m) : formatNumber(m)}</div>
    <div className="text-right">{money ? formatMoney(j) : formatNumber(j)}</div>
  </div>
);

const DetailHeaderRow = () => (
  <div className={cn(detailGridClass, "pb-1 text-[11px] font-semibold")}>
    <div />
    <div className="text-right">{tStr("monatlich")}</div>
    <div className="text-right">{tStr("jaehrlich")}</div>
  </div>
);
