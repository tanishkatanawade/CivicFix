import { useSentinel } from "../state/SentinelContext";
import { IncidentQueue } from "../components/IncidentQueue";
import { IssueDossier } from "../components/IssueDossier";
import { SpatialCanvas } from "../components/SpatialCanvas";
import { Card } from "../components/Primitives";

export function WardOfficerDashboard() {
  const { issues, wards, selectedIssueId, selectIssue, issueById } = useSentinel();
  const selected = issueById(selectedIssueId) ?? issues[0];

  const reportCount = issues.reduce((sum, issue) => sum + issue.reports.length, 0);
  const gapWards = wards.filter((ward) => issues.some((i) => i.wardId === ward.wardId && i.visibilityGap.flagged));

  return (
    <div className="ws-page">
      <p className="ws-page__intro">
        {reportCount} citizen reports across {wards.length} wards resolve to {issues.length} civic issues.
        The queue below is the unit of work — one problem, not fifty tickets.
      </p>

      <div className="ws-split">
        <div className="ws-stack">
          <Card
            title="Spatial evidence map"
            hint="Pins are clustered issues. Size encodes priority; a dashed ring marks recurrence after a completed public work."
            flush
          >
            <SpatialCanvas
              issues={issues}
              wards={wards}
              selectedIssueId={selected?.issueId ?? null}
              onSelect={selectIssue}
            />
          </Card>

          <Card
            title="Incident queue"
            hint="Civic issues, ranked by an explainable priority ledger."
            aside={<span className="ws-eyebrow">{issues.length} open</span>}
            flush
          >
            <IncidentQueue
              issues={issues}
              wards={wards}
              selectedIssueId={selected?.issueId ?? null}
              onSelect={selectIssue}
            />
          </Card>

          <Card title="Ward coverage" hint="Complaint volume measured against the asset-condition survey.">
            <table className="ws-table">
              <thead>
                <tr>
                  <th>Ward</th>
                  <th>Officer</th>
                  <th>Complaints (90 d)</th>
                  <th>Infrastructure need</th>
                  <th>Read</th>
                </tr>
              </thead>
              <tbody>
                {wards.map((ward) => {
                  const gap = ward.complaintVolume < 60 && ward.infrastructureNeedIndex > 65;
                  return (
                    <tr key={ward.wardId}>
                      <td>
                        {ward.wardId} · {ward.name}
                      </td>
                      <td>{ward.officer}</td>
                      <td className="ws-mono">{ward.complaintVolume}</td>
                      <td className="ws-mono">{ward.infrastructureNeedIndex}/100</td>
                      <td>
                        {gap ? (
                          <span className="ws-tag ws-tag--gap">Under-reporting — verify in field</span>
                        ) : (
                          <span className="ws-tag">Proportionate</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>

        <div className="ws-stack">
          {gapWards.length > 0 && (
            <Card title="Civic visibility gap" hint="Quiet wards are not problem-free wards.">
              <p className="ws-note" style={{ marginBottom: 14 }}>
                {gapWards.length} {gapWards.length === 1 ? "ward is" : "wards are"} reporting far below what
                their measured infrastructure need predicts. Standard dispatch would under-serve them, so the
                console routes these to the Field Dispatch console as verification visits.
              </p>
              <ul className="ws-list">
                {gapWards.map((ward) => (
                  <li key={ward.wardId} className="ws-review">
                    <span className="ws-review__title">
                      {ward.wardId} · {ward.name}
                    </span>
                    <p className="ws-chain__detail">
                      {ward.complaintVolume} complaints vs need index {ward.infrastructureNeedIndex}/100 ·
                      officer {ward.officer}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {selected && <IssueDossier issue={selected} />}
        </div>
      </div>
    </div>
  );
}
