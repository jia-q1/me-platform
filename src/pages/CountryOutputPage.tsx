import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { getCountry, getOutput, getProject, listSites } from '../data/api';
import { useData } from '../data/useData';
import { MapPanel } from '../components/MapPanel';
import { IndicatorCard } from '../components/IndicatorCard';
import { Loaded, PageHeader, Panel, ProgressBar, StatTile, StatusBadge } from '../components/ui';
import { num, pct, pctText, usdM } from '../lib/format';

export function CountryOutputPage() {
  const { countryId = '', outputId = '' } = useParams();
  const [showDisagg, setShowDisagg] = useState(true);

  const data = useData(async () => {
    const [country, output, sites] = await Promise.all([getCountry(countryId), getOutput(outputId), listSites({ countryId, outputId })]);
    if (!country || !output) return null;
    const result = output.byCountry.find((r) => r.countryId === countryId);
    if (!result) return null;
    const project = await getProject(output.projectId);
    return { country, output, result, sites, project };
  }, [countryId, outputId]);

  return (
    <div className="wrap">
      <Loaded state={data} notFound="output for this country">
        {({ country, output, result, sites, project }) => {
          const achievedPct = pct(result.achieved, result.target);
          return (
            <>
              <PageHeader
                crumbs={[
                  { label: 'Home', to: '/' },
                  { label: 'Countries', to: '/countries' },
                  { label: country.name, to: `/countries/${country.id}` },
                  { label: `Output ${output.number}` },
                ]}
                eyebrow={`Output ${output.number} · ${project?.name ?? ''} · ${country.name}`}
                title={output.title}
                actions={
                  <Link className="btn-o" to={`/projects/${output.projectId}/outputs/${output.id}/countries`}>
                    Same output across all countries
                  </Link>
                }
              />

              <Panel title="Where this output is delivered">
                <MapPanel
                  sizeLabel="people reached at site"
                  points={sites.map((s) => ({ id: s.id, label: `${s.name} · ${num(s.peopleReached)} people`, lat: s.lat, lng: s.lng, value: s.peopleReached }))}
                />
              </Panel>

              <div className="grid-2">
                <Panel title="Results against target" aside={<StatusBadge status={result.status} />}>
                  <div className="big-pct serif">{pctText(achievedPct)}</div>
                  <p className="muted">of end-of-project target ({num(result.achieved)} of {num(result.target)})</p>
                  <ProgressBar value={achievedPct} label="Achieved against target" />
                </Panel>
                <Panel title="Resources for this output">
                  <div className="stats-row">
                    <StatTile label="Budget (USD)" value={usdM(result.budget)} />
                    <StatTile label="Expenditure (USD)" value={usdM(result.expenditure)} />
                  </div>
                  <p className="note">Source: Quantum, output-level project ID {result.quantumOutputId ?? '—'}</p>
                </Panel>
              </div>

              <div className="section-head">
                <h2 className="serif section-title">Indicators</h2>
                <button type="button" className="btn-o" aria-pressed={showDisagg} onClick={() => setShowDisagg((v) => !v)}>
                  {showDisagg ? 'Hide disaggregation' : 'Show disaggregation'}
                </button>
              </div>
              <div className="stack">
                {result.indicators.map((i) => (
                  <IndicatorCard key={i.id} indicator={i} showDisaggregation={showDisagg} />
                ))}
              </div>
            </>
          );
        }}
      </Loaded>
    </div>
  );
}
