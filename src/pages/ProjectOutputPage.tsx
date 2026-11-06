import { Link, useParams } from 'react-router';
import { getOutput, getProject, listCountries } from '../data/api';
import { useData } from '../data/useData';
import { IndicatorCard } from '../components/IndicatorCard';
import { Empty, Loaded, PageHeader, StatusBadge, TabLinks, ValidationBadge } from '../components/ui';
import { num, usdM } from '../lib/format';

type Tab = 'kpis' | 'infrastructure' | 'countries';

export function ProjectOutputPage({ tab }: { tab: Tab }) {
  const { projectId = '', outputId = '' } = useParams();

  const data = useData(async () => {
    const [project, output, countries] = await Promise.all([getProject(projectId), getOutput(outputId), listCountries()]);
    if (!project || !output || output.projectId !== project.id) return null;
    return { project, output, countries };
  }, [projectId, outputId]);

  return (
    <div className="wrap">
      <Loaded state={data} notFound="output">
        {({ project, output, countries }) => {
          const base = `/projects/${project.id}/outputs/${output.id}`;
          return (
            <>
              <PageHeader
                crumbs={[
                  { label: 'Home', to: '/' },
                  { label: 'Projects', to: '/projects' },
                  { label: project.name, to: `/projects/${project.id}` },
                  { label: `Output ${output.number}` },
                ]}
                eyebrow={`Output ${output.number} · ${project.name} · all countries`}
                title={output.title}
                meta={<StatusBadge status={output.status} />}
              />
              <TabLinks
                tabs={[
                  { to: base, label: 'KPIs', end: true },
                  { to: `${base}/infrastructure`, label: 'Type of infrastructure' },
                  { to: `${base}/countries`, label: 'By country' },
                ]}
              />

              {tab === 'kpis' &&
                (output.indicators.length === 0 ? (
                  <Empty>No KPIs defined for this output yet.</Empty>
                ) : (
                  <div className="grid-2">
                    {output.indicators.map((i) => (
                      <IndicatorCard key={i.id} indicator={i} showTrend />
                    ))}
                  </div>
                ))}

              {tab === 'infrastructure' &&
                (output.infrastructure.length === 0 ? (
                  <Empty>This output has no infrastructure component.</Empty>
                ) : (
                  <div className="table-wrap">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Type of infrastructure</th>
                          <th className="num">Planned</th>
                          <th className="num">Completed</th>
                          <th className="num">Spent (USD)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {output.infrastructure.map((r) => (
                          <tr key={r.type}>
                            <td>{r.type}</td>
                            <td className="num">{num(r.planned)}</td>
                            <td className="num">{num(r.completed)}</td>
                            <td className="num">{usdM(r.spent)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}

              {tab === 'countries' &&
                (output.byCountry.length === 0 ? (
                  <Empty>No country results yet.</Empty>
                ) : (
                  <div className="table-wrap">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Country</th>
                          <th className="num">Achieved / target</th>
                          <th className="num">Spent / budget</th>
                          <th>Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {output.byCountry.map((r) => (
                          <tr key={r.countryId}>
                            <td>
                              <Link to={`/countries/${r.countryId}/outputs/${output.id}`}>{countries.find((c) => c.id === r.countryId)?.name ?? r.countryId} →</Link>
                            </td>
                            <td className="num">
                              {num(r.achieved)} / {num(r.target)}
                            </td>
                            <td className="num">
                              {usdM(r.expenditure)} / {usdM(r.budget)}
                            </td>
                            <td>
                              <ValidationBadge status={r.validation} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
            </>
          );
        }}
      </Loaded>
    </div>
  );
}
