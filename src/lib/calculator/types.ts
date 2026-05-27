export type Branche =
  | "dienstleistung"
  | "gastronomie"
  | "handel"
  | "gewerbe"
  | "provision";

export type Dienstverhaeltnis =
  | "angestellter"
  | "arbeiter"
  | "geringfuegig"
  | "lehrling"
  | "dienstvertrag";

export interface InputMitarbeiter {
  active: boolean;
  beschaeftigungsform: Dienstverhaeltnis;
  bruttogehaltProMonat: number;
  anzahlWochenstunden: number;
  anzahlBeschaeftigungsmonate: number;
  zusatzkostenMonatlich: number;
  zusatzkostenJaehrlich: number;
  verkaufbareStunden: number; // %
  stundensatz: number;
  umsatzsteigerung: number; // %
  foerderung: boolean; // EPU
  foerderungBonus: boolean;
  foerderungStartUp: boolean;
}

export interface InputModel {
  nameDesUnternehmens: string;
  gruendungsjahr: number;
  branche: Branche;
  umsatz: number;
  aufwand: number;
  stunden: number;
  wareneinsatz: number;
  provision: number; // %
  erzielbarerGewinn: number;
  mitarbeiter1: InputMitarbeiter;
  mitarbeiter2: InputMitarbeiter;
  mitarbeiter3: InputMitarbeiter;
  mitarbeiter4: InputMitarbeiter;
}

export interface MonatJahr {
  monat: number;
  jahr: number;
}

export interface MitarbeiterResult {
  brutto: MonatJahr;
  bruttoInklLohnnebenkosten: MonatJahr;
  foerderungText: string;
  foerderung: MonatJahr;
  arbeitsstunden: MonatJahr;
}

export interface OutputModel {
  fehlermeldung: string;
  ausgangssituation: {
    umsatzText: string;
    umsatz: MonatJahr;
    wareneinsatz: MonatJahr;
    aufwand: MonatJahr;
    gewinn: MonatJahr;
  };
  potenzial: {
    umsatzpotenzialMitarbeiter: MonatJahr;
    umsatzpotenzialBreakEven: MonatJahr;
    stundenMitarbeiter: MonatJahr;
    stundenBreakEven: MonatJahr;
  };
  breakEven: {
    gesamtumsatz: MonatJahr;
    breakEvenUmsatzText: string;
    breakEvenUmsatz: MonatJahr;
    wareneinsatz: MonatJahr;
    aufwand: MonatJahr;
    personalkosten: MonatJahr;
    foerderungenGesamt: MonatJahr;
    gewinn: MonatJahr;
    mitarbeiter: MitarbeiterResult[];
  };
}

export const emptyMitarbeiter = (): InputMitarbeiter => ({
  active: false,
  beschaeftigungsform: "angestellter",
  bruttogehaltProMonat: 0,
  anzahlWochenstunden: 0,
  anzahlBeschaeftigungsmonate: 0,
  zusatzkostenMonatlich: 0,
  zusatzkostenJaehrlich: 0,
  verkaufbareStunden: 0,
  stundensatz: 0,
  umsatzsteigerung: 0,
  foerderung: false,
  foerderungBonus: false,
  foerderungStartUp: false,
});

export const emptyMitarbeiterResult = (): MitarbeiterResult => ({
  brutto: { monat: 0, jahr: 0 },
  bruttoInklLohnnebenkosten: { monat: 0, jahr: 0 },
  foerderungText: "Förderung",
  foerderung: { monat: 0, jahr: 0 },
  arbeitsstunden: { monat: 0, jahr: 0 },
});
