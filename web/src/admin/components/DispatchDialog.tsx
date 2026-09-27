import { useEffect, useRef, useState } from "react";
import type { CivicIssue, Crew, DispatchKind } from "../state/types";

/** Confirm-before-dispatch: the officer sees exactly what is being committed -
 * which crew, which issue, which SLA - before anything leaves the console. */
export function DispatchDialog({
  issue,
  crew,
  kind,
  onCancel,
  onConfirm,
}: {
  issue: CivicIssue;
  crew: Crew;
  kind: DispatchKind;
  onCancel: () => void;
  onConfirm: (args: { slaHours: number; note: string }) => void;
}) {
  const [slaHours, setSlaHours] = useState(kind === "field_verification" ? 72 : 48);
  const [note, setNote] = useState("");
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const verification = kind === "field_verification";

  return (
    <div className="ws-dialog-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="ws-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ws-dispatch-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="ws-dialog__head">
          <p className="ws-eyebrow">Confirm before dispatch</p>
          <h2 id="ws-dispatch-title" className="ws-card__title">
            {verification ? "Send for field verification" : "Dispatch repair crew"}
          </h2>
        </header>
        <div className="ws-dialog__body">
          <dl className="ws-summary">
            <dt>Issue</dt>
            <dd>
              {issue.issueId} — {issue.title}
            </dd>
            <dt>Aggregates</dt>
            <dd>{issue.reports.length} citizen reports</dd>
            <dt>Priority</dt>
            <dd>
              {issue.priority.total}/{issue.priority.max} ({issue.priority.factors.map((f) => `+${f.points} ${f.label}`).join(", ")})
            </dd>
            <dt>Assignee</dt>
            <dd>
              {crew.name} · {crew.trade} · ETA {crew.etaMinutes} min ({crew.distanceKm} km)
            </dd>
            <dt>Linked work</dt>
            <dd>
              {issue.match
                ? `${issue.match.project.projectId} — ${issue.match.project.contractor.name}`
                : "None — no funded public work matched"}
            </dd>
          </dl>

          {verification && (
            <p className="ws-note">
              This ward shows a civic visibility gap, so the recommended action is an inspection that
              records ground truth, not a repair order based on complaint volume alone.
            </p>
          )}

          <label className="ws-field">
            <span className="ws-field__label">SLA (hours)</span>
            <input
              className="ws-input"
              type="number"
              min={4}
              max={240}
              value={slaHours}
              onChange={(event) => setSlaHours(Number(event.target.value))}
            />
          </label>

          <label className="ws-field">
            <span className="ws-field__label">Instructions to the {verification ? "inspector" : "crew"}</span>
            <textarea
              className="ws-textarea"
              value={note}
              placeholder={verification ? "What should the inspector photograph and measure?" : "Scope of work, safety measures…"}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>
        </div>
        <footer className="ws-dialog__foot">
          <button type="button" className="ws-btn ws-btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            className="ws-btn ws-btn--primary"
            onClick={() => onConfirm({ slaHours, note: note.trim() })}
          >
            {verification ? "Confirm verification visit" : "Confirm dispatch"}
          </button>
        </footer>
      </div>
    </div>
  );
}
