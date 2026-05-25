import * as SliderPrimitive from "@radix-ui/react-slider";
import { useCalculator } from "@/lib/calculator/CalculatorContext";
import { formatMoney } from "@/lib/format";
import { tStr } from "@/lib/text";
import { cn } from "@/lib/utils";

export const ErzielbarerGewinnSlider = () => {
  const { result, sliderValue, setSliderValue, hasValidResult } = useCalculator();
  const enabled = hasValidResult;
  const displayedValue =
    sliderValue > 0 ? sliderValue : result?.ausgangssituation.gewinn.jahr ?? 0;

  return (
    <div
      className={cn(
        "rounded-sm bg-[#003C56] px-4 pb-8 pt-5 text-slider-foreground",
        !enabled && "bg-[#003C56]/70 text-slider-foreground/75",
      )}
    >
      <div className="mb-1 text-xs font-medium">
        {tStr("erzielbarerGewinn")}
      </div>
      <div className="mb-5 text-xl font-medium">{formatMoney(displayedValue)}</div>
      <SliderPrimitive.Root
        className="relative flex w-full touch-none select-none items-center"
        value={[displayedValue]}
        min={0}
        max={1000000}
        step={100}
        disabled={!enabled}
        onValueChange={(v) => setSliderValue(v[0])}
      >
        <SliderPrimitive.Track className={cn("relative h-0.5 w-full grow overflow-hidden rounded-full", enabled ? "bg-white/80" : "bg-white/35")}>
          <SliderPrimitive.Range className={cn("absolute h-full", enabled ? "bg-white" : "bg-transparent")} />
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
