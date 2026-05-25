import {
  BV,
  DB_ZUM_FLAF,
  DZ_ZUM_DB,
  FOERDERUNG_SATZ,
  JAHR,
  KOMM_ST,
  KUERZUNGSFAKTOR,
  SV_GERINGFUEGIGKEITSGRENZE,
  SV_HOECHSTBEITRAGSGRUNDLAGE,
  SV_PAUSCHALIERUNGSGRENZE,
  WOCHEN_PRO_MONAT,
} from "./constants";
import {
  Branche,
  emptyMitarbeiterResult,
  InputMitarbeiter,
  InputModel,
  MitarbeiterResult,
  OutputModel,
} from "./types";

const round0 = (v: number) => Math.round(v);
const round2 = (v: number) => Math.round(v * 100) / 100;
const round4 = (v: number) => Math.round(v * 10000) / 10000;
const round6 = (v: number) => Math.round(v * 1000000) / 1000000;

function calcLohnnebenkosten(
  brutto: number,
  monate: number,
  sonderzahlung: number,
  satz: number,
  satzSZ: number,
  maxBasis: number | null = null,
): number {
  let lnn: number, lnn13: number, lnn14: number;
  if (maxBasis === null) {
    lnn = round2((brutto * satz) / 100);
    lnn13 = round2((sonderzahlung * satzSZ) / 100);
    lnn14 = round2((sonderzahlung * satzSZ) / 100);
  } else {
    lnn = round2((Math.min(brutto, maxBasis) * satz) / 100);
    lnn13 = round2((Math.min(sonderzahlung, maxBasis * 2) * satzSZ) / 100);
    lnn14 = round2(
      (Math.min(sonderzahlung, Math.max(maxBasis * 2 - sonderzahlung, 0)) *
        satzSZ) /
        100,
    );
  }
  return lnn * monate + lnn13 + lnn14;
}

function svPauschalierungsgrenzeExceeded(
  allMitarbeiter: InputMitarbeiter[],
): boolean {
  let count = 0;
  let total = 0;

  // Mirrors the original C# else-if chain exactly, including its effective
  // behavior of considering only the first marginal employee it encounters.
  if (allMitarbeiter[0].beschaeftigungsform === "geringfuegig") {
    count++;
    total += Math.min(
      allMitarbeiter[0].bruttogehaltProMonat,
      SV_GERINGFUEGIGKEITSGRENZE,
    );
  } else if (allMitarbeiter[1].beschaeftigungsform === "geringfuegig") {
    count++;
    total += Math.min(
      allMitarbeiter[1].bruttogehaltProMonat,
      SV_GERINGFUEGIGKEITSGRENZE,
    );
  } else if (allMitarbeiter[2].beschaeftigungsform === "geringfuegig") {
    count++;
    total += Math.min(
      allMitarbeiter[2].bruttogehaltProMonat,
      SV_GERINGFUEGIGKEITSGRENZE,
    );
  } else if (allMitarbeiter[3].beschaeftigungsform === "geringfuegig") {
    count++;
    total += Math.min(
      allMitarbeiter[3].bruttogehaltProMonat,
      SV_GERINGFUEGIGKEITSGRENZE,
    );
  }

  return count > 1 && total > SV_PAUSCHALIERUNGSGRENZE;
}

function foerderungText(m: InputMitarbeiter): string {
  if (m.foerderung) return "EPU Lohnnebenkostenförderung";
  if (m.foerderungBonus) return "Beschäftigungsbonus";
  if (m.foerderungStartUp) return "aws Förderung für innovative Start-Ups";
  return "Förderung";
}

