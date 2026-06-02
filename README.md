# Break-Even Calculator React

This is the React frontend rewrite of the original Austrian WKO break-even calculator which was implemented using ASP.NET MVC / .NET Framework.

The React calculation logic is implemented in TypeScript and tested against a reference implementation derived from the original C# source.

## Getting Started

Install dependencies:

```bash
bun install
```

Run the development server:

```bash
bun run dev
```

Run tests:

```bash
bun run test
```

Build for production:

```bash
bun run build
```

## Docker

The Docker setup builds the Vite/React app with Bun and serves the compiled static files with nginx.

Build the image:

```bash
docker build -t break-even-calculator .
```

Run the container:

```bash
docker run --rm -p 8080:80 break-even-calculator
```

Then open `http://localhost:8080`.

## Important Files

- `src/lib/calculator/calculate.ts`: core calculation logic.
- `src/lib/calculator/types.ts`: input and output data shapes.
- `src/lib/calculator/branche.ts`: industry defaults and visibility rules.
- `src/lib/calculator/constants.ts`: 2026 payroll and subsidy constants.
- `src/lib/calculator/CalculatorContext.tsx`: React state wrapper around the calculator.
- `src/pages/Calculator.tsx`: main calculator UI entry point.
- `src/lib/calculator/calculate.test.ts`: focused unit/regression tests for current React logic.
- `src/lib/calculator/csharp-parity.test.ts`: parity tests against a TypeScript reference implementation based on the original C# calculator.

## Test Strategy

There are two calculator test layers:

### `calculate.test.ts`

This is a focused unit/regression test suite for the React calculator. It checks basic readiness/validation, baseline profit, personnel costs, provision turnover, high-salary payroll behavior, bonus rounding, and desired-profit slider behavior.

### `csharp-parity.test.ts`

This is the stronger parity test suite. It contains a TypeScript reference implementation based on the original C# `BreakEvenCalculator`. The React `calculate()` and `calculateExtended()` outputs are compared against that reference across branch, payroll, subsidy, potential, provision, and slider scenarios.

The goal is that parity tests pass without expected failures. If a future change intentionally diverges from the original source, it should be documented explicitly in these tests and in this README.
