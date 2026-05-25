import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatMoney, formatNumber, parseDeNumber } from "@/lib/format";

interface Props {
  value: number;
  onChange: (v: number) => void;
  variant?: "money" | "integer" | "decimal";
  suffix?: string;
  className?: string;
  invalid?: boolean;
  disabled?: boolean;
  computed?: boolean; // gray text when value derived from slider
  id?: string;
  ariaLabel?: string;
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
}: Props) => {
  const format = (v: number) => {
    if (variant === "money") return formatMoney(v);
    if (variant === "integer") return formatNumber(v);
    // decimal: show with comma, no currency
    return v.toLocaleString("de-AT", { maximumFractionDigits: 4 });
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
        onFocus={(e) => {
          setFocused(true);
          // show raw editable representation
          const raw = value === 0 ? "" : value.toLocaleString("de-AT", { maximumFractionDigits: 4 }).replace(/\./g, "");
          setText(raw.replace(",", ","));
          requestAnimationFrame(() => e.target.select());
        }}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          const parsed = parseDeNumber(text);
          onChange(parsed);
          setFocused(false);
          setText(format(parsed));
        }}
        className={cn(
          "bg-muted border-transparent",
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
