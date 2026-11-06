import { BrowserRouter, Route, Routes } from 'react-router';
import { Layout } from './components/Layout';
import { NotFound, ToastProvider } from './components/ui';
import { HomePage } from './pages/HomePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { CountriesPage } from './pages/CountriesPage';
import { CountryPage } from './pages/CountryPage';
import { CountryOutputPage } from './pages/CountryOutputPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectPage } from './pages/ProjectPage';
import { ProjectOutputPage } from './pages/ProjectOutputPage';
import { FundingSourcesPage } from './pages/FundingSourcesPage';
import { FundingSourcePage } from './pages/FundingSourcePage';
import { FundingMapPage } from './pages/FundingMapPage';

/**
 * Every screen and its URL. The comments match the screen codes in the prototype.
 */
export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Layout>
          <Routes>
            {/* LP */}
            <Route path="/" element={<HomePage />} />
            {/* A */}
            <Route path="/analytics" element={<AnalyticsPage />} />

            {/* C1, C2, C3 */}
            <Route path="/countries" element={<CountriesPage />} />
            <Route path="/countries/:countryId" element={<CountryPage />} />
            <Route path="/countries/:countryId/outputs/:outputId" element={<CountryOutputPage />} />

            {/* P1, P2, P3 (three tabs) */}
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectPage />} />
            <Route path="/projects/:projectId/outputs/:outputId" element={<ProjectOutputPage tab="kpis" />} />
            <Route path="/projects/:projectId/outputs/:outputId/infrastructure" element={<ProjectOutputPage tab="infrastructure" />} />
            <Route path="/projects/:projectId/outputs/:outputId/countries" element={<ProjectOutputPage tab="countries" />} />

            {/* F1, F2, F3 */}
            <Route path="/funding-sources" element={<FundingSourcesPage />} />
            <Route path="/funding-sources/:sourceId" element={<FundingSourcePage />} />
            <Route path="/funding-sources/:sourceId/where-funds-go" element={<FundingMapPage />} />

            <Route
              path="*"
              element={
                <div className="wrap">
                  <NotFound />
                </div>
              }
            />
          </Routes>
        </Layout>
      </ToastProvider>
    </BrowserRouter>
  );
}
