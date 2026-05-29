import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useCalculator,
  type MitarbeiterIndex,
} from "@/lib/calculator/CalculatorContext";
import { tList, tStr, type TextKey, type TextListKey } from "@/lib/text";
import { cn } from "@/lib/utils";
import { JAHR } from "@/lib/calculator/constants";
import { isMitarbeiterBasicComplete } from "@/lib/calculator/mitarbeiterStatus";

type Kind = "epu" | "bonus" | "startup";

interface Props {
  kind: Kind;
}

const TITLE_KEY: Record<Kind, TextKey> = {
  epu: "foerderungEpu",
  bonus: "foerderungBonus",
  startup: "foerderungStartUp",
};
const HINT_KEY: Record<Kind, TextKey> = {
  epu: "hinweisEpu",
  bonus: "hinweisBonus",
  startup: "hinweisStartUp",
};
const COND_KEY: Record<Kind, TextListKey> = {
  epu: "epuConditions",
  bonus: "bonusConditions",
  startup: "startUpConditions",
};

export const SubsidyCard = ({ kind }: Props) => {
  const [conditionsOpen, setConditionsOpen] = useState(true);
  const [epuOpen, setEpuOpen] = useState(false);
  const {
    input,
    patchMitarbeiter,
    showStartUpUnavailable,
    setShowStartUpUnavailable,
  } = useCalculator();
  const all = [
    input.mitarbeiter1,
    input.mitarbeiter2,
    input.mitarbeiter3,
    input.mitarbeiter4,
  ];

  const isAnyOn = all.some((m) =>
    kind === "epu"
      ? m.foerderung
      : kind === "bonus"
        ? m.foerderungBonus
        : m.foerderungStartUp,
  );

  const setKindFor = (i: MitarbeiterIndex, on: boolean) => {
    if (kind === "epu") {
      ([0, 1, 2, 3] as MitarbeiterIndex[]).forEach((idx) => {
        const selected = on && idx === i;
        patchMitarbeiter(idx, {
          foerderung: selected,
          foerderungBonus: selected ? false : all[idx].foerderungBonus,
          foerderungStartUp: selected ? false : all[idx].foerderungStartUp,
        });
      });
    } else if (kind === "bonus") {
      patchMitarbeiter(i, {
        foerderungBonus: on,
        foerderung: on ? false : all[i].foerderung,
        foerderungStartUp: on ? false : all[i].foerderungStartUp,
      });
    } else {
      // startup — check eligibility
      if (on) {
        const uYears = JAHR - input.gruendungsjahr + 1;
        if (input.gruendungsjahr !== 0 && uYears > 5) {
          setShowStartUpUnavailable(true);
          return;
        }
      }
      patchMitarbeiter(i, {
        foerderungStartUp: on,
        foerderung: on ? false : all[i].foerderung,
        foerderungBonus: on ? false : all[i].foerderungBonus,
      });
    }
  };

  // Eligibility per employee
  const eligible = (i: MitarbeiterIndex) => {
    const m = all[i];
    if (!isMitarbeiterBasicComplete(m)) return false;

    if (
      m.beschaeftigungsform !== "angestellter" &&
      m.beschaeftigungsform !== "arbeiter"
    )
      return false;

    if (kind === "epu") {
      return true;
    }

    if (kind === "bonus") {
      const usedCount = all.filter((x) => x.foerderungBonus).length;
      const isMe = m.foerderungBonus;
      if (m.anzahlBeschaeftigungsmonate < 6) return false;
      if (!isMe && usedCount >= 3) return false;
      return true;
    }
    // startup
    const usedCount = all.filter((x) => x.foerderungStartUp).length;
    const isMe = m.foerderungStartUp;
    if (m.anzahlBeschaeftigungsmonate < 3) return false;
    if (!isMe && usedCount >= 3) return false;
    return true;
  };

  const checked = (i: MitarbeiterIndex) => {
    const m = all[i];
    return kind === "epu"
      ? m.foerderung
      : kind === "bonus"
        ? m.foerderungBonus
        : m.foerderungStartUp;
  };

  useEffect(() => {
    if (kind !== "epu") return;
    if (isAnyOn) setEpuOpen(true);

    ([0, 1, 2, 3] as MitarbeiterIndex[]).forEach((i) => {
      if (checked(i) && !eligible(i)) {
        setKindFor(i, false);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, input]);

  const cardOn = isAnyOn;
  const isEpu = kind === "epu";
  const isExpanded = isEpu ? epuOpen : cardOn;
  const epuBorderColor = isExpanded ? "#735E9E" : "#003C56";

  return (
    <>
      <Card
        className={cn(
          "bg-card transition-colors",
          isEpu ? "px-5 py-3" : "border-l-4 p-5",
          !isEpu && (cardOn ? "border-l-subsidy" : "border-l-subsidy/50"),
        )}
        style={isEpu ? { borderColor: epuBorderColor } : undefined}
      >
        <div className="flex items-center justify-between gap-3">
          <h3
            className={cn(
              "min-w-0 flex-1 truncate text-lg font-medium",
              !isEpu && (cardOn ? "text-subsidy" : "text-foreground"),
            )}
            style={isEpu ? { color: "#003C56" } : undefined}
          >
            {tStr(TITLE_KEY[kind])}
          </h3>
          <Switch
            checked={isExpanded}
            onCheckedChange={(on) => {
              if (isEpu) {
                setEpuOpen(on);
                if (!on) {
                  ([0, 1, 2, 3] as MitarbeiterIndex[]).forEach((i) =>
                    setKindFor(i, false),
                  );
                }
                return;
              }

              if (!on) {
                // turn off for everyone
                ([0, 1, 2, 3] as MitarbeiterIndex[]).forEach((i) =>
                  setKindFor(i, false),
                );
              } else {
                // turn on first eligible
                const firstEligible = ([0, 1, 2, 3] as MitarbeiterIndex[]).find(
                  (i) => eligible(i),
                );
                if (firstEligible !== undefined)
                  setKindFor(firstEligible, true);
              }
            }}
            className={cn(
              "h-5 w-10 cursor-pointer",
              isExpanded && "data-[state=checked]:bg-toggle-on",
            )}
            thumbClassName="h-3.5 w-3.5 data-[state=checked]:translate-x-[27px] data-[state=unchecked]:translate-x-[1px]"
            aria-label={tStr(TITLE_KEY[kind])}
          />
        </div>

        {isExpanded && (
          <div className="mt-5 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {([0, 1, 2, 3] as MitarbeiterIndex[]).map((i) => {
                const isEligible = eligible(i);
                const isChecked = checked(i);
                return (
                  <label
                    key={i}
                    className={cn(
                      "flex items-center gap-3 rounded-md border border-border bg-muted/40 px-3 py-3 text-sm",
                      isEpu && "border-[#E6E6E6] bg-[#F5F5F5]",
                      !isEligible && "cursor-not-allowed opacity-60",
                      isChecked &&
                        (isEpu
                          ? "border-[#E6E6E6] bg-[#F5F5F5]"
                          : "border-subsidy bg-subsidy-soft"),
                    )}
                  >
                    <Checkbox
                      checked={isChecked}
                      disabled={!isEligible}
                      onCheckedChange={(c) => setKindFor(i, !!c)}
                      className={cn(
                        isEpu
                          ? "h-6 w-6 rounded-[4px] border-[#BDBCDB] bg-white text-white data-[state=checked]:border-[#003C56] data-[state=checked]:bg-[#003C56] data-[state=unchecked]:bg-white"
                          : "data-[state=checked]:border-toggle-on data-[state=checked]:bg-toggle-on",
                      )}
                      iconClassName={
                        isEpu ? "h-4 w-4 stroke-[3.25]" : undefined
                      }
                    />
                    <span className={cn(isEpu && "text-base")}>
                      {isEpu ? "Für Mitarbeiter:in" : tStr("fuerMitarbeiter")}{" "}
                      {i + 1}
                    </span>
                  </label>
                );
              })}
            </div>

            <Collapsible
              open={conditionsOpen}
              onOpenChange={setConditionsOpen}
              className="rounded-md bg-[#F5F5F5] px-4 py-4"
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 text-left text-sm font-medium">
                <span>Voraussetzungen</span>
                <ChevronUp
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform",
                    !conditionsOpen && "rotate-180",
                  )}
                  aria-hidden
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-7">
                <h4 className="mb-5 text-lg font-medium leading-snug">
                  {tStr("voraussetzungenTitel")}
                </h4>
                <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[#555]">
                  {tList(COND_KEY[kind]).map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>

            <div className="rounded-md bg-[#EFF2F9] px-4 py-3 text-sm leading-relaxed">
              <span className="font-medium">{tStr("hinweisLabel")}</span>{" "}
              {tStr(HINT_KEY[kind])}
            </div>
          </div>
        )}
      </Card>

      {kind === "startup" && (
        <Dialog
          open={showStartUpUnavailable}
          onOpenChange={setShowStartUpUnavailable}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{tStr("foerderungStartUp")}</DialogTitle>
            </DialogHeader>
            <p className="text-sm">{tStr("startUpUnavailable")}</p>
            <DialogFooter>
              <Button onClick={() => setShowStartUpUnavailable(false)}>
                {tStr("ok")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