function calcMitarbeiter(
  input: InputModel,
  m: InputMitarbeiter,
  branche: Branche,
  all: InputMitarbeiter[],
): MitarbeiterResult {
  if (m.bruttogehaltProMonat <= 0) return emptyMitarbeiterResult();

  const typ = m.beschaeftigungsform;
  const monate = m.anzahlBeschaeftigungsmonate;

  let brutto_monat = m.bruttogehaltProMonat;
  if (typ === "geringfuegig") {
    brutto_monat = Math.min(brutto_monat, SV_GERINGFUEGIGKEITSGRENZE);
  }

  let brutto_jahr: number;
  if (typ === "dienstvertrag") {
    brutto_jahr = brutto_monat * monate;
  } else {
    brutto_jahr = brutto_monat * (14 * (monate / 12));
  }

  let sonderzahlung = (brutto_monat / 12) * monate;
  if (typ === "dienstvertrag") sonderzahlung = 0;

  let sv_satz = 0;
  let sv_satz_SZ = 0;
  let sv_max = SV_HOECHSTBEITRAGSGRUNDLAGE;

  if (typ === "angestellter" || typ === "arbeiter") {
    sv_satz = 21.23;
    sv_satz_SZ = 20.48;
  } else if (typ === "geringfuegig") {
    sv_satz = 1.1;
    sv_satz_SZ = 1.1;
    if (svPauschalierungsgrenzeExceeded(all)) {
      sv_satz += 19.4;
      sv_satz_SZ += 19.4;
    }
  } else if (typ === "lehrling") {
    sv_satz = 15.38;
    sv_satz_SZ = 15.38;
  } else if (typ === "dienstvertrag") {
    sv_max = (SV_HOECHSTBEITRAGSGRUNDLAGE * 7) / 6;
    sv_satz = 20.48;
    sv_satz_SZ = 20.48;
  }

  const brutto_inkl_lnn_jahr =
    brutto_jahr +
    calcLohnnebenkosten(
      brutto_monat,
      monate,
      sonderzahlung,
      sv_satz,
      sv_satz_SZ,
      sv_max,
    ) +
    calcLohnnebenkosten(brutto_monat, monate, sonderzahlung, KOMM_ST, KOMM_ST) +
    calcLohnnebenkosten(
      brutto_monat,
      monate,
      sonderzahlung,
      DB_ZUM_FLAF,
      DB_ZUM_FLAF,
    ) +
    calcLohnnebenkosten(
      brutto_monat,
      monate,
      sonderzahlung,
      DZ_ZUM_DB,
      DZ_ZUM_DB,
    ) +
    calcLohnnebenkosten(brutto_monat, monate, sonderzahlung, BV, BV);

  const foerderungBasis =
    brutto_jahr +
    calcLohnnebenkosten(
      brutto_monat,
      monate,
      sonderzahlung,
      sv_satz,
      sv_satz_SZ,
      sv_max,
    ) +
    calcLohnnebenkosten(
      brutto_monat,
      monate,
      sonderzahlung,
      KOMM_ST,
      KOMM_ST,
      sv_max,
    ) +
    calcLohnnebenkosten(
      brutto_monat,
      monate,
      sonderzahlung,
      DB_ZUM_FLAF,
      DB_ZUM_FLAF,
      sv_max,
    ) +
    calcLohnnebenkosten(
      brutto_monat,
      monate,
      sonderzahlung,
      DZ_ZUM_DB,
      DZ_ZUM_DB,
      sv_max,
    ) +
    calcLohnnebenkosten(brutto_monat, monate, sonderzahlung, BV, BV, sv_max);

  const brutto_inkl_lnn_monat = monate > 0 ? brutto_inkl_lnn_jahr / monate : 0;

  let foerderung_jahr = 0;
  let foerderung_monat = 0;
  const label = foerderungText(m);
  const foerderungCount = [
    m.foerderung,
    m.foerderungBonus,
    m.foerderungStartUp,
  ].filter(Boolean).length;

  if ((typ === "angestellter" || typ === "arbeiter") && foerderungCount === 1) {
    if (m.foerderung) {
      foerderung_monat = round2(
        (Math.min(brutto_monat, sv_max) * FOERDERUNG_SATZ) / 100,
      );
      foerderung_jahr = foerderung_monat * monate;
    } else if (m.foerderungBonus && monate >= 6) {
      foerderung_jahr = round2(
        Math.max(((foerderungBasis - brutto_jahr) * 50) / 100, 0),
      );
      foerderung_monat = monate > 0 ? round2(foerderung_jahr / monate) : 0;
    } else if (m.foerderungStartUp && monate >= 3) {
      const unternehmensjahr = JAHR - input.gruendungsjahr + 1;
      if (input.gruendungsjahr === 0 || unternehmensjahr <= 5) {
        foerderung_jahr = round2(Math.max(foerderungBasis - brutto_jahr, 0));
        foerderung_monat = monate > 0 ? round2(foerderung_jahr / monate) : 0;
      }
    }
  }

  let arbeitsstunden_monat = 0;
  let arbeitsstunden_jahr = 0;
  if (branche === "dienstleistung" || branche === "gewerbe") {
    const kf = typ === "dienstvertrag" ? 1.0 : KUERZUNGSFAKTOR;
    arbeitsstunden_monat = round2(
      m.anzahlWochenstunden * WOCHEN_PRO_MONAT * kf,
    );
    arbeitsstunden_jahr = round2(arbeitsstunden_monat * monate);
  }

  return {
    brutto: { monat: round2(brutto_monat), jahr: round2(brutto_jahr) },
    bruttoInklLohnnebenkosten: {
      monat: round2(brutto_inkl_lnn_monat),
      jahr: round2(brutto_inkl_lnn_jahr),
    },
    foerderungText: label,
    foerderung: {
      monat: round2(foerderung_monat),
      jahr: round2(foerderung_jahr),
    },
    arbeitsstunden: {
      monat: round2(arbeitsstunden_monat),
      jahr: round2(arbeitsstunden_jahr),
    },
  };
}

