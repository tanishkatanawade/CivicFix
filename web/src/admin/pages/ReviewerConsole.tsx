import { useMemo, useState } from "react";
import { useSentinel } from "../state/SentinelContext";
import { EvidenceChainView } from "../components/EvidenceChainView";
import { EvidenceFrame } from "../components/EvidenceFrame";
import { Card, LifecycleRibbon, PostCompletionAlert } from "../components/Primitives";
import { formatDate, formatDateTime, formatRupees } from "../components/format";
import { CATEGORY_LABELS } from "../state/types";

export function ReviewerConsole() {
  const { issues, wardById, selectedIssueId, selectIssue, issueById, decideVerification, closeIssue } =
    useSentinel();
  const [note, setNote] = useState("");

  const reviewable = useMemo(() => issues.filter((issue) => issue.resolution), [issues]);
  const selected = issueById(selectedIssueId)?.resolution ? issueById(selectedIssueId) : reviewable[0] ?? null;
  const ward = selected ? wardById(selected.wardId) : undefined;
  const flagged = issues.filter((issue) => issue.recurrence.postCompletion);

  return (
    <div className="ws-page">
      <p className="ws-page__intro">
        The vigilance console closes the loop between a complaint and the public money already spent near
        it. Evidence integrity checks come first; the chain from complaint to contractor sits beside them so
        a sign-off is never a blind click.
      </p>

      {flagged.length > 0 && (
        <Card
          title="Work → outcome exceptions"
          hint="Issues where citizens kept reporting after a funded project was recorded complete."
          flush
        >
          <table className="ws-table">
            <thead>
              <tr>
                <th>Issue</th>
                <th>Public work</th>
                <th>Completed</th>
                <th>Recurrence</th>
                <th>Contractor</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {flagged.map((issue) => (
                <tr key={issue.issueId}>
                  <td>
                    <strong>{issue.issueId}</strong>
                    <br />
                    {issue.title}
                  </td>
                  <td>
                    {issue.match?.project.projectId}
                    <br />
                    <span className="ws-chain__detail">
                      {issue.match ? formatRupees(issue.match.project.sanctionedAmount) : ""}
                    </span>
                  </td>
                  <td className="ws-mono">
                    {issue.match?.project.completedOn ? formatDate(issue.match.project.completedOn) : "—"}
                  </td>
                  <td>
                    <span className="ws-tag ws-tag--alert">
                      +{issue.recurrence.daysAfterCompletion} days after completion
                    </span>
                  </td>
                  <td>
                    {issue.match?.project.contractor.name}
                    <br />
                    <span className="ws-chain__detail">
                      {issue.match?.project.contractor.priorFlags} prior flags
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="ws-btn ws-btn--sm"
                      onClick={() => selectIssue(issue.issueId)}
                    >
                      Open in studio
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {!selected || !selected.resolution ? (
        <Card title="Evidence verification studio">
          <p className="ws-empty">No resolution evidence has been submitted yet.</p>
        </Card>
      ) : (
        <div className="ws-split">
          <div className="ws-stack">
            <Card
              title="Evidence verification studio"
              hint={`${selected.issueId} · ${CATEGORY_LABELS[selected.category] ?? selected.category} · Ward ${selected.wardId} ${ward?.name ?? ""}`}
            >
              <div className="ws-stack" style={{ gap: 18 }}>
                <LifecycleRibbon stage={selected.stage} />
                <div className="ws-compare">
                  <EvidenceFrame
                    kind="before"
                    caption={selected.resolution.beforeCaption}
                    capturedAt={selected.resolution.beforeCapturedAt}
                  />
                  <EvidenceFrame
                    kind="after"
                    caption={selected.resolution.afterCaption}
                    capturedAt={selected.resolution.afterCapturedAt}
                  />
                </div>
                <ul className="ws-checks">
                  <li className="ws-check">
                    <p className="ws-check__label">Geotag match</p>
                    <p className={`ws-check__value ${selected.resolution.geoMatch ? "is-pass" : "is-fail"}`}>
                      {selected.resolution.geoMatch ? "Within tolerance" : "Mismatch"}
                    </p>
                  </li>
                  <li className="ws-check">
                    <p className="ws-check__label">GPS drift</p>
                    <p className={`ws-check__value ${selected.resolution.gpsDriftM > 50 ? "is-fail" : "is-pass"}`}>
                      {selected.resolution.gpsDriftM} m
                    </p>
                  </li>
                  <li className="ws-check">
                    <p className="ws-check__label">EXIF integrity</p>
                    <p className={`ws-check__value ${selected.resolution.exifIntact ? "is-pass" : "is-fail"}`}>
                      {selected.resolution.exifIntact ? "Intact" : "Stripped"}
                    </p>
                  </li>
                  <li className="ws-check">
                    <p className="ws-check__label">Inspector</p>
                    <p className="ws-check__value">{selected.resolution.inspector}</p>
                  </li>
                </ul>
              </div>
            </Card>

            <Card
              title="Resolution audit"
              hint="Sign-off is recorded against a named reviewer and stays in the audit trail."
            >
              <div className="ws-stack" style={{ gap: 14 }}>
                <PostCompletionAlert issue={selected} />
                {selected.verification.state === "pending" ? (
                  <>
                    <label className="ws-field">
                      <span className="ws-field__label">Reviewer note</span>
                      <textarea
                        className="ws-textarea"
                        value={note}
                        placeholder="What did you check, and what remains outstanding?"
                        onChange={(event) => setNote(event.target.value)}
                      />
                    </label>
                    <div className="ws-review__actions">
                      <button
                        type="button"
                        className="ws-btn ws-btn--seal"
                        onClick={() => {
                          decideVerification(selected.issueId, true, note.trim());
                          setNote("");
                        }}
                      >
                        Verify resolution
                      </button>
                      <button
                        type="button"
                        className="ws-btn ws-btn--danger"
                        onClick={() => {
                          decideVerification(selected.issueId, false, note.trim());
                          setNote("");
                        }}
                      >
                        Reject — send back to field
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="ws-stack" style={{ gap: 12 }}>
                    <p className="ws-note">
                      {selected.verification.state === "verified" ? "Verified" : "Rejected"} by{" "}
                      {selected.verification.decidedBy} on{" "}
                      {selected.verification.decidedAt ? formatDateTime(selected.verification.decidedAt) : ""}.
                      {selected.verification.note ? ` “${selected.verification.note}”` : ""}
                    </p>
                    {selected.verification.state === "verified" && selected.stage !== "closed" && (
                      <div>
                        <button
                          type="button"
                          className="ws-btn ws-btn--primary"
                          onClick={() => closeIssue(selected.issueId)}
                        >
                          Close issue
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="ws-stack">
            <Card title="Evidence chain" hint="Complaint → Ward → Public project → Tender → Contractor">
              <EvidenceChainView issue={selected} ward={ward} />
            </Card>

            <Card title="Audit trail">
              <ol className="ws-timeline">
                {selected.timeline.map((entry) => (
                  <li key={`${entry.at}-${entry.label}`}>
                    <time dateTime={entry.at}>{formatDateTime(entry.at)}</time>
                    <span>
                      {entry.label}
                      <span className="ws-timeline__actor">{entry.actor}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </Card>

            <Card title="Other submissions" hint="Switch the studio to another resolved issue." flush>
              {reviewable.map((issue) => (
                <button
                  key={issue.issueId}
                  type="button"
                  className={`ws-issue ${issue.issueId === selected.issueId ? "is-selected" : ""}`}
                  onClick={() => selectIssue(issue.issueId)}
                  aria-pressed={issue.issueId === selected.issueId}
                >
                  <div className="ws-issue__top">
                    <span className="ws-issue__id">{issue.issueId}</span>
                    <span className="ws-issue__ward">{issue.wardId}</span>
                  </div>
                  <p className="ws-issue__title">{issue.title}</p>
                  <div className="ws-issue__meta">
                    <span className="ws-tag">{issue.verification.state}</span>
                    {issue.recurrence.postCompletion && (
                      <span className="ws-tag ws-tag--alert">Post-completion recurrence</span>
                    )}
                  </div>
                </button>
              ))}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
