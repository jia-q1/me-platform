/**
 * THE DATA LAYER. Every screen gets its data through the functions in this file and
 * nowhere else.
 *
 * Today they return the sample data in ./mock.ts. When the pipeline exists, set
 * VITE_DATA_SOURCE=api (see .env.example) and fill in the `fromApi` calls below.
 * The screens don't change: they only care that each function returns data shaped
 * like the types in ./types.ts.
 *
 * All functions are async on purpose, so switching to network calls later needs no
 * changes in the components.
 */
import * as mock from './mock';
import type {
  AnalyticsTool,
  Country,
  FundingSource,
  Output,
  OutputCountryResult,
  PortfolioSummary,
  Project,
  Site,
} from './types';

const SOURCE = (import.meta.env.VITE_DATA_SOURCE as string | undefined) ?? 'mock';
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

async function fromApi<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Could not load ${path} (${res.status})`);
  return (await res.json()) as T;
}

/** Small delay so loading states are visible during development. */
const tick = <T,>(value: T): Promise<T> => new Promise((r) => setTimeout(() => r(value), 80));

const useApi = SOURCE === 'api';

export async function getPortfolio(): Promise<PortfolioSummary> {
  return useApi ? fromApi('/portfolio') : tick(mock.portfolio);
}

export async function listProjects(): Promise<Project[]> {
  return useApi ? fromApi('/projects') : tick(mock.projects);
}

export async function getProject(id: string): Promise<Project | null> {
  if (useApi) return fromApi(`/projects/${id}`);
  return tick(mock.projects.find((p) => p.id === id) ?? null);
}

export async function listOutputs(projectId?: string): Promise<Output[]> {
  if (useApi) return fromApi(projectId ? `/projects/${projectId}/outputs` : '/outputs');
  return tick(projectId ? mock.outputs.filter((o) => o.projectId === projectId) : mock.outputs);
}

export async function getOutput(id: string): Promise<Output | null> {
  if (useApi) return fromApi(`/outputs/${id}`);
  return tick(mock.outputs.find((o) => o.id === id) ?? null);
}

export async function listCountries(): Promise<Country[]> {
  return useApi ? fromApi('/countries') : tick(mock.countries);
}

export async function getCountry(id: string): Promise<Country | null> {
  if (useApi) return fromApi(`/countries/${id}`);
  return tick(mock.countries.find((c) => c.id === id) ?? null);
}

/** Every output delivered in a country, with that country's results. */
export async function listOutputsInCountry(
  countryId: string,
): Promise<{ output: Output; result: OutputCountryResult }[]> {
  if (useApi) return fromApi(`/countries/${countryId}/outputs`);
  const rows = mock.outputs.flatMap((output) =>
    output.byCountry.filter((r) => r.countryId === countryId).map((result) => ({ output, result })),
  );
  return tick(rows);
}

export async function listSites(filter: { countryId?: string; projectId?: string; outputId?: string } = {}): Promise<Site[]> {
  if (useApi) {
    const q = new URLSearchParams(Object.entries(filter).filter(([, v]) => v) as [string, string][]);
    return fromApi(`/sites?${q}`);
  }
  return tick(
    mock.sites.filter(
      (s) =>
        (!filter.countryId || s.countryId === filter.countryId) &&
        (!filter.projectId || s.projectId === filter.projectId) &&
        (!filter.outputId || s.outputId === filter.outputId),
    ),
  );
}

export async function listFundingSources(): Promise<FundingSource[]> {
  return useApi ? fromApi('/funding-sources') : tick(mock.fundingSources);
}

export async function getFundingSource(id: string): Promise<FundingSource | null> {
  if (useApi) return fromApi(`/funding-sources/${id}`);
  return tick(mock.fundingSources.find((f) => f.id === id) ?? null);
}

export async function listAnalyticsTools(): Promise<AnalyticsTool[]> {
  return useApi ? fromApi('/analytics-tools') : tick(mock.analyticsTools);
}

export const isSampleData = !useApi;
