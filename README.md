# Break-Even Calculator React

This is the React frontend rewrite of the original Austrian WKO break-even calculator which was implemented using ASP.NET MVC / .NET Framework.

The React calculation logic is implemented in TypeScript and tested against a reference implementation derived from the original C# source.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Run tests:

```bash
npm test -- --run
```

Build for production:

```bash
npm run build
```

## Important Files

- `src/lib/calculator/calculate.ts`: core calculation logic.
- `src/lib/calculator/types.ts`: input and output data shapes.
- `src/lib/calculator/branche.ts`: industry defaults and visibility rules.
- `src/lib/calculator/constants.ts`: 2026 payroll and subsidy constants.
- `src/lib/calculator/CalculatorContext.tsx`: React state wrapper around the calculator.
- `src/lib/calculator/calculate.test.ts`: focused unit/regression tests for current React logic.
- `src/lib/calculator/csharp-parity.test.ts`: parity tests against a TypeScript reference implementation based on the original C# calculator.

## Test Strategy

There are two calculator test layers:

### `calculate.test.ts`

This is a focused unit/regression test suite for the React calculator. It checks basic readiness/validation, baseline profit, personnel costs, provision turnover, high-salary payroll behavior, bonus rounding, and desired-profit slider behavior.

### `csharp-parity.test.ts`

This is the stronger parity test suite. It contains a TypeScript reference implementation based on the original C# `BreakEvenCalculator`. The React `calculate()` and `calculateExtended()` outputs are compared against that reference across branch, payroll, subsidy, potential, provision, and slider scenarios.

The goal is that parity tests pass without expected failures. If a future change intentionally diverges from the original source, it should be documented explicitly in these tests and in this README.

## Calculator Logic

The calculator estimates whether hiring up to four employees can be covered by additional revenue. It compares the current business situation with a break-even scenario that includes employee payroll costs, extra employee-related costs, and possible subsidies.

The original source uses German domain names, so the English explanation below includes those terms in parentheses.

### 1. Business Inputs

The calculator starts with the business owner's current annual values:

- Revenue (`Umsatz`)
- Expenses (`Aufwand`)
- Billable hours (`Stunden` / `Verrechnete Stunden`)
- Cost of goods (`Wareneinsatz`)
- Commission percentage (`Provision in %`)
- Desired profit slider value (`Erzielbarer Gewinn`)

Not every field applies to every industry (`Branche`):

- Service (`Dienstleistung`): revenue, expenses, billable hours.
- Gastronomy (`Gastronomie`): revenue, expenses, cost of goods.
- Retail (`Handel`): revenue, expenses, cost of goods.
- Mixed trade/services/handcraft (`Gewerbe-Handel-Dienstleistung/Handwerk`, stored as `gewerbe`): revenue, expenses, billable hours, cost of goods.
- Commission-based business (`Provision`): commission revenue, expenses, commission percentage.

The current profit (`Gewinn`) is calculated as:

```text
profit = revenue - expenses - cost of goods
```

For industries without cost of goods, cost of goods is treated as zero.

### 2. Validation

The calculator follows the original validation rules:

- Industry (`Branche`) must be selected.
- Revenue (`Umsatz`) must be greater than zero.
- Expenses (`Aufwand`) cannot be negative.
- Hours (`Stunden`) cannot be negative for service and mixed trade/services.
- Cost of goods (`Wareneinsatz`) cannot be negative for gastronomy, retail, and mixed trade/services.
- Commission percentage (`Provision`) must be greater than zero for commission-based businesses.
- Revenue must be greater than expenses, or greater than expenses plus cost of goods where cost of goods applies.
- Desired profit (`Erzielbarer Gewinn`) cannot be negative.

### 3. Employee Inputs

The calculator supports up to four employees (`Mitarbeiter_1` through `Mitarbeiter_4`). Each employee can have:

- Employment type (`Beschaeftigungsform`), such as salaried employee (`Angestellter`), worker (`Arbeiter`), marginal employment (`Geringfuegig`), apprentice (`Lehrling`), or freelance employment contract (`Freier Dienstvertrag`).
- Monthly gross salary (`BruttogehaltProMonat`).
- Weekly hours (`AnzahlWochenstunden`).
- Employment months per year (`AnzahlBeschaeftigungsmonate`).
- Monthly extra costs (`ZusatzkostenMonatlich`).
- Yearly extra costs (`ZusatzkostenJaehrlich`).
- Saleable hours percentage (`VerkaufbareStunden`) for service-based industries.
- Hourly rate (`Stundensatz`) for service-based industries.
- Estimated revenue increase percentage (`Umsatzsteigerung`) for gastronomy, retail, and commission-based businesses.
- Subsidy flags (`Foerderung`, `FoerderungBonus`, `FoerderungStartUp`).

### 4. Employee Payroll Cost

For each employee with a positive monthly gross salary, the calculator computes:

