/**
 * SAMPLE DATA. Every name and number here is made up so the screens have something
 * to show. Country names are placeholders ("Country A") on purpose; the coordinates
 * only give the map dots somewhere to sit.
 *
 * When real data arrives this file is no longer used for the live app (see
 * src/data/api.ts), but keep it: it is handy for development and demos.
 */
import type {
  AnalyticsTool,
  Country,
  Demographics,
  FundingSource,
  Indicator,
  Output,
  OutputCountryResult,
  PortfolioSummary,
  Project,
  QuarterPoint,
  ResultStatus,
  Site,
  ValidationStatus,
} from './types';

const M = 1_000_000;

function demo(total: number): Demographics {
  return {
    total,
    women: Math.round(total * 0.52),
    men: Math.round(total * 0.48),
    youth: Math.round(total * 0.27),
    displaced: Math.round(total * 0.34),
    disability: Math.round(total * 0.08),
  };
}

function quarters(count: number, finalTarget: number, pace: number, reported: number): QuarterPoint[] {
  return Array.from({ length: count }, (_, i) => {
    const target = Math.round((finalTarget * (i + 1)) / count);
    return {
      label: `Q${i + 1}`,
      target,
      achieved: i < reported ? Math.round(target * pace * (0.9 + 0.05 * i)) : null,
    };
  });
}

function trend(target: number, pct: number, points = 6): (number | null)[] {
  return Array.from({ length: points }, (_, i) => Math.round((target * pct * (i + 1)) / points));
}

function indicator(
  id: string,
  code: string,
  title: string,
  target: number,
  pct: number,
  status: ResultStatus,
  validation: ValidationStatus,
): Indicator {
  const achieved = status === 'no-data' ? null : Math.round(target * pct);
  return {
    id,
    code,
    frameworkRef: `GF-${code}`,
    title,
    baseline: 0,
    target,
    achieved,
    status,
    validation,
    disaggregation: achieved === null ? demo(0) : demo(achieved),
    trend: status === 'no-data' ? [null, null, null, null, null, null] : trend(target, pct),
  };
}

// ---------------------------------------------------------------------------
// Countries
// ---------------------------------------------------------------------------

export const countries: Country[] = [
  {
    id: 'country-a',
    name: 'Country A',
    region: 'Arab States',
    iso3: null,
    submission: 'submitted',
    lastSubmittedQuarter: 'Q3 2026',
    projectIds: ['revive-1', 'stabilization'],
    budget: 6.4 * M,
    expenditure: 3.9 * M,
    setAsideAllocation: 1.2 * M,
    risks: [
      { id: 'r1', title: 'Access constraints in northern districts', level: 'high', owner: 'CO Programme Lead', mitigation: 'Work through local partners', nextReview: '2026-12-01' },
      { id: 'r2', title: 'Procurement delays for construction materials', level: 'medium', owner: 'CO Operations', mitigation: 'Framework agreements', nextReview: '2026-12-15' },
    ],
    demographics: demo(48_200),
  },
  {
    id: 'country-b',
    name: 'Country B',
    region: 'Africa',
    iso3: null,
    submission: 'submitted',
    lastSubmittedQuarter: 'Q3 2026',
    projectIds: ['revive-1', 'revive-2'],
    budget: 5.1 * M,
    expenditure: 3.6 * M,
    setAsideAllocation: 0.8 * M,
    risks: [{ id: 'r3', title: 'Currency depreciation reducing purchasing power', level: 'medium' }],
    demographics: demo(36_900),
  },
  {
    id: 'country-c',
    name: 'Country C',
    region: 'Asia and the Pacific',
    iso3: null,
    submission: 'late',
    lastSubmittedQuarter: 'Q2 2026',
    projectIds: ['global-jsb', 'funding-windows'],
    budget: 3.8 * M,
    expenditure: 1.7 * M,
    setAsideAllocation: 0.5 * M,
    risks: [{ id: 'r4', title: 'Flood season disrupting site access', level: 'high' }],
    demographics: demo(21_400),
  },
  {
    id: 'country-d',
    name: 'Country D',
    region: 'Africa',
    iso3: null,
    submission: 'missing',
    lastSubmittedQuarter: 'Q1 2026',
    projectIds: ['revive-1'],
    budget: 2.9 * M,
    expenditure: 1.1 * M,
    setAsideAllocation: null,
    risks: [{ id: 'r5', title: 'Election-related insecurity', level: 'high' }],
    demographics: demo(12_700),
  },
  {
    id: 'country-e',
    name: 'Country E',
    region: 'Latin America and the Caribbean',
    iso3: null,
    submission: 'submitted',
    lastSubmittedQuarter: 'Q3 2026',
    projectIds: ['funding-windows', 'stabilization'],
    budget: 4.2 * M,
    expenditure: 2.8 * M,
    setAsideAllocation: 0.6 * M,
    risks: [{ id: 'r6', title: 'Partner capacity turnover', level: 'low' }],
    demographics: demo(27_300),
  },
];

