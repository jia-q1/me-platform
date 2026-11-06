import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { getFundingSource, listProjects } from '../data/api';
import { useData } from '../data/useData';
import type { Period, ReportingObligation } from '../data/types';
import { HBars } from '../components/charts';
import { Badge, Loaded, Note, PageHeader, Panel, PendingButton, PeriodSelect, ProgressBar, StatTile } from '../components/ui';
import { date, num, pct, pctText, usdM, years } from '../lib/format';
import { fundingTypeLabel } from './FundingSourcesPage';

const obligationBadge = (o: ReportingObligation) => {
  switch (o.status) {
    case 'submitted':
      return <Badge tone="good">Submitted</Badge>;
    case 'overdue':
      return <Badge tone="bad">Overdue {date(o.due)}</Badge>;
    case 'due':
      return <Badge tone="warn">Due {date(o.due)}</Badge>;
    default:
      return <Badge tone="neutral">{date(o.due)}</Badge>;
  }
};

export function FundingSourcePage() {
  const { sourceId = '' } = useParams();
  const [period, setPeriod] = useState<Period>('since-start');

  const data = useData(
    () => Promise.all([getFundingSource(sourceId), listProjects()]).then(([source, projects]) => (source ? { source, projects } : null)),
    [sourceId, period],
  );

  return (
    <div className="wrap">
      <Loaded state={data} notFound="funding source">
        {({ source: f, projects }) => {
          const spent = pct(f.expenditure, f.contribution);
          return (
            <>
              <PageHeader
                crumbs={[{ label: 'Home', to: '/' }, { label: 'Funding sources', to: '/funding-sources' }, { label: f.name }]}
                title={f.name}
                meta={`${fundingTypeLabel[f.type]} · Agreement ${f.agreement ?? '—'} · ${years(f.startYear, f.endYear)}`}
                actions={
                  <>
                    <PeriodSelect value={period} onChange={setPeriod} />
                    <Link className="btn" to={`/funding-sources/${f.id}/where-funds-go`}>
                      Where the funds go
                    </Link>
                  </>
                }
              />

              <div className="grid-2">
                <Panel title="Contribution and spending">
                  <div className="stats-row">
                    <StatTile label="Contribution (USD)" value={usdM(f.contribution)} />
                    <StatTile label="Expenditure (USD)" value={usdM(f.expenditure)} />
                  </div>
                  <div className="demo-top" style={{ marginTop: 16 }}>
                    <span>Spent of contribution</span>
                    <strong>{pctText(spent)}</strong>
                  </div>
                  <ProgressBar value={spent} label="Spent of contribution" />
                </Panel>
                <Panel title="Results this funding supports">
                  <div className="stats-row">
                    <StatTile label="People reached" value={num(f.peopleReached)} />
                    <StatTile label="Outputs on track" value={f.outputsTotal == null ? '—' : `${f.outputsOnTrack}/${f.outputsTotal}`} />
                  </div>
                  <Note>Attribution rule: {f.attributionRule ?? 'pro rata to funding share or earmarked outputs only, to be agreed'}.</Note>
                </Panel>

                <Panel title="Expenditure by pillar">
                  <HBars rows={f.byPillar.map((p) => ({ label: p.pillar, value: p.amount }))} />
                </Panel>
                <Panel title="Expenditure by output">
                  <HBars rows={f.byOutput.map((p) => ({ label: p.label, value: p.amount }))} />
                </Panel>

                <Panel title="Projects funded">
                  <ul className="link-list">
                    {f.projects.map((p) => (
                      <li key={p.projectId}>
                        <Link to={`/projects/${p.projectId}`}>{projects.find((x) => x.id === p.projectId)?.name ?? p.projectId}</Link>
                        <strong>{usdM(p.amount)} →</strong>
                      </li>
                    ))}
                  </ul>
                  <Link className="btn-o" to={`/funding-sources/${f.id}/where-funds-go`}>
                    See countries and sites
                  </Link>
                </Panel>
                <Panel title="Reporting obligations">
                  <ul className="link-list">
                    {f.obligations.map((o) => (
                      <li key={o.name}>
                        <span>{o.name}</span>
                        {obligationBadge(o)}
                      </li>
                    ))}
                  </ul>
                  <PendingButton>Generate report draft</PendingButton>
                </Panel>
              </div>
            </>
          );
        }}
      </Loaded>
    </div>
  );
}
