import { describe, expect, it } from "vitest";
import {
  calculate,
  calculateExtended,
  isReadyToCalculate,
  validateInput,
} from "@/lib/calculator/calculate";
import {
  defaultInput,
  defaultLandingInput,
  defaultMitarbeiterFor,
} from "@/lib/calculator/branche";
import type { Branche, InputModel } from "@/lib/calculator/types";

const round2 = (v: number) => Math.round(v * 100) / 100;

const branchInput = (
  branche: Branche,
  values: Partial<InputModel>,
): InputModel => ({
  ...defaultInput(branche),
  ...values,
});

describe("calculator", () => {
  it("pre-populates first calculator landing defaults", () => {
    const i = defaultLandingInput();

    expect(i.branche).toBe("dienstleistung");
    expect(i.mitarbeiter1).toMatchObject({
      active: true,
      beschaeftigungsform: "angestellter",
      bruttogehaltProMonat: 2200,
      anzahlWochenstunden: 38.5,
      anzahlBeschaeftigungsmonate: 12,
    });
  });

  it("applies branch-specific active employee defaults", () => {
    expect(defaultMitarbeiterFor("dienstleistung", true)).toMatchObject({
      beschaeftigungsform: "angestellter",
      bruttogehaltProMonat: 2200,
      anzahlWochenstunden: 38.5,
      anzahlBeschaeftigungsmonate: 12,
    });
    expect(defaultMitarbeiterFor("gewerbe", true)).toMatchObject({
      beschaeftigungsform: "angestellter",
      bruttogehaltProMonat: 2200,
      anzahlWochenstunden: 38.5,
      anzahlBeschaeftigungsmonate: 12,
    });
    expect(defaultMitarbeiterFor("gastronomie", true)).toMatchObject({
      beschaeftigungsform: "arbeiter",
      bruttogehaltProMonat: 1500,
      anzahlWochenstunden: 40,
      anzahlBeschaeftigungsmonate: 12,
    });
    expect(defaultMitarbeiterFor("handel", true)).toMatchObject({
      beschaeftigungsform: "arbeiter",
      bruttogehaltProMonat: 1500,
      anzahlWochenstunden: 40,
      anzahlBeschaeftigungsmonate: 12,
    });
    expect(defaultMitarbeiterFor("provision", true)).toMatchObject({
      beschaeftigungsform: "angestellter",
      bruttogehaltProMonat: 1800,
      anzahlWochenstunden: 38.5,
      anzahlBeschaeftigungsmonate: 12,
    });
  });

  it("isReadyToCalculate is false for empty input", () => {
    expect(isReadyToCalculate(defaultInput("dienstleistung"))).toBe(false);
  });

  it("requires Wareneinsatz for Gewerbe-Handel-Dienstleistung/Handwerk", () => {
    expect(
      isReadyToCalculate(
        branchInput("gewerbe", {
          umsatz: 100000,
          aufwand: 20000,
          stunden: 1000,
          wareneinsatz: 0,
        }),
      ),
    ).toBe(false);

    expect(
      isReadyToCalculate(
        branchInput("gewerbe", {
          umsatz: 100000,
          aufwand: 20000,
          stunden: 1000,
          wareneinsatz: 10000,
        }),
      ),
    ).toBe(true);
  });

  it("validates umsatz must be > aufwand", () => {
    const i = defaultInput("dienstleistung");
    i.umsatz = 100;
    i.aufwand = 200;
    i.stunden = 100;
    const err = validateInput(i);
    expect(err).not.toBeNull();
  });

  it("computes baseline ausgangssituation correctly (dienstleistung)", () => {
    const i = defaultInput("dienstleistung");
    i.umsatz = 50000;
    i.aufwand = 10000;
    i.stunden = 1000;
    const r = calculate(i);
    expect(r.fehlermeldung).toBe("");
    expect(r.ausgangssituation.gewinn.jahr).toBe(40000);
    // No employees → break-even == ausgangssituation
    expect(r.breakEven.breakEvenUmsatz.jahr).toBe(50000);
  });

  it("calculates Ausgangssituation profit by branch-specific revenue formula", () => {
    const cases: Array<{
      name: string;
      input: InputModel;
      expectedProfit: number;
      expectedWareneinsatz: number;
    }> = [
      {
        name: "dienstleistung",
        input: branchInput("dienstleistung", {
          umsatz: 100000,
          aufwand: 25000,
          stunden: 1000,
        }),
        expectedProfit: 75000,
        expectedWareneinsatz: 0,
      },
      {
        name: "gastronomie",
        input: branchInput("gastronomie", {
          umsatz: 160000,
          aufwand: 50000,
          wareneinsatz: 70000,
        }),
        expectedProfit: 40000,
        expectedWareneinsatz: 70000,
      },
      {
        name: "handel",
        input: branchInput("handel", {
          umsatz: 180000,
          aufwand: 40000,
          wareneinsatz: 65000,
        }),
        expectedProfit: 75000,
        expectedWareneinsatz: 65000,
      },
      {
        name: "gewerbe",
        input: branchInput("gewerbe", {
          umsatz: 140000,
          aufwand: 35000,
          wareneinsatz: 28000,
          stunden: 1200,
        }),
        expectedProfit: 77000,
        expectedWareneinsatz: 28000,
      },
      {
        name: "provision",
        input: branchInput("provision", {
          umsatz: 50000,
          aufwand: 10000,
          provision: 10,
        }),
        expectedProfit: 40000,
        expectedWareneinsatz: 0,
      },
    ];

    cases.forEach(({ name, input, expectedProfit, expectedWareneinsatz }) => {
      const r = calculate(input);

      expect(r.fehlermeldung, name).toBe("");
      expect(r.ausgangssituation.gewinn.jahr, name).toBe(expectedProfit);
      expect(r.ausgangssituation.wareneinsatz.jahr, name).toBe(
        expectedWareneinsatz,
      );
    });
  });

  it("keeps Umsatz inkl. neuer Mitarbeiter profit equal to displayed row arithmetic", () => {
    const cases: Array<{ name: string; input: InputModel }> = [
      {
        name: "dienstleistung",
        input: branchInput("dienstleistung", {
          umsatz: 100000,
          aufwand: 25000,
          stunden: 1000,
          mitarbeiter1: defaultMitarbeiterFor("dienstleistung", true),
        }),
      },
      {
        name: "gastronomie",
        input: branchInput("gastronomie", {
          umsatz: 160000,
          aufwand: 50000,
          wareneinsatz: 70000,
          mitarbeiter1: defaultMitarbeiterFor("gastronomie", true),
        }),
      },
      {
        name: "handel",
        input: branchInput("handel", {
          umsatz: 180000,
          aufwand: 40000,
          wareneinsatz: 65000,
          mitarbeiter1: defaultMitarbeiterFor("handel", true),
        }),
      },
      {
        name: "gewerbe",
        input: branchInput("gewerbe", {
          umsatz: 140000,
          aufwand: 35000,
          wareneinsatz: 28000,
          stunden: 1200,
          mitarbeiter1: defaultMitarbeiterFor("gewerbe", true),
        }),
      },
      {
        name: "provision",
        input: branchInput("provision", {
          umsatz: 50000,
          aufwand: 10000,
          provision: 10,
          mitarbeiter1: defaultMitarbeiterFor("provision", true),
        }),
      },
    ];

    cases.forEach(({ name, input }) => {
      const r = calculate(input);
      const rowProfit = round2(
        r.breakEven.breakEvenUmsatz.jahr -
          r.breakEven.wareneinsatz.jahr -
          r.breakEven.aufwand.jahr -
          r.breakEven.personalkosten.jahr +
          r.breakEven.foerderungenGesamt.jahr,
      );

      expect(r.fehlermeldung, name).toBe("");
      expect(rowProfit, name).toBeCloseTo(r.breakEven.gewinn.jahr, 2);
      expect(r.breakEven.gewinn.jahr, name).toBe(
        r.ausgangssituation.gewinn.jahr,
      );
    });
  });

  it("keeps default dienstleistung employee out of potential until sales inputs are set", () => {
    const i = defaultInput("dienstleistung");
    i.umsatz = 222;
    i.aufwand = 111;
    i.stunden = 2;
    i.mitarbeiter1 = defaultMitarbeiterFor("dienstleistung", true);

    const r = calculate(i);

    expect(r.fehlermeldung).toBe("");
    expect(r.potenzial.umsatzpotenzialMitarbeiter.jahr).toBe(222);
    expect(r.potenzial.stundenMitarbeiter.jahr).toBe(2);
    expect(r.potenzial.umsatzpotenzialBreakEven.jahr).toBeCloseTo(40173.56, 2);
    expect(r.potenzial.stundenBreakEven.jahr).toBe(362);
  });

  it("includes Mitarbeiter1 personalkosten when active (gewerbe)", () => {
    const i = defaultInput("gewerbe");
    i.umsatz = 100000;
    i.aufwand = 20000;
    i.wareneinsatz = 10000;
    i.stunden = 1000;
    i.mitarbeiter1 = {
      ...defaultMitarbeiterFor("gewerbe", true),
      bruttogehaltProMonat: 2000,
    };
    const r = calculate(i);
    expect(r.fehlermeldung).toBe("");
    expect(r.breakEven.personalkosten.jahr).toBeGreaterThan(0);
    // Employee 1 brutto-jahr should be 2000 * 14 = 28000
    expect(r.breakEven.mitarbeiter[0].brutto.jahr).toBeCloseTo(28000, 0);
  });

  it("uses synced Zusatzkosten as one recurring cost instead of double counting", () => {
    const i = defaultInput("dienstleistung");
    i.umsatz = 100000;
    i.aufwand = 20000;
    i.stunden = 1000;
    i.mitarbeiter1 = {
      ...defaultMitarbeiterFor("dienstleistung", true),
      anzahlBeschaeftigungsmonate: 10,
      zusatzkostenMonatlich: 100,
      zusatzkostenJaehrlich: 1200,
    };

    const r = calculate(i);

    expect(r.fehlermeldung).toBe("");
    expect(r.breakEven.aufwand.jahr).toBe(21000);
  });

  it("provision branch produces gesamtumsatz when provision > 0", () => {
    const i = defaultInput("provision");
    i.umsatz = 50000;
    i.aufwand = 10000;
    i.provision = 10;
    const r = calculate(i);
    expect(r.fehlermeldung).toBe("");
    expect(r.breakEven.gesamtumsatz.jahr).toBeGreaterThan(0);
  });

  it("matches original payroll behavior for high salaries by capping only social security in personnel costs", () => {
    const i = defaultInput("dienstleistung");
    i.umsatz = 300000;
    i.aufwand = 60000;
    i.stunden = 1800;
    i.mitarbeiter1 = {
      ...defaultMitarbeiterFor("dienstleistung", true),
      bruttogehaltProMonat: 9000,
      verkaufbareStunden: 0,
      stundensatz: 0,
    };

    const r = calculate(i);

    expect(r.fehlermeldung).toBe("");
    expect(
      r.breakEven.mitarbeiter[0].bruttoInklLohnnebenkosten.jahr,
    ).toBeCloseTo(157316.81, 2);
    expect(
      r.breakEven.mitarbeiter[0].bruttoInklLohnnebenkosten.monat,
    ).toBeCloseTo(13109.73, 2);
  });

  it("matches original bonus subsidy annual-to-monthly rounding order", () => {
    const i = defaultInput("dienstleistung");
    i.gruendungsjahr = 2024;
    i.umsatz = 90000;
    i.aufwand = 20000;
    i.stunden = 1200;
    i.mitarbeiter1 = {
      ...defaultMitarbeiterFor("dienstleistung", true),
      bruttogehaltProMonat: 2200,
      verkaufbareStunden: 0,
      stundensatz: 0,
      foerderungBonus: true,
    };

    const r = calculate(i);

    expect(r.breakEven.mitarbeiter[0].foerderung.jahr).toBeCloseTo(4575.78, 2);
    expect(r.breakEven.mitarbeiter[0].foerderung.monat).toBeCloseTo(381.32, 2);
  });

  it("calculates EPU funding from monthly gross pay and employment months", () => {
    const i = defaultInput("dienstleistung");
    i.umsatz = 120000;
    i.aufwand = 20000;
    i.stunden = 1200;
    i.mitarbeiter1 = {
      ...defaultMitarbeiterFor("dienstleistung", true),
      bruttogehaltProMonat: 3000,
      anzahlBeschaeftigungsmonate: 10,
      foerderung: true,
    };

    const r = calculate(i);

    expect(r.breakEven.mitarbeiter[0].foerderung.monat).toBe(720);
    expect(r.breakEven.mitarbeiter[0].foerderung.jahr).toBe(7200);
  });

  it("keeps original situation visible while calculateExtended applies desired profit to break-even", () => {
    const i = defaultInput("gewerbe");
    i.umsatz = 140000;
    i.aufwand = 35000;
    i.wareneinsatz = 28000;
    i.stunden = 1200;
    i.mitarbeiter1 = {
      ...defaultMitarbeiterFor("gewerbe", true),
      bruttogehaltProMonat: 2000,
      verkaufbareStunden: 70,
      stundensatz: 95,
    };

    const r = calculateExtended(i, 60000);

    expect(r.ausgangssituation.umsatz.jahr).toBe(140000);
    expect(r.ausgangssituation.wareneinsatz.jahr).toBe(28000);
    expect(r.ausgangssituation.gewinn.jahr).toBe(77000);
    expect(r.breakEven.gewinn.jahr).toBe(60000);
  });
});