// ---------------------------------------------------------------------------
// Sites (map points)
// ---------------------------------------------------------------------------

export const sites: Site[] = [
  { id: 's1', name: 'Site 1', countryId: 'country-a', projectId: 'revive-1', outputId: 'revive-1-o1', lat: 33.3, lng: 44.4, peopleReached: 14_200 },
  { id: 's2', name: 'Site 2', countryId: 'country-a', projectId: 'revive-1', outputId: 'revive-1-o2', lat: 36.2, lng: 43.1, peopleReached: 9_800 },
  { id: 's3', name: 'Site 3', countryId: 'country-a', projectId: 'stabilization', outputId: 'stabilization-o1', lat: 30.5, lng: 47.8, peopleReached: 6_300 },
  { id: 's4', name: 'Site 4', countryId: 'country-b', projectId: 'revive-1', outputId: 'revive-1-o1', lat: 12.6, lng: -8.0, peopleReached: 11_500 },
  { id: 's5', name: 'Site 5', countryId: 'country-b', projectId: 'revive-2', outputId: 'revive-2-o1', lat: 14.7, lng: -17.4, peopleReached: 8_100 },
  { id: 's6', name: 'Site 6', countryId: 'country-c', projectId: 'global-jsb', outputId: 'global-jsb-o1', lat: 23.8, lng: 90.4, peopleReached: 7_900 },
  { id: 's7', name: 'Site 7', countryId: 'country-d', projectId: 'revive-1', outputId: 'revive-1-o3', lat: 9.0, lng: 38.7, peopleReached: 5_200 },
  { id: 's8', name: 'Site 8', countryId: 'country-e', projectId: 'funding-windows', outputId: 'funding-windows-o1', lat: 18.5, lng: -72.3, peopleReached: 10_400 },
  { id: 's9', name: 'Site 9', countryId: 'country-e', projectId: 'stabilization', outputId: 'stabilization-o2', lat: 4.7, lng: -74.1, peopleReached: 6_700 },
];

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------

function byCountry(
  outputId: string,
  rows: [countryId: string, target: number, pct: number, budget: number, spentPct: number, status: ResultStatus, validation: ValidationStatus][],
): OutputCountryResult[] {
  return rows.map(([countryId, target, pct, budget, spentPct, status, validation], i) => ({
    outputId,
    countryId,
    target,
    achieved: status === 'no-data' ? null : Math.round(target * pct),
    budget,
    expenditure: Math.round(budget * spentPct),
    status,
    validation,
    quantumOutputId: `000${12345 + i}`,
    indicators: [
      indicator(`${outputId}-${countryId}-i1`, '1.1', 'Number of people with restored income sources', Math.round(target * 0.6), pct, status, validation),
      indicator(`${outputId}-${countryId}-i2`, '1.2', 'Number of small businesses supported to reopen', Math.round(target * 0.05), pct * 0.85, status === 'no-data' ? 'no-data' : 'behind', 'awaiting'),
    ],
  }));
}

