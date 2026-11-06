/**
 * Data model for the M&E platform.
 *
 * These types are the contract between the UI and the data pipeline. Every screen
 * reads data shaped like this, whether it comes from mock data or the real sources
 * (Quantum, CO results submissions, the master Excel). When the real data arrives,
 * compare it against these types first: any field that doesn't exist yet stays
 * `null` and the UI shows "—" instead of breaking.
 *
 * Money is always in USD (whole dollars). Percentages are 0–100.
 */

export type Id = string;

/** Delivery status of a project or output against its targets. */
export type ResultStatus = 'on-track' | 'behind' | 'no-data';

/** Whether a country office has submitted its results for the current quarter. */
export type SubmissionStatus = 'submitted' | 'late' | 'missing';

/** Whether a reported value has been checked by the M&E focal point. */
export type ValidationStatus = 'validated' | 'awaiting' | 'missing';

export type RiskLevel = 'high' | 'medium' | 'low';

export type Region =
  | 'Africa'
  | 'Arab States'
  | 'Asia and the Pacific'
  | 'Europe and Central Asia'
  | 'Latin America and the Caribbean';

export type FundingType = 'bilateral' | 'multilateral' | 'core';

/** Time window the user is looking at (the "Period" selector). */
export type Period = 'quarter' | 'ytd' | 'since-start';

export interface Money {
  budget: number | null;
  expenditure: number | null;
}

/** People reached, broken down the way the global framework asks for. */
export interface Demographics {
  total: number | null;
  women: number | null;
  men: number | null;
  youth: number | null;
  displaced: number | null;
  disability: number | null;
}

export interface Site {
  id: Id;
  name: string;
  countryId: Id;
  projectId: Id;
  outputId?: Id;
  /** WGS84 coordinates, for the map layer. */
  lat: number;
  lng: number;
  peopleReached: number | null;
}

export interface Risk {
  id: Id;
  title: string;
  level: RiskLevel;
  owner?: string;
  mitigation?: string;
  nextReview?: string;
}

export interface Indicator {
  id: Id;
  /** e.g. "1.1" */
  code: string;
  frameworkRef: string | null;
  title: string;
  baseline: number | null;
  target: number | null;
  achieved: number | null;
  status: ResultStatus;
  validation: ValidationStatus;
  disaggregation: Demographics;
  /** Cumulative achieved value per quarter, oldest first. */
  trend: (number | null)[];
}

export interface InfrastructureRow {
  type: string;
  planned: number | null;
  completed: number | null;
  spent: number | null;
}

/** Results and money for one output in one country. */
export interface OutputCountryResult {
  outputId: Id;
  countryId: Id;
  achieved: number | null;
  target: number | null;
  budget: number | null;
  expenditure: number | null;
  status: ResultStatus;
  validation: ValidationStatus;
  /** Quantum output-level project ID. */
  quantumOutputId: string | null;
  indicators: Indicator[];
}

export interface Output {
  id: Id;
  projectId: Id;
  number: number;
  title: string;
  pillar: string;
  status: ResultStatus;
  /** % of end-of-project target achieved. */
  achievedPct: number | null;
  budget: number | null;
  expenditure: number | null;
  indicators: Indicator[];
  infrastructure: InfrastructureRow[];
  byCountry: OutputCountryResult[];
}

export interface QuarterPoint {
  label: string;
  achieved: number | null;
  target: number | null;
}

export interface Project {
  id: Id;
  name: string;
  quantumId: string | null;
  startYear: number | null;
  endYear: number | null;
  pillar: string;
  status: ResultStatus;
  fundingSourceIds: Id[];
  countryIds: Id[];
  outputIds: Id[];
  budget: number | null;
  expenditure: number | null;
  nextReportDue: string | null;
  endOfProjectTarget: number | null;
  quarterly: QuarterPoint[];
  demographics: Demographics;
}

export interface Country {
  id: Id;
  name: string;
  region: Region;
  /** ISO 3166-1 alpha-3, once real countries are used. */
  iso3: string | null;
  submission: SubmissionStatus;
  lastSubmittedQuarter: string | null;
  projectIds: Id[];
  budget: number | null;
  expenditure: number | null;
  setAsideAllocation: number | null;
  risks: Risk[];
  demographics: Demographics;
}

export interface ReportingObligation {
  name: string;
  due: string | null;
  status: 'due' | 'submitted' | 'overdue' | 'upcoming';
}

export interface FundingSource {
  id: Id;
  name: string;
  type: FundingType;
  agreement: string | null;
  startYear: number | null;
  endYear: number | null;
  contribution: number | null;
  expenditure: number | null;
  /** How results are credited to this source. Still to be agreed. */
  attributionRule: string | null;
  projects: { projectId: Id; amount: number | null; countryIds: Id[] }[];
  byCountry: { countryId: Id; amount: number | null }[];
  byPillar: { pillar: string; amount: number | null }[];
  byOutput: { label: string; amount: number | null }[];
  obligations: ReportingObligation[];
  peopleReached: number | null;
  outputsOnTrack: number | null;
  outputsTotal: number | null;
}

export interface AnalyticsTool {
  id: Id;
  name: string;
  description: string;
  linksTo: string;
  linkStatus: 'live' | 'pending' | 'to-build';
  url: string | null;
}

export interface PortfolioSummary {
  activeProjects: number;
  countries: number;
  budget: number | null;
  expenditure: number | null;
  submissionsReceived: number;
  submissionsExpected: number;
  focalPoint: { name: string; title: string; email: string };
  deadlines: { label: string; date: string }[];
  lastRefresh: string | null;
}
