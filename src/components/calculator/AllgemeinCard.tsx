import { Card } from "@/components/ui/card";
import { HelpIcon } from "@/components/HelpIcon";
import { NumberInput } from "@/components/NumberInput";
import { useCalculator } from "@/lib/calculator/CalculatorContext";
import { showsProvision, showsStunden, showsWareneinsatz, branchen } from "@/lib/calculator/branche";
import type { Branche } from "@/lib/calculator/types";
import { tStr, type TextKey } from "@/lib/text";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const b = input.branche;

  return (
    <Card className="border-border bg-card p-6">
      <h2 className="mb-4 text-xl font-semibold">{tStr("allgemein")}</h2>
      <div className="border-t border-dashed border-border pt-4" />

      <div className="mb-4">
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
          {tStr("branche")}
          <HelpIcon text={tStr("branche")} />
        </label>
        <Select value={b} onValueChange={(v) => setBranche(v as Branche)}>
          <SelectTrigger aria-label={tStr("branche")} className="border-transparent bg-muted">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
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
        <Field label={tStr("umsatz")} help={tStr("umsatz")}>
          <NumberInput
            value={input.umsatz}
            onChange={(v) => patchInput({ umsatz: v })}
            ariaLabel={tStr("umsatz")}
          />
        </Field>

        <Field label={tStr("aufwand")} help={tStr("aufwand")}>
          <NumberInput
            value={input.aufwand}
            onChange={(v) => patchInput({ aufwand: v })}
            ariaLabel={tStr("aufwand")}
          />
        </Field>

        {showsStunden(b) && (
          <Field label={tStr("verrechneteStunden")} help={tStr("verrechneteStunden")}>
            <NumberInput
              value={input.stunden}
              onChange={(v) => patchInput({ stunden: v })}
              variant="integer"
              ariaLabel={tStr("verrechneteStunden")}
              suffix="h"
            />
          </Field>
        )}

        {showsWareneinsatz(b) && (
          <Field label={tStr("wareneinsatz")} help={tStr("wareneinsatz")}>
            <NumberInput
              value={input.wareneinsatz}
              onChange={(v) => patchInput({ wareneinsatz: v })}
              ariaLabel={tStr("wareneinsatz")}
            />
          </Field>
        )}

        {showsProvision(b) && (
          <Field label={tStr("provisionPct")} help={tStr("provisionPct")}>
            <NumberInput
              value={input.provision}
              onChange={(v) => patchInput({ provision: v })}
              variant="decimal"
              suffix="%"
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
    <label className="mb-1.5 flex min-h-[2.5rem] items-start gap-1.5 text-sm font-medium leading-tight">
      <span className="flex-1">{label}</span>
      <HelpIcon text={help} />
    </label>
    {children}
  </div>
);
