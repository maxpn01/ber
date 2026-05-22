import * as SliderPrimitive from "@radix-ui/react-slider";
import { useCalculator } from "@/lib/calculator/CalculatorContext";
import { formatMoney } from "@/lib/format";
import { tStr } from "@/lib/text";
import { cn } from "@/lib/utils";

export const ErzielbarerGewinnSlider = () => {
  const { sliderValue, setSliderValue, firstCalcDone } = useCalculator();
  const enabled = firstCalcDone;

  return (
    <div
      className={cn(
        "rounded-lg p-6 transition-opacity",
        enabled ? "bg-slider text-slider-foreground" : "bg-slider/40 text-slider-foreground/70",
      )}
    >
      <div className="mb-1 text-sm">{tStr("erzielbarerGewinn")}</div>
      <div className="mb-4 text-2xl font-semibold">{formatMoney(sliderValue)}</div>
      <SliderPrimitive.Root
        className="relative flex w-full touch-none select-none items-center"
        value={[sliderValue]}
        min={0}
        max={1000000}
        step={100}
        disabled={!enabled}
        onValueChange={(v) => setSliderValue(v[0])}
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-white/30">
          <SliderPrimitive.Range className="absolute h-full bg-white" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className="block h-5 w-5 rounded-full bg-white shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-60"
          aria-label={tStr("erzielbarerGewinn")}
        />
      </SliderPrimitive.Root>
      {!enabled && <div className="mt-3 text-xs opacity-90">{tStr("sliderLocked")}</div>}
    </div>
  );
};
