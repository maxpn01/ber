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
  defaultBruttoMonat: number;
  defaultWochenstunden: number;
}

export const brancheDefaults: Record<Branche, BrancheDefaults> = {
  dienstleistung: {
    defaultDienstverhaeltnis: "angestellter",
    defaultBruttoMonat: 2200,
    defaultWochenstunden: 38.5,
  },
  gastronomie: {
    defaultDienstverhaeltnis: "arbeiter",
    defaultBruttoMonat: 1500,
    defaultWochenstunden: 40,
  },
  handel: {
    defaultDienstverhaeltnis: "arbeiter",
    defaultBruttoMonat: 1500,
    defaultWochenstunden: 38.5,
  },
  gewerbe: {
    defaultDienstverhaeltnis: "angestellter",
    defaultBruttoMonat: 2000,
    defaultWochenstunden: 38.5,
  },
  provision: {
    defaultDienstverhaeltnis: "angestellter",
    defaultBruttoMonat: 1800,
    defaultWochenstunden: 38.5,
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

export function defaultMitarbeiterFor(
  branche: Branche,
  active: boolean,
): InputMitarbeiter {
  const d = brancheDefaults[branche];
  return {
    active,
    beschaeftigungsform: d.defaultDienstverhaeltnis,
    bruttogehaltProMonat: active ? d.defaultBruttoMonat : 0,
    anzahlWochenstunden: active ? d.defaultWochenstunden : 0,
    anzahlBeschaeftigungsmonate: 12,
    zusatzkostenMonatlich: 0,
    zusatzkostenJaehrlich: 0,
    verkaufbareStunden: showsVerkaufbareStunden(branche) && active ? 80 : 0,
    stundensatz: showsVerkaufbareStunden(branche) && active ? 80 : 0,
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
