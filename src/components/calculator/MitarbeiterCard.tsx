import { CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HelpIcon } from "@/components/HelpIcon";
import { NumberInput } from "@/components/NumberInput";
import {
  useCalculator,
  type MitarbeiterIndex,
} from "@/lib/calculator/CalculatorContext";
import {
  defaultMitarbeiterFieldValuesFor,
  dienstverhaeltnisse,
  showsUmsatzsteigerung,
  showsVerkaufbareStunden,
} from "@/lib/calculator/branche";
import {
  isMitarbeiterAdvancedComplete,
  isMitarbeiterBasicComplete,
} from "@/lib/calculator/mitarbeiterStatus";
import type { Dienstverhaeltnis } from "@/lib/calculator/types";
import { tStr, type TextKey } from "@/lib/text";
import { cn } from "@/lib/utils";

const dvLabelKey = (d: Dienstverhaeltnis): TextKey => {
  const map: Record<Dienstverhaeltnis, TextKey> = {
    angestellter: "dv_angestellter",
    arbeiter: "dv_arbeiter",
    geringfuegig: "dv_geringfuegig",
    lehrling: "dv_lehrling",
    dienstvertrag: "dv_dienstvertrag",
  };
  return map[d];
};

interface Props {
  index: MitarbeiterIndex;
}

