/**
 * Larger pieces shared by several screens.
 */
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import type { Demographics, ResultStatus, Risk } from '../data/types';
import { num, pct, pctText, usdM } from '../lib/format';
import { Note, Panel, ProgressBar, RiskBadge, StatTile, StatusBadge } from './ui';

export function DemographicsPanel({ data }: { data: Demographics }) {
  const rows: [string, number | null][] = [
    ['Women and girls', data.women],
    ['Youth (15–24)', data.youth],
    ['Displaced or returnees', data.displaced],
    ['Persons with disabilities', data.disability],
  ];
  return (
    <Panel title="Demographics" aside={<span>People reached: <strong>{num(data.total)}</strong></span>}>
      <div className="demo">
        {rows.map(([label, v]) => {
          const p = pct(v, data.total);
          return (
            <div key={label} className="demo-row">
              <div className="demo-top">
                <span>{label}</span>
                <strong>
                  {num(v)} · {pctText(p)}
                </strong>
              </div>
              <ProgressBar value={p} label={label} />
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

export function MoneyOverview({
  budget,
  expenditure,
  extra = [],
  footer,
}: {
  budget: number | null;
  expenditure: number | null;
  extra?: { label: string; value: string }[];
  footer?: ReactNode;
}) {
  const delivery = pct(expenditure, budget);
  return (
    <Panel title="Overview">
      <div className="stats-row">
        <StatTile label="Budget (USD)" value={usdM(budget)} />
        <StatTile label="Expenditure (USD)" value={usdM(expenditure)} />
        {extra.map((e) => (
          <StatTile key={e.label} label={e.label} value={e.value} />
        ))}
      </div>
      <div className="demo-top" style={{ marginTop: 16 }}>
        <span>Delivery rate</span>
        <strong>{pctText(delivery)}</strong>
      </div>
      <ProgressBar value={delivery} label="Delivery rate" />
      {footer}
    </Panel>
  );
}

export function RiskList({ risks }: { risks: Risk[] }) {
  if (risks.length === 0) return <Note>No risks recorded.</Note>;
  return (
    <ul className="risks">
      {risks.map((r) => (
        <li key={r.id}>
          <span>{r.title}</span>
          <RiskBadge level={r.level} />
        </li>
      ))}
    </ul>
  );
}

/** One output as a clickable row: title, achieved vs target, spent vs budget, status. */
export function OutputRow({
  to,
  eyebrow,
  title,
  achievedText,
  achievedPct,
  budget,
  expenditure,
  status,
}: {
  to: string;
  eyebrow: string;
  title: string;
  achievedText: string;
  achievedPct: number | null;
  budget: number | null;
  expenditure: number | null;
  status: ResultStatus;
}) {
  return (
    <Link to={to} className="row-link">
      <div className="row-main">
        <div className="eyebrow-sm">{eyebrow}</div>
        <div className="row-title">{title}</div>
      </div>
      <div className="row-metric">
        <div className="demo-top">
          <span>Achieved vs target</span>
          <strong>{achievedText}</strong>
        </div>
        <ProgressBar value={achievedPct} />
      </div>
      <div className="row-metric-sm">
        <span>Spent / budget</span>
        <strong>
          {usdM(expenditure)} / {usdM(budget)}
        </strong>
      </div>
      <StatusBadge status={status} />
      <span className="row-arrow" aria-hidden="true">→</span>
    </Link>
  );
}