export type ValidationKey =
  | "branche"
  | "umsatz"
  | "aufwand"
  | "stunden"
  | "wareneinsatz"
  | "provision"
  | "umsatzVsAbzug"
  | "erzielbarerGewinn"
  | null;

export interface ValidationError {
  key: Exclude<ValidationKey, null>;
  msg: string; // German default; UI may localize via i18n key
}

export function validateInput(input: InputModel): ValidationError | null {
  const b = input.branche;
  if (!b) return { key: "branche", msg: "Bitte wählen Sie ein Branche aus!" };
  if (input.umsatz <= 0)
    return { key: "umsatz", msg: "Der Umsatz muss größer als Null (0) sein!" };
  if (input.aufwand < 0)
    return {
      key: "aufwand",
      msg: "Der Aufwand darf nicht kleiner als Null (0) sein!",
    };
  if ((b === "dienstleistung" || b === "gewerbe") && input.stunden < 0)
    return {
      key: "stunden",
      msg: "Die Stunden dürfen nicht kleiner als Null (0) sein!",
    };
  if (
    (b === "gastronomie" || b === "handel" || b === "gewerbe") &&
    input.wareneinsatz < 0
  )
    return {
      key: "wareneinsatz",
      msg: "Der Wareneinsatz darf nicht kleiner als Null (0) sein!",
    };
  if (b === "provision" && input.provision <= 0)
    return {
      key: "provision",
      msg: "Die Provision in % muss größer als Null (0) sein!",
    };

  const abzuege =
    input.aufwand +
    (b === "gastronomie" || b === "handel" || b === "gewerbe"
      ? input.wareneinsatz
      : 0);
  if (input.umsatz - abzuege <= 0) {
    return {
      key: "umsatzVsAbzug",
      msg:
        b === "gastronomie" || b === "handel" || b === "gewerbe"
          ? "Der Umsatz muss größer als der Aufwand und Wareneinsatz sein!"
          : "Der Umsatz muss größer als der Aufwand sein!",
    };
  }
  if (input.erzielbarerGewinn < 0)
    return {
      key: "erzielbarerGewinn",
      msg: "Der erzielbare Gewinn darf nicht kleiner als Null (0) sein!",
    };
  return null;
}

export function isReadyToCalculate(input: InputModel): boolean {
  const b = input.branche;
  if (!b) return false;
  if (input.umsatz <= 0 || input.aufwand < 0) return false;
  if ((b === "dienstleistung" || b === "gewerbe") && input.stunden <= 0)
    return false;
  if (
    (b === "gastronomie" || b === "handel" || b === "gewerbe") &&
    input.wareneinsatz < 0
  )
    return false;
  if (b === "provision" && input.provision <= 0) return false;
  return true;
}