const infraDefault = [
  { type: 'Markets', planned: 12, completed: 7, spent: 0.9 * M },
  { type: 'Roads and access', planned: 30, completed: 18, spent: 1.4 * M },
  { type: 'Water points', planned: 45, completed: 31, spent: 0.6 * M },
  { type: 'Health facilities', planned: 8, completed: 3, spent: 0.8 * M },
  { type: 'Schools', planned: 10, completed: 6, spent: 0.7 * M },
];

export const outputs: Output[] = [
  {
    id: 'revive-1-o1',
    projectId: 'revive-1',
    number: 1,
    title: 'Livelihoods restored',
    pillar: 'Local economies and livelihoods',
    status: 'on-track',
    achievedPct: 64,
    budget: 3.2 * M,
    expenditure: 2.1 * M,
    indicators: [
      indicator('r1o1-k1', '1.1', 'People with restored income sources', 18_000, 0.66, 'on-track', 'validated'),
      indicator('r1o1-k2', '1.2', 'Small businesses reopened', 900, 0.41, 'behind', 'awaiting'),
      indicator('r1o1-k3', '1.3', 'Short-term jobs created, of which women', 6_500, 0.7, 'on-track', 'validated'),
      indicator('r1o1-k4', '1.4', 'Market facilities rehabilitated', 12, 0, 'no-data', 'missing'),
    ],
    infrastructure: infraDefault,
    byCountry: byCountry('revive-1-o1', [
      ['country-a', 9_000, 0.71, 1.4 * M, 0.68, 'on-track', 'validated'],
      ['country-b', 6_000, 0.62, 1.1 * M, 0.64, 'on-track', 'awaiting'],
      ['country-d', 3_000, 0, 0.7 * M, 0.4, 'no-data', 'missing'],
    ]),
  },
  {
    id: 'revive-1-o2',
    projectId: 'revive-1',
    number: 2,
    title: 'Basic infrastructure rehabilitated',
    pillar: 'Community infrastructure',
    status: 'behind',
    achievedPct: 38,
    budget: 2.6 * M,
    expenditure: 1.2 * M,
    indicators: [
      indicator('r1o2-k1', '2.1', 'Infrastructure units rehabilitated', 105, 0.38, 'behind', 'validated'),
      indicator('r1o2-k2', '2.2', 'People with improved access to basic services', 40_000, 0.42, 'behind', 'awaiting'),
    ],
    infrastructure: infraDefault,
    byCountry: byCountry('revive-1-o2', [
      ['country-a', 60, 0.4, 1.5 * M, 0.5, 'behind', 'validated'],
      ['country-b', 45, 0.35, 1.1 * M, 0.42, 'behind', 'awaiting'],
    ]),
  },
  {
    id: 'revive-1-o3',
    projectId: 'revive-1',
    number: 3,
    title: 'Local capacities for recovery strengthened',
    pillar: 'Local capacities for early recovery',
    status: 'on-track',
    achievedPct: 71,
    budget: 1.4 * M,
    expenditure: 0.9 * M,
    indicators: [
      indicator('r1o3-k1', '3.1', 'Local officials trained in recovery planning', 600, 0.72, 'on-track', 'validated'),
      indicator('r1o3-k2', '3.2', 'Local recovery plans adopted', 20, 0.65, 'on-track', 'validated'),
    ],
    infrastructure: [],
    byCountry: byCountry('revive-1-o3', [
      ['country-a', 300, 0.75, 0.6 * M, 0.7, 'on-track', 'validated'],
      ['country-d', 300, 0, 0.8 * M, 0.55, 'no-data', 'missing'],
    ]),
  },
  ...simpleOutputs('revive-2', [['Livelihoods restored', 'Local economies and livelihoods', 'on-track', 58], ['Community infrastructure rebuilt', 'Community infrastructure', 'on-track', 61]], [['country-b']]),
  ...simpleOutputs('global-jsb', [['Joint assessments completed', 'Local capacities for early recovery', 'behind', 32], ['Coordination platforms functional', 'Local capacities for early recovery', 'behind', 40]], [['country-c']]),
  ...simpleOutputs('funding-windows', [['Rapid recovery grants delivered', 'Local economies and livelihoods', 'on-track', 66]], [['country-c', 'country-e']]),
  ...simpleOutputs('stabilization', [['Local governance functions restored', 'Local capacities for early recovery', 'behind', 35], ['Essential services resumed', 'Community infrastructure', 'on-track', 59]], [['country-a', 'country-e']]),
];

