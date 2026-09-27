import { formatDateTime } from "./format";

/** Stand-in for the field photograph.
 *
 * The MVP has no uploaded media, and a grey "image missing" box reads as a
 * bug during a demo, so each frame renders a deterministic schematic of the
 * road surface instead - damaged for "before", repaired for "after". */
function RoadSchematic({ damaged }: { damaged: boolean }) {
  return (
    <svg viewBox="0 0 320 240" aria-hidden="true">
      <rect width="320" height="240" fill="#cfc7ba" />
      <rect y="120" width="320" height="120" fill={damaged ? "#8d8477" : "#7d7a76"} />
      <rect y="112" width="320" height="10" fill="#b9b0a1" />
      {[30, 110, 190, 270].map((x) => (
        <rect key={x} x={x} y="172" width="34" height="5" fill="#efe9dd" opacity="0.8" />
      ))}
      {damaged ? (
        <>
          <ellipse cx="168" cy="188" rx="62" ry="30" fill="#4a423a" />
          <ellipse cx="168" cy="184" rx="48" ry="21" fill="#2f2924" />
          <ellipse cx="150" cy="182" rx="22" ry="9" fill="#6d6152" opacity="0.7" />
          <path d="M106 188 L86 206 M230 188 L252 204" stroke="#4a423a" strokeWidth="3" />
        </>
      ) : (
        <>
          <ellipse cx="168" cy="188" rx="64" ry="31" fill="#3f3b37" />
          <ellipse cx="168" cy="188" rx="64" ry="31" fill="none" stroke="#54504b" strokeWidth="2" />
        </>
      )}
      <rect y="60" width="320" height="52" fill="#b7ad9c" />
      <rect y="0" width="320" height="60" fill="#d9d2c4" />
      <rect x="18" y="16" width="52" height="44" fill="#c4bcac" />
      <rect x="92" y="10" width="64" height="50" fill="#cdc5b5" />
      <rect x="182" y="20" width="76" height="40" fill="#c8c0b0" />
    </svg>
  );
}

export function EvidenceFrame({
  kind,
  caption,
  capturedAt,
}: {
  kind: "before" | "after";
  caption: string;
  capturedAt: string;
}) {
  return (
    <figure className="ws-frame" style={{ margin: 0 }}>
      <div className="ws-frame__canvas">
        <RoadSchematic damaged={kind === "before"} />
        <span className="ws-frame__stamp">{kind === "before" ? "Before · intake photo" : "After · crew photo"}</span>
      </div>
      <figcaption className="ws-frame__caption">
        {caption}
        <span className="ws-frame__time">Captured {formatDateTime(capturedAt)}</span>
      </figcaption>
    </figure>
  );
}