interface CalcShared {
  wareneinsatzAnteil: number;
  stundensatz: number;
}

function computeShared(input: InputModel): CalcShared {
  const b = input.branche;
  let wareneinsatzAnteil = 0;
  if (
    (b === "gastronomie" || b === "handel" || b === "gewerbe") &&
    input.umsatz !== 0
  ) {
    wareneinsatzAnteil = round6(input.wareneinsatz / input.umsatz);
    if (wareneinsatzAnteil >= 1) wareneinsatzAnteil = 0;
  }
  let stundensatz = 0;
  if ((b === "dienstleistung" || b === "gewerbe") && input.stunden !== 0) {
    let grundlage = input.umsatz;
    if (b === "gewerbe")
      grundlage = Math.max(input.umsatz - input.wareneinsatz, 0);
    stundensatz = round4(grundlage / input.stunden);
  }
  return { wareneinsatzAnteil, stundensatz };
}

export function calculate(input: InputModel): OutputModel {
  return calculateWithShared(input);
}

function calculateWithShared(
  input: InputModel,
  shared: CalcShared = computeShared(input),
): OutputModel {
  const b = input.branche;
  const all = [
    input.mitarbeiter1,
    input.mitarbeiter2,
    input.mitarbeiter3,
    input.mitarbeiter4,
  ];

  const err = validateInput(input);
  if (err) return errorOutput(err.msg, b);

  const ausgUmsatz_jahr = input.umsatz;
  const ausgAufwand_jahr = input.aufwand;
  const ausgWareneinsatz_jahr =
    b === "gastronomie" || b === "handel" || b === "gewerbe"
      ? input.wareneinsatz
      : 0;
  const ausgGewinn_jahr =
    ausgUmsatz_jahr - ausgAufwand_jahr - ausgWareneinsatz_jahr;

  const { wareneinsatzAnteil, stundensatz } = shared;

  const mResults = all.map((m) => calcMitarbeiter(input, m, b, all));

  const personalkosten_jahr = mResults.reduce(
    (s, m) => s + m.bruttoInklLohnnebenkosten.jahr,
    0,
  );
  const foerderungenGesamt_jahr = mResults.reduce(
    (s, m) => s + m.foerderung.jahr,
    0,
  );

  let beAufwand_jahr = ausgAufwand_jahr;
  all.forEach((m) => {
    if (m.bruttogehaltProMonat > 0) {
      beAufwand_jahr +=
        m.zusatzkostenJaehrlich +
        m.zusatzkostenMonatlich * m.anzahlBeschaeftigungsmonate;
    }
  });

  const beGewinn_jahr = ausgGewinn_jahr;
  const beWareneinsatz_start = ausgWareneinsatz_jahr;

  let beUmsatz_jahr =
    beAufwand_jahr +
    personalkosten_jahr +
    beGewinn_jahr -
    foerderungenGesamt_jahr;

  let beWareneinsatz_jahr = beWareneinsatz_start;
  if (
    (b === "gastronomie" || b === "handel" || b === "gewerbe") &&
    round2(wareneinsatzAnteil) !== 0
  ) {
    beUmsatz_jahr =
      (beUmsatz_jahr * wareneinsatzAnteil) /
      (wareneinsatzAnteil - wareneinsatzAnteil * wareneinsatzAnteil);
    beWareneinsatz_jahr = round2(beUmsatz_jahr * wareneinsatzAnteil);
  }

  const gesamtumsatz_jahr =
    b === "provision" && input.provision !== 0
      ? (beUmsatz_jahr * 100) / input.provision
      : 0;

  let potenzialUmsatz_jahr = 0;
  let potenzialStunden_jahr = 0;
  if (b === "dienstleistung" || b === "gewerbe") {
    potenzialUmsatz_jahr = all.reduce((s, m, i) => {
      return (
        s +
        mResults[i].arbeitsstunden.jahr *
          (m.verkaufbareStunden / 100) *
          m.stundensatz
      );
    }, input.umsatz);

    if (input.wareneinsatz !== 0) {
      const hasV = all.some(
        (m) => m.verkaufbareStunden !== 0 && m.stundensatz !== 0,
      );
      if (hasV)
        potenzialUmsatz_jahr += beWareneinsatz_jahr - ausgWareneinsatz_jahr;
    }

    potenzialStunden_jahr = all.reduce((s, m, i) => {
      return (
        s +
        round0(mResults[i].arbeitsstunden.jahr * (m.verkaufbareStunden / 100))
      );
    }, round0(input.stunden));
  } else if (b === "gastronomie" || b === "handel" || b === "provision") {
    potenzialUmsatz_jahr = all.reduce((s, m) => {
      return s + (ausgUmsatz_jahr * m.umsatzsteigerung) / 100;
    }, input.umsatz);
  }

  const potenzialBreakEven_jahr = beUmsatz_jahr;

  let stundenBreakEven_jahr = 0;
  if (
    (b === "dienstleistung" || b === "gewerbe") &&
    input.stunden !== 0 &&
    stundensatz !== 0
  ) {
    const hasAnyV = all.some(
      (m) => m.verkaufbareStunden !== 0 && m.stundensatz !== 0,
    );
    stundenBreakEven_jahr = round0(beUmsatz_jahr / stundensatz);

    if (hasAnyV) {
      const baseStunden = round0(
        (input.umsatz + (beWareneinsatz_jahr - ausgWareneinsatz_jahr)) /
          stundensatz,
      );
      stundenBreakEven_jahr = baseStunden;
      all.forEach((m, i) => {
        const mr = mResults[i];
        const zusatz =
          m.zusatzkostenJaehrlich +
          m.zusatzkostenMonatlich * m.anzahlBeschaeftigungsmonate;
        const netto =
          mr.bruttoInklLohnnebenkosten.jahr - mr.foerderung.jahr + zusatz;
        if (m.verkaufbareStunden !== 0 && m.stundensatz !== 0) {
          stundenBreakEven_jahr += round0(netto / m.stundensatz);
        } else {
          stundenBreakEven_jahr += round0(netto / stundensatz);
        }
      });
      potenzialStunden_jahr =
        all.reduce(
          (s, m, i) =>
            s +
            round0(
              mResults[i].arbeitsstunden.jahr * (m.verkaufbareStunden / 100),
            ),
          0,
        ) +
        round0(
          (input.umsatz + (beWareneinsatz_jahr - ausgWareneinsatz_jahr)) /
            stundensatz,
        );
    }
  }

  return {
    fehlermeldung: "",
    ausgangssituation: {
      umsatzText: b === "provision" ? "Provisionsumsatz" : "Umsatz",
      umsatz: {
        monat: round2(ausgUmsatz_jahr / 12),
        jahr: round2(ausgUmsatz_jahr),
      },
      wareneinsatz: {
        monat: round2(ausgWareneinsatz_jahr / 12),
        jahr: round2(ausgWareneinsatz_jahr),
      },
      aufwand: {
        monat: round2(ausgAufwand_jahr / 12),
        jahr: round2(ausgAufwand_jahr),
      },
      gewinn: {
        monat: round2(ausgGewinn_jahr / 12),
        jahr: round2(ausgGewinn_jahr),
      },
    },
    potenzial: {
      umsatzpotenzialMitarbeiter: {
        monat: 0,
        jahr: round2(potenzialUmsatz_jahr),
      },
      umsatzpotenzialBreakEven: {
        monat: 0,
        jahr: round2(potenzialBreakEven_jahr),
      },
      stundenMitarbeiter: { monat: 0, jahr: round0(potenzialStunden_jahr) },
      stundenBreakEven: { monat: 0, jahr: round0(stundenBreakEven_jahr) },
    },
    breakEven: {
      gesamtumsatz: {
        monat: round2(gesamtumsatz_jahr / 12),
        jahr: round2(gesamtumsatz_jahr),
      },
      breakEvenUmsatzText:
        b === "provision" ? "Break-Even-Provisionsumsatz" : "Break-Even-Umsatz",
      breakEvenUmsatz: {
        monat: round2(beUmsatz_jahr / 12),
        jahr: round2(beUmsatz_jahr),
      },
      wareneinsatz: {
        monat: round2(beWareneinsatz_jahr / 12),
        jahr: round2(beWareneinsatz_jahr),
      },
      aufwand: {
        monat: round2(beAufwand_jahr / 12),
        jahr: round2(beAufwand_jahr),
      },
      personalkosten: {
        monat: round2(personalkosten_jahr / 12),
        jahr: round2(personalkosten_jahr),
      },
      foerderungenGesamt: {
        monat: round2(foerderungenGesamt_jahr / 12),
        jahr: round2(foerderungenGesamt_jahr),
      },
      gewinn: {
        monat: round2(beGewinn_jahr / 12),
        jahr: round2(beGewinn_jahr),
      },
      mitarbeiter: mResults,
    },
  };
}

