import { describe, expect, it } from "vitest";
import {
  defaultInput,
  defaultMitarbeiterFor as defaultEmployeeFor,
} from "./branche";
import { calculate, calculateExtended } from "./calculate";
import type {
  Branche as Industry,
  Dienstverhaeltnis as EmploymentType,
  InputMitarbeiter as EmployeeInput,
  InputModel,
  OutputModel,
} from "./types";

// German property names and product strings are kept only where they are part of
// the existing React calculator contract or the original .NET response contract.
const YEAR = 2026;
const SOCIAL_SECURITY_MAX_BASE = 6930.0;
const MARGINAL_EMPLOYMENT_LIMIT = 551.1;
const MARGINAL_EMPLOYMENT_FLAT_RATE_LIMIT = 826.65;
const MUNICIPAL_TAX_RATE = 3.0;
const EMPLOYER_CONTRIBUTION_RATE = 3.7;
const EMPLOYER_SURCHARGE_RATE = 0.36;
const COMPANY_PENSION_RATE = 1.53;
const WEEKS_PER_MONTH = 4.33;
const REDUCTION_FACTOR = 0.8038;
const SUBSIDY_RATE = 24;

class MonthlyYearlyAmount {
  monat = 0;
  jahr = 0;

  constructor(private readonly conversionFactor = 0) {}

  setMonth(value: number) {
    this.monat = round2(value);
    if (this.conversionFactor !== 0)
      this.jahr = round2(this.monat * this.conversionFactor);
  }

  setYear(value: number) {
    this.jahr = round2(value);
    if (this.conversionFactor !== 0)
      this.monat = round2(this.jahr / this.conversionFactor);
  }

  addYear(value: number) {
    this.setYear(this.jahr + value);
  }
}

interface ReferenceEmployeeResult {
  brutto: MonthlyYearlyAmount;
  bruttoInklLohnnebenkosten: MonthlyYearlyAmount;
  foerderungText: string;
  foerderung: MonthlyYearlyAmount;
  arbeitsstunden: MonthlyYearlyAmount;
}

interface ReferenceOutput {
  umsatz: MonthlyYearlyAmount;
  aufwand: MonthlyYearlyAmount;
  stunden: MonthlyYearlyAmount;
  wareneinsatz: MonthlyYearlyAmount;
  fehlermeldung: string;
  ausgangssituation: {
    umsatzText: string;
    umsatz: MonthlyYearlyAmount;
    wareneinsatz: MonthlyYearlyAmount;
    aufwand: MonthlyYearlyAmount;
    gewinn: MonthlyYearlyAmount;
  };
  potenzial: {
    umsatzpotenzialMitarbeiter: MonthlyYearlyAmount;
    umsatzpotenzialBreakEven: MonthlyYearlyAmount;
    stundenMitarbeiter: MonthlyYearlyAmount;
    stundenBreakEven: MonthlyYearlyAmount;
  };
  breakEven: {
    gesamtumsatz: MonthlyYearlyAmount;
    breakEvenUmsatzText: string;
    breakEvenUmsatz: MonthlyYearlyAmount;
    wareneinsatz: MonthlyYearlyAmount;
    aufwand: MonthlyYearlyAmount;
    personalkosten: MonthlyYearlyAmount;
    foerderungenGesamt: MonthlyYearlyAmount;
    gewinn: MonthlyYearlyAmount;
    mitarbeiter: ReferenceEmployeeResult[];
  };
}

const roundAway = (value: number, digits: number) => {
  const factor = 10 ** digits;
  const rounded = Math.round(Math.abs(value) * factor) / factor;
  return value < 0 ? -rounded : rounded;
};

const round0 = (value: number) => roundAway(value, 0);
const round2 = (value: number) => roundAway(value, 2);
const round4 = (value: number) => roundAway(value, 4);
const round6 = (value: number) => roundAway(value, 6);

const emptyReferenceEmployeeResult = (): ReferenceEmployeeResult => ({
  brutto: new MonthlyYearlyAmount(),
  bruttoInklLohnnebenkosten: new MonthlyYearlyAmount(),
  foerderungText: "",
  foerderung: new MonthlyYearlyAmount(),
  arbeitsstunden: new MonthlyYearlyAmount(),
});

const emptyReferenceOutput = (): ReferenceOutput => ({
  umsatz: new MonthlyYearlyAmount(12),
  aufwand: new MonthlyYearlyAmount(12),
  stunden: new MonthlyYearlyAmount(12),
  wareneinsatz: new MonthlyYearlyAmount(12),
  fehlermeldung: "",
  ausgangssituation: {
    umsatzText: "",
    umsatz: new MonthlyYearlyAmount(12),
    wareneinsatz: new MonthlyYearlyAmount(12),
    aufwand: new MonthlyYearlyAmount(12),
    gewinn: new MonthlyYearlyAmount(12),
  },
  potenzial: {
    umsatzpotenzialMitarbeiter: new MonthlyYearlyAmount(12),
    umsatzpotenzialBreakEven: new MonthlyYearlyAmount(12),
    stundenMitarbeiter: new MonthlyYearlyAmount(12),
    stundenBreakEven: new MonthlyYearlyAmount(12),
  },
  breakEven: {
    gesamtumsatz: new MonthlyYearlyAmount(12),
    breakEvenUmsatzText: "",
    breakEvenUmsatz: new MonthlyYearlyAmount(12),
    wareneinsatz: new MonthlyYearlyAmount(12),
    aufwand: new MonthlyYearlyAmount(12),
    personalkosten: new MonthlyYearlyAmount(12),
    foerderungenGesamt: new MonthlyYearlyAmount(12),
    gewinn: new MonthlyYearlyAmount(12),
    mitarbeiter: [
      emptyReferenceEmployeeResult(),
      emptyReferenceEmployeeResult(),
      emptyReferenceEmployeeResult(),
      emptyReferenceEmployeeResult(),
    ],
  },
});

