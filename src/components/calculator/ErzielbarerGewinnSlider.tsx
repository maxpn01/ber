import * as SliderPrimitive from "@radix-ui/react-slider";
import { useRef } from "react";
import { HelpIcon } from "@/components/HelpIcon";
import { useCalculator } from "@/lib/calculator/CalculatorContext";
import { formatMoney } from "@/lib/format";
import { tStr } from "@/lib/text";
import { cn } from "@/lib/utils";

const MIN_PROFIT = 1;
const MAX_PROFIT = 1_000_000;
const KEYBOARD_STEP = 100;
const POINTER_STEP = 6_000;

export const ErzielbarerGewinnSlider = () => {
  const {
    result,
    sliderValue,
    setSliderValue,
    hasValidResult,
    hasCalculatedOnce,
  } = useCalculator();
  const pointerActiveRef = useRef(false);
  const enabled = hasValidResult || (hasCalculatedOnce && sliderValue > 0);
  const displayedValue =
    sliderValue > 0
      ? sliderValue
      : (result?.ausgangssituation.gewinn.jahr ?? 0);
  const clampValue = (value: number) =>
    Math.min(MAX_PROFIT, Math.max(MIN_PROFIT, value));
  const normalizeValue = (value: number) => {
    if (!pointerActiveRef.current) return value;
    const steppedValue = Math.round(value / POINTER_STEP) * POINTER_STEP;
    return clampValue(steppedValue);
  };

  return (
    <div
      className={cn(
        "rounded-sm bg-[#003C56] px-4 pb-8 pt-5 text-slider-foreground",
        !enabled && "bg-[#003C56]/70 text-slider-foreground/75",
      )}
    >
      <div className="mb-1 flex items-center gap-2.5 text-[14px] font-medium">
        <span>{tStr("erzielbarerGewinn")}</span>
        <HelpIcon
          text={tStr("sliderHint")}
          iconSrc="/title_tooltip_icon.svg"
          className="mt-0 h-[22px] w-[22px] [&_img]:invert"
        />
      </div>
      <div className="mb-5 text-[24px] font-medium">
        {formatMoney(displayedValue)}
      </div>
      <SliderPrimitive.Root
        className="relative flex w-full touch-none select-none items-center"
        value={[displayedValue]}
        min={enabled ? MIN_PROFIT : 0}
        max={MAX_PROFIT}
        step={KEYBOARD_STEP}
        disabled={!enabled}
        onPointerDown={() => {
          pointerActiveRef.current = true;
        }}
        onPointerUp={() => {
          pointerActiveRef.current = false;
        }}
        onPointerCancel={() => {
          pointerActiveRef.current = false;
        }}
        onKeyDownCapture={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowUp") {
            event.preventDefault();
            setSliderValue(clampValue(displayedValue + KEYBOARD_STEP));
          } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
            event.preventDefault();
            setSliderValue(clampValue(displayedValue - KEYBOARD_STEP));
          } else if (event.key === "Home") {
            event.preventDefault();
            setSliderValue(MIN_PROFIT);
          } else if (event.key === "End") {
            event.preventDefault();
            setSliderValue(MAX_PROFIT);
          }
        }}
        onValueChange={(v) => setSliderValue(normalizeValue(v[0]))}
      >
        <SliderPrimitive.Track
          className={cn(
            "relative h-0.5 w-full grow overflow-hidden rounded-full",
            enabled ? "bg-white/80" : "bg-white/35",
          )}
        >
          <SliderPrimitive.Range
            className={cn(
              "absolute h-full",
              enabled ? "bg-white" : "bg-transparent",
            )}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            "z-10 block h-4 w-4 rounded-full bg-white shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
            !enabled && "cursor-not-allowed shadow-none",
          )}
          aria-label={tStr("erzielbarerGewinn")}
        />
      </SliderPrimitive.Root>
    </div>
  );
};
