import { DEMO_NOW } from "../state/seed";

const DATE_TIME = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const DATE_ONLY = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export function formatDateTime(iso: string): string {
  return DATE_TIME.format(new Date(iso));
}

export function formatDate(iso: string): string {
  return DATE_ONLY.format(new Date(iso));
}

/** Ages are measured against the fixed demo clock, not wall-clock time. */
export function relativeDays(iso: string): string {
  const days = Math.round((DEMO_NOW.getTime() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export function formatRupees(amount: number): string {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(2)} cr`;
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(2)} lakh`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

const CATEGORY_COLORS: Record<string, string> = {
  pothole_road: "#9a3412",
  drainage_sewage: "#0f766e",
  water_supply: "#1d4ed8",
  streetlight: "#a16207",
  garbage_waste: "#4d7c0f",
  footpath: "#7e22ce",
  traffic_signage: "#be185d",
};

export function categoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? "#756b64";
}

export function initials(name: string): string {
  return name
    .replace(/^Inspector\s+/i, "")
    .split(/[\s.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