function csharpReference(input: InputModel): ReferenceOutput {
  const result = emptyReferenceOutput();
  const b = input.branche;
  let wareneinsatzAnteil = 0;
  let stundensatz = 0;

  const validationMessage = validateLikeCSharp(input);
  if (validationMessage) {
    result.fehlermeldung = validationMessage;
    return result;
  }

  const ausgangssituation = (extended: boolean) => {
    result.ausgangssituation.umsatzText =
      b === "provision" ? "Provisionsumsatz" : "Umsatz";
    result.ausgangssituation.umsatz.setYear(input.umsatz);
    result.ausgangssituation.aufwand.setYear(input.aufwand);

    if (hasCostOfGoods(b)) {
      result.ausgangssituation.wareneinsatz.setYear(input.wareneinsatz);
    }

    result.ausgangssituation.gewinn.setYear(
      result.ausgangssituation.umsatz.jahr -
        result.ausgangssituation.aufwand.jahr -
        result.ausgangssituation.wareneinsatz.jahr,
    );

    if (extended) {
      result.ausgangssituation.gewinn.setYear(input.erzielbarerGewinn);
      result.ausgangssituation.umsatz.setYear(
        result.ausgangssituation.aufwand.jahr +
          result.ausgangssituation.gewinn.jahr,
      );

      if (hasCostOfGoods(b) && round2(wareneinsatzAnteil) !== 0) {
        result.ausgangssituation.umsatz.setYear(
          round2(
            (result.ausgangssituation.umsatz.jahr * wareneinsatzAnteil) /
              (wareneinsatzAnteil - wareneinsatzAnteil * wareneinsatzAnteil),
          ),
        );
      }

      result.ausgangssituation.wareneinsatz.setYear(
        result.ausgangssituation.umsatz.jahr * wareneinsatzAnteil,
      );
      result.umsatz.setYear(result.ausgangssituation.umsatz.jahr);
      result.aufwand.setYear(result.ausgangssituation.aufwand.jahr);

      if (stundensatz !== 0) {
        let grundlage = result.ausgangssituation.umsatz.jahr;
        if (b === "gewerbe") {
          grundlage = Math.max(
            result.ausgangssituation.umsatz.jahr -
              result.ausgangssituation.wareneinsatz.jahr,
            0,
          );
        }
        result.stunden.setYear(round0(grundlage / stundensatz));
      }

      result.wareneinsatz.setYear(result.ausgangssituation.wareneinsatz.jahr);
    }
  };

  const breakEvenUmsatz = (extended: boolean) => {
    result.umsatz.setYear(input.umsatz);
    result.aufwand.setYear(input.aufwand);
    result.stunden.setYear(input.stunden);
    result.wareneinsatz.setYear(input.wareneinsatz);

    ausgangssituation(extended);

    const employees = employeesOf(input);
    employees.forEach((employee, index) => {
      employeeLikeCSharp(
        input,
        employee,
        b,
        result.breakEven.mitarbeiter[index],
      );
    });

    result.breakEven.breakEvenUmsatzText =
      b === "provision" ? "Break-Even-Provisionsumsatz" : "Break-Even-Umsatz";

    result.breakEven.gewinn.setYear(result.ausgangssituation.gewinn.jahr);
    result.breakEven.foerderungenGesamt.setYear(
      result.breakEven.mitarbeiter.reduce(
        (sum, employee) => sum + employee.foerderung.jahr,
        0,
      ),
    );
    result.breakEven.personalkosten.setYear(
      result.breakEven.mitarbeiter.reduce(
        (sum, employee) => sum + employee.bruttoInklLohnnebenkosten.jahr,
        0,
      ),
    );

    result.breakEven.aufwand.setYear(result.ausgangssituation.aufwand.jahr);
    employees.forEach((employee) => {
      if (employee.bruttogehaltProMonat > 0) {
        result.breakEven.aufwand.addYear(
          employee.zusatzkostenJaehrlich +
            employee.zusatzkostenMonatlich *
              employee.anzahlBeschaeftigungsmonate,
        );
      }
    });

    result.breakEven.wareneinsatz.setYear(
      result.ausgangssituation.wareneinsatz.jahr,
    );
    result.breakEven.breakEvenUmsatz.setYear(
      result.breakEven.aufwand.jahr +
        result.breakEven.personalkosten.jahr +
        result.breakEven.gewinn.jahr -
        result.breakEven.foerderungenGesamt.jahr,
    );

    if (!extended) wareneinsatzAnteil = 0;
    if (hasCostOfGoods(b)) {
      if (result.ausgangssituation.umsatz.jahr !== 0 && !extended) {
        wareneinsatzAnteil = round6(
          result.ausgangssituation.wareneinsatz.jahr /
            result.ausgangssituation.umsatz.jahr,
        );
        if (wareneinsatzAnteil >= 1) wareneinsatzAnteil = 0;
      }

      if (round2(wareneinsatzAnteil) !== 0) {
        result.breakEven.breakEvenUmsatz.setYear(
          (result.breakEven.breakEvenUmsatz.jahr * wareneinsatzAnteil) /
            (wareneinsatzAnteil - wareneinsatzAnteil * wareneinsatzAnteil),
        );
      }
      result.breakEven.wareneinsatz.setYear(
        result.breakEven.breakEvenUmsatz.jahr * wareneinsatzAnteil,
      );
    }

    if (b === "provision" && input.provision !== 0) {
      result.breakEven.gesamtumsatz.setYear(
        (result.breakEven.breakEvenUmsatz.jahr * 100) / input.provision,
      );
    }

    if (hasHours(b)) {
      result.potenzial.umsatzpotenzialMitarbeiter.setYear(
        result.breakEven.mitarbeiter.reduce(
          (sum, employee, index) =>
            sum +
            employee.arbeitsstunden.jahr *
              (employees[index].verkaufbareStunden / 100) *
              employees[index].stundensatz,
          result.umsatz.jahr,
        ),
      );

      if (
        input.wareneinsatz !== 0 &&
        employees.some(
          (employee) =>
            employee.verkaufbareStunden !== 0 && employee.stundensatz !== 0,
        )
      ) {
        result.potenzial.umsatzpotenzialMitarbeiter.addYear(
          result.breakEven.wareneinsatz.jahr - result.wareneinsatz.jahr,
        );
      }

      result.potenzial.stundenMitarbeiter.setYear(
        result.breakEven.mitarbeiter.reduce(
          (sum, employee, index) =>
            sum +
            round0(
              employee.arbeitsstunden.jahr *
                (employees[index].verkaufbareStunden / 100),
            ),
          round0(result.stunden.jahr),
        ),
      );
    } else if (b === "gastronomie" || b === "handel" || b === "provision") {
      result.potenzial.umsatzpotenzialMitarbeiter.setYear(
        employees.reduce(
          (sum, employee) =>
            sum +
            (result.ausgangssituation.umsatz.jahr * employee.umsatzsteigerung) /
              100,
          result.umsatz.jahr,
        ),
      );
    }

    result.potenzial.umsatzpotenzialBreakEven.setYear(
      result.breakEven.breakEvenUmsatz.jahr,
    );

    if (!extended) stundensatz = 0;
    if (hasHours(b) && input.stunden !== 0) {
      if (!extended) {
        let grundlage = result.ausgangssituation.umsatz.jahr;
        if (b === "gewerbe") {
          grundlage = Math.max(
            result.ausgangssituation.umsatz.jahr -
              result.ausgangssituation.wareneinsatz.jahr,
            0,
          );
        }
        stundensatz = round4(grundlage / input.stunden);
      }

      if (stundensatz !== 0) {
        if (
          input.wareneinsatz !== 0 &&
          employees.some(
            (employee) =>
              employee.verkaufbareStunden !== 0 && employee.stundensatz !== 0,
          )
        ) {
          result.potenzial.stundenMitarbeiter.setYear(
            result.breakEven.mitarbeiter.reduce(
              (sum, employee, index) =>
                sum +
                round0(
                  employee.arbeitsstunden.jahr *
                    (employees[index].verkaufbareStunden / 100),
                ),
              round0(
                (result.umsatz.jahr +
                  (result.breakEven.wareneinsatz.jahr -
                    result.wareneinsatz.jahr)) /
                  stundensatz,
              ),
            ),
          );
        }

        result.potenzial.stundenBreakEven.setYear(
          round0(result.breakEven.breakEvenUmsatz.jahr / stundensatz),
        );
      }

      if (
        employees.some(
          (employee) =>
            employee.verkaufbareStunden !== 0 && employee.stundensatz !== 0,
        )
      ) {
        result.potenzial.stundenBreakEven.setYear(input.stunden);
        if (stundensatz !== 0) {
          result.potenzial.stundenBreakEven.setYear(
            round0(
              (result.umsatz.jahr +
                (result.breakEven.wareneinsatz.jahr -
                  result.wareneinsatz.jahr)) /
                stundensatz,
            ),
          );
        }

        employees.forEach((employee, index) => {
          const calculatedEmployee = result.breakEven.mitarbeiter[index];
          const cost =
            calculatedEmployee.bruttoInklLohnnebenkosten.jahr -
            calculatedEmployee.foerderung.jahr +
            employee.zusatzkostenJaehrlich +
            employee.zusatzkostenMonatlich *
              employee.anzahlBeschaeftigungsmonate;

          if (employee.verkaufbareStunden !== 0 && employee.stundensatz !== 0) {
            result.potenzial.stundenBreakEven.addYear(
              round0(cost / employee.stundensatz),
            );
          } else if (stundensatz !== 0) {
            result.potenzial.stundenBreakEven.addYear(
              round0(cost / stundensatz),
            );
          }
        });
      }
    }

    if (extended) ausgangssituation(false);
  };

  breakEvenUmsatz(false);
  if (input.erzielbarerGewinn > 0) breakEvenUmsatz(true);

  return result;
}

