import { Card } from "@/components/ui/card";
import { HelpIcon } from "@/components/HelpIcon";
import { NumberInput } from "@/components/NumberInput";
import { useRef } from "react";
import { useCalculator } from "@/lib/calculator/CalculatorContext";
import {
  showsProvision,
  showsStunden,
  showsWareneinsatz,
  branchen,
} from "@/lib/calculator/branche";
import type { Branche } from "@/lib/calculator/types";
import { tStr, type TextKey } from "@/lib/text";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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

export const AllgemeinCard = () => {
  const { input, patchInput, setBranche } = useCalculator();
  const brancheTriggerRef = useRef<HTMLButtonElement>(null);
  const blurBrancheAfterSelectRef = useRef(false);
  const b = input.branche;
  const umsatzLabel = showsProvision(b)
    ? tStr("provisionsumsatz")
    : tStr("umsatz");

  return (
    <Card className="border-border bg-card p-4">
      <h2 className="mb-2 text-lg font-medium">{tStr("allgemein")}</h2>
      <div className="border-t border-dashed border-border pt-4 text-[#A2A4A9]" />

      <div className="mb-4">
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium">
          {tStr("branche")}
          <HelpIcon text={tStr("brancheHelp")} />
        </label>
        <Select
          value={b}
          onValueChange={(v) => {
            blurBrancheAfterSelectRef.current = true;
            setBranche(v as Branche);
          }}
        >
          <SelectTrigger
            ref={brancheTriggerRef}
            aria-label={tStr("branche")}
            className={cn(
              "border-transparent bg-muted",
              "data-[state=open]:border-slider data-[state=open]:bg-slider/5 data-[state=open]:ring-1 data-[state=open]:ring-slider",
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            onCloseAutoFocus={(event) => {
              if (!blurBrancheAfterSelectRef.current) return;
              event.preventDefault();
              blurBrancheAfterSelectRef.current = false;
              brancheTriggerRef.current?.blur();
            }}
          >
            {branchen.map((x) => (
              <SelectItem key={x} value={x}>
                {tStr(brancheLabelKey(x))}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border-t border-dashed border-border pt-4" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label={umsatzLabel} help={tStr("umsatzHelp")}>
          <NumberInput
            value={input.umsatz}
            onChange={(v) => patchInput({ umsatz: v })}
            ariaLabel={umsatzLabel}
          />
        </Field>

        <Field label={tStr("aufwand")} help={tStr("aufwandHelp")}>
          <NumberInput
            value={input.aufwand}
            onChange={(v) => patchInput({ aufwand: v })}
            ariaLabel={tStr("aufwand")}
          />
        </Field>

        {showsStunden(b) && (
          <Field
            label={tStr("verrechneteStunden")}
            help={tStr("verrechneteStundenHelp")}
          >
            <NumberInput
              value={input.stunden}
              onChange={(v) => patchInput({ stunden: v })}
              variant="decimal"
              ariaLabel={tStr("verrechneteStunden")}
            />
          </Field>
        )}

        {showsWareneinsatz(b) && (
          <Field label={tStr("wareneinsatz")} help={tStr("wareneinsatzHelp")}>
            <NumberInput
              value={input.wareneinsatz}
              onChange={(v) => patchInput({ wareneinsatz: v })}
              ariaLabel={tStr("wareneinsatz")}
            />
          </Field>
        )}

        {showsProvision(b) && (
          <Field label={tStr("provisionPct")} help={tStr("provisionPctHelp")}>
            <NumberInput
              value={input.provision}
              onChange={(v) => patchInput({ provision: v })}
              variant="percent"
              suffix="%"
              max={100}
              ariaLabel={tStr("provisionPct")}
            />
          </Field>
        )}
      </div>
    </Card>
  );
};

const Field = ({
  label,
  help,
  children,
}: {
  label: string;
  help: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col">
    <label className="mb-1.5 flex min-h-[2.5rem] items-start gap-1.5 text-xs font-medium leading-tight">
      <span className="flex-1">{label}</span>
      <HelpIcon text={help} />
    </label>
    {children}
  </div>
);