function simpleOutputs(
  projectId: string,
  defs: [title: string, pillar: string, status: ResultStatus, pct: number][],
  countryGroups: string[][],
): Output[] {
  const countriesForProject = countryGroups[0];
  return defs.map(([title, pillar, status, pct], i) => {
    const id = `${projectId}-o${i + 1}`;
    const budget = (1.2 + i * 0.4) * M;
    return {
      id,
      projectId,
      number: i + 1,
      title,
      pillar,
      status,
      achievedPct: pct,
      budget,
      expenditure: Math.round(budget * (pct / 100 + 0.05)),
      indicators: [
        indicator(`${id}-k1`, `${i + 1}.1`, `${title}: primary indicator`, 5_000, pct / 100, status, 'validated'),
        indicator(`${id}-k2`, `${i + 1}.2`, `${title}: secondary indicator`, 200, pct / 100 - 0.08, status, 'awaiting'),
      ],
      infrastructure: [],
      byCountry: byCountry(
        id,
        countriesForProject.map((c) => [c, 2_500, pct / 100, budget / countriesForProject.length, pct / 100, status, 'validated']),
      ),
    };
  });
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

function outputIdsFor(projectId: string) {
  return outputs.filter((o) => o.projectId === projectId).map((o) => o.id);
}

export const projects: Project[] = [
  {
    id: 'revive-1',
    name: 'REVIVE I',
    quantumId: '00134567',
    startYear: 2024,
    endYear: 2027,
    pillar: 'Local economies and livelihoods',
    status: 'on-track',
    fundingSourceIds: ['rok', 'cb-set-aside'],
    countryIds: ['country-a', 'country-b', 'country-d'],
    outputIds: outputIdsFor('revive-1'),
    budget: 7.2 * M,
    expenditure: 4.2 * M,
    nextReportDue: '2027-01-31',
    endOfProjectTarget: 18_000,
    quarterly: quarters(8, 18_000, 0.95, 6),
    demographics: demo(52_400),
  },
  {
    id: 'revive-2',
    name: 'REVIVE II',
    quantumId: '00145678',
    startYear: 2025,
    endYear: 2028,
    pillar: 'Community infrastructure',
    status: 'on-track',
    fundingSourceIds: ['rok'],
    countryIds: ['country-b'],
    outputIds: outputIdsFor('revive-2'),
    budget: 3.0 * M,
    expenditure: 1.6 * M,
    nextReportDue: '2027-02-15',
    endOfProjectTarget: 10_000,
    quarterly: quarters(8, 10_000, 1.0, 4),
    demographics: demo(18_100),
  },
  {
    id: 'global-jsb',
    name: 'Global JSB 2025-2026',
    quantumId: '00151234',
    startYear: 2025,
    endYear: 2026,
    pillar: 'Local capacities for early recovery',
    status: 'behind',
    fundingSourceIds: ['japan'],
    countryIds: ['country-c'],
    outputIds: outputIdsFor('global-jsb'),
    budget: 2.4 * M,
    expenditure: 0.9 * M,
    nextReportDue: '2026-12-15',
    endOfProjectTarget: 6_000,
    quarterly: quarters(8, 6_000, 0.7, 7),
    demographics: demo(9_600),
  },
  {
    id: 'funding-windows',
    name: 'Funding Windows',
    quantumId: '00122334',
    startYear: 2023,
    endYear: 2027,
    pillar: 'Local economies and livelihoods',
    status: 'on-track',
    fundingSourceIds: ['donor-4', 'cb-set-aside'],
    countryIds: ['country-c', 'country-e'],
    outputIds: outputIdsFor('funding-windows'),
    budget: 3.6 * M,
    expenditure: 2.3 * M,
    nextReportDue: '2027-03-31',
    endOfProjectTarget: 5_000,
    quarterly: quarters(8, 5_000, 1.0, 6),
    demographics: demo(21_000),
  },
  {
    id: 'stabilization',
    name: 'Stabilization',
    quantumId: '00119876',
    startYear: 2024,
    endYear: 2027,
    pillar: 'Local capacities for early recovery',
    status: 'behind',
    fundingSourceIds: ['donor-3', 'donor-5'],
    countryIds: ['country-a', 'country-e'],
    outputIds: outputIdsFor('stabilization'),
    budget: 4.1 * M,
    expenditure: 1.9 * M,
    nextReportDue: '2027-01-15',
    endOfProjectTarget: 8_000,
    quarterly: quarters(8, 8_000, 0.75, 5),
    demographics: demo(24_500),
  },
  {
    id: 'project-6',
    name: 'Project 6',
    quantumId: null,
    startYear: null,
    endYear: null,
    pillar: 'Community infrastructure',
    status: 'no-data',
    fundingSourceIds: [],
    countryIds: [],
    outputIds: [],
    budget: null,
    expenditure: null,
    nextReportDue: null,
    endOfProjectTarget: null,
    quarterly: [],
    demographics: { total: null, women: null, men: null, youth: null, displaced: null, disability: null },
  },
];

// ---------------------------------------------------------------------------
// Funding sources
// ---------------------------------------------------------------------------

export const fundingSources: FundingSource[] = [
  {
    id: 'rok',
    name: 'Republic of Korea',
    type: 'bilateral',
    agreement: 'AGR-2024-017',
    startYear: 2024,
    endYear: 2028,
    contribution: 8.0 * M,
    expenditure: 4.6 * M,
    attributionRule: null,
    projects: [
      { projectId: 'revive-1', amount: 5.0 * M, countryIds: ['country-a', 'country-d'] },
      { projectId: 'revive-2', amount: 3.0 * M, countryIds: ['country-b'] },
    ],
    byCountry: [
      { countryId: 'country-a', amount: 2.4 * M },
      { countryId: 'country-b', amount: 1.5 * M },
      { countryId: 'country-d', amount: 0.7 * M },
    ],
    byPillar: [
      { pillar: 'Local economies and livelihoods', amount: 2.3 * M },
      { pillar: 'Community infrastructure', amount: 1.6 * M },
      { pillar: 'Local capacities for early recovery', amount: 0.7 * M },
    ],
    byOutput: [
      { label: 'Output 1', amount: 2.1 * M },
      { label: 'Output 2', amount: 1.7 * M },
      { label: 'Output 3', amount: 0.8 * M },
    ],
    obligations: [
      { name: 'Interim narrative and financial report', due: '2026-12-31', status: 'due' },
      { name: 'Annual report', due: '2026-03-31', status: 'submitted' },
      { name: 'Final report', due: '2028-06-30', status: 'upcoming' },
    ],
    peopleReached: 51_300,
    outputsOnTrack: 4,
    outputsTotal: 5,
  },
  fundingSimple('japan', 'Japan', 'bilateral', 2.4 * M, 0.9 * M, ['global-jsb'], ['country-c']),
  fundingSimple('donor-3', 'Donor 3', 'bilateral', 2.5 * M, 1.2 * M, ['stabilization'], ['country-a']),
  fundingSimple('donor-4', 'Donor 4', 'multilateral', 2.0 * M, 1.4 * M, ['funding-windows'], ['country-c', 'country-e']),
  fundingSimple('donor-5', 'Donor 5', 'multilateral', 1.6 * M, 0.7 * M, ['stabilization'], ['country-e']),
  fundingSimple('cb-set-aside', 'Crisis Bureau set-aside', 'core', 10.0 * M, 3.1 * M, ['revive-1', 'funding-windows'], ['country-a', 'country-b', 'country-c', 'country-e']),
];

function fundingSimple(
  id: string,
  name: string,
  type: FundingSource['type'],
  contribution: number,
  expenditure: number,
  projectIds: string[],
  countryIds: string[],
): FundingSource {
  const share = 1 / countryIds.length;
  return {
    id,
    name,
    type,
    agreement: null,
    startYear: 2025,
    endYear: 2027,
    contribution,
    expenditure,
    attributionRule: null,
    projects: projectIds.map((projectId) => ({ projectId, amount: contribution / projectIds.length, countryIds })),
    byCountry: countryIds.map((countryId) => ({ countryId, amount: Math.round(expenditure * share) })),
    byPillar: [
      { pillar: 'Local economies and livelihoods', amount: Math.round(expenditure * 0.5) },
      { pillar: 'Community infrastructure', amount: Math.round(expenditure * 0.3) },
      { pillar: 'Local capacities for early recovery', amount: Math.round(expenditure * 0.2) },
    ],
    byOutput: [
      { label: 'Output 1', amount: Math.round(expenditure * 0.55) },
      { label: 'Output 2', amount: Math.round(expenditure * 0.45) },
    ],
    obligations: [{ name: 'Annual report', due: '2027-03-31', status: 'upcoming' }],
    peopleReached: null,
    outputsOnTrack: null,
    outputsTotal: null,
  };
}

// ---------------------------------------------------------------------------
// Analytics tools and portfolio summary
// ---------------------------------------------------------------------------

export const analyticsTools: AnalyticsTool[] = [
  {
    id: 'rapida',
    name: 'RAPIDA',
    description: 'Rapid digital assessment of damage and needs. Feeds baseline and targeting for recovery outputs in affected areas.',
    linksTo: 'Country map layer, output targets',
    linkStatus: 'pending',
    url: null,
  },
  {
    id: 'impact-dashboard',
    name: 'Impact Dashboard',
    description: 'Satellite-based monitoring of early recovery, combining Earth Engine, ACLED and World Bank data. Provides the geospatial view used on country and output screens.',
    linksTo: 'Geospatial view, trends and gaps',
    linkStatus: 'pending',
    url: null,
  },
  {
    id: 'risk-registry',
    name: 'Risk registry',
    description: 'Project and country risks with owner, likelihood, impact, mitigation and next review date. Top risks surface on each country dashboard.',
    linksTo: 'Country dashboards, project dashboards',
    linkStatus: 'to-build',
    url: null,
  },
  {
    id: 'trends-gaps',
    name: 'Trends and gaps',
    description: 'Indicator trajectories against targets over time, with flags where CO data is late, missing or not validated.',
    linksTo: 'Results tracker, CO submission log',
    linkStatus: 'to-build',
    url: null,
  },
];

export const portfolio: PortfolioSummary = {
  activeProjects: projects.filter((p) => p.status !== 'no-data').length,
  countries: countries.length,
  budget: projects.reduce((s, p) => s + (p.budget ?? 0), 0),
  expenditure: projects.reduce((s, p) => s + (p.expenditure ?? 0), 0),
  submissionsReceived: countries.filter((c) => c.submission === 'submitted').length,
  submissionsExpected: countries.length,
  focalPoint: { name: 'Name Surname', title: 'M&E Specialist', email: 'me.focalpoint@example.org' },
  deadlines: [
    { label: 'CO results submission, Q4', date: '2027-01-15' },
    { label: 'Quarterly donor report', date: '2027-01-31' },
  ],
  lastRefresh: '2026-11-06',
};
