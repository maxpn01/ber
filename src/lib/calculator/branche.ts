import { Branche, Dienstverhaeltnis, InputMitarbeiter, InputModel } from "./types";

export const branchen: Branche[] = [
  "dienstleistung",
  "gastronomie",
  "handel",
  "gewerbe",
  "provision",
];

export const dienstverhaeltnisse: Dienstverhaeltnis[] = [
  "angestellter",
  "arbeiter",
  "geringfuegig",
  "lehrling",
  "dienstvertrag",
];

export interface BrancheDefaults {
  defaultDienstverhaeltnis: Dienstverhaeltnis;
}

export const brancheDefaults: Record<Branche, BrancheDefaults> = {
  dienstleistung: {
    defaultDienstverhaeltnis: "angestellter",
  },
  gastronomie: {
    defaultDienstverhaeltnis: "arbeiter",
  },
  handel: {
    defaultDienstverhaeltnis: "arbeiter",
  },
  gewerbe: {
    defaultDienstverhaeltnis: "angestellter",
  },
  provision: {
    defaultDienstverhaeltnis: "angestellter",
  },
};

export const showsStunden = (b: Branche) => b === "dienstleistung" || b === "gewerbe";
export const showsWareneinsatz = (b: Branche) =>
  b === "gastronomie" || b === "handel" || b === "gewerbe";
export const showsProvision = (b: Branche) => b === "provision";
export const showsVerkaufbareStunden = (b: Branche) =>
  b === "dienstleistung" || b === "gewerbe";
export const showsUmsatzsteigerung = (b: Branche) =>
  b === "gastronomie" || b === "handel" || b === "provision";

export function defaultMitarbeiterFieldValuesFor(
  beschaeftigungsform: Dienstverhaeltnis,
): Pick<
  InputMitarbeiter,
  "bruttogehaltProMonat" | "anzahlWochenstunden" | "anzahlBeschaeftigungsmonate"
> {
  if (beschaeftigungsform === "geringfuegig" || beschaeftigungsform === "lehrling") {
    return {
      bruttogehaltProMonat: 0,
      anzahlWochenstunden: 0,
      anzahlBeschaeftigungsmonate: 0,
    };
  }

  return {
    bruttogehaltProMonat: 2200,
    anzahlWochenstunden: 38.5,
    anzahlBeschaeftigungsmonate: 12,
  };
}

export function defaultMitarbeiterFor(
  branche: Branche,
  active: boolean,
): InputMitarbeiter {
  const d = brancheDefaults[branche];
  const fieldValues = active
    ? defaultMitarbeiterFieldValuesFor(d.defaultDienstverhaeltnis)
    : {
        bruttogehaltProMonat: 0,
        anzahlWochenstunden: 0,
        anzahlBeschaeftigungsmonate: 0,
      };

  return {
    active,
    beschaeftigungsform: d.defaultDienstverhaeltnis,
    ...fieldValues,
    zusatzkostenMonatlich: 0,
    zusatzkostenJaehrlich: 0,
    verkaufbareStunden: 0,
    stundensatz: 0,
    umsatzsteigerung: 0,
    foerderung: false,
    foerderungBonus: false,
    foerderungStartUp: false,
  };
}

export function defaultInput(branche: Branche = "dienstleistung"): InputModel {
  return {
    nameDesUnternehmens: "",
    gruendungsjahr: new Date().getFullYear(),
    branche,
    umsatz: 0,
    aufwand: 0,
    stunden: 0,
    wareneinsatz: 0,
    provision: 0,
    erzielbarerGewinn: 0,
    mitarbeiter1: defaultMitarbeiterFor(branche, false),
    mitarbeiter2: defaultMitarbeiterFor(branche, false),
    mitarbeiter3: defaultMitarbeiterFor(branche, false),
    mitarbeiter4: defaultMitarbeiterFor(branche, false),
  };
}

export function defaultLandingInput(): InputModel {
  const branche: Branche = "dienstleistung";
  return {
    ...defaultInput(branche),
    mitarbeiter1: defaultMitarbeiterFor(branche, true),
  };
}
