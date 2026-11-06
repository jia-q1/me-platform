/**
 * Lightweight SVG charts. No chart library yet: the shapes are simple and this keeps
 * the bundle small. If the charts grow (tooltips, zoom, many series), swap these for
 * a library such as Recharts without touching the pages.
 */
import type { QuarterPoint } from '../data/types';
import { num, usdM } from '../lib/format';

const BLUE = '#0468B1';
const BLUE_LIGHT = '#9CC3E6';
const GRID = '#E6EBF0';
const MUTED = '#55606E';

/** Cumulative achieved (bars) against the quarterly target (line). */
export function QuarterChart({ data, endTarget }: { data: QuarterPoint[]; endTarget: number | null }) {
  if (data.length === 0) return <p className="note">No quarterly results reported yet.</p>;
  const W = 720;
  const H = 260;
  const pad = { l: 56, r: 16, t: 24, b: 32 };
  const max = Math.max(endTarget ?? 0, ...data.map((d) => Math.max(d.achieved ?? 0, d.target ?? 0))) * 1.08 || 1;
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const step = iw / data.length;
  const y = (v: number) => pad.t + ih - (v / max) * ih;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));
  const targetPts = data
    .map((d, i) => (d.target == null ? null : `${pad.l + step * i + step / 2},${y(d.target)}`))
    .filter(Boolean)
    .join(' ');

  return (
    <figure className="chart">
      <div className="legend">
        <span><i className="sw" style={{ background: BLUE }} />Achieved (cumulative)</span>
        <span><i className="sw sw-line" style={{ borderColor: MUTED }} />Target</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Results against targets by quarter">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke={GRID} />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill={MUTED}>{num(t)}</text>
          </g>
        ))}
        {endTarget != null && (
          <g>
            <line x1={pad.l} x2={W - pad.r} y1={y(endTarget)} y2={y(endTarget)} stroke="#1F2328" strokeDasharray="2 4" />
            <text x={W - pad.r} y={y(endTarget) - 6} textAnchor="end" fontSize="11" fill="#1F2328" fontWeight="700">
              End-of-project target {num(endTarget)}
            </text>
          </g>
        )}
        {data.map((d, i) => {
          const x = pad.l + step * i + step * 0.18;
          const w = step * 0.64;
          return (
            <g key={d.label}>
              {d.achieved != null && (
                <rect x={x} y={y(d.achieved)} width={w} height={pad.t + ih - y(d.achieved)} fill={BLUE}>
                  <title>{`${d.label}: ${num(d.achieved)} achieved of ${num(d.target)} target`}</title>
                </rect>
              )}
              <text x={pad.l + step * i + step / 2} y={H - 10} textAnchor="middle" fontSize="12" fill={MUTED}>{d.label}</text>
            </g>
          );
        })}
        <polyline points={targetPts} fill="none" stroke={MUTED} strokeWidth="2" strokeDasharray="6 4" />
      </svg>
    </figure>
  );
}

/** Budget vs expenditure, one row per item. */
export function BudgetBars({ rows }: { rows: { label: string; budget: number | null; expenditure: number | null }[] }) {
  const max = Math.max(1, ...rows.map((r) => Math.max(r.budget ?? 0, r.expenditure ?? 0)));
  return (
    <figure className="chart">
      <div className="legend">
        <span><i className="sw" style={{ background: BLUE_LIGHT }} />Budget</span>
        <span><i className="sw" style={{ background: BLUE }} />Expenditure</span>
      </div>
      <div className="bbars">
        {rows.map((r) => (
          <div className="bbar" key={r.label}>
            <div className="bbar-label">{r.label}</div>
            <div className="bbar-tracks">
              <div className="bbar-track">
                <div className="bbar-fill" style={{ width: `${((r.budget ?? 0) / max) * 100}%`, background: BLUE_LIGHT }} />
                <span>{usdM(r.budget)}</span>
              </div>
              <div className="bbar-track">
                <div className="bbar-fill" style={{ width: `${((r.expenditure ?? 0) / max) * 100}%`, background: BLUE }} />
                <span>{usdM(r.expenditure)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </figure>
  );
}

/** Simple labelled horizontal bars (e.g. expenditure by pillar). */
export function HBars({ rows, format = usdM }: { rows: { label: string; value: number | null }[]; format?: (v: number | null) => string }) {
  const max = Math.max(1, ...rows.map((r) => r.value ?? 0));
  return (
    <div className="hbars">
      {rows.map((r) => (
        <div className="hbar" key={r.label}>
          <div className="hbar-label">{r.label}</div>
          <div className="hbar-track">
            <div className="hbar-fill" style={{ width: `${((r.value ?? 0) / max) * 100}%` }} />
          </div>
          <div className="hbar-value">{format(r.value)}</div>
        </div>
      ))}
    </div>
  );
}

export function Sparkline({ values, target }: { values: (number | null)[]; target: number | null }) {
  const W = 220;
  const H = 56;
  const pts = values.map((v, i) => ({ v, i })).filter((p): p is { v: number; i: number } => p.v != null);
  if (pts.length === 0) return <div className="spark-empty">No trend data yet</div>;
  const max = Math.max(target ?? 0, ...pts.map((p) => p.v)) || 1;
  const x = (i: number) => (i / Math.max(1, values.length - 1)) * (W - 8) + 4;
  const y = (v: number) => H - 6 - (v / max) * (H - 12);
  return (
    <svg className="spark" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      {target != null && <line x1="0" x2={W} y1={y(target)} y2={y(target)} stroke={MUTED} strokeDasharray="4 4" />}
      <polyline points={pts.map((p) => `${x(p.i)},${y(p.v)}`).join(' ')} fill="none" stroke={BLUE} strokeWidth="2.5" />
      {pts.length > 0 && <circle cx={x(pts[pts.length - 1].i)} cy={y(pts[pts.length - 1].v)} r="3.5" fill={BLUE} />}
    </svg>
  );
}