function validateLikeCSharp(input: InputModel): string {
  const b = input.branche;
  if (!b) return "Bitte wählen Sie ein Industry aus!";
  if (input.umsatz <= 0) return "Der Umsatz muss größer als Null (0) sein!";
  if (input.aufwand < 0)
    return "Der Aufwand darf nicht kleiner als Null (0) sein!";
  if (hasHours(b) && input.stunden < 0)
    return "Die Stunden dürfen nicht kleiner als Null (0) sein!";
  if (hasCostOfGoods(b) && input.wareneinsatz < 0)
    return "Der Wareneinsatz darf nicht kleiner als Null (0) sein!";
  if (b === "provision" && input.provision <= 0)
    return "Die Provision in % muss größer als Null (0) sein!";

  const abzuege = input.aufwand + (hasCostOfGoods(b) ? input.wareneinsatz : 0);
  if (input.umsatz - abzuege <= 0) {
    return hasCostOfGoods(b)
      ? "Der Umsatz muss größer als der Aufwand und Wareneinsatz sein!"
      : "Der Umsatz muss größer als der Aufwand sein!";
  }
  if (input.erzielbarerGewinn < 0)
    return "Der erzielbare Gewinn darf nicht kleiner als Null (0) sein!";
  return "";
}

function employeeLikeCSharp(
  input: InputModel,
  mitarbeiter: EmployeeInput,
  branche: Industry,
  output: ReferenceEmployeeResult,
) {
  if (mitarbeiter.bruttogehaltProMonat <= 0) return;

  const typ = mitarbeiter.beschaeftigungsform;
  let svMax = SOCIAL_SECURITY_MAX_BASE;
  let svSatz = 0;
  let svSatzSZ = 0;

  output.brutto.setMonth(mitarbeiter.bruttogehaltProMonat);
  if (typ === "geringfuegig") {
    output.brutto.setMonth(
      Math.min(output.brutto.monat, MARGINAL_EMPLOYMENT_LIMIT),
    );
  }

  if (typ === "dienstvertrag") {
    output.brutto.setYear(
      output.brutto.monat * mitarbeiter.anzahlBeschaeftigungsmonate,
    );
  } else {
    output.brutto.setYear(
      output.brutto.monat *
        (14 * (mitarbeiter.anzahlBeschaeftigungsmonate / 12)),
    );
  }

  output.bruttoInklLohnnebenkosten.setYear(output.brutto.jahr);
  let bonusSubsidyBasis = output.bruttoInklLohnnebenkosten.jahr;
  let sonderzahlung =
    (output.brutto.monat / 12) * mitarbeiter.anzahlBeschaeftigungsmonate;

  if (typ === "angestellter" || typ === "arbeiter") {
    svSatz = 21.23;
    svSatzSZ = 20.48;
  } else if (typ === "geringfuegig") {
    svSatz = 1.1;
    svSatzSZ = 1.1;
    if (matchesOriginalMarginalEmploymentFlatRateRule(input)) {
      svSatz += 19.4;
      svSatzSZ += 19.4;
    }
  } else if (typ === "lehrling") {
    svSatz = 15.38;
    svSatzSZ = 15.38;
  } else if (typ === "dienstvertrag") {
    sonderzahlung = 0;
    svMax = (SOCIAL_SECURITY_MAX_BASE * 7) / 6;
    svSatz = 20.48;
    svSatzSZ = 20.48;
  }

  output.bruttoInklLohnnebenkosten.addYear(
    ancillaryPayrollCosts(
      output.brutto.monat,
      mitarbeiter.anzahlBeschaeftigungsmonate,
      sonderzahlung,
      svSatz,
      svSatzSZ,
      svMax,
    ),
  );
  bonusSubsidyBasis = output.bruttoInklLohnnebenkosten.jahr;

  output.bruttoInklLohnnebenkosten.addYear(
    ancillaryPayrollCosts(
      output.brutto.monat,
      mitarbeiter.anzahlBeschaeftigungsmonate,
      sonderzahlung,
      MUNICIPAL_TAX_RATE,
      MUNICIPAL_TAX_RATE,
    ),
  );
  bonusSubsidyBasis += ancillaryPayrollCosts(
    output.brutto.monat,
    mitarbeiter.anzahlBeschaeftigungsmonate,
    sonderzahlung,
    MUNICIPAL_TAX_RATE,
    MUNICIPAL_TAX_RATE,
    svMax,
  );

  output.bruttoInklLohnnebenkosten.addYear(
    ancillaryPayrollCosts(
      output.brutto.monat,
      mitarbeiter.anzahlBeschaeftigungsmonate,
      sonderzahlung,
      EMPLOYER_CONTRIBUTION_RATE,
      EMPLOYER_CONTRIBUTION_RATE,
    ),
  );
  bonusSubsidyBasis += ancillaryPayrollCosts(
    output.brutto.monat,
    mitarbeiter.anzahlBeschaeftigungsmonate,
    sonderzahlung,
    EMPLOYER_CONTRIBUTION_RATE,
    EMPLOYER_CONTRIBUTION_RATE,
    svMax,
  );

  output.bruttoInklLohnnebenkosten.addYear(
    ancillaryPayrollCosts(
      output.brutto.monat,
      mitarbeiter.anzahlBeschaeftigungsmonate,
      sonderzahlung,
      EMPLOYER_SURCHARGE_RATE,
      EMPLOYER_SURCHARGE_RATE,
    ),
  );
  bonusSubsidyBasis += ancillaryPayrollCosts(
    output.brutto.monat,
    mitarbeiter.anzahlBeschaeftigungsmonate,
    sonderzahlung,
    EMPLOYER_SURCHARGE_RATE,
    EMPLOYER_SURCHARGE_RATE,
    svMax,
  );

  output.bruttoInklLohnnebenkosten.addYear(
    ancillaryPayrollCosts(
      output.brutto.monat,
      mitarbeiter.anzahlBeschaeftigungsmonate,
      sonderzahlung,
      COMPANY_PENSION_RATE,
      COMPANY_PENSION_RATE,
    ),
  );
  bonusSubsidyBasis += ancillaryPayrollCosts(
    output.brutto.monat,
    mitarbeiter.anzahlBeschaeftigungsmonate,
    sonderzahlung,
    COMPANY_PENSION_RATE,
    COMPANY_PENSION_RATE,
    svMax,
  );

  if (mitarbeiter.anzahlBeschaeftigungsmonate > 0) {
    output.bruttoInklLohnnebenkosten.setMonth(
      output.bruttoInklLohnnebenkosten.jahr /
        mitarbeiter.anzahlBeschaeftigungsmonate,
    );
  }

  output.foerderungText = subsidyTextLikeCSharp(mitarbeiter);

  if (typ === "angestellter" || typ === "arbeiter") {
    const foerderungCount = [
      mitarbeiter.foerderung,
      mitarbeiter.foerderungBonus,
      mitarbeiter.foerderungStartUp,
    ].filter(Boolean).length;

    if (foerderungCount === 1) {
      if (mitarbeiter.foerderung) {
        output.foerderung.setMonth(
          (Math.min(output.brutto.monat, svMax) * SUBSIDY_RATE) / 100,
        );
        output.foerderung.setYear(
          output.foerderung.monat * mitarbeiter.anzahlBeschaeftigungsmonate,
        );
      }

      if (
        mitarbeiter.foerderungBonus &&
        mitarbeiter.anzahlBeschaeftigungsmonate >= 6
      ) {
        output.foerderung.setYear(
          Math.max(((bonusSubsidyBasis - output.brutto.jahr) * 50) / 100, 0),
        );
        if (mitarbeiter.anzahlBeschaeftigungsmonate > 0) {
          output.foerderung.setMonth(
            output.foerderung.jahr / mitarbeiter.anzahlBeschaeftigungsmonate,
          );
        }
      }

      if (mitarbeiter.foerderungStartUp) {
        const unternehmensjahr = YEAR - input.gruendungsjahr + 1;
        if (
          (input.gruendungsjahr === 0 || unternehmensjahr <= 5) &&
          mitarbeiter.anzahlBeschaeftigungsmonate >= 3
        ) {
          output.foerderung.setYear(
            Math.max(bonusSubsidyBasis - output.brutto.jahr, 0),
          );
          if (mitarbeiter.anzahlBeschaeftigungsmonate > 0) {
            output.foerderung.setMonth(
              output.foerderung.jahr / mitarbeiter.anzahlBeschaeftigungsmonate,
            );
          }
        }
      }
    }
  }

  if (hasHours(branche)) {
    const kuerzungsfaktor = typ === "dienstvertrag" ? 1 : REDUCTION_FACTOR;
    output.arbeitsstunden.setMonth(
      mitarbeiter.anzahlWochenstunden * WEEKS_PER_MONTH * kuerzungsfaktor,
    );
    output.arbeitsstunden.setYear(
      output.arbeitsstunden.monat * mitarbeiter.anzahlBeschaeftigungsmonate,
    );
  }
}

