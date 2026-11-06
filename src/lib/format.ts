import type { Period, ResultStatus, SubmissionStatus, ValidationStatus } from '../data/types';

/** Shown wherever a value is missing (null). */
export const EMPTY = '—';

/** 4_200_000 -> "4.2M", 850_000 -> "0.9M" (USD, matches the prototype). */
export function usdM(value: number | null | undefined): string {
  if (value == null) return EMPTY;
  return `${(value / 1_000_000).toFixed(1)}M`;
}

export function num(value: number | null | undefined): string {
  if (value == null) return EMPTY;
  return value.toLocaleString('en-US');
}

/** Share of a in b as a whole percentage, or null if it can't be computed. */
export function pct(a: number | null | undefined, b: number | null | undefined): number | null {
  if (a == null || b == null || b === 0) return null;
  return Math.round((a / b) * 100);
}

export function pctText(value: number | null | undefined): string {
  return value == null ? EMPTY : `${value}%`;
}

export function date(value: string | null | undefined): string {
  if (!value) return EMPTY;
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function years(start: number | null, end: number | null): string {
  if (start == null || end == null) return EMPTY;
  return `${start}–${end}`;
}

export const resultStatusLabel: Record<ResultStatus, string> = {
  'on-track': 'On track',
  behind: 'Behind',
  'no-data': 'No data',
};

export const submissionLabel: Record<SubmissionStatus, string> = {
  submitted: 'Submitted',
  late: 'Late',
  missing: 'Missing',
};

export const validationLabel: Record<ValidationStatus, string> = {
  validated: 'Validated',
  awaiting: 'Awaiting validation',
  missing: 'Missing',
};

export const periodLabel: Record<Period, string> = {
  quarter: 'Current quarter',
  ytd: 'Year to date',
  'since-start': 'Since start',
};
