import { useSentinel } from "../state/SentinelContext";
import type { CivicIssue } from "../state/types";
import { CATEGORY_LABELS, CHANNEL_LABELS } from "../state/types";
import { EvidenceChainView } from "./EvidenceChainView";
import { PriorityLedgerView } from "./PriorityLedgerView";
import { Card, HumanReviewBlock, LifecycleRibbon, PostCompletionAlert, VisibilityGapNotice } from "./Primitives";
import { formatDateTime, relativeDays } from "./format";

/** Right-hand dossier for the selected issue: evidence first, then the two
 * decisions the officer actually has to make (cluster, work match). */
export function IssueDossier({ issue }: { issue: CivicIssue }) {
  const { wardById, reviewCluster, reviewMatch } = useSentinel();
  const ward = wardById(issue.wardId);

  return (
    <div className="ws-stack">
      <Card
        title={issue.title}
        hint={`${issue.issueId} · ${CATEGORY_LABELS[issue.category] ?? issue.category} · Ward ${issue.wardId} ${ward?.name ?? ""}`}
      >
        <div className="ws-stack" style={{ gap: 18 }}>
          <LifecycleRibbon stage={issue.stage} />
          <PostCompletionAlert issue={issue} />
          <VisibilityGapNotice gap={issue.visibilityGap} wardName={ward?.name ?? issue.wardId} />

          <HumanReviewBlock
            title={`Cluster of ${issue.reports.length} reports`}
            badge={<span className="ws-tag">{issue.cluster.method}</span>}
            evidence={issue.cluster.evidence}
            state={issue.cluster.state}
            reviewedBy={issue.cluster.reviewedBy}
            approveLabel="Approve cluster"
            rejectLabel="Reject — keep separate"
            onApprove={() => reviewCluster(issue.issueId, true)}
            onReject={() => reviewCluster(issue.issueId, false)}
          />

          {issue.match ? (
            <HumanReviewBlock
              title={`Public work match — ${issue.match.project.projectId}`}
              badge={
                <span className="ws-tag">confidence {(issue.match.confidence * 100).toFixed(0)}%</span>
              }
              evidence={issue.match.rationale}
              state={issue.match.state}
              reviewedBy={issue.match.reviewedBy}
              approveLabel="Confirm link"
              rejectLabel="Reject — unrelated"
              onApprove={() => reviewMatch(issue.issueId, true)}
              onReject={() => reviewMatch(issue.issueId, false)}
            />
          ) : (
            <p className="ws-note">
              No funded public work matched this issue. The chain below records that absence rather than
              hiding it.
            </p>
          )}
        </div>
      </Card>

      <Card title="Explainable priority" hint="A transparent sum of named factors — no black-box score.">
        <PriorityLedgerView ledger={issue.priority} />
      </Card>

      <Card title="Evidence chain" hint="Complaint → Ward → Public project → Tender → Contractor">
        <EvidenceChainView issue={issue} ward={ward} />
      </Card>

      <Card title={`Source reports (${issue.reports.length})`} hint="The raw citizen reports behind this single issue.">
        <ul className="ws-reports">
          {issue.reports.map((report) => (
            <li key={report.reportId} className="ws-report">
              <div className="ws-report__meta">
                <span>{report.reportId}</span>
                <span>{CHANNEL_LABELS[report.channel]}</span>
                <span>{report.language.toUpperCase()}</span>
                <span>{formatDateTime(report.reportedAt)}</span>
                <span>{relativeDays(report.reportedAt)}</span>
                <span>
                  {report.photoCount} {report.photoCount === 1 ? "photo" : "photos"}
                </span>
              </div>
              <p className="ws-report__text">{report.text}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Audit trail" hint="Every machine suggestion and human decision, in order.">
        <ol className="ws-timeline">
          {issue.timeline.map((entry) => (
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
    </div>
  );
}