function ancillaryPayrollCosts(
  brutto: number,
  monate: number,
  sonderzahlung: number,
  contributionRate: number,
  specialPaymentContributionRate: number,
  svMax: number | null = null,
) {
  let monthlyAncillaryPayrollCosts = round2((brutto * contributionRate) / 100);
  let thirteenthSalaryAncillaryPayrollCosts = round2(
    (sonderzahlung * specialPaymentContributionRate) / 100,
  );
  let fourteenthSalaryAncillaryPayrollCosts = round2(
    (sonderzahlung * specialPaymentContributionRate) / 100,
  );

  if (svMax !== null) {
    monthlyAncillaryPayrollCosts = round2(
      (Math.min(brutto, svMax) * contributionRate) / 100,
    );
    thirteenthSalaryAncillaryPayrollCosts = round2(
      (Math.min(sonderzahlung, svMax * 2) * specialPaymentContributionRate) /
        100,
    );
    fourteenthSalaryAncillaryPayrollCosts = round2(
      (Math.min(sonderzahlung, Math.max(svMax * 2 - sonderzahlung, 0)) *
        specialPaymentContributionRate) /
        100,
    );
  }

  return (
    monthlyAncillaryPayrollCosts * monate +
    thirteenthSalaryAncillaryPayrollCosts +
    fourteenthSalaryAncillaryPayrollCosts
  );
}

