import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { getCountry, listOutputsInCountry, listProjects, listSites } from '../data/api';
import { useData } from '../data/useData';
import type { Period } from '../data/types';
import { DemographicsPanel, MoneyOverview, OutputRow, RiskList } from '../components/blocks';
import { MapPanel } from '../components/MapPanel';
import { Loaded, PageHeader, Panel, PendingButton, PeriodSelect, SubmissionBadge } from '../components/ui';
import { num, pct, usdM } from '../lib/format';

export function CountryPage() {
  const { countryId = '' } = useParams();
  const [period, setPeriod] = useState<Period>('quarter');

  const data = useData(
    () =>
      Promise.all([getCountry(countryId), listOutputsInCountry(countryId), listProjects(), listSites({ countryId })]).then(([country, outputs, projects, sites]) =>
        country ? { country, outputs, projects, sites } : null,
      ),
    [countryId, period],
  );

  return (
    <div className="wrap">
      <Loaded state={data} notFound="country">
        {({ country, outputs, projects, sites }) => {
          const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? id;
          return (
            <>
              <PageHeader
                crumbs={[{ label: 'Home', to: '/' }, { label: 'Countries', to: '/countries' }, { label: country.name }]}
                title={country.name}
                meta={
                  <>
                    <SubmissionBadge status={country.submission} /> <span>{country.lastSubmittedQuarter ? `Last submission ${country.lastSubmittedQuarter}` : 'No submissions yet'}</span>
                    <span className="chips">
                      {country.projectIds.map((id) => (
                        <Link key={id} to={`/projects/${id}`} className="chip">
                          {projectName(id)}
                        </Link>
                      ))}
                    </span>
                  </>
                }
                actions={
                  <>
                    <PeriodSelect value={period} onChange={setPeriod} />
                    <PendingButton>Generate report draft</PendingButton>
                  </>
                }
              />

              <Panel title="Project locations">
                <MapPanel
                  sizeLabel="people reached at site"
                  points={sites.map((s) => ({
                    id: s.id,
                    label: `${s.name} · ${projectName(s.projectId)}`,
                    lat: s.lat,
                    lng: s.lng,
                    value: s.peopleReached,
                    group: projectName(s.projectId),
                    to: s.outputId ? `/countries/${country.id}/outputs/${s.outputId}` : undefined,
                  }))}
                />
              </Panel>

              <div className="grid-2">
                <MoneyOverview
                  budget={country.budget}
                  expenditure={country.expenditure}
                  extra={[{ label: 'Set-aside allocation', value: usdM(country.setAsideAllocation) }]}
                  footer={
                    <>
                      <div className="eyebrow" style={{ marginTop: 20 }}>
                        Top risks
                      </div>
                      <RiskList risks={country.risks} />
                    </>
                  }
                />
                <DemographicsPanel data={country.demographics} />
              </div>

              <h2 className="serif section-title">Outputs in {country.name}</h2>
              {outputs.length === 0 ? (
                <div className="empty">No outputs reported for this country yet.</div>
              ) : (
                <div className="stack">
                  {outputs.map(({ output, result }) => (
                    <OutputRow
                      key={output.id}
                      to={`/countries/${country.id}/outputs/${output.id}`}
                      eyebrow={`Output ${output.number} · ${projectName(output.projectId)}`}
                      title={output.title}
                      achievedText={`${num(result.achieved)} / ${num(result.target)}`}
                      achievedPct={pct(result.achieved, result.target)}
                      budget={result.budget}
                      expenditure={result.expenditure}
                      status={result.status}
                    />
                  ))}
                </div>
              )}
            </>
          );
        }}
      </Loaded>
    </div>
  );
}
