import { createContext, useCallback, useContext, useMemo, useReducer, useState } from "react";
import { CREWS, CURRENT_OFFICER, DEMO_NOW, ISSUES, PROJECTS, WARDS } from "./seed";
import type {
  CivicIssue,
  Crew,
  DispatchKind,
  IssueStage,
  PublicProject,
  Ward,
} from "./types";
import { STAGE_ORDER } from "./types";

/** Stages only ever move forward - a later review never rewinds the lifecycle. */
function advance(current: IssueStage, next: IssueStage): IssueStage {
  return STAGE_ORDER.indexOf(next) > STAGE_ORDER.indexOf(current) ? next : current;
}

function stamp(): string {
  return DEMO_NOW.toISOString();
}

type Action =
  | { type: "cluster/review"; issueId: string; approved: boolean; actor: string }
  | { type: "match/review"; issueId: string; approved: boolean; actor: string }
  | { type: "dispatch/create"; issueId: string; kind: DispatchKind; crew: Crew; slaHours: number; note: string; actor: string }
  | { type: "verification/decide"; issueId: string; verified: boolean; note: string; actor: string }
  | { type: "issue/close"; issueId: string; actor: string };

function reduceIssue(issue: CivicIssue, action: Action): CivicIssue {
  switch (action.type) {
    case "cluster/review": {
      const state = action.approved ? "approved" : "rejected";
      return {
        ...issue,
        cluster: { ...issue.cluster, state, reviewedBy: action.actor },
        stage: action.approved ? advance(issue.stage, "prioritized") : issue.stage,
        timeline: [
          ...issue.timeline,
          {
            at: stamp(),
            label: action.approved
              ? `Cluster of ${issue.reports.length} reports approved`
              : "Cluster rejected — reports returned to intake",
            actor: action.actor,
          },
        ],
      };
    }
    case "match/review": {
      if (!issue.match) return issue;
      const state = action.approved ? "approved" : "rejected";
      return {
        ...issue,
        match: { ...issue.match, state, reviewedBy: action.actor },
        stage: action.approved ? advance(issue.stage, "matched") : issue.stage,
        timeline: [
          ...issue.timeline,
          {
            at: stamp(),
            label: action.approved
              ? `Public work ${issue.match.project.projectId} confirmed as linked`
              : `Public work ${issue.match.project.projectId} rejected as unrelated`,
            actor: action.actor,
          },
        ],
      };
    }
    case "dispatch/create": {
      const label =
        action.kind === "field_verification"
          ? `${action.crew.name} sent for field verification (${action.slaHours} h)`
          : `${action.crew.name} dispatched (${action.slaHours} h SLA)`;
      return {
        ...issue,
        dispatch: {
          kind: action.kind,
          crewId: action.crew.crewId,
          crewName: action.crew.name,
          dispatchedAt: stamp(),
          slaHours: action.slaHours,
          note: action.note,
          confirmedBy: action.actor,
        },
        stage: advance(issue.stage, "dispatched"),
        timeline: [...issue.timeline, { at: stamp(), label, actor: action.actor }],
      };
    }
    case "verification/decide": {
      return {
        ...issue,
        verification: {
          state: action.verified ? "verified" : "rejected",
          decidedBy: action.actor,
          decidedAt: stamp(),
          note: action.note,
        },
        stage: action.verified ? advance(issue.stage, "verified") : issue.stage,
        timeline: [
          ...issue.timeline,
          {
            at: stamp(),
            label: action.verified
              ? "Resolution evidence verified"
              : "Resolution evidence rejected — issue stays open",
            actor: action.actor,
          },
        ],
      };
    }
    case "issue/close": {
      return {
        ...issue,
        stage: advance(issue.stage, "closed"),
        timeline: [...issue.timeline, { at: stamp(), label: "Issue closed", actor: action.actor }],
      };
    }
    default:
      return issue;
  }
}

function reducer(state: CivicIssue[], action: Action): CivicIssue[] {
  return state.map((issue) => (issue.issueId === action.issueId ? reduceIssue(issue, action) : issue));
}

export interface SentinelContextValue {
  issues: CivicIssue[];
  wards: Ward[];
  crews: Crew[];
  projects: PublicProject[];
  officer: string;
  selectedIssueId: string | null;
  selectIssue: (issueId: string | null) => void;
  issueById: (issueId: string | null) => CivicIssue | null;
  wardById: (wardId: string) => Ward | undefined;
  reviewCluster: (issueId: string, approved: boolean) => void;
  reviewMatch: (issueId: string, approved: boolean) => void;
  dispatchCrew: (args: { issueId: string; kind: DispatchKind; crew: Crew; slaHours: number; note: string }) => void;
  decideVerification: (issueId: string, verified: boolean, note: string) => void;
  closeIssue: (issueId: string) => void;
}

const SentinelContext = createContext<SentinelContextValue | null>(null);

export function SentinelProvider({ children }: { children: React.ReactNode }) {
  const [issues, dispatch] = useReducer(reducer, ISSUES);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(ISSUES[0].issueId);

  const issueById = useCallback(
    (issueId: string | null) => issues.find((i) => i.issueId === issueId) ?? null,
    [issues]
  );
  const wardById = useCallback((wardId: string) => WARDS.find((w) => w.wardId === wardId), []);

  const value = useMemo<SentinelContextValue>(
    () => ({
      issues,
      wards: WARDS,
      crews: CREWS,
      projects: PROJECTS,
      officer: CURRENT_OFFICER,
      selectedIssueId,
      selectIssue: setSelectedIssueId,
      issueById,
      wardById,
      reviewCluster: (issueId, approved) =>
        dispatch({ type: "cluster/review", issueId, approved, actor: CURRENT_OFFICER }),
      reviewMatch: (issueId, approved) =>
        dispatch({ type: "match/review", issueId, approved, actor: CURRENT_OFFICER }),
      dispatchCrew: ({ issueId, kind, crew, slaHours, note }) =>
        dispatch({ type: "dispatch/create", issueId, kind, crew, slaHours, note, actor: CURRENT_OFFICER }),
      decideVerification: (issueId, verified, note) =>
        dispatch({ type: "verification/decide", issueId, verified, note, actor: CURRENT_OFFICER }),
      closeIssue: (issueId) => dispatch({ type: "issue/close", issueId, actor: CURRENT_OFFICER }),
    }),
    [issues, selectedIssueId, issueById, wardById]
  );

  return <SentinelContext.Provider value={value}>{children}</SentinelContext.Provider>;
}

export function useSentinel(): SentinelContextValue {
  const ctx = useContext(SentinelContext);
  if (!ctx) throw new Error("useSentinel must be used inside <SentinelProvider>");
  return ctx;
}
