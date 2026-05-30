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
import { ErzielbarerGewinnSlider } from "@/components/calculator/ErzielbarerGewinnSlider";

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

  return (
    <Card className="border-border bg-card p-3 sm:p-4">
      <h2 className="mb-2 text-[18px] font-medium sm:text-[22px]">
        {tStr("allgemein")}
      </h2>

      <div className="border-t border-dashed border-border pt-4 text-[#A2A4A9] mb-2" />

      <div className="mb-6">
        <div className="relative mb-1.5 flex flex-wrap items-center gap-1 text-[14px] font-medium">
          {tStr("branche")}
          <HelpIcon
            text={tStr("brancheHelp")}
            inlineContent
            className="mt-0.5"
            contentClassName="w-full max-w-none sm:max-w-none lg:max-w-none"
          />
        </div>
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
              "border-transparent bg-muted text-[15px] sm:text-[16px]",
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

      <div className="border-t border-dashed border-border pt-6" />

      <div className="grid grid-cols-1 gap-4 pb-8 sm:grid-cols-3 sm:items-end">
        <Field label={tStr("umsatz")} help={tStr("umsatzHelp")}>
          <NumberInput
            value={input.umsatz}
            onChange={(v) => patchInput({ umsatz: v })}
            ariaLabel={tStr("umsatz")}
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

      <ErzielbarerGewinnSlider />
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
    <div className="mb-1.5 flex items-start gap-1 text-[14px] font-medium leading-tight">
      <span>{label}</span>
      <HelpIcon text={help} className="mt-1" />
    </div>
    {children}
  </div>
);
