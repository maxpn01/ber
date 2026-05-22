import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { defaultInput, defaultMitarbeiterFor } from "@/lib/calculator/branche";
import { calculate, calculateExtended, isReadyToCalculate } from "@/lib/calculator/calculate";
import { Branche, InputMitarbeiter, InputModel, OutputModel } from "@/lib/calculator/types";

export type MitarbeiterIndex = 0 | 1 | 2 | 3;

interface CalcCtx {
  input: InputModel;
  setInput: Dispatch<SetStateAction<InputModel>>;
  result: OutputModel | null;
  sliderValue: number;
  setSliderValue: (v: number) => void;
  firstCalcDone: boolean;
  patchInput: (patch: Partial<InputModel>) => void;
  setBranche: (b: Branche) => void;
  patchMitarbeiter: (i: MitarbeiterIndex, patch: Partial<InputMitarbeiter>) => void;
  toggleMitarbeiter: (i: MitarbeiterIndex, active: boolean) => void;
  resetMitarbeiter: (i: MitarbeiterIndex) => void;
  deleteMitarbeiter: (i: MitarbeiterIndex) => void;
  activeMitarbeiterCount: number;
  showStartUpUnavailable: boolean;
  setShowStartUpUnavailable: (v: boolean) => void;
}

const Ctx = createContext<CalcCtx | null>(null);

const MITARBEITER_KEYS: ReadonlyArray<keyof InputModel> = [
  "mitarbeiter1",
  "mitarbeiter2",
  "mitarbeiter3",
  "mitarbeiter4",
];

export const CalculatorProvider = ({ children }: { children: ReactNode }) => {
  const [input, setInput] = useState<InputModel>(() => defaultInput("dienstleistung"));
  const [sliderValue, setSliderValueState] = useState(0);
  const [firstCalcDone, setFirstCalcDone] = useState(false);
  const [showStartUpUnavailable, setShowStartUpUnavailable] = useState(false);

  // Compute result reactively (synchronously is fine; calc is cheap)
  const result = useMemo(() => {
    if (!isReadyToCalculate(input)) {
      return null;
    }
    return sliderValue > 0 ? calculateExtended(input, sliderValue) : calculate(input);
  }, [input, sliderValue]);

  useEffect(() => {
    if (result && !result.fehlermeldung && !firstCalcDone) {
      setFirstCalcDone(true);
    }
  }, [result, firstCalcDone]);

  const patchInput = useCallback((patch: Partial<InputModel>) => {
    setInput((prev) => ({ ...prev, ...patch, erzielbarerGewinn: 0 }));
    setSliderValueState(0);
  }, []);

  const setBranche = useCallback((b: Branche) => {
    setInput((prev) => {
      // Reset employees defaults but preserve activation state.
      const buildM = (m: InputMitarbeiter): InputMitarbeiter => {
        if (!m.active) return defaultMitarbeiterFor(b, false);
        const d = defaultMitarbeiterFor(b, true);
        return { ...d, active: true };
      };
      return {
        ...prev,
        branche: b,
        // reset branche-specific values on switch
        stunden: 0,
        wareneinsatz: 0,
        provision: 0,
        erzielbarerGewinn: 0,
        mitarbeiter1: buildM(prev.mitarbeiter1),
        mitarbeiter2: buildM(prev.mitarbeiter2),
        mitarbeiter3: buildM(prev.mitarbeiter3),
        mitarbeiter4: buildM(prev.mitarbeiter4),
      };
    });
    setSliderValueState(0);
  }, []);

  const patchMitarbeiter = useCallback(
    (i: MitarbeiterIndex, patch: Partial<InputMitarbeiter>) => {
      const key = MITARBEITER_KEYS[i] as "mitarbeiter1" | "mitarbeiter2" | "mitarbeiter3" | "mitarbeiter4";
      setInput((prev) => ({
        ...prev,
        [key]: { ...(prev[key] as InputMitarbeiter), ...patch },
        erzielbarerGewinn: 0,
      }));
      setSliderValueState(0);
    },
    [],
  );

  const toggleMitarbeiter = useCallback((i: MitarbeiterIndex, active: boolean) => {
    const key = MITARBEITER_KEYS[i] as "mitarbeiter1" | "mitarbeiter2" | "mitarbeiter3" | "mitarbeiter4";
    setInput((prev) => {
      if (active) {
        const current = prev[key] as InputMitarbeiter;
        // If has data already, just activate; else fill with defaults
        const filled =
          current.bruttogehaltProMonat > 0
            ? { ...current, active: true }
            : { ...defaultMitarbeiterFor(prev.branche, true), active: true };
        return { ...prev, [key]: filled, erzielbarerGewinn: 0 };
      } else {
        return { ...prev, [key]: defaultMitarbeiterFor(prev.branche, false), erzielbarerGewinn: 0 };
      }
    });
    setSliderValueState(0);
  }, []);

  const resetMitarbeiter = useCallback((i: MitarbeiterIndex) => {
    const key = MITARBEITER_KEYS[i] as "mitarbeiter1" | "mitarbeiter2" | "mitarbeiter3" | "mitarbeiter4";
    setInput((prev) => ({
      ...prev,
      [key]: { ...defaultMitarbeiterFor(prev.branche, true), active: true },
      erzielbarerGewinn: 0,
    }));
    setSliderValueState(0);
  }, []);

  const deleteMitarbeiter = useCallback((i: MitarbeiterIndex) => toggleMitarbeiter(i, false), [toggleMitarbeiter]);

  const setSliderValue = useCallback(
    (v: number) => {
      setSliderValueState(v);
      setInput((prev) => ({ ...prev, erzielbarerGewinn: v }));
    },
    [],
  );

  const activeMitarbeiterCount = [input.mitarbeiter1, input.mitarbeiter2, input.mitarbeiter3, input.mitarbeiter4].filter(
    (m) => m.active && m.bruttogehaltProMonat > 0,
  ).length;

  const value = useMemo<CalcCtx>(
    () => ({
      input,
      setInput,
      result,
      sliderValue,
      setSliderValue,
      firstCalcDone,
      patchInput,
      setBranche,
      patchMitarbeiter,
      toggleMitarbeiter,
      resetMitarbeiter,
      deleteMitarbeiter,
      activeMitarbeiterCount,
      showStartUpUnavailable,
      setShowStartUpUnavailable,
    }),
    [
      input,
      result,
      sliderValue,
      setSliderValue,
      firstCalcDone,
      patchInput,
      setBranche,
      patchMitarbeiter,
      toggleMitarbeiter,
      resetMitarbeiter,
      deleteMitarbeiter,
      activeMitarbeiterCount,
      showStartUpUnavailable,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useCalculator = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCalculator must be used within CalculatorProvider");
  return v;
};
