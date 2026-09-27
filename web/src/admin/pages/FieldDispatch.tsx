import { useMemo, useState } from "react";
import { ShieldCheck, Truck } from "lucide-react";
import { useSentinel } from "../state/SentinelContext";
import { DispatchDialog } from "../components/DispatchDialog";
import { Card, LifecycleRibbon, VisibilityGapNotice } from "../components/Primitives";
import { CATEGORY_LABELS } from "../state/types";
import type { Crew, DispatchKind } from "../state/types";
import { formatDateTime } from "../components/format";

const CREW_STATUS_LABELS: Record<Crew["status"], string> = {
  available: "Available",
  on_task: "On task",
  off_shift: "Off shift",
};

export function FieldDispatch() {
  const { issues, crews, wards, selectedIssueId, selectIssue, issueById, dispatchCrew } = useSentinel();
  const [pendingCrew, setPendingCrew] = useState<Crew | null>(null);

  const dispatchable = useMemo(() => issues.filter((issue) => !issue.dispatch), [issues]);
  const dispatched = useMemo(() => issues.filter((issue) => issue.dispatch), [issues]);

  const selected = issueById(selectedIssueId) ?? dispatchable[0] ?? issues[0];
  const ward = selected ? wards.find((w) => w.wardId === selected.wardId) : undefined;
  const kind: DispatchKind = selected?.visibilityGap.flagged ? "field_verification" : "repair_crew";

  const rankedCrews = useMemo(() => {
    if (!selected) return [];
    const wantsInspector = kind === "field_verification";
    return [...crews]
      .filter((crew) => (wantsInspector ? crew.trade === "Field verification" : crew.trade !== "Field verification"))
      .sort((a, b) => {
        const sameWard = Number(b.wardId === selected.wardId) - Number(a.wardId === selected.wardId);
        if (sameWard !== 0) return sameWard;
        return a.etaMinutes - b.etaMinutes;
      });
  }, [crews, selected, kind]);

  if (!selected) {
    return <div className="ws-page">Nothing queued for dispatch.</div>;
  }

  return (
    <div className="ws-page">
      <p className="ws-page__intro">
        Routing happens against issues, not tickets, and nothing leaves this console without an explicit
        confirmation step. Where a ward shows a civic visibility gap, the recommended action switches from a
        repair order to a field verification visit.
      </p>

      <div className="ws-split">
        <div className="ws-stack">
          <Card title="Awaiting dispatch" hint="Highest priority first." flush>
            {dispatchable.length === 0 ? (
              <p className="ws-empty">Every open issue has been dispatched.</p>
            ) : (
              [...dispatchable]
                .sort((a, b) => b.priority.total - a.priority.total)
                .map((issue) => (
                  <button
                    key={issue.issueId}
                    type="button"
                    className={`ws-issue ${issue.issueId === selected.issueId ? "is-selected" : ""}`}
                    onClick={() => selectIssue(issue.issueId)}
                    aria-pressed={issue.issueId === selected.issueId}
                  >
                    <div className="ws-issue__top">
                      <span className="ws-issue__id">{issue.issueId}</span>
                      <span className="ws-issue__ward">
                        {issue.wardId} · {CATEGORY_LABELS[issue.category] ?? issue.category}
                      </span>
                      <span className="ws-issue__score">
                        {issue.priority.total}
                        <span>/{issue.priority.max}</span>
                      </span>
                    </div>
                    <p className="ws-issue__title">{issue.title}</p>
                    <div className="ws-issue__meta">
                      <span>{issue.reports.length} reports clustered</span>
                      {issue.visibilityGap.flagged && (
                        <span className="ws-tag ws-tag--gap">Verify in field, do not auto-dispatch</span>
                      )}
                    </div>
                  </button>
                ))
            )}
          </Card>

          <Card title="Dispatched" hint="Open assignments and the officer who confirmed each one." flush>
            {dispatched.length === 0 ? (
              <p className="ws-empty">No crews are currently assigned.</p>
            ) : (
              <table className="ws-table">
                <thead>
                  <tr>
                    <th>Issue</th>
                    <th>Assignment</th>
                    <th>Confirmed</th>
                    <th>SLA</th>
                  </tr>
                </thead>
                <tbody>
                  {dispatched.map((issue) => (
                    <tr key={issue.issueId}>
                      <td>
                        <strong>{issue.issueId}</strong>
                        <br />
                        {issue.title}
                      </td>
                      <td>
                        {issue.dispatch?.crewName}
                        <br />
                        <span className="ws-chain__detail">
                          {issue.dispatch?.kind === "field_verification" ? "Field verification" : "Repair crew"}
                        </span>
                      </td>
                      <td>
                        {issue.dispatch?.confirmedBy}
                        <br />
                        <span className="ws-chain__detail">
                          {issue.dispatch ? formatDateTime(issue.dispatch.dispatchedAt) : ""}
                        </span>
                      </td>
                      <td className="ws-mono">{issue.dispatch?.slaHours} h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>

        <div className="ws-stack">
          <Card
            title={selected.title}
            hint={`${selected.issueId} · Ward ${selected.wardId} ${ward?.name ?? ""} · priority ${selected.priority.total}/${selected.priority.max}`}
          >
            <div className="ws-stack" style={{ gap: 16 }}>
              <LifecycleRibbon stage={selected.stage} />
              <VisibilityGapNotice gap={selected.visibilityGap} wardName={ward?.name ?? selected.wardId} />
              <p className="ws-note">
                Recommended action:{" "}
                <strong>
                  {kind === "field_verification" ? "field verification visit" : "repair crew dispatch"}
                </strong>
                {kind === "field_verification"
                  ? " — the complaint signal is too thin in this ward to size the work."
                  : ` — ${selected.reports.length} corroborating reports and a priority of ${selected.priority.total}.`}
              </p>
              {selected.dispatch && (
                <p className="ws-note">
                  Already assigned to {selected.dispatch.crewName}, confirmed by {selected.dispatch.confirmedBy}.
                </p>
              )}
            </div>
          </Card>

          <Card
            title={kind === "field_verification" ? "Available inspectors" : "Available crews"}
            hint="Ranked by ward match, then ETA."
            aside={
              kind === "field_verification" ? (
                <ShieldCheck size={18} aria-hidden="true" />
              ) : (
                <Truck size={18} aria-hidden="true" />
              )
            }
          >
            <ul className="ws-list" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {rankedCrews.map((crew) => (
                <li key={crew.crewId}>
                  <button
                    type="button"
                    className="ws-crew"
                    disabled={crew.status === "off_shift" || Boolean(selected.dispatch)}
                    onClick={() => setPendingCrew(crew)}
                  >
                    <span>
                      <span className="ws-crew__name">{crew.name}</span>
                      <span className="ws-crew__trade">
                        {crew.trade} · ward {crew.wardId} · {CREW_STATUS_LABELS[crew.status]} ·{" "}
                        {crew.openTasks} open
                      </span>
                    </span>
                    <span className="ws-crew__eta">
                      ETA {crew.etaMinutes} min
                      <br />
                      {crew.distanceKm} km
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {pendingCrew && (
        <DispatchDialog
          issue={selected}
          crew={pendingCrew}
          kind={kind}
          onCancel={() => setPendingCrew(null)}
          onConfirm={({ slaHours, note }) => {
            dispatchCrew({ issueId: selected.issueId, kind, crew: pendingCrew, slaHours, note });
            setPendingCrew(null);
          }}
        />
      )}
    </div>
  );
}
