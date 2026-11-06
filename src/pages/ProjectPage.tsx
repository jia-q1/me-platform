import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { getProject, listCountries, listFundingSources, listOutputs } from '../data/api';
import { useData } from '../data/useData';
import type { Period } from '../data/types';
import { QuarterChart } from '../components/charts';
import { DemographicsPanel, MoneyOverview, OutputRow } from '../components/blocks';
import { Loaded, Note, PageHeader, Panel, PendingButton, PeriodSelect, StatusBadge } from '../components/ui';
import { date, pctText, years } from '../lib/format';

export function ProjectPage() {
  const { projectId = '' } = useParams();
  const [period, setPeriod] = useState<Period>('quarter');

  const data = useData(
    () =>
      Promise.all([getProject(projectId), listOutputs(projectId), listCountries(), listFundingSources()]).then(([project, outputs, countries, funding]) =>
        project ? { project, outputs, countries, funding } : null,
      ),
    [projectId, period],
  );

  return (
    <div className="wrap">
      <Loaded state={data} notFound="project">
        {({ project, outputs, countries, funding }) => {
          const donors = funding.filter((f) => project.fundingSourceIds.includes(f.id));
          const onTrack = outputs.filter((o) => o.status === 'on-track').length;
          return (
            <>
              <PageHeader
                crumbs={[{ label: 'Home', to: '/' }, { label: 'Projects', to: '/projects' }, { label: project.name }]}
                title={project.name}
                meta={
                  <>
                    <StatusBadge status={project.status} />
                    <span>
                      Quantum ID {project.quantumId ?? '—'} · {years(project.startYear, project.endYear)} · Funded by{' '}
                      {donors.length === 0
                        ? '—'
                        : donors.map((d, i) => (
                            <span key={d.id}>
                              {i > 0 && ', '}
                              <Link to={`/funding-sources/${d.id}`}>{d.name}</Link>
                            </span>
                          ))}
                    </span>
                  </>
                }
                actions={
                  <>
                    <PeriodSelect value={period} onChange={setPeriod} />
                    <PendingButton>Generate quarterly report draft</PendingButton>
                  </>
                }
              />
              {project.countryIds.length > 0 && (
                <div className="chips chips-row">
                  <span className="muted">Countries:</span>
                  {project.countryIds.map((id) => (
                    <Link key={id} to={`/countries/${id}`} className="chip">
                      {countries.find((c) => c.id === id)?.name ?? id}
                    </Link>
                  ))}
                </div>
              )}

              <Panel title="Results against targets, by quarter">
                <QuarterChart data={project.quarterly} endTarget={project.endOfProjectTarget} />
                <Note>Aggregates validated indicator values across all outputs.</Note>
              </Panel>

              <div className="grid-2">
                <MoneyOverview
                  budget={project.budget}
                  expenditure={project.expenditure}
                  footer={
                    <div className="stats-row" style={{ marginTop: 20 }}>
                      <div className="kv-block">
                        <span>Outputs on track</span>
                        <strong>
                          {onTrack} of {outputs.length}
                        </strong>
                      </div>
                      <div className="kv-block">
                        <span>Next report due</span>
                        <strong>{date(project.nextReportDue)}</strong>
                      </div>
                    </div>
                  }
                />
                <DemographicsPanel data={project.demographics} />
              </div>

              <h2 className="serif section-title">Outputs</h2>
              {outputs.length === 0 ? (
                <div className="empty">No outputs defined for this project yet.</div>
              ) : (
                <div className="stack">
                  {outputs.map((o) => (
                    <OutputRow
                      key={o.id}
                      to={`/projects/${project.id}/outputs/${o.id}`}
                      eyebrow={`Output ${o.number} · ${o.indicators.length} indicators · ${o.byCountry.length} countries`}
                      title={o.title}
                      achievedText={pctText(o.achievedPct)}
                      achievedPct={o.achievedPct}
                      budget={o.budget}
                      expenditure={o.expenditure}
                      status={o.status}
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
