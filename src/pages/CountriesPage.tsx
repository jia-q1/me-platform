import { Link, useSearchParams } from 'react-router';
import { listCountries, listOutputs, listProjects, listSites } from '../data/api';
import { useData } from '../data/useData';
import type { Region, SubmissionStatus } from '../data/types';
import { FilterBar, Loaded, PageHeader, Panel, SearchField, SelectField, SubmissionBadge } from '../components/ui';
import { MapPanel } from '../components/MapPanel';
import { ViewToggle } from '../components/ViewToggle';
import { pct, pctText, usdM } from '../lib/format';

const REGIONS: Region[] = ['Africa', 'Arab States', 'Asia and the Pacific', 'Europe and Central Asia', 'Latin America and the Caribbean'];

export function CountriesPage() {
  const [params, setParams] = useSearchParams();
  const project = params.get('project') ?? 'all';
  const region = params.get('region') ?? 'all';
  const status = (params.get('status') ?? 'all') as SubmissionStatus | 'all';
  const q = params.get('q') ?? '';
  const view = params.get('view') === 'map' ? 'map' : 'list';

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'all' || (key === 'view' && value === 'list')) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const data = useData(
    () => Promise.all([listCountries(), listProjects(), listOutputs(), listSites()]).then(([countries, projects, outputs, sites]) => ({ countries, projects, outputs, sites })),
    [],
  );

  return (
    <div className="wrap">
      <PageHeader
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Countries' }]}
        title="M&E by country"
        meta="Status of every country in the portfolio. Select a country to see its map, results, resources and risks."
        actions={<ViewToggle value={view} onChange={(v) => set('view', v)} />}
      />
      <Loaded state={data}>
        {({ countries, projects, outputs, sites }) => {
          const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? id;
          const filtered = countries.filter(
            (c) =>
              (project === 'all' || c.projectIds.includes(project)) &&
              (region === 'all' || c.region === region) &&
              (status === 'all' || c.submission === status) &&
              (!q || c.name.toLowerCase().includes(q.toLowerCase())),
          );
          const gaps = countries.filter((c) => c.submission !== 'submitted');
          const outputsOnTrack = (countryId: string) => {
            const rows = outputs.flatMap((o) => o.byCountry.filter((r) => r.countryId === countryId));
            return `${rows.filter((r) => r.status === 'on-track').length} of ${rows.length}`;
          };

          return (
            <>
              <FilterBar>
                <SelectField label="Project" value={project} onChange={(v) => set('project', v)} options={[{ value: 'all', label: 'All projects' }, ...projects.map((p) => ({ value: p.id, label: p.name }))]} />
                <SelectField label="Region" value={region} onChange={(v) => set('region', v)} options={[{ value: 'all', label: 'All regions' }, ...REGIONS.map((r) => ({ value: r, label: r }))]} />
                <SelectField
                  label="Reporting status"
                  value={status}
                  onChange={(v) => set('status', v)}
                  options={[
                    { value: 'all', label: 'Any' },
                    { value: 'submitted', label: 'Submitted' },
                    { value: 'late', label: 'Late' },
                    { value: 'missing', label: 'Missing' },
                  ]}
                />
                <SearchField value={q} onChange={(v) => set('q', v)} placeholder="Country name" />
              </FilterBar>

              {view === 'map' ? (
                <Panel title="Portfolio map">
                  <MapPanel
                    sizeLabel="people reached at site"
                    points={sites
                      .filter((s) => filtered.some((c) => c.id === s.countryId))
                      .map((s) => ({
                        id: s.id,
                        label: `${countries.find((c) => c.id === s.countryId)?.name} · ${s.name}`,
                        lat: s.lat,
                        lng: s.lng,
                        value: s.peopleReached,
                        group: projectName(s.projectId),
                        to: `/countries/${s.countryId}`,
                      }))}
                  />
                </Panel>
              ) : filtered.length === 0 ? (
                <div className="empty">No countries match these filters.</div>
              ) : (
                <div className="grid-3">
                  {filtered.map((c) => (
                    <Link key={c.id} to={`/countries/${c.id}`} className="tile card">
                      <span className="card-top">
                        <span className="eyebrow-sm">{c.region}</span>
                        <SubmissionBadge status={c.submission} />
                      </span>
                      <span className="tile-title serif">{c.name}</span>
                      <span className="chips">
                        {c.projectIds.map((id) => (
                          <span key={id} className="chip">
                            {projectName(id)}
                          </span>
                        ))}
                      </span>
                      <span className="kv">
                        <span>Budget (USD)</span>
                        <strong>{usdM(c.budget)}</strong>
                      </span>
                      <span className="kv">
                        <span>Delivery</span>
                        <strong>{pctText(pct(c.expenditure, c.budget))}</strong>
                      </span>
                      <span className="kv">
                        <span>Outputs on track</span>
                        <strong>{outputsOnTrack(c.id)}</strong>
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              <section className="panel panel-warn">
                <h2 className="serif">Data gaps this quarter: {gaps.length} countries</h2>
                <p>Have not submitted current-quarter results, or submitted values that are not yet validated. Their dashboards show the last validated quarter.</p>
                <ul className="gap-list">
                  {gaps.map((c) => (
                    <li key={c.id}>
                      <Link to={`/countries/${c.id}`}>{c.name}</Link> <SubmissionBadge status={c.submission} />{' '}
                      <span className="muted">last submitted {c.lastSubmittedQuarter ?? 'never'}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          );
        }}
      </Loaded>
    </div>
  );
}
