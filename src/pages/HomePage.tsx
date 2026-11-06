import { Link } from 'react-router';
import { getPortfolio } from '../data/api';
import { useData } from '../data/useData';
import { Loaded, StatTile } from '../components/ui';
import { date, pct, pctText, usdM } from '../lib/format';

const VIEWS = [
  {
    to: '/projects',
    icon: '▦',
    title: 'M&E by project',
    text: 'Results against targets, outputs, disaggregated reach and delivery for each project.',
    cta: 'Open projects',
  },
  {
    to: '/countries',
    icon: '◍',
    title: 'M&E by country',
    text: 'Country status for senior management: map, results, resources, risks and reporting compliance.',
    cta: 'Open countries',
  },
  {
    to: '/funding-sources',
    icon: '◈',
    title: 'M&E by funding source',
    text: "Contributions, expenditure by pillar and output, and where each donor's funds are delivering, including the USD 10M set-aside.",
    cta: 'Open funding sources',
  },
  {
    to: '/analytics',
    icon: '▥',
    title: 'Analytics',
    text: 'RAPIDA, the Impact Dashboard, the risk registry, and trends and gaps across the portfolio.',
    cta: 'Open analytics',
  },
];

export function HomePage() {
  const portfolio = useData(() => getPortfolio(), []);

  return (
    <>
      <section className="hero">
        <div className="in">
          <div className="eyebrow eyebrow-light">Crisis Bureau · Monitoring and evaluation</div>
          <h1 className="serif">Results, resources and risk across the crisis portfolio</h1>
          <p>
            Track results against global framework targets, link them to budget and expenditure, and draw quarterly report content
            from validated data. One view by project, by country and by funding source.
          </p>
          <div className="hero-actions">
            <Link to="/countries" className="btn-w">
              Open portfolio map
            </Link>
            <Link to="/projects" className="btn-wo">
              Browse projects
            </Link>
          </div>
        </div>
      </section>

      <div className="wrap">
        <Loaded state={portfolio}>
          {(p) => (
            <>
              <div className="stats-grid stats-hero">
                <StatTile label="Active projects" value={p.activeProjects} />
                <StatTile label="Countries" value={p.countries} />
                <StatTile label="Budget (USD)" value={usdM(p.budget)} />
                <StatTile label="Delivery rate" value={pctText(pct(p.expenditure, p.budget))} />
              </div>
              <div className="stats-grid stats-warn">
                <StatTile
                  label="CO submissions this quarter"
                  value={`${p.submissionsReceived} of ${p.submissionsExpected}`}
                  sub={<Link to="/countries?status=late">See who hasn't submitted</Link>}
                />
              </div>

              <div className="grid-2">
                <section className="panel contact">
                  <div className="avatar" aria-hidden="true">
                    ◯
                  </div>
                  <div>
                    <div className="eyebrow">Responsible</div>
                    <div className="serif contact-name">
                      {p.focalPoint.name}, {p.focalPoint.title}
                    </div>
                    <p className="muted">
                      M&amp;E focal point, Crisis Bureau. Contact for data questions, access and corrections:{' '}
                      <a href={`mailto:${p.focalPoint.email}`}>{p.focalPoint.email}</a>
                    </p>
                  </div>
                </section>
                <section className="panel">
                  <div className="eyebrow">Next deadlines</div>
                  <ul className="deadlines">
                    {p.deadlines.map((d) => (
                      <li key={d.label}>
                        <span>{d.label}</span>
                        <strong>{date(d.date)}</strong>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </>
          )}
        </Loaded>

        <h2 className="serif section-title">Choose a view</h2>
        <div className="grid-2">
          {VIEWS.map((v) => (
            <Link key={v.to} to={v.to} className="tile">
              <span className="tile-icon" aria-hidden="true">
                {v.icon}
              </span>
              <span className="tile-title serif">{v.title}</span>
              <span className="tile-text">{v.text}</span>
              <span className="tile-cta">{v.cta} →</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
