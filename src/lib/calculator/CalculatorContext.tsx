import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  defaultLandingInput,
  defaultMitarbeiterFor,
} from "@/lib/calculator/branche";
import {
  calculate,
  calculateExtended,
  isReadyToCalculate,
} from "@/lib/calculator/calculate";
import {
  Branche,
  InputMitarbeiter,
  InputModel,
  OutputModel,
} from "@/lib/calculator/types";
import {
  hasMitarbeiterInput,
  isMitarbeiterBasicComplete,
} from "@/lib/calculator/mitarbeiterStatus";

export type MitarbeiterIndex = 0 | 1 | 2 | 3;

interface CalcCtx {
  input: InputModel;
  setInput: Dispatch<SetStateAction<InputModel>>;
  result: OutputModel | null;
  sliderValue: number;
  setSliderValue: (v: number) => void;
  inputComplete: boolean;
  hasValidationError: boolean;
  hasValidResult: boolean;
  hasCalculatedOnce: boolean;
  patchInput: (patch: Partial<InputModel>) => void;
  setBranche: (b: Branche) => void;
  patchMitarbeiter: (
    i: MitarbeiterIndex,
    patch: Partial<InputMitarbeiter>,
  ) => void;
  openMitarbeiterIndex: MitarbeiterIndex | null;
  toggleMitarbeiterOpen: (i: MitarbeiterIndex) => void;
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
  const [input, setInput] = useState<InputModel>(() => defaultLandingInput());
  const [sliderValue, setSliderValueState] = useState(0);
  const [hasCalculatedOnce, setHasCalculatedOnce] = useState(false);
  const [showStartUpUnavailable, setShowStartUpUnavailable] = useState(false);
  const [openMitarbeiterIndex, setOpenMitarbeiterIndex] =
    useState<MitarbeiterIndex | null>(0);
  const inputComplete = useMemo(() => isReadyToCalculate(input), [input]);

  // Compute result reactively (synchronously is fine; calc is cheap)
  const result = useMemo(() => {
    if (!inputComplete) {
      return null;
    }
    return sliderValue > 0
      ? calculateExtended(input, sliderValue)
      : calculate(input);
  }, [input, inputComplete, sliderValue]);
  const hasValidationError = !!result?.fehlermeldung;
  const hasValidResult = !!result && !hasValidationError;

  useEffect(() => {
    if (hasValidResult) {
      setHasCalculatedOnce(true);
    }
  }, [hasValidResult]);

  const patchInput = useCallback((patch: Partial<InputModel>) => {
    setInput((prev) => ({ ...prev, ...patch, erzielbarerGewinn: 0 }));
    setSliderValueState(0);
  }, []);

  const setBranche = useCallback((b: Branche) => {
    setInput((prev) => {
      // Reset employee defaults for the new branch only where employee data is present.
      const buildM = (m: InputMitarbeiter): InputMitarbeiter => {
        if (!hasMitarbeiterInput(m)) return defaultMitarbeiterFor(b, false);
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
      const key = MITARBEITER_KEYS[i] as
        | "mitarbeiter1"
        | "mitarbeiter2"
        | "mitarbeiter3"
        | "mitarbeiter4";
      setInput((prev) => ({
        ...prev,
        [key]: (() => {
          const next = { ...(prev[key] as InputMitarbeiter), ...patch };
          return { ...next, active: isMitarbeiterBasicComplete(next) };
        })(),
        erzielbarerGewinn: 0,
      }));
      setSliderValueState(0);
    },
    [],
  );

  const toggleMitarbeiterOpen = useCallback((i: MitarbeiterIndex) => {
    setOpenMitarbeiterIndex((prev) => (prev === i ? null : i));
  }, []);

  const resetMitarbeiter = useCallback((i: MitarbeiterIndex) => {
    const key = MITARBEITER_KEYS[i] as
      | "mitarbeiter1"
      | "mitarbeiter2"
      | "mitarbeiter3"
      | "mitarbeiter4";
    setInput((prev) => ({
      ...prev,
      [key]: { ...defaultMitarbeiterFor(prev.branche, true), active: true },
      erzielbarerGewinn: 0,
    }));
    setSliderValueState(0);
  }, []);

  const deleteMitarbeiter = useCallback(
    (i: MitarbeiterIndex) => {
      const key = MITARBEITER_KEYS[i] as
        | "mitarbeiter1"
        | "mitarbeiter2"
        | "mitarbeiter3"
        | "mitarbeiter4";
      setInput((prev) => ({
        ...prev,
        [key]: defaultMitarbeiterFor(prev.branche, false),
        erzielbarerGewinn: 0,
      }));
      setSliderValueState(0);
      setOpenMitarbeiterIndex((prev) => (prev === i ? null : prev));
    },
    [],
  );

  const setSliderValue = useCallback((v: number) => {
    setSliderValueState(v);
    setInput((prev) => ({ ...prev, erzielbarerGewinn: v }));
  }, []);

  const activeMitarbeiterCount = [
    input.mitarbeiter1,
    input.mitarbeiter2,
    input.mitarbeiter3,
    input.mitarbeiter4,
  ].filter(isMitarbeiterBasicComplete).length;

  const value = useMemo<CalcCtx>(
    () => ({
      input,
      setInput,
      result,
      sliderValue,
      setSliderValue,
      inputComplete,
      hasValidationError,
      hasValidResult,
      hasCalculatedOnce,
      patchInput,
      setBranche,
      patchMitarbeiter,
      openMitarbeiterIndex,
      toggleMitarbeiterOpen,
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
      inputComplete,
      hasValidationError,
      hasValidResult,
      hasCalculatedOnce,
      patchInput,
      setBranche,
      patchMitarbeiter,
      openMitarbeiterIndex,
      toggleMitarbeiterOpen,
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
  if (!v)
    throw new Error("useCalculator must be used within CalculatorProvider");
  return v;
};
