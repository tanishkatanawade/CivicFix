import type { CivicIssue, Ward } from "../state/types";
import { formatDate, formatRupees } from "./format";

interface ChainNode {
  label: string;
  detail: string;
  present: boolean;
  alert?: boolean;
}

/** Complaint → Ward → Public Project (MPLADS) → Tender → Contractor.
 * Absent links are rendered rather than hidden: "no funded work found" is
 * itself an audit finding. */
export function EvidenceChainView({ issue, ward }: { issue: CivicIssue; ward: Ward | undefined }) {
  const project = issue.match?.project ?? null;
  const nodes: ChainNode[] = [
    {
      label: `${issue.reports.length} citizen ${issue.reports.length === 1 ? "complaint" : "complaints"}`,
      detail: `Clustered into ${issue.issueId} · ${issue.cluster.state} · similarity ${issue.cluster.semanticSimilarity.toFixed(2)}`,
      present: true,
    },
    {
      label: `Ward ${issue.wardId} — ${ward?.name ?? "Unknown"}`,
      detail: ward ? `Ward officer ${ward.officer} · ${ward.population.toLocaleString("en-IN")} residents` : "Ward record missing",
      present: Boolean(ward),
    },
    {
      label: project ? `Public project ${project.projectId}` : "No funded public work linked",
      detail: project
        ? `${project.scheme} · ${project.name} · ${formatRupees(project.sanctionedAmount)} sanctioned ${formatDate(project.sanctionedOn)}`
        : "Matching engine found no project within 250 m in this category.",
      present: Boolean(project),
    },
    {
      label: project ? `Tender ${project.tenderId}` : "No tender in the chain",
      detail: project
        ? `Awarded ${formatDate(project.tenderAwardedOn)} · completion recorded ${project.completedOn ? formatDate(project.completedOn) : "not yet reported"}`
        : "Without a project there is no tender to audit.",
      present: Boolean(project),
    },
    {
      label: project ? project.contractor.name : "No contractor accountable",
      detail: project
        ? `${project.contractor.contractorId} · ${project.contractor.activeTenders} active tenders · ${project.contractor.priorFlags} prior verification flags`
        : "Accountability cannot be assigned until a work match is approved.",
      present: Boolean(project),
      alert: Boolean(project) && issue.recurrence.postCompletion,
    },
  ];

  return (
    <ol className="ws-chain">
      {nodes.map((node, index) => (
        <li
          key={node.label}
          className={`ws-chain__node ${node.present ? "" : "ws-chain__node--absent"} ${node.alert ? "ws-chain__node--alert" : ""}`}
        >
          <span className="ws-chain__rail" aria-hidden="true">
            <span className="ws-chain__dot" />
            {index < nodes.length - 1 && <span className="ws-chain__line" />}
          </span>
          <span>
            <span className="ws-chain__label">{node.label}</span>
            <span className="ws-chain__detail">{node.detail}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