function matchesOriginalMarginalEmploymentFlatRateRule(input: InputModel) {
  const employees = employeesOf(input);
  let count = 0;
  let sum = 0;

  // Mirrors the original else-if chain exactly, including its likely bug.
  if (employees[0].beschaeftigungsform === "geringfuegig") {
    count++;
    sum += Math.min(
      employees[0].bruttogehaltProMonat,
      MARGINAL_EMPLOYMENT_LIMIT,
    );
  } else if (employees[1].beschaeftigungsform === "geringfuegig") {
    count++;
    sum += Math.min(
      employees[1].bruttogehaltProMonat,
      MARGINAL_EMPLOYMENT_LIMIT,
    );
  } else if (employees[2].beschaeftigungsform === "geringfuegig") {
    count++;
    sum += Math.min(
      employees[2].bruttogehaltProMonat,
      MARGINAL_EMPLOYMENT_LIMIT,
    );
  } else if (employees[3].beschaeftigungsform === "geringfuegig") {
    count++;
    sum += Math.min(
      employees[3].bruttogehaltProMonat,
      MARGINAL_EMPLOYMENT_LIMIT,
    );
  }

  return count > 1 && sum > MARGINAL_EMPLOYMENT_FLAT_RATE_LIMIT;
}

const subsidyTextLikeCSharp = (mitarbeiter: EmployeeInput) => {
  if (mitarbeiter.foerderung) return "EPU Lohnnebenkostenförderung";
  if (mitarbeiter.foerderungBonus) return "Beschäftigungsbonus";
  if (mitarbeiter.foerderungStartUp)
    return "aws Förderung für innovative Start-Ups";
  return "Förderung";
};

