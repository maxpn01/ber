import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCalculator, type MitarbeiterIndex } from "@/lib/calculator/CalculatorContext";
import { tList, tStr, type TextKey, type TextListKey } from "@/lib/text";
import { cn } from "@/lib/utils";
import { JAHR } from "@/lib/calculator/constants";

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
  const { input, patchMitarbeiter, showStartUpUnavailable, setShowStartUpUnavailable } = useCalculator();
  const all = [input.mitarbeiter1, input.mitarbeiter2, input.mitarbeiter3, input.mitarbeiter4];

  const isAnyOn = all.some((m) =>
    kind === "epu" ? m.foerderung : kind === "bonus" ? m.foerderungBonus : m.foerderungStartUp,
  );

  const setKindFor = (i: MitarbeiterIndex, on: boolean) => {
    if (kind === "epu") {
      patchMitarbeiter(i, {
        foerderung: on,
        foerderungBonus: on ? false : all[i].foerderungBonus,
        foerderungStartUp: on ? false : all[i].foerderungStartUp,
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
    if (!m.active || m.bruttogehaltProMonat <= 0) return false;
    if (m.beschaeftigungsform !== "angestellter" && m.beschaeftigungsform !== "arbeiter") return false;

    if (kind === "epu") {
      return i === 0; // only MA1
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
    return kind === "epu" ? m.foerderung : kind === "bonus" ? m.foerderungBonus : m.foerderungStartUp;
  };

  const cardOn = isAnyOn;

  return (
    <>
      <Card
        className={cn(
          "border-l-4 bg-card p-5 transition-colors",
          cardOn ? "border-l-subsidy" : "border-l-subsidy/50",
        )}
      >
        <div className="flex items-center justify-between">
          <h3 className={cn("text-base font-semibold", cardOn ? "text-subsidy" : "text-foreground")}>
            {tStr(TITLE_KEY[kind])}
          </h3>
          <Switch
            checked={cardOn}
            onCheckedChange={(on) => {
              if (!on) {
                // turn off for everyone
                ([0, 1, 2, 3] as MitarbeiterIndex[]).forEach((i) => setKindFor(i, false));
              } else {
                // turn on first eligible
                const firstEligible = ([0, 1, 2, 3] as MitarbeiterIndex[]).find((i) => eligible(i));
                if (firstEligible !== undefined) setKindFor(firstEligible, true);
              }
            }}
            className={cn(cardOn && "data-[state=checked]:bg-subsidy")}
            aria-label={tStr(TITLE_KEY[kind])}
          />
        </div>

        {cardOn && (
          <div className="mt-5 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {([0, 1, 2, 3] as MitarbeiterIndex[]).map((i) => {
                const isEligible = eligible(i);
                const isChecked = checked(i);
                return (
                  <label
                    key={i}
                    className={cn(
                      "flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm",
                      !isEligible && "opacity-50 cursor-not-allowed",
                      isChecked && "border-subsidy bg-subsidy-soft",
                    )}
                  >
                    <Checkbox
                      checked={isChecked}
                      disabled={!isEligible}
                      onCheckedChange={(c) => setKindFor(i, !!c)}
                      className="data-[state=checked]:bg-subsidy data-[state=checked]:border-subsidy"
                    />
                    <span>{tStr("fuerMitarbeiter")} {i + 1}</span>
                  </label>
                );
              })}
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold">{tStr("voraussetzungenTitel")}</h4>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                {tList(COND_KEY[kind]).map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-md border border-subsidy/30 bg-subsidy-soft px-4 py-3 text-sm">
              <span className="font-semibold">{tStr("hinweisLabel")}</span>{" "}
              {tStr(HINT_KEY[kind])}
            </div>
          </div>
        )}
      </Card>

      {kind === "startup" && (
        <Dialog open={showStartUpUnavailable} onOpenChange={setShowStartUpUnavailable}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{tStr("foerderungStartUp")}</DialogTitle>
            </DialogHeader>
            <p className="text-sm">{tStr("startUpUnavailable")}</p>
            <DialogFooter>
              <Button onClick={() => setShowStartUpUnavailable(false)}>{tStr("ok")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
