import { useEffect, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { isSampleData } from '../data/api';

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/projects', label: 'Projects' },
  { to: '/countries', label: 'Countries' },
  { to: '/funding-sources', label: 'Funding sources' },
  { to: '/analytics', label: 'Analytics' },
];

export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  // Start each new screen at the top, like a normal page load.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <a href="#main" className="skip">
        Skip to content
      </a>
      {isSampleData && (
        <div className="sample-banner" role="note">
          <div className="in">
            <strong>Sample data.</strong> All names and figures are placeholders until the data pipeline is connected.
          </div>
        </div>
      )}
      <header className="site-head">
        <div className="in">
          <Link to="/" className="brand">
            <span>CB M&amp;E Platform</span>
            <span>Crisis Bureau · Results and resources</span>
          </Link>
          <nav className="nav" aria-label="Main">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'on' : undefined)}>
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="site-foot">
        <div className="in">
          <span>United Nations Development Programme · Crisis Bureau</span>
          <span>Sources: Quantum (finance), CO results submissions</span>
        </div>
      </footer>
    </>
  );
}
