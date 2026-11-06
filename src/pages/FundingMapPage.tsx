import { Link, useParams } from 'react-router';
import { getFundingSource, listCountries, listOutputs, listProjects, listSites } from '../data/api';
import { useData } from '../data/useData';
import { HBars } from '../components/charts';
import { MapPanel } from '../components/MapPanel';
import { Loaded, PageHeader, Panel, StatTile, StatusBadge } from '../components/ui';
import { pct, pctText, usdM } from '../lib/format';

export function FundingMapPage() {
  const { sourceId = '' } = useParams();

  const data = useData(async () => {
    const [source, countries, projects, outputs, sites] = await Promise.all([getFundingSource(sourceId), listCountries(), listProjects(), listOutputs(), listSites()]);
    return source ? { source, countries, projects, outputs, sites } : null;
  }, [sourceId]);

  return (
    <div className="wrap">
      <Loaded state={data} notFound="funding source">
        {({ source: f, countries, projects, outputs, sites }) => {
          const countryName = (id: string) => countries.find((c) => c.id === id)?.name ?? id;
          const fundedProjectIds = f.projects.map((p) => p.projectId);
          const fundedSites = sites.filter((s) => fundedProjectIds.includes(s.projectId) && f.byCountry.some((c) => c.countryId === s.countryId));
          const total = f.byCountry.reduce((s, c) => s + (c.amount ?? 0), 0);

          // One point per funded country, placed at the average of its sites.
          const points = f.byCountry
            .map((c) => {
              const cs = fundedSites.filter((s) => s.countryId === c.countryId);
              if (cs.length === 0) return null;
              return {
                id: c.countryId,
                label: `${countryName(c.countryId)} · ${usdM(c.amount)}`,
                lat: cs.reduce((s, x) => s + x.lat, 0) / cs.length,
                lng: cs.reduce((s, x) => s + x.lng, 0) / cs.length,
                value: c.amount,
                to: `/countries/${c.countryId}`,
              };
            })
            .filter((p) => p !== null);

          return (
            <>
              <PageHeader
                crumbs={[
                  { label: 'Home', to: '/' },
                  { label: 'Funding sources', to: '/funding-sources' },
                  { label: f.name, to: `/funding-sources/${f.id}` },
                  { label: 'Where the funds go' },
                ]}
                title={`Where ${f.name} funds are delivering`}
                meta={`Countries, sites and projects financed${f.agreement ? ` under agreement ${f.agreement}` : ''}`}
              />

              <div className="grid-main">
                <Panel title="Funded countries">
                  <MapPanel points={points} sizeLabel="expenditure from this source" valueFormat={usdM} />
                </Panel>
                <div className="stack">
                  <Panel title="Reach">
                    <div className="stats-row">
                      <StatTile label="Countries" value={f.byCountry.length} />
                      <StatTile label="Sites" value={fundedSites.length} />
                      <StatTile label="Projects" value={f.projects.length} />
                    </div>
                  </Panel>
                  <Panel title="Share of expenditure by country">
                    <HBars rows={f.byCountry.map((c) => ({ label: countryName(c.countryId), value: pct(c.amount, total) }))} format={pctText} />
                  </Panel>
                </div>
              </div>

              <h2 className="serif section-title">Projects funded</h2>
              <div className="stack">
                {f.projects.map((fp) => {
                  const p = projects.find((x) => x.id === fp.projectId);
                  const projOutputs = outputs.filter((o) => o.projectId === fp.projectId);
                  const spent = p ? pct(p.expenditure, p.budget) : null;
                  return (
                    <Link key={fp.projectId} to={`/projects/${fp.projectId}`} className="row-link">
                      <div className="row-main">
                        <div className="eyebrow-sm">{fp.countryIds.map(countryName).join(', ')}</div>
                        <div className="row-title">{p?.name ?? fp.projectId}</div>
                      </div>
                      <div className="row-metric-sm">
                        <span>From this source</span>
                        <strong>{usdM(fp.amount)}</strong>
                      </div>
                      <div className="row-metric-sm">
                        <span>Spent</span>
                        <strong>{pctText(spent)}</strong>
                      </div>
                      <div className="row-metric-sm">
                        <span>Outputs</span>
                        <strong>{projOutputs.length}</strong>
                      </div>
                      {p && <StatusBadge status={p.status} />}
                      <span className="row-arrow" aria-hidden="true">→</span>
                    </Link>
                  );
                })}
              </div>
            </>
          );
        }}
      </Loaded>
    </div>
  );
}
