import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { TrashIcon } from "@/components/icons/TrashIcon";
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
import { useRef } from "react";

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
  const beschaeftigungsformTriggerRef = useRef<HTMLButtonElement>(null);
  const blurBeschaeftigungsformAfterSelectRef = useRef(false);
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
    <Card className="border-border bg-card px-3 py-3 sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-1.5 text-left text-[18px] font-medium sm:text-[22px]"
          onClick={() => toggleMitarbeiterOpen(index)}
          aria-expanded={isOpen}
        >
          <span className="truncate">
            {tStr("datenMitarbeiter")}:in {index + 1}
          </span>
          {isFilled && (
            <span className="flex h-[18px] w-[18px] mt-0.5 shrink-0 items-center justify-center rounded-full bg-toggle-on">
              <img src="/complete_icon.svg" alt="" className="h-4 w-4" />
            </span>
          )}
        </button>
        <Switch
          checked={isIncluded}
          aria-readonly="true"
          tabIndex={-1}
          onClick={() => toggleMitarbeiterOpen(index)}
          aria-label={`${tStr("datenMitarbeiter")} ${index + 1} öffnen oder schließen`}
          className={cn(
            "h-6 w-12 cursor-pointer",
            isIncluded && "data-[state=checked]:bg-toggle-on",
          )}
          thumbClassName="h-[18px] w-[18px] data-[state=checked]:translate-x-[calc(3rem-1.125rem-4px-0.0625rem)] data-[state=unchecked]:translate-x-[0.0625rem]"
        />
      </div>

      {isOpen && (
        <div className="mt-4 space-y-[25px] border-t border-dashed border-border pt-4">
          <div>
            <div className="mb-1.5 flex items-center gap-1.5 text-[14px] font-medium">
              {tStr("beschaeftigungsform")}
              <HelpIcon
                text={tStr("beschaeftigungsformHelp")}
                className="mt-0.5"
              />
            </div>
            <Select
              value={m.beschaeftigungsform}
              onValueChange={(v) => {
                blurBeschaeftigungsformAfterSelectRef.current = true;
                const beschaeftigungsform = v as Dienstverhaeltnis;
                patchMitarbeiter(index, {
                  beschaeftigungsform,
                  ...defaultMitarbeiterFieldValuesFor(
                    input.branche,
                    beschaeftigungsform,
                  ),
                });
              }}
            >
              <SelectTrigger
                ref={beschaeftigungsformTriggerRef}
                aria-label={`${tStr("datenMitarbeiter")} ${index + 1}: ${tStr("beschaeftigungsform")}`}
                className={cn(
                  "border-transparent bg-muted text-[16px]",
                  "data-[state=open]:border-slider data-[state=open]:bg-slider/5 data-[state=open]:ring-1 data-[state=open]:ring-slider",
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                onCloseAutoFocus={(event) => {
                  if (!blurBeschaeftigungsformAfterSelectRef.current) return;
                  event.preventDefault();
                  blurBeschaeftigungsformAfterSelectRef.current = false;
                  beschaeftigungsformTriggerRef.current?.blur();
                }}
              >
                {dienstverhaeltnisse.map((d) => (
                  <SelectItem key={d} value={d}>
                    {tStr(dvLabelKey(d))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="mb-1.5 flex items-center gap-1.5 text-[14px] font-medium">
              {tStr("bruttogehalt")}
              <HelpIcon text={tStr("bruttogehaltHelp")} className="mt-[3px]" />
            </div>
            <NumberInput
              value={m.bruttogehaltProMonat}
              onChange={(v) =>
                patchMitarbeiter(index, { bruttogehaltProMonat: v })
              }
              ariaLabel={`${tStr("datenMitarbeiter")} ${index + 1}: ${tStr("bruttogehalt")}`}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2">
            <div>
              <div className="mb-1.5 flex items-start gap-1.5 text-[14px] font-medium leading-tight">
                {tStr("wochenstunden")}
                <HelpIcon
                  text={tStr("wochenstundenHelp")}
                  className="mt-[4px]"
                />
              </div>
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
              <div className="mb-1.5 text-[14px] font-medium leading-tight">
                <span>{tStr("beschaeftigungsmonate")}</span>
                <HelpIcon
                  text={tStr("beschaeftigungsmonateHelp")}
                  className="ml-1.5 align-middle"
                />
              </div>
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

          <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2">
            <div>
              <div className="mb-1.5 flex items-start gap-1.5 text-[14px] font-medium leading-tight">
                {tStr("zusatzkostenMonatlich")}
                <HelpIcon
                  text={tStr("zusatzkostenMonatlichHelp")}
                  className="mt-[4px]"
                />
              </div>
              <NumberInput
                value={m.zusatzkostenMonatlich}
                onChange={(v) =>
                  patchMitarbeiter(index, {
                    zusatzkostenMonatlich: v,
                    zusatzkostenJaehrlich: v * 12,
                  })
                }
                ariaLabel={`${tStr("datenMitarbeiter")} ${index + 1}: ${tStr("zusatzkostenMonatlich")}`}
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-start gap-1.5 text-[14px] font-medium leading-tight">
                {tStr("zusatzkostenJaehrlich")}
                <HelpIcon
                  text={tStr("zusatzkostenJaehrlichHelp")}
                  className="mt-[4px]"
                />
              </div>
              <NumberInput
                value={m.zusatzkostenJaehrlich}
                onChange={(v) =>
                  patchMitarbeiter(index, {
                    zusatzkostenMonatlich: v / 12,
                    zusatzkostenJaehrlich: v,
                  })
                }
                ariaLabel={`${tStr("datenMitarbeiter")} ${index + 1}: ${tStr("zusatzkostenJaehrlich")}`}
              />
            </div>
          </div>

          {showsVerkaufbareStunden(b) && (
            <div className="border-t border-dashed border-border pt-4">
              <h4 className="mb-3 flex items-center gap-1.5 text-[18px] font-semibold">
                {tStr("verkaufbareStunden")}
                <HelpIcon
                  text={tStr("verkaufbareStundenHelp")}
                  className="mt-[4px]"
                />
              </h4>
              <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[14px] font-medium">
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
                  <label className="mb-1.5 block text-[14px] font-medium">
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
              <h4 className="mb-3 flex items-center gap-1.5 text-base font-semibold">
                {tStr("potenzielleUmsatzsteigerung")}
                <HelpIcon text={tStr("potenzielleUmsatzsteigerungHelp")} />
              </h4>
              <label className="mb-1.5 block text-[14px] font-medium">
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

          <div className="flex items-center gap-4 py-4">
            <Button
              variant="outline"
              size="sm"
              className="w-4/5 rounded-full border-black bg-transparent px-6 py-5 text-base font-medium hover:bg-transparent hover:opacity-70 sm:w-auto"
              onClick={() => resetMitarbeiter(index)}
            >
              {tStr("zuruecksetzen")}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-[47px] w-[47px] rounded-full bg-transparent p-0 shadow-none hover:opacity-70"
              onClick={() => deleteMitarbeiter(index)}
              aria-label={tStr("loeschen")}
            >
              <TrashIcon />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
