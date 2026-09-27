import { useMemo } from "react";
import type { CivicIssue, Ward } from "../state/types";
import { categoryColor } from "./format";

const WIDTH = 760;
const HEIGHT = 470;
const PAD = 56;

/** Schematic ward canvas.
 *
 * A deliberately offline, tile-free projection: the demo must render the same
 * way on a conference wifi that blocks map tiles. Coordinates are linearly
 * projected from the issue lat/lon bounds into the SVG viewBox. */
export function SpatialCanvas({
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
  const project = useMemo(() => {
    const lats = issues.map((i) => i.lat);
    const lons = issues.map((i) => i.lon);
    const latMin = Math.min(...lats);
    const latMax = Math.max(...lats);
    const lonMin = Math.min(...lons);
    const lonMax = Math.max(...lons);
    const latSpan = latMax - latMin || 1;
    const lonSpan = lonMax - lonMin || 1;
    return (lat: number, lon: number): [number, number] => [
      PAD + ((lon - lonMin) / lonSpan) * (WIDTH - PAD * 2),
      PAD + ((latMax - lat) / latSpan) * (HEIGHT - PAD * 2),
    ];
  }, [issues]);

  const wardBlobs = useMemo(
    () =>
      wards
        .map((ward) => {
          const wardIssues = issues.filter((i) => i.wardId === ward.wardId);
          if (wardIssues.length === 0) return null;
          const points = wardIssues.map((i) => project(i.lat, i.lon));
          const cx = points.reduce((sum, p) => sum + p[0], 0) / points.length;
          const cy = points.reduce((sum, p) => sum + p[1], 0) / points.length;
          const rx = Math.max(78, ...points.map((p) => Math.abs(p[0] - cx) + 62));
          const ry = Math.max(62, ...points.map((p) => Math.abs(p[1] - cy) + 50));
          const gapFlagged = wardIssues.some((i) => i.visibilityGap.flagged);
          return { ward, cx, cy, rx, ry, gapFlagged };
        })
        .filter((blob): blob is NonNullable<typeof blob> => blob !== null),
    [wards, issues, project]
  );

  return (
    <div className="ws-map">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Schematic ward map of open civic issues">
        <defs>
          <pattern id="ws-grid" width="38" height="38" patternUnits="userSpaceOnUse">
            <path d="M 38 0 L 0 0 0 38" fill="none" stroke="rgba(28,25,23,0.055)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={WIDTH} height={HEIGHT} fill="url(#ws-grid)" />

        {wardBlobs.map((blob) => (
          <g key={blob.ward.wardId}>
            <ellipse
              className={`ws-map__ward ${blob.gapFlagged ? "is-gap" : ""}`}
              cx={blob.cx}
              cy={blob.cy}
              rx={blob.rx}
              ry={blob.ry}
            />
            <text className="ws-map__wardlabel" x={blob.cx} y={blob.cy - blob.ry + 16} textAnchor="middle">
              {blob.ward.wardId} · {blob.ward.name}
            </text>
          </g>
        ))}

        {issues.map((issue) => {
          const [x, y] = project(issue.lat, issue.lon);
          const selected = issue.issueId === selectedIssueId;
          const radius = 7 + (issue.priority.total / issue.priority.max) * 11;
          return (
            <g
              key={issue.issueId}
              className="ws-map__pin"
              onClick={() => onSelect(issue.issueId)}
              role="button"
              tabIndex={0}
              aria-label={`${issue.issueId}, priority ${issue.priority.total}, ${issue.title}`}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(issue.issueId);
                }
              }}
            >
              {issue.recurrence.postCompletion && (
                <circle cx={x} cy={y} r={radius + 7} fill="none" stroke="#b42318" strokeWidth="1.5" strokeDasharray="3 3" />
              )}
              <circle
                cx={x}
                cy={y}
                r={radius}
                fill={categoryColor(issue.category)}
                fillOpacity={selected ? 0.95 : 0.7}
                stroke={selected ? "#1c1917" : "#fffdf8"}
                strokeWidth={selected ? 2.5 : 1.5}
              />
              <text className="ws-map__pinlabel" x={x} y={y + radius + 12} textAnchor="middle">
                {issue.issueId} · {issue.reports.length} rpts
              </text>
            </g>
          );
        })}
      </svg>
      <div className="ws-map__legend">
        <span>
          <span className="ws-map__swatch" style={{ background: "#9a3412" }} /> Pin size = priority score
        </span>
        <span>
          <span
            className="ws-map__swatch"
            style={{ border: "1.5px dashed #b42318", background: "transparent" }}
          />{" "}
          Post-completion recurrence
        </span>
        <span>
          <span className="ws-map__swatch" style={{ background: "rgba(161,98,7,0.35)", borderRadius: 2 }} /> Ward with
          visibility gap
        </span>
        <span>Label shows the issue ID and how many citizen reports it aggregates.</span>
      </div>
    </div>
  );
}
