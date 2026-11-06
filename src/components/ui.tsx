/**
 * Small building blocks used on every screen.
 */
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router';
import type { DataState } from '../data/useData';
import type { Period, ResultStatus, RiskLevel, SubmissionStatus, ValidationStatus } from '../data/types';
import { periodLabel, resultStatusLabel, submissionLabel, validationLabel } from '../lib/format';

// ---------------------------------------------------------------------------
// Status badges
// ---------------------------------------------------------------------------

type Tone = 'good' | 'warn' | 'bad' | 'neutral' | 'info';

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

const resultTone: Record<ResultStatus, Tone> = { 'on-track': 'good', behind: 'warn', 'no-data': 'neutral' };
const submissionTone: Record<SubmissionStatus, Tone> = { submitted: 'good', late: 'warn', missing: 'bad' };
const validationTone: Record<ValidationStatus, Tone> = { validated: 'good', awaiting: 'warn', missing: 'bad' };
const riskTone: Record<RiskLevel, Tone> = { high: 'bad', medium: 'warn', low: 'neutral' };

export const StatusBadge = ({ status }: { status: ResultStatus }) => (
  <Badge tone={resultTone[status]}>{resultStatusLabel[status]}</Badge>
);
export const SubmissionBadge = ({ status }: { status: SubmissionStatus }) => (
  <Badge tone={submissionTone[status]}>{submissionLabel[status]}</Badge>
);
export const ValidationBadge = ({ status }: { status: ValidationStatus }) => (
  <Badge tone={validationTone[status]}>{validationLabel[status]}</Badge>
);
export const RiskBadge = ({ level }: { level: RiskLevel }) => (
  <Badge tone={riskTone[level]}>{level[0].toUpperCase() + level.slice(1)}</Badge>
);

// ---------------------------------------------------------------------------
// Layout pieces
// ---------------------------------------------------------------------------

export function Panel({ title, aside, children, className = '' }: { title?: ReactNode; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`panel ${className}`}>
      {(title || aside) && (
        <header className="panel-head">
          {title && <h2 className="serif">{title}</h2>}
          {aside && <div className="panel-aside">{aside}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function StatTile({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value serif">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export function ProgressBar({ value, label }: { value: number | null; label?: string }) {
  const v = value == null ? 0 : Math.max(0, Math.min(100, value));
  return (
    <div className="progress" role="progressbar" aria-valuenow={value ?? undefined} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="progress-fill" style={{ width: `${v}%` }} />
    </div>
  );
}

export type Crumb = { label: string; to?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      {items.map((c, i) => (
        <span key={i}>
          {i > 0 && <span className="crumb-sep">/</span>}
          {c.to ? <Link to={c.to}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({
  crumbs,
  eyebrow,
  title,
  meta,
  actions,
}: {
  crumbs?: Crumb[];
  eyebrow?: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="page-head">
      {crumbs && <Breadcrumbs items={crumbs} />}
      <div className="page-head-row">
        <div>
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          <h1 className="serif">{title}</h1>
          {meta && <div className="page-meta">{meta}</div>}
        </div>
        {actions && <div className="page-actions">{actions}</div>}
      </div>
    </div>
  );
}

/** Tabs that are real links, so each tab has its own URL. */
export function TabLinks({ tabs }: { tabs: { to: string; label: string; end?: boolean }[] }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => (isActive ? 'tab tab-on' : 'tab')}>
          {t.label}
        </NavLink>
      ))}
    </div>
  );
}

export function PeriodSelect({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <label className="field">
      <span>Period</span>
      <select value={value} onChange={(e) => onChange(e.target.value as Period)}>
        {(Object.keys(periodLabel) as Period[]).map((p) => (
          <option key={p} value={p}>
            {periodLabel[p]}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SearchField({ value, onChange, placeholder = 'Search' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="field field-grow">
      <span>Search</span>
      <input type="search" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="filters">{children}</div>;
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="note">{children}</p>;
}

// ---------------------------------------------------------------------------
// Loading / error / empty
// ---------------------------------------------------------------------------

/**
 * Renders children only when data is ready.
 *   <Loaded state={projects}>{(list) => ...}</Loaded>
 * A `null` result (record not found) shows the not-found message.
 */
export function Loaded<T>({ state, children, notFound }: { state: DataState<T>; children: (data: NonNullable<T>) => ReactNode; notFound?: string }) {
  if (state.status === 'loading') return <div className="state">Loading…</div>;
  if (state.status === 'error')
    return (
      <div className="state state-error" role="alert">
        <strong>Couldn't load this data.</strong> {state.error.message}
      </div>
    );
  if (state.data == null) return <NotFound what={notFound} />;
  return <>{children(state.data as NonNullable<T>)}</>;
}

export function NotFound({ what = 'page' }: { what?: string }) {
  return (
    <div className="state">
      <h1 className="serif">Not found</h1>
      <p>We couldn't find that {what}. It may have been renamed or removed.</p>
      <Link to="/" className="btn">
        Back to home
      </Link>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}

// ---------------------------------------------------------------------------
// Toast: for buttons whose feature isn't connected yet
// ---------------------------------------------------------------------------

const ToastContext = createContext<(msg: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const show = useCallback((m: string) => {
    setMsg(m);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMsg(null), 2400);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      {msg && (
        <div className="toast" role="status">
          {msg}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

/** A button for a feature that isn't built yet. Says so instead of doing nothing. */
export function PendingButton({ children, variant = 'btn' }: { children: ReactNode; variant?: 'btn' | 'btn-o' }) {
  const toast = useToast();
  return (
    <button type="button" className={variant} onClick={() => toast('Not connected yet: coming in a later version.')}>
      {children}
    </button>
  );
}