- Monthly gross pay (`Brutto.Monat`)
- Yearly gross pay (`Brutto.Jahr`)
- Yearly gross pay including employer-side ancillary payroll costs (`BruttoInklLohnnebenkosten.Jahr`)
- Monthly equivalent of that yearly amount (`BruttoInklLohnnebenkosten.Monat`)

The yearly gross pay depends on employment type:

```text
freelance employment contract:
  yearly gross = monthly gross * employment months

all other employment types:
  yearly gross = monthly gross * 14 * (employment months / 12)
```

For marginal employment (`Geringfuegig`), monthly gross is capped at the marginal employment threshold before payroll cost calculations.

The ancillary payroll costs include:

- Social security (`SV`)
- Municipal tax (`KommSt`)
- Employer contribution to FLAF (`DB zum FLAF`)
- Employer surcharge (`DZ zum DB`)
- Company pension contribution (`BV`)

The React implementation intentionally mirrors the original C# behavior:

- The displayed personnel cost caps social security (`SV`) at the social-security contribution base (`SV_Hoechstbeitragsgrundlage`).
- Other ancillary costs are not capped in the displayed personnel cost, matching the original source.
- Subsidy calculations use the same capped-side basis as the original source.

### 5. Subsidies

Only one subsidy can apply to a given employee. The original labels are:

- EPU ancillary payroll subsidy (`EPU Lohnnebenkostenfoerderung`)
- Employment bonus (`Beschaeftigungsbonus`)
- AWS startup subsidy (`aws Foerderung fuer innovative Start-Ups`)

The original calculation behavior is preserved:

- The EPU subsidy is 24% of the capped monthly gross salary and is multiplied by employment months.
- The employment bonus is 50% of eligible employer-side ancillary payroll costs, only when employment months are at least 6.
- The startup subsidy is 100% of eligible employer-side ancillary payroll costs, only when employment months are at least 3 and the business is within the original source's five-year startup window.
- The output label can still show the selected subsidy label even if the subsidy amount is zero because eligibility failed. This matches the original C# helper behavior.

### 6. Working Hours

For service and mixed trade/services industries, the calculator estimates available employee working hours (`Arbeitsstunden`):

```text
monthly working hours = weekly hours * 4.33 * reduction factor
yearly working hours = monthly working hours * employment months
```

The reduction factor (`Kuerzungsfaktor`) is `0.8038`, matching the original code. For freelance employment contracts (`Freier Dienstvertrag`), the factor is `1.0`.

### 7. Break-Even Revenue

The break-even scenario includes:

- Original business expenses (`Aufwand`)
- Additional employee monthly/yearly extra costs (`ZusatzkostenMonatlich`, `ZusatzkostenJaehrlich`)
- Employee payroll costs (`Personalkosten`)
- Original profit (`Gewinn`)
- Minus total subsidies (`FoerderungenGesamt`)

Base break-even revenue (`Break-Even-Umsatz`) is:

```text
break-even revenue =
  expenses
  + personnel costs
  + profit
  - subsidies
```

For gastronomy, retail, and mixed trade/services, the original cost-of-goods ratio is preserved:

```text
cost-of-goods ratio = cost of goods / revenue
```

The break-even revenue is then grossed up so the cost of goods remains proportional to revenue.

For commission-based businesses, the calculator also derives total turnover (`Gesamtumsatz`) from commission revenue:

```text
total turnover = break-even commission revenue * 100 / commission percentage
```

### 8. Employee Revenue Potential

The calculator also estimates potential revenue with the new employees (`Umsatzpotenzial Mitarbeiter`).

For service and mixed trade/services:

```text
employee potential =
  original revenue
  + sum(employee working hours * saleable hours % * hourly rate)
```

If cost of goods applies and saleable-hour data is present, the break-even cost-of-goods difference is added as in the original source.

For gastronomy, retail, and commission-based businesses:

```text
employee potential =
  original revenue
  + sum(original revenue * employee estimated revenue increase %)
```

### 9. Hours Potential And Break-Even Hours

For service and mixed trade/services, the calculator also computes:

- Potential total hours (`Stunden Mitarbeiter`)
- Break-even hours (`Stunden Break Even`)

The original hourly rate is derived from the starting inputs:

```text
service:
  hourly rate = revenue / hours

mixed trade/services:
  hourly rate = (revenue - cost of goods) / hours
```

Break-even hours are derived from break-even revenue and that original hourly rate. If employee-specific saleable-hour and hourly-rate data exists, the original code adds each employee's net personnel cost divided by either that employee's hourly rate or the original derived hourly rate.

### 10. Desired Profit Slider

The desired profit slider (`Erzielbarer Gewinn`) lets the user ask: "What revenue/hours would be needed to reach this profit?"

The original source handles this as a second calculation pass:

1. First pass calculates the original cost-of-goods ratio and hourly rate.
2. Second pass replaces profit (`Gewinn`) with desired profit (`Erzielbarer Gewinn`).
3. Revenue, cost of goods, and hours are recalculated using the first pass's ratio/hourly rate.
4. The displayed original situation (`Ausgangssituation`) is restored to the user's original input values.

The React implementation mirrors that behavior in `calculateExtended()`.