export const MitarbeiterCard = ({ index }: Props) => {
  const {
    input,
    patchMitarbeiter,
    openMitarbeiterIndex,
    toggleMitarbeiterOpen,
    resetMitarbeiter,
    deleteMitarbeiter,
  } = useCalculator();
  const m = [
    input.mitarbeiter1,
    input.mitarbeiter2,
    input.mitarbeiter3,
    input.mitarbeiter4,
  ][index];
  const b = input.branche;

  const isOpen = openMitarbeiterIndex === index;
  const isIncluded = isMitarbeiterBasicComplete(m);
  const isFilled = isMitarbeiterAdvancedComplete(m, b);

  return (
    <Card className="border-border bg-card px-5 py-3">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 text-left text-lg font-medium"
          onClick={() => toggleMitarbeiterOpen(index)}
          aria-expanded={isOpen}
        >
          <span className="truncate">
            {tStr("datenMitarbeiter")}:in {index + 1}
          </span>
          {isFilled && (
            <CheckCircle2
              className="h-4 w-4 shrink-0 text-toggle-on"
              aria-hidden
            />
          )}
        </button>
        <Switch
          checked={isIncluded}
          aria-readonly="true"
          tabIndex={-1}
          onClick={() => toggleMitarbeiterOpen(index)}
          aria-label={`${tStr("datenMitarbeiter")} ${index + 1} öffnen oder schließen`}
          className={cn(
            "h-5 w-10 cursor-pointer",
            isIncluded && "data-[state=checked]:bg-toggle-on",
          )}
          thumbClassName="h-3.5 w-3.5 data-[state=checked]:translate-x-[27px] data-[state=unchecked]:translate-x-[1px]"
        />
      </div>

      {isOpen && (
        <div className="mt-4 space-y-4 border-t border-dashed border-border pt-4">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
              {tStr("beschaeftigungsform")}
              <HelpIcon text={tStr("beschaeftigungsform")} />
            </label>
            <Select
              value={m.beschaeftigungsform}
              onValueChange={(v) => {
                const beschaeftigungsform = v as Dienstverhaeltnis;
                patchMitarbeiter(index, {
                  beschaeftigungsform,
                  ...defaultMitarbeiterFieldValuesFor(beschaeftigungsform),
                });
              }}
            >
              <SelectTrigger
                aria-label={`${tStr("datenMitarbeiter")} ${index + 1}: ${tStr("beschaeftigungsform")}`}
                className="border-transparent bg-muted"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dienstverhaeltnisse.map((d) => (
                  <SelectItem key={d} value={d}>
                    {tStr(dvLabelKey(d))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
              {tStr("bruttogehalt")}
              <HelpIcon text={tStr("bruttogehalt")} />
            </label>
            <NumberInput
              value={m.bruttogehaltProMonat}
              onChange={(v) =>
                patchMitarbeiter(index, { bruttogehaltProMonat: v })
              }
              ariaLabel={`${tStr("datenMitarbeiter")} ${index + 1}: ${tStr("bruttogehalt")}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                {tStr("wochenstunden")}
                <HelpIcon text={tStr("wochenstunden")} />
              </label>
              <NumberInput
                value={m.anzahlWochenstunden}
                variant="decimal"
                onChange={(v) =>
                  patchMitarbeiter(index, { anzahlWochenstunden: v })
                }
                max={168}
                ariaLabel={`${tStr("datenMitarbeiter")} ${index + 1}: ${tStr("wochenstunden")}`}
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                {tStr("beschaeftigungsmonate")}
                <HelpIcon text={tStr("beschaeftigungsmonate")} />
              </label>
              <NumberInput
                value={m.anzahlBeschaeftigungsmonate}
                variant="integer"
                min={0}
                max={12}
                ariaLabel={`${tStr("datenMitarbeiter")} ${index + 1}: ${tStr("beschaeftigungsmonate")}`}
                onChange={(v) =>
                  patchMitarbeiter(index, { anzahlBeschaeftigungsmonate: v })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                {tStr("zusatzkostenMonatlich")}
                <HelpIcon text={tStr("zusatzkostenMonatlich")} />
              </label>
              <NumberInput
                value={m.zusatzkostenMonatlich}
                onChange={(v) =>
                  patchMitarbeiter(index, { zusatzkostenMonatlich: v })
                }
                ariaLabel={`${tStr("datenMitarbeiter")} ${index + 1}: ${tStr("zusatzkostenMonatlich")}`}
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                {tStr("zusatzkostenJaehrlich")}
                <HelpIcon text={tStr("zusatzkostenJaehrlich")} />
              </label>
              <NumberInput
                value={m.zusatzkostenJaehrlich}
                onChange={(v) =>
                  patchMitarbeiter(index, { zusatzkostenJaehrlich: v })
                }
                ariaLabel={`${tStr("datenMitarbeiter")} ${index + 1}: ${tStr("zusatzkostenJaehrlich")}`}
              />
            </div>
          </div>

          {showsVerkaufbareStunden(b) && (
            <div className="border-t border-dashed border-border pt-4">
              <h4 className="mb-3 text-base font-semibold">
                {tStr("verkaufbareStunden")}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    {tStr("verkaufbareStundenPct")}
                  </label>
                  <NumberInput
                    value={m.verkaufbareStunden}
                    variant="percent"
                    suffix="%"
                    max={100}
                    onChange={(v) =>
                      patchMitarbeiter(index, { verkaufbareStunden: v })
                    }
                    ariaLabel={`${tStr("datenMitarbeiter")} ${index + 1}: ${tStr("verkaufbareStundenPct")}`}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    {tStr("stundensatz")}
                  </label>
                  <NumberInput
                    value={m.stundensatz}
                    onChange={(v) =>
                      patchMitarbeiter(index, { stundensatz: v })
                    }
                    ariaLabel={`${tStr("datenMitarbeiter")} ${index + 1}: ${tStr("stundensatz")}`}
                  />
                </div>
              </div>
            </div>
          )}

          {showsUmsatzsteigerung(b) && (
            <div className="border-t border-dashed border-border pt-4">
              <label className="mb-1.5 block text-sm font-medium">
                {tStr("umsatzsteigerung")}
              </label>
              <NumberInput
                value={m.umsatzsteigerung}
                variant="percent"
                suffix="%"
                max={100}
                onChange={(v) =>
                  patchMitarbeiter(index, { umsatzsteigerung: v })
                }
                ariaLabel={`${tStr("datenMitarbeiter")} ${index + 1}: ${tStr("umsatzsteigerung")}`}
              />
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => resetMitarbeiter(index)}
            >
              {tStr("zuruecksetzen")}
            </Button>
            <Button
              variant="default"
              size="icon"
              className="h-9 w-9 rounded-full bg-foreground text-background hover:bg-foreground/85"
              onClick={() => deleteMitarbeiter(index)}
              aria-label={tStr("loeschen")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
