import { Link, useSearchParams } from 'react-router';
import { listCountries, listProjects } from '../data/api';
import { useData } from '../data/useData';
import type { ResultStatus } from '../data/types';
import { BudgetBars } from '../components/charts';
import { MapPanel } from '../components/MapPanel';
import { ViewToggle } from '../components/ViewToggle';
import { FilterBar, Loaded, Note, PageHeader, Panel, SearchField, SelectField, StatusBadge } from '../components/ui';
import { pct, pctText, usdM, years } from '../lib/format';

/** Rough country centroids for the participating-countries map. Replace with ISO3 lookups once real countries are used. */
const COUNTRY_POS: Record<string, [number, number]> = {
  'country-a': [33, 44],
  'country-b': [13, -10],
  'country-c': [23, 90],
  'country-d': [9, 39],
  'country-e': [12, -73],
};

export function ProjectsPage() {
  const [params, setParams] = useSearchParams();
  const pillar = params.get('pillar') ?? 'all';
  const status = (params.get('status') ?? 'all') as ResultStatus | 'all';
  const q = params.get('q') ?? '';
  const view = params.get('view') === 'map' ? 'map' : 'list';

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'all' || (key === 'view' && value === 'list')) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const data = useData(() => Promise.all([listProjects(), listCountries()]).then(([projects, countries]) => ({ projects, countries })), []);

  return (
    <div className="wrap">
      <PageHeader
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Projects' }]}
        title="M&E by project"
        meta="Every project in the portfolio with its delivery and results status. New projects appear automatically once created in Quantum."
        actions={<ViewToggle value={view} onChange={(v) => set('view', v)} />}
      />
      <Loaded state={data}>
        {({ projects, countries }) => {
          const pillars = [...new Set(projects.map((p) => p.pillar))];
          const filtered = projects.filter(
            (p) =>
              (pillar === 'all' || p.pillar === pillar) &&
              (status === 'all' || p.status === status) &&
              (!q || p.name.toLowerCase().includes(q.toLowerCase())),
          );
          return (
            <>
              <FilterBar>
                <SelectField label="Pillar" value={pillar} onChange={(v) => set('pillar', v)} options={[{ value: 'all', label: 'All pillars' }, ...pillars.map((p) => ({ value: p, label: p }))]} />
                <SelectField
                  label="Status"
                  value={status}
                  onChange={(v) => set('status', v)}
                  options={[
                    { value: 'all', label: 'All' },
                    { value: 'on-track', label: 'On track' },
                    { value: 'behind', label: 'Behind' },
                    { value: 'no-data', label: 'No data' },
                  ]}
                />
                <SearchField value={q} onChange={(v) => set('q', v)} placeholder="Project name" />
              </FilterBar>

              {view === 'map' ? (
                <Panel title="Participating countries">
                  <MapPanel
                    sizeLabel="number of projects"
                    points={countries
                      .map((c) => ({ c, n: filtered.filter((p) => p.countryIds.includes(c.id)).length }))
                      .filter(({ c, n }) => n > 0 && COUNTRY_POS[c.id])
                      .map(({ c, n }) => ({
                        id: c.id,
                        label: `${c.name} · ${n} project${n > 1 ? 's' : ''}`,
                        lat: COUNTRY_POS[c.id][0],
                        lng: COUNTRY_POS[c.id][1],
                        value: n,
                        to: `/countries/${c.id}`,
                      }))}
                  />
                </Panel>
              ) : filtered.length === 0 ? (
                <div className="empty">No projects match these filters.</div>
              ) : (
                <div className="grid-3">
                  {filtered.map((p) => (
                    <Link key={p.id} to={`/projects/${p.id}`} className="tile card">
                      <span className="card-top">
                        <span className="eyebrow-sm">
                          Quantum ID {p.quantumId ?? '—'} · {p.countryIds.length} countries
                        </span>
                        <StatusBadge status={p.status} />
                      </span>
                      <span className="tile-title serif">{p.name}</span>
                      <span className="kv">
                        <span>Budget (USD)</span>
                        <strong>{usdM(p.budget)}</strong>
                      </span>
                      <span className="kv">
                        <span>Delivery</span>
                        <strong>{pctText(pct(p.expenditure, p.budget))}</strong>
                      </span>
                      <span className="kv">
                        <span>Period</span>
                        <strong>{years(p.startYear, p.endYear)}</strong>
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              <Panel title="Budget and expenditure by project">
                <BudgetBars rows={filtered.map((p) => ({ label: p.name, budget: p.budget, expenditure: p.expenditure }))} />
                <Note>Source when connected: Quantum.</Note>
              </Panel>
            </>
          );
        }}
      </Loaded>
    </div>
  );
}