const hasCostOfGoods = (branche: Industry) =>
  branche === "gastronomie" || branche === "handel" || branche === "gewerbe";

const hasHours = (branche: Industry) =>
  branche === "dienstleistung" || branche === "gewerbe";

const employeesOf = (input: InputModel) => [
  input.mitarbeiter1,
  input.mitarbeiter2,
  input.mitarbeiter3,
  input.mitarbeiter4,
];

function inputFor(
  branche: Industry,
  patch: Partial<InputModel> = {},
): InputModel {
  return {
    ...defaultInput(branche),
    ...patch,
    mitarbeiter1: patch.mitarbeiter1 ?? defaultEmployeeFor(branche, false),
    mitarbeiter2: patch.mitarbeiter2 ?? defaultEmployeeFor(branche, false),
    mitarbeiter3: patch.mitarbeiter3 ?? defaultEmployeeFor(branche, false),
    mitarbeiter4: patch.mitarbeiter4 ?? defaultEmployeeFor(branche, false),
  };
}

function employee(
  branche: Industry,
  patch: Partial<EmployeeInput> = {},
): EmployeeInput {
  return { ...defaultEmployeeFor(branche, true), ...patch, active: true };
}

function assertParity(
  input: InputModel,
  actual: OutputModel = calculate(input),
) {
  const expected = csharpReference(input);

  expect(actual.fehlermeldung).toBe(expected.fehlermeldung);
  if (expected.fehlermeldung) {
    compareMonthlyYearlyAmount(
      "ausgangssituation.umsatz",
      actual.ausgangssituation.umsatz,
      expected.ausgangssituation.umsatz,
    );
    compareMonthlyYearlyAmount(
      "breakEven.breakEvenUmsatz",
      actual.breakEven.breakEvenUmsatz,
      expected.breakEven.breakEvenUmsatz,
    );
    compareYearOnly(
      "potenzial.umsatzpotenzialMitarbeiter",
      actual.potenzial.umsatzpotenzialMitarbeiter,
      expected.potenzial.umsatzpotenzialMitarbeiter,
    );
    return;
  }

  compareMonthlyYearlyAmount(
    "ausgangssituation.umsatz",
    actual.ausgangssituation.umsatz,
    expected.ausgangssituation.umsatz,
  );
  compareMonthlyYearlyAmount(
    "ausgangssituation.wareneinsatz",
    actual.ausgangssituation.wareneinsatz,
    expected.ausgangssituation.wareneinsatz,
  );
  compareMonthlyYearlyAmount(
    "ausgangssituation.aufwand",
    actual.ausgangssituation.aufwand,
    expected.ausgangssituation.aufwand,
  );
  compareMonthlyYearlyAmount(
    "ausgangssituation.gewinn",
    actual.ausgangssituation.gewinn,
    expected.ausgangssituation.gewinn,
  );

  compareMonthlyYearlyAmount(
    "breakEven.gesamtumsatz",
    actual.breakEven.gesamtumsatz,
    expected.breakEven.gesamtumsatz,
  );
  expect(actual.breakEven.breakEvenUmsatzText).toBe(
    expected.breakEven.breakEvenUmsatzText,
  );
  compareMonthlyYearlyAmount(
    "breakEven.breakEvenUmsatz",
    actual.breakEven.breakEvenUmsatz,
    expected.breakEven.breakEvenUmsatz,
  );
  compareMonthlyYearlyAmount(
    "breakEven.wareneinsatz",
    actual.breakEven.wareneinsatz,
    expected.breakEven.wareneinsatz,
  );
  compareMonthlyYearlyAmount(
    "breakEven.aufwand",
    actual.breakEven.aufwand,
    expected.breakEven.aufwand,
  );
  compareMonthlyYearlyAmount(
    "breakEven.personalkosten",
    actual.breakEven.personalkosten,
    expected.breakEven.personalkosten,
  );
  compareMonthlyYearlyAmount(
    "breakEven.foerderungenGesamt",
    actual.breakEven.foerderungenGesamt,
    expected.breakEven.foerderungenGesamt,
  );
  compareMonthlyYearlyAmount(
    "breakEven.gewinn",
    actual.breakEven.gewinn,
    expected.breakEven.gewinn,
  );

  // Original comments and jQuery rendering use only yearly potential values.
  compareYearOnly(
    "potenzial.umsatzpotenzialMitarbeiter",
    actual.potenzial.umsatzpotenzialMitarbeiter,
    expected.potenzial.umsatzpotenzialMitarbeiter,
  );
  compareYearOnly(
    "potenzial.umsatzpotenzialBreakEven",
    actual.potenzial.umsatzpotenzialBreakEven,
    expected.potenzial.umsatzpotenzialBreakEven,
  );
  compareYearOnly(
    "potenzial.stundenMitarbeiter",
    actual.potenzial.stundenMitarbeiter,
    expected.potenzial.stundenMitarbeiter,
  );
  compareYearOnly(
    "potenzial.stundenBreakEven",
    actual.potenzial.stundenBreakEven,
    expected.potenzial.stundenBreakEven,
  );

  actual.breakEven.mitarbeiter.forEach((actualEmployee, index) => {
    const expectedEmployee = expected.breakEven.mitarbeiter[index];
    compareMonthlyYearlyAmount(
      `mitarbeiter.${index}.brutto`,
      actualEmployee.brutto,
      expectedEmployee.brutto,
    );
    compareMonthlyYearlyAmount(
      `mitarbeiter.${index}.bruttoInklLohnnebenkosten`,
      actualEmployee.bruttoInklLohnnebenkosten,
      expectedEmployee.bruttoInklLohnnebenkosten,
    );
    if (expectedEmployee.brutto.monat > 0 || actualEmployee.brutto.monat > 0) {
      expect(actualEmployee.foerderungText).toBe(
        expectedEmployee.foerderungText,
      );
    }
    compareMonthlyYearlyAmount(
      `mitarbeiter.${index}.foerderung`,
      actualEmployee.foerderung,
      expectedEmployee.foerderung,
    );
    compareMonthlyYearlyAmount(
      `mitarbeiter.${index}.arbeitsstunden`,
      actualEmployee.arbeitsstunden,
      expectedEmployee.arbeitsstunden,
    );
  });
}

