import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
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
  const potenzialInputHelp = showStunden
    ? tStr("potenzialInputVerkaufbareStundenHelp")
    : tStr("potenzialInputUmsatzsteigerungHelp");

  const empty = !result || !!result.fehlermeldung;
  const emptyValue = "-";
  const personnelDetails = empty
    ? []
    : result!.breakEven.mitarbeiter
        .map((mitarbeiter, index) => ({ mitarbeiter, index }))
        .filter(({ mitarbeiter }) => mitarbeiter.brutto.jahr > 0);
  const hasPersonnelDetails = personnelDetails.length > 0;

  useEffect(() => {
    if (!hasPersonnelDetails) {
      setDetailsOpen(false);
    }
  }, [hasPersonnelDetails]);

  if (!hasCalculatedOnce && !result) {
    return (
      <div className="h-full min-h-[520px] rounded-lg bg-result p-3 text-result-foreground min-[380px]:p-4">
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
    <div className="h-full rounded-lg bg-result px-3 py-6 text-result-foreground min-[380px]:px-4 min-[1180px]:px-8">
      <section className="mb-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 min-[430px]:flex-nowrap min-[430px]:gap-4">
          <h3 className="flex min-w-0 items-start gap-1.5 text-[18px] font-medium leading-tight min-[1120px]:whitespace-nowrap">
            {tStr("potenzialTitle")}
            <HelpIcon
              text={tStr("potenzialHelp")}
              className="mt-[6px] h-[12px] w-[12px]"
            />
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
                  text={potenzialInputHelp}
                  className="shrink-0"
                  contentClassName="text-left"
                />
              </span>,
              <span className="font-medium">{tStr("breakEven")}</span>,
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
        <h3 className="mb-3 text-[18px] font-medium leading-tight">
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
                  text={tStr("jaehrlichHelp")}
                  className="shrink-0 mt-0.5"
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
              hasPersonnelDetails ? (
                <span className="flex min-w-0 items-center gap-0.5 whitespace-nowrap text-[14px] min-[1180px]:gap-1 min-[1180px]:text-[15px]">
                  <span className="shrink-0">- {tStr("personalkosten")}</span>
                  <button
                    type="button"
                    onClick={() => setDetailsOpen((p) => !p)}
                    className="inline-flex shrink-0 items-center px-0.5 text-[12px] font-medium underline underline-offset-2 min-[1180px]:px-1"
                    aria-expanded={detailsOpen}
                  >
                    ➔ {tStr("details")}
                  </button>
                </span>
              ) : (
                `- ${tStr("personalkosten")}`
              )
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
          {detailsOpen && hasPersonnelDetails && (
            <div className="my-1 overflow-hidden rounded bg-white text-result-foreground">
              <div>
                {personnelDetails.map(
                  ({ mitarbeiter: m, index }, detailIndex) => {
                    const rows = [
                      {
                        label: tStr("bruttoEntgelt"),
                        m: m.brutto.monat,
                        j: m.brutto.jahr,
                        money: true,
                      },
                      {
                        label: tStr("bruttoEntgeltInkl"),
                        m: m.bruttoInklLohnnebenkosten.monat,
                        j: m.bruttoInklLohnnebenkosten.jahr,
                        money: true,
                      },
                      {
                        label: tStr("foerderung"),
                        m: m.foerderung.monat,
                        j: m.foerderung.jahr,
                        money: true,
                      },
                      ...(showStunden
                        ? [
                            {
                              label: tStr("arbeitsstunden"),
                              m: m.arbeitsstunden.monat,
                              j: m.arbeitsstunden.jahr,
                              money: false,
                            },
                          ]
                        : []),
                    ];

                    return (
                      <div key={index} className="text-[13px]">
                        <div className="flex min-h-8 items-center justify-between px-2 font-medium">
                          <span>
                            {tStr("mitarbeiter")} {index + 1}
                          </span>
                          {detailIndex === 0 && (
                            <button
                              type="button"
                              onClick={() => setDetailsOpen(false)}
                              className="inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-result-foreground text-result-foreground"
                              aria-label={tStr("detailsAusblenden")}
                            >
                              <X className="h-2 w-2" aria-hidden />
                            </button>
                          )}
                        </div>
                        <div>
                          {rows.map((row, rowIndex) => (
                            <DetailRow
                              key={row.label}
                              label={row.label}
                              m={row.m}
                              j={row.j}
                              money={row.money}
                              shaded={rowIndex % 2 === 0}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
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
        <h3 className="mb-3 text-[18px] font-medium leading-tight">
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
  <div className="space-y-2 text-[15px] leading-tight">{children}</div>
);

const resultGridClass =
  "grid grid-cols-2 items-center gap-x-2 gap-y-1 sm:max-[1119px]:grid-cols-[minmax(0,1fr)_minmax(8rem,13rem)_minmax(8rem,13rem)] min-[1120px]:grid-cols-[minmax(0,1fr)_minmax(8rem,30%)_minmax(8rem,30%)] min-[1180px]:grid-cols-[minmax(0,1fr)_140px_140px] min-[1180px]:gap-x-3";

const detailGridClass =
  "grid grid-cols-2 items-start gap-x-2 gap-y-1 sm:max-[1119px]:grid-cols-[minmax(0,1fr)_minmax(7.5rem,12rem)_minmax(7.5rem,12rem)] min-[1120px]:grid-cols-[minmax(0,1fr)_minmax(7.5rem,29%)_minmax(7.5rem,29%)] min-[1180px]:grid-cols-[minmax(0,1fr)_132px_132px]";

const ResultHeaderRow = ({
  columns,
}: {
  columns: [ReactNode, ReactNode, ReactNode];
}) => (
  <div
    className={cn(
      resultGridClass,
      "px-2 pb-1 text-[14px] font-normal text-result-foreground",
    )}
  >
    <div className="hidden sm:max-[1119px]:invisible sm:max-[1119px]:block min-[1120px]:block">
      {columns[0]}
    </div>
    <div className="whitespace-nowrap text-right">{columns[1]}</div>
    <div className="whitespace-nowrap text-right">{columns[2]}</div>
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
    <div className="col-span-2 min-w-0 sm:max-[1119px]:col-span-3 min-[1120px]:col-span-1">
      {label}
    </div>
    <div className="min-w-0 whitespace-nowrap text-right text-[clamp(12px,3.2vw,15px)] tabular-nums sm:max-[1119px]:col-start-2">
      {values[0]}
    </div>
    <div className="min-w-0 whitespace-nowrap text-right text-[clamp(12px,3.2vw,15px)] tabular-nums">
      {values[1]}
    </div>
  </div>
);

const EmployeeIcons = ({
  activeCount,
  activeClassName,
}: {
  activeCount: number;
  activeClassName: string;
}) => (
  <div
    className="flex shrink-0 items-center gap-1.5"
    role="img"
    aria-label={`${activeCount} von 4 Mitarbeitern in der Berechnung enthalten`}
  >
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
  shaded = false,
}: {
  label: string;
  m: number;
  j: number;
  money?: boolean;
  shaded?: boolean;
}) => (
  <div className={cn(detailGridClass, "px-2 py-1.5", shaded && "bg-[#EFEFEF]")}>
    <div className="col-span-2 min-w-0 text-result-foreground/80 sm:max-[1119px]:col-span-3 min-[1120px]:col-span-1">
      {label}
    </div>
    <div className="min-w-0 whitespace-nowrap text-right text-[clamp(11px,3vw,13px)] tabular-nums sm:max-[1119px]:col-start-2">
      {money ? formatMoney(m) : formatNumber(m)}
    </div>
    <div className="min-w-0 whitespace-nowrap text-right text-[clamp(11px,3vw,13px)] tabular-nums">
      {money ? formatMoney(j) : formatNumber(j)}
    </div>
  </div>
);