export function calculateExtended(
  input: InputModel,
  erzielbarerGewinn: number,
): OutputModel {
  const b = input.branche;
  const shared = computeShared(input);
  const { wareneinsatzAnteil, stundensatz } = shared;
  const newAufwand = input.aufwand;
  let newUmsatz = newAufwand + erzielbarerGewinn;

  if (
    (b === "gastronomie" || b === "handel" || b === "gewerbe") &&
    round2(wareneinsatzAnteil) !== 0
  ) {
    newUmsatz = round2(
      (newUmsatz * wareneinsatzAnteil) /
        (wareneinsatzAnteil - wareneinsatzAnteil * wareneinsatzAnteil),
    );
  }

  const newWareneinsatz = round2(newUmsatz * wareneinsatzAnteil);
  const newStunden =
    stundensatz !== 0
      ? round0(Math.max(newUmsatz - newWareneinsatz, 0) / stundensatz)
      : 0;

  const overridden: InputModel = {
    ...input,
    umsatz: round2(newUmsatz),
    wareneinsatz: newWareneinsatz,
    stunden: newStunden,
    erzielbarerGewinn,
  };

  const result = calculateWithShared(overridden, shared);
  const original = calculate(input);

  // The original C# returns the desired-profit scenario in the break-even and
  // top-level calculated values, then restores the displayed Ausgangssituation
  // back to the user's original inputs at the end of the second pass.
  return {
    ...result,
    ausgangssituation: original.ausgangssituation,
  };
}

