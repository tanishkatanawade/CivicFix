import { AlertTriangle, Eye } from "lucide-react";
import type { CivicIssue, IssueStage, VisibilityGap } from "../state/types";
import { STAGE_LABELS, STAGE_ORDER } from "../state/types";

export function Card({
  title,
  hint,
  aside,
  flush,
  children,
}: {
  title: string;
  hint?: string;
  aside?: React.ReactNode;
  flush?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="ws-card">
      <header className="ws-card__head">
        <div>
          <h2 className="ws-card__title">{title}</h2>
          {hint && <p className="ws-card__hint">{hint}</p>}
        </div>
        {aside && <div style={{ marginLeft: "auto" }}>{aside}</div>}
      </header>
      <div className={flush ? "ws-card__body ws-card__body--flush" : "ws-card__body"}>{children}</div>
    </section>
  );
}

/** Reported → Clustered → Prioritized → Matched → Dispatched → Verified → Closed */
export function LifecycleRibbon({ stage }: { stage: IssueStage }) {
  const currentIndex = STAGE_ORDER.indexOf(stage);
  return (
    <ol className="ws-lifecycle" aria-label={`Lifecycle stage: ${STAGE_LABELS[stage]}`}>
      {STAGE_ORDER.map((step, i) => (
        <li key={step} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span
            className={`ws-lifecycle__step ${i < currentIndex ? "is-done" : ""} ${i === currentIndex ? "is-current" : ""}`}
            aria-current={i === currentIndex ? "step" : undefined}
          >
            {STAGE_LABELS[step]}
          </span>
          {i < STAGE_ORDER.length - 1 && (
            <span className="ws-lifecycle__sep" aria-hidden="true">
              ›
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

export function StageTag({ stage }: { stage: IssueStage }) {
  return <span className="ws-tag ws-tag--stage">{STAGE_LABELS[stage]}</span>;
}

export function PostCompletionAlert({ issue }: { issue: CivicIssue }) {
  if (!issue.recurrence.postCompletion || !issue.match) return null;
  return (
    <div className="ws-alert" role="alert">
      <AlertTriangle size={18} className="ws-alert__icon" aria-hidden="true" />
      <div>
        <p className="ws-alert__title">⚠️ Post-Completion Recurrence — Verification Recommended</p>
        <p className="ws-alert__body">
          Citizens kept reporting this location {issue.recurrence.daysAfterCompletion} days after{" "}
          <span className="ws-mono">{issue.match.project.projectId}</span> was recorded complete on{" "}
          {issue.match.project.completedOn}. Contractor{" "}
          <strong>{issue.match.project.contractor.name}</strong> remains accountable under the defect
          liability period.
        </p>
      </div>
    </div>
  );
}

export function VisibilityGapNotice({ gap, wardName }: { gap: VisibilityGap; wardName: string }) {
  if (!gap.flagged) return null;
  return (
    <div className="ws-alert ws-alert--gap" role="note">
      <Eye size={18} className="ws-alert__icon" aria-hidden="true" />
      <div>
        <p className="ws-alert__title">Civic visibility gap — {wardName}</p>
        <p className="ws-alert__body">
          Low complaint volume ({gap.complaintVolume} in 90 days) against a high infrastructure-need index (
          {gap.infrastructureNeedIndex}/100). {gap.note} Recommended action:{" "}
          <strong>field verification</strong> rather than standard dispatch.
        </p>
      </div>
    </div>
  );
}

/** Every AI suggestion is shown with its evidence and an explicit human decision. */
export function HumanReviewBlock({
  title,
  badge,
  evidence,
  state,
  reviewedBy,
  approveLabel,
  rejectLabel,
  onApprove,
  onReject,
}: {
  title: string;
  badge?: React.ReactNode;
  evidence: string[];
  state: "suggested" | "approved" | "rejected";
  reviewedBy: string | null;
  approveLabel: string;
  rejectLabel: string;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="ws-review">
      <div className="ws-review__head">
        <span className="ws-review__title">{title}</span>
        {badge}
        <span className="ws-eyebrow" style={{ marginLeft: "auto" }}>
          Machine suggestion
        </span>
      </div>
      <ul className="ws-review__evidence">
        {evidence.map((line) => (
          <li key={line}>
            <span>{line}</span>
          </li>
        ))}
      </ul>
      {state === "suggested" ? (
        <div className="ws-review__actions">
          <button type="button" className="ws-btn ws-btn--seal ws-btn--sm" onClick={onApprove}>
            {approveLabel}
          </button>
          <button type="button" className="ws-btn ws-btn--danger ws-btn--sm" onClick={onReject}>
            {rejectLabel}
          </button>
        </div>
      ) : (
        <p className="ws-review__decided">
          {state === "approved" ? "Approved" : "Rejected"}
          {reviewedBy ? ` by ${reviewedBy}` : ""} — recorded in the audit trail.
        </p>
      )}
    </div>
  );
}
