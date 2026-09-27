import { useMemo, useState } from "react";
import { Layers } from "lucide-react";
import type { CivicIssue, Ward } from "../state/types";
import { CATEGORY_LABELS } from "../state/types";
import { categoryColor, relativeDays } from "./format";
import { StageTag } from "./Primitives";

type SortKey = "priority" | "recent" | "reports";

/** The queue lists civic issues, not raw complaints: one row is one problem,
 * with the report count shown so the aggregation is never hidden. */
export function IncidentQueue({
  issues,
  wards,
  selectedIssueId,
  onSelect,
}: {
  issues: CivicIssue[];
  wards: Ward[];
  selectedIssueId: string | null;
  onSelect: (issueId: string) => void;
}) {
  const [ward, setWard] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<SortKey>("priority");

  const visible = useMemo(() => {
    const filtered = issues.filter(
      (issue) => (!ward || issue.wardId === ward) && (!category || issue.category === category)
    );
    const sorted = [...filtered];
    if (sort === "priority") sorted.sort((a, b) => b.priority.total - a.priority.total);
    if (sort === "reports") sorted.sort((a, b) => b.reports.length - a.reports.length);
    if (sort === "recent")
      sorted.sort(
        (a, b) =>
          new Date(b.recurrence.lastReportedAt).getTime() - new Date(a.recurrence.lastReportedAt).getTime()
      );
    return sorted;
  }, [issues, ward, category, sort]);

  const categories = useMemo(() => [...new Set(issues.map((i) => i.category))], [issues]);

  return (
    <div className="ws-queue">
      <div className="ws-queue__toolbar">
        <label className="ws-field">
          <span className="ws-field__label">Ward</span>
          <select className="ws-select" value={ward} onChange={(e) => setWard(e.target.value)}>
            <option value="">All wards</option>
            {wards.map((w) => (
              <option key={w.wardId} value={w.wardId}>
                {w.wardId} · {w.name}
              </option>
            ))}
          </select>
        </label>
        <label className="ws-field">
          <span className="ws-field__label">Category</span>
          <select className="ws-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c] ?? c}
              </option>
            ))}
          </select>
        </label>
        <label className="ws-field">
          <span className="ws-field__label">Sort by</span>
          <select className="ws-select" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="priority">Priority score</option>
            <option value="reports">Reports aggregated</option>
            <option value="recent">Most recent report</option>
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="ws-empty">No civic issues match these filters.</p>
      ) : (
        visible.map((issue) => {
          const wardName = wards.find((w) => w.wardId === issue.wardId)?.name ?? issue.wardId;
          return (
            <button
              key={issue.issueId}
              type="button"
              className={`ws-issue ${issue.issueId === selectedIssueId ? "is-selected" : ""}`}
              onClick={() => onSelect(issue.issueId)}
              aria-pressed={issue.issueId === selectedIssueId}
            >
              <div className="ws-issue__top">
                <span className="ws-issue__id">{issue.issueId}</span>
                <span className="ws-issue__ward">
                  {issue.wardId} · {wardName}
                </span>
                <span className="ws-issue__score">
                  {issue.priority.total}
                  <span>/{issue.priority.max}</span>
                </span>
              </div>
              <p className="ws-issue__title">{issue.title}</p>
              <div className="ws-issue__meta">
                <span className="ws-tag" style={{ borderColor: categoryColor(issue.category) }}>
                  <span className="ws-tag__dot" style={{ background: categoryColor(issue.category) }} />
                  {CATEGORY_LABELS[issue.category] ?? issue.category}
                </span>
                <StageTag stage={issue.stage} />
                <span className="ws-issue__rollup">
                  <Layers size={13} aria-hidden="true" />
                  {issue.reports.length} citizen {issue.reports.length === 1 ? "report" : "reports"} clustered
                </span>
                <span>· last report {relativeDays(issue.recurrence.lastReportedAt)}</span>
                {issue.recurrence.postCompletion && <span className="ws-tag ws-tag--alert">Post-completion recurrence</span>}
                {issue.visibilityGap.flagged && <span className="ws-tag ws-tag--gap">Visibility gap</span>}
              </div>
              <div className="ws-issue__bar" aria-hidden="true">
                {issue.priority.factors.map((factor) => (
                  <span
                    key={factor.key}
                    style={{
                      width: `${(factor.points / issue.priority.max) * 100}%`,
                      background: categoryColor(issue.category),
                      opacity: 0.35 + (factor.points / issue.priority.max) * 2,
                      marginRight: 2,
                    }}
                  />
                ))}
              </div>
            </button>
          );
        })
      )}
    </div>
  );
}
