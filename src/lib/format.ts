// Use German separators explicitly: dot thousands and comma decimals.
const nfMoney = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const nfDecimal = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const nfInt = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });

export function formatMoney(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "0,00 €";
  return `${nfMoney.format(v)} €`;
}

export function formatNumber(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "0";
  return nfInt.format(v);
}

export function formatDecimal(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "0,00";
  return nfDecimal.format(v);
}

export function formatPercent(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "0,00 %";
  return `${nfDecimal.format(v)} %`;
}

// Parse a German-formatted number string back to a number.
// Accepts: "1.234,56", "1234,56", "1234.56", "1234"
export function parseDeNumber(input: string): number {
  if (!input) return 0;
  const cleaned = input
    .replace(/\s|€|%/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "") // remove thousands dots
    .replace(",", ".");
  const v = parseFloat(cleaned);
  return Number.isFinite(v) ? v : 0;
}
