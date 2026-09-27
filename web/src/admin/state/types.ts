// Domain model for the WardSentry administrator console.
//
// The console is a front-end MVP: the intelligence pipeline (clustering,
// priority scoring, public-work matching) is simulated in the browser so the
// whole lifecycle can be demonstrated without the FastAPI service. Field
// names deliberately mirror the civic pipeline vocabulary so the store can be
// swapped for live API responses later.

export type IssueStage =
  | "reported"
  | "clustered"
  | "prioritized"
  | "matched"
  | "dispatched"
  | "verified"
  | "closed";

export const STAGE_ORDER: IssueStage[] = [
  "reported",
  "clustered",
  "prioritized",
  "matched",
  "dispatched",
  "verified",
  "closed",
];

export const STAGE_LABELS: Record<IssueStage, string> = {
  reported: "Reported",
  clustered: "Clustered",
  prioritized: "Prioritized",
  matched: "Matched to public work",
  dispatched: "Dispatched",
  verified: "Verified",
  closed: "Closed",
};

export type ReviewState = "suggested" | "approved" | "rejected";

export type IntakeChannel = "app" | "whatsapp" | "ivr" | "walk_in";

export interface CitizenReport {
  reportId: string;
  text: string;
  language: string;
  channel: IntakeChannel;
  reportedAt: string;
  lat: number;
  lon: number;
  photoCount: number;
  /** Salted hash stand-in: reporter identity never reaches the console. */
  reporterRef: string;
}

/** One line of the explainable priority ledger - never a black-box score. */
export interface PriorityFactor {
  key: string;
  label: string;
  points: number;
  evidence: string;
}

export interface PriorityLedger {
  total: number;
  max: number;
  factors: PriorityFactor[];
}

export interface ClusterProposal {
  state: ReviewState;
  method: string;
  semanticSimilarity: number;
  radiusM: number;
  windowDays: number;
  evidence: string[];
  reviewedBy: string | null;
}

export interface Contractor {
  contractorId: string;
  name: string;
  activeTenders: number;
  priorFlags: number;
}

export interface PublicProject {
  projectId: string;
  scheme: string;
  name: string;
  sanctionedAmount: number;
  sanctionedOn: string;
  completedOn: string | null;
  tenderId: string;
  tenderAwardedOn: string;
  contractor: Contractor;
  wardId: string;
}

export interface WorkMatch {
  state: ReviewState;
  confidence: number;
  rationale: string[];
  project: PublicProject;
  distanceM: number;
  reviewedBy: string | null;
}

export interface RecurrenceProfile {
  count: number;
  firstReportedAt: string;
  lastReportedAt: string;
  /** True when reports keep arriving after the linked project's completion. */
  postCompletion: boolean;
  daysAfterCompletion: number | null;
}

export interface VisibilityGap {
  flagged: boolean;
  complaintVolume: number;
  infrastructureNeedIndex: number;
  note: string;
}

export interface Crew {
  crewId: string;
  name: string;
  trade: string;
  wardId: string;
  status: "available" | "on_task" | "off_shift";
  etaMinutes: number;
  distanceKm: number;
  openTasks: number;
}

export type DispatchKind = "repair_crew" | "field_verification";

export interface DispatchOrder {
  kind: DispatchKind;
  crewId: string;
  crewName: string;
  dispatchedAt: string;
  slaHours: number;
  note: string;
  confirmedBy: string;
}

export interface ResolutionEvidence {
  beforeCapturedAt: string;
  afterCapturedAt: string;
  beforeCaption: string;
  afterCaption: string;
  /** Simulated integrity checks the reviewer must weigh before signing off. */
  geoMatch: boolean;
  exifIntact: boolean;
  gpsDriftM: number;
  inspector: string;
}

export interface VerificationDecision {
  state: "pending" | "verified" | "rejected";
  decidedBy: string | null;
  decidedAt: string | null;
  note: string | null;
}

export interface TimelineEntry {
  at: string;
  label: string;
  actor: string;
}

export interface CivicIssue {
  issueId: string;
  title: string;
  category: string;
  wardId: string;
  lat: number;
  lon: number;
  stage: IssueStage;
  reports: CitizenReport[];
  cluster: ClusterProposal;
  priority: PriorityLedger;
  match: WorkMatch | null;
  recurrence: RecurrenceProfile;
  visibilityGap: VisibilityGap;
  dispatch: DispatchOrder | null;
  resolution: ResolutionEvidence | null;
  verification: VerificationDecision;
  timeline: TimelineEntry[];
}

export interface Ward {
  wardId: string;
  name: string;
  officer: string;
  population: number;
  complaintVolume: number;
  infrastructureNeedIndex: number;
}

export const CATEGORY_LABELS: Record<string, string> = {
  pothole_road: "Pothole / road",
  drainage_sewage: "Drainage / sewage",
  water_supply: "Water supply",
  streetlight: "Streetlight",
  garbage_waste: "Garbage / waste",
  footpath: "Footpath",
  traffic_signage: "Traffic signage",
};

export const CHANNEL_LABELS: Record<IntakeChannel, string> = {
  app: "App",
  whatsapp: "WhatsApp",
  ivr: "IVR call",
  walk_in: "Walk-in",
};
