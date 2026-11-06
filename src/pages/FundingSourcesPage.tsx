import { Link, useSearchParams } from 'react-router';
import { listFundingSources } from '../data/api';
import { useData } from '../data/useData';
import type { FundingSource, FundingType } from '../data/types';
import { Badge, FilterBar, Loaded, PageHeader, SearchField, SelectField } from '../components/ui';
import { date, pct, pctText, usdM } from '../lib/format';

export const fundingTypeLabel: Record<FundingType, string> = {
  bilateral: 'Bilateral',
  multilateral: 'Multilateral',
  core: 'Core and set-aside',
};

type DueFilter = 'any' | '30' | '90' | 'overdue';

/** Next reporting obligation that isn't submitted yet. */
export function nextReport(f: FundingSource) {
  return f.obligations.filter((o) => o.status !== 'submitted' && o.due).sort((a, b) => (a.due! < b.due! ? -1 : 1))[0] ?? null;
}

function matchesDue(f: FundingSource, filter: DueFilter, today = new Date()) {
  if (filter === 'any') return true;
  const next = nextReport(f);
  if (!next?.due) return false;
  const days = (new Date(`${next.due}T00:00:00`).getTime() - today.getTime()) / 86_400_000;
  if (filter === 'overdue') return days < 0;
  return days >= 0 && days <= Number(filter);
}

export function FundingSourcesPage() {
  const [params, setParams] = useSearchParams();
  const type = (params.get('type') ?? 'all') as FundingType | 'all';
  const due = (params.get('due') ?? 'any') as DueFilter;
  const q = params.get('q') ?? '';

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'all' || value === 'any') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const data = useData(() => listFundingSources(), []);

  return (
    <div className="wrap">
      <PageHeader
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Funding sources' }]}
        title="M&E by funding source"
        meta="Contributions, delivery and reporting obligations for each funding source, including the Crisis Bureau set-aside."
      />
      <Loaded state={data}>
        {(sources) => {
          const filtered = sources.filter(
            (f) => (type === 'all' || f.type === type) && matchesDue(f, due) && (!q || f.name.toLowerCase().includes(q.toLowerCase())),
          );
          return (
            <>
              <FilterBar>
                <SelectField
                  label="Type"
                  value={type}
                  onChange={(v) => set('type', v)}
                  options={[{ value: 'all', label: 'All sources' }, ...(Object.keys(fundingTypeLabel) as FundingType[]).map((t) => ({ value: t, label: fundingTypeLabel[t] }))]}
                />
                <SelectField
                  label="Report due"
                  value={due}
                  onChange={(v) => set('due', v)}
                  options={[
                    { value: 'any', label: 'Any time' },
                    { value: '30', label: 'Next 30 days' },
                    { value: '90', label: 'Next 90 days' },
                    { value: 'overdue', label: 'Overdue' },
                  ]}
                />
                <SearchField value={q} onChange={(v) => set('q', v)} placeholder="Donor name" />
              </FilterBar>
              {filtered.length === 0 ? (
                <div className="empty">No funding sources match these filters.</div>
              ) : (
                <div className="grid-3">
                  {filtered.map((f) => {
                    const next = nextReport(f);
                    return (
                      <Link key={f.id} to={`/funding-sources/${f.id}`} className="tile card">
                        <span className="card-top">
                          <Badge tone="info">{fundingTypeLabel[f.type]}</Badge>
                        </span>
                        <span className="tile-title serif">{f.name}</span>
                        <span className="kv">
                          <span>Contribution (USD)</span>
                          <strong>{usdM(f.contribution)}</strong>
                        </span>
                        <span className="kv">
                          <span>Spent</span>
                          <strong>{pctText(pct(f.expenditure, f.contribution))}</strong>
                        </span>
                        <span className="kv">
                          <span>Projects funded · next report</span>
                          <strong>
                            {f.projects.length} · {date(next?.due)}
                          </strong>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          );
        }}
      </Loaded>
    </div>
  );
}
