import { KeyboardEvent, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  formatDecimal,
  formatMoney,
  formatNumber,
  parseDeNumber,
} from "@/lib/format";

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 2_147_483_647;

interface Props {
  value: number;
  onChange: (v: number) => void;
  variant?: "money" | "integer" | "decimal" | "percent";
  suffix?: string;
  className?: string;
  invalid?: boolean;
  disabled?: boolean;
  computed?: boolean; // gray text when value derived from slider
  id?: string;
  ariaLabel?: string;
  min?: number;
  max?: number;
}

export const NumberInput = ({
  value,
  onChange,
  variant = "money",
  suffix,
  className,
  invalid,
  disabled,
  computed,
  id,
  ariaLabel,
  min = DEFAULT_MIN,
  max = DEFAULT_MAX,
}: Props) => {
  const precision = variant === "integer" ? 0 : 2;

  const format = (v: number) => {
    if (variant === "money") return formatMoney(v);
    if (variant === "integer") return formatNumber(v);
    return formatDecimal(v);
  };

  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  const roundForVariant = (v: number) => {
    if (variant === "integer") return Math.round(v);
    const factor = 10 ** precision;
    return Math.round(v * factor) / factor;
  };

  const sanitize = (raw: string) => {
    const negative = raw.trimStart().startsWith("-");
    const sign = negative ? "-" : "";

    if (variant === "integer") {
      return sign + raw.replace(/\D/g, "");
    }

    const stripped = raw.replace(/[^\d.,]/g, "");
    const commaIndex = stripped.indexOf(",");
    if (commaIndex === -1) return sign + stripped;

    return (
      sign +
      stripped.slice(0, commaIndex + 1) +
      stripped.slice(commaIndex + 1).replace(/,/g, "")
    );
  };

  const commit = (raw: string) => {
    const parsed = clamp(roundForVariant(parseDeNumber(raw)));
    onChange(parsed);
    setFocused(false);
    setText(format(parsed));
  };

  const [text, setText] = useState<string>(() => format(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(format(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, variant, focused]);

  return (
    <div className="relative">
      <Input
        id={id}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        value={text}
        disabled={disabled}
        inputMode={variant === "integer" ? "numeric" : "decimal"}
        onFocus={(e) => {
          setFocused(true);
          // show raw editable representation
          const editableValue = clamp(roundForVariant(value));
          const raw =
            editableValue === 0
              ? ""
              : editableValue
                  .toLocaleString("de-DE", {
                    maximumFractionDigits: precision,
                  })
                  .replace(/\./g, "");
          e.currentTarget.value = raw;
          setText(raw);
          e.currentTarget.setSelectionRange(0, raw.length);
        }}
        onChange={(e) => {
          setText(sanitize(e.target.value));
        }}
        onBlur={(e) => {
          commit(e.currentTarget.value);
        }}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        className={cn(
          "border-transparent bg-muted",
          invalid && "border-destructive bg-destructive/10 text-destructive",
          computed && !focused && "text-muted-foreground",
          suffix && "pr-8",
          className,
        )}
      />
      {suffix && (
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
  );
};