function errorOutput(msg: string, b: Branche): OutputModel {
  return {
    fehlermeldung: msg,
    ausgangssituation: {
      umsatzText: b === "provision" ? "Provisionsumsatz" : "Umsatz",
      umsatz: { monat: 0, jahr: 0 },
      wareneinsatz: { monat: 0, jahr: 0 },
      aufwand: { monat: 0, jahr: 0 },
      gewinn: { monat: 0, jahr: 0 },
    },
    potenzial: {
      umsatzpotenzialMitarbeiter: { monat: 0, jahr: 0 },
      umsatzpotenzialBreakEven: { monat: 0, jahr: 0 },
      stundenMitarbeiter: { monat: 0, jahr: 0 },
      stundenBreakEven: { monat: 0, jahr: 0 },
    },
    breakEven: {
      gesamtumsatz: { monat: 0, jahr: 0 },
      breakEvenUmsatzText:
        b === "provision" ? "Break-Even-Provisionsumsatz" : "Break-Even-Umsatz",
      breakEvenUmsatz: { monat: 0, jahr: 0 },
      wareneinsatz: { monat: 0, jahr: 0 },
      aufwand: { monat: 0, jahr: 0 },
      personalkosten: { monat: 0, jahr: 0 },
      foerderungenGesamt: { monat: 0, jahr: 0 },
      gewinn: { monat: 0, jahr: 0 },
      mitarbeiter: [
        emptyMitarbeiterResult(),
        emptyMitarbeiterResult(),
        emptyMitarbeiterResult(),
        emptyMitarbeiterResult(),
      ],
    },
  };
}