function compareMonthlyYearlyAmount(
  label: string,
  actual: { monat: number; jahr: number },
  expected: { monat: number; jahr: number },
) {
  expect(actual.monat, `${label}.monat`).toBeCloseTo(expected.monat, 2);
  expect(actual.jahr, `${label}.jahr`).toBeCloseTo(expected.jahr, 2);
}

function compareYearOnly(
  label: string,
  actual: { jahr: number },
  expected: { jahr: number },
) {
  expect(actual.jahr, `${label}.jahr`).toBeCloseTo(expected.jahr, 2);
}

describe("calculator parity with original .NET BreakEvenCalculator", () => {
  it.each<Industry>([
    "dienstleistung",
    "gastronomie",
    "handel",
    "gewerbe",
    "provision",
  ])(
    "matches original validation/error output for invalid %s input",
    (branche) => {
      assertParity(inputFor(branche));
    },
  );

  it("matches service baseline without employees", () => {
    assertParity(
      inputFor("dienstleistung", {
        umsatz: 50000,
        aufwand: 10000,
        stunden: 1000,
      }),
    );
  });

  it("matches gastronomy break-even gross-up using cost-of-goods ratio", () => {
    assertParity(
      inputFor("gastronomie", {
        umsatz: 120000,
        aufwand: 45000,
        wareneinsatz: 30000,
      }),
    );
  });

  it("matches retail potential from estimated employee revenue increase", () => {
    assertParity(
      inputFor("handel", {
        umsatz: 160000,
        aufwand: 50000,
        wareneinsatz: 70000,
        mitarbeiter1: employee("handel", { umsatzsteigerung: 12 }),
      }),
    );
  });

  it("matches mixed trade/services employee potential hours and break-even hours", () => {
    assertParity(
      inputFor("gewerbe", {
        umsatz: 130000,
        aufwand: 30000,
        wareneinsatz: 25000,
        stunden: 1300,
        mitarbeiter1: employee("gewerbe", {
          bruttogehaltProMonat: 2000,
          anzahlWochenstunden: 38.5,
          verkaufbareStunden: 70,
          stundensatz: 95,
        }),
      }),
    );
  });

  it("matches commission-based total turnover calculation", () => {
    assertParity(
      inputFor("provision", {
        umsatz: 60000,
        aufwand: 18000,
        provision: 8,
        mitarbeiter1: employee("provision", {
          bruttogehaltProMonat: 1800,
          umsatzsteigerung: 10,
        }),
      }),
    );
  });

  it.each<[string, Partial<EmployeeInput>]>([
    ["EPU ancillary payroll subsidy", { foerderung: true }],
    ["aws startup subsidy", { foerderungStartUp: true }],
  ])("matches eligible subsidy calculation for %s", (_name, subsidyPatch) => {
    assertParity(
      inputFor("dienstleistung", {
        gruendungsjahr: 2024,
        umsatz: 90000,
        aufwand: 20000,
        stunden: 1200,
        mitarbeiter1: employee("dienstleistung", {
          bruttogehaltProMonat: 2200,
          anzahlWochenstunden: 38.5,
          verkaufbareStunden: 0,
          stundensatz: 0,
          ...subsidyPatch,
        }),
      }),
    );
  });

  it("matches original behavior: bonus subsidy can drift by one cent from C# decimal rounding", () => {
    assertParity(
      inputFor("dienstleistung", {
        gruendungsjahr: 2024,
        umsatz: 90000,
        aufwand: 20000,
        stunden: 1200,
        mitarbeiter1: employee("dienstleistung", {
          bruttogehaltProMonat: 2200,
          anzahlWochenstunden: 38.5,
          verkaufbareStunden: 0,
          stundensatz: 0,
          foerderungBonus: true,
        }),
      }),
    );
  });

  it("matches original behavior: high salary payroll costs must not cap all non-SV components", () => {
    assertParity(
      inputFor("dienstleistung", {
        umsatz: 300000,
        aufwand: 60000,
        stunden: 1800,
        mitarbeiter1: employee("dienstleistung", {
          bruttogehaltProMonat: 9000,
          anzahlWochenstunden: 38.5,
          verkaufbareStunden: 0,
          stundensatz: 0,
        }),
      }),
    );
  });

  it("matches original behavior: bonus subsidy uses the original capped-side subsidy basis", () => {
    assertParity(
      inputFor("dienstleistung", {
        umsatz: 300000,
        aufwand: 60000,
        stunden: 1800,
        mitarbeiter1: employee("dienstleistung", {
          bruttogehaltProMonat: 9000,
          anzahlWochenstunden: 38.5,
          verkaufbareStunden: 0,
          stundensatz: 0,
          foerderungBonus: true,
        }),
      }),
    );
  });

  it("matches original behavior: marginal-employment social-security flat-rate rule mirrors the original else-if chain", () => {
    assertParity(
      inputFor("dienstleistung", {
        umsatz: 90000,
        aufwand: 15000,
        stunden: 1000,
        mitarbeiter1: employee("dienstleistung", {
          beschaeftigungsform: "geringfuegig" as EmploymentType,
          bruttogehaltProMonat: 500,
        }),
        mitarbeiter2: employee("dienstleistung", {
          beschaeftigungsform: "geringfuegig" as EmploymentType,
          bruttogehaltProMonat: 500,
        }),
      }),
    );
  });

  it("matches original behavior: extended desired-profit slider must mirror the original second pass", () => {
    const input = inputFor("gewerbe", {
      umsatz: 140000,
      aufwand: 35000,
      wareneinsatz: 28000,
      stunden: 1200,
      mitarbeiter1: employee("gewerbe", {
        bruttogehaltProMonat: 2000,
        verkaufbareStunden: 70,
        stundensatz: 95,
      }),
      erzielbarerGewinn: 60000,
    });

    assertParity(
      input,
      calculateExtended({ ...input, erzielbarerGewinn: 0 }, 60000),
    );
  });

  it("matches original behavior: original keeps subsidy label even when startup subsidy is ineligible", () => {
    assertParity(
      inputFor("dienstleistung", {
        gruendungsjahr: 2018,
        umsatz: 90000,
        aufwand: 20000,
        stunden: 1200,
        mitarbeiter1: employee("dienstleistung", {
          bruttogehaltProMonat: 2200,
          verkaufbareStunden: 0,
          stundensatz: 0,
          foerderungStartUp: true,
        }),
      }),
    );
  });
});
