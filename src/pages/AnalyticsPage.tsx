import { Link } from 'react-router';
import { listAnalyticsTools } from '../data/api';
import { useData } from '../data/useData';
import { Badge, Loaded, PageHeader } from '../components/ui';
import type { AnalyticsTool } from '../data/types';

const statusBadge: Record<AnalyticsTool['linkStatus'], { tone: 'good' | 'warn' | 'neutral'; label: string }> = {
  live: { tone: 'good', label: 'Live' },
  pending: { tone: 'warn', label: 'Link pending' },
  'to-build': { tone: 'neutral', label: 'To be built' },
};

/** Where to send people for tools that live inside the platform. */
const internalLink: Record<string, { to: string; label: string }> = {
  'risk-registry': { to: '/countries', label: 'See risks on a country page' },
  'trends-gaps': { to: '/projects', label: 'See trends on a project page' },
};

export function AnalyticsPage() {
  const tools = useData(() => listAnalyticsTools(), []);
  return (
    <div className="wrap">
      <PageHeader
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Analytics' }]}
        title="Analytics"
        meta="Specialised tools that sit beside the results data. Each card states what it adds, how it links to the platform, and whether that link is live."
      />
      <Loaded state={tools}>
        {(list) => (
          <div className="grid-2">
            {list.map((t) => {
              const s = statusBadge[t.linkStatus];
              const internal = internalLink[t.id];
              return (
                <section key={t.id} className="panel tool">
                  <header className="panel-head">
                    <h2 className="serif">{t.name}</h2>
                    <Badge tone={s.tone}>{s.label}</Badge>
                  </header>
                  <p>{t.description}</p>
                  <p className="muted">Links to: {t.linksTo}</p>
                  {t.url ? (
                    <a className="btn-o" href={t.url} target="_blank" rel="noreferrer">
                      Open {t.name}
                    </a>
                  ) : internal ? (
                    <Link className="btn-o" to={internal.to}>
                      {internal.label}
                    </Link>
                  ) : (
                    <span className="muted">Link to be added</span>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </Loaded>
    </div>
  );
}
