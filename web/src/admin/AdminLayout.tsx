import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { ClipboardCheck, LayoutDashboard, PanelLeftClose, PanelLeftOpen, Truck } from "lucide-react";
import { SentinelProvider, useSentinel } from "./state/SentinelContext";
import { initials } from "./components/format";
import "./styles/wardsentry.css";

const SECTIONS = [
  {
    to: "/admin",
    end: true,
    icon: LayoutDashboard,
    title: "Ward Officer Dashboard",
    hint: "Spatial map + incident queue",
    heading: "Ward Officer Dashboard",
    subtitle: "Clustered civic issues, ranked by an explainable priority ledger.",
  },
  {
    to: "/admin/dispatch",
    end: false,
    icon: Truck,
    title: "Field Dispatch",
    hint: "Crew routing, confirm before send",
    heading: "Field Dispatch & Verification",
    subtitle: "Route crews and inspectors — nothing leaves without a confirmation step.",
  },
  {
    to: "/admin/review",
    end: false,
    icon: ClipboardCheck,
    title: "Reviewer / Vigilance",
    hint: "Evidence studio + resolution audit",
    heading: "Reviewer / Vigilance Console",
    subtitle: "Verify resolution evidence against the public work already funded.",
  },
];

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { issues, officer } = useSentinel();
  const counts: Record<string, number> = {
    "/admin": issues.length,
    "/admin/dispatch": issues.filter((i) => !i.dispatch).length,
    "/admin/review": issues.filter((i) => i.resolution && i.verification.state === "pending").length,
  };

  return (
    <aside className="ws-sidebar">
      <div className="ws-brand">
        <span className="ws-brand__seal" aria-hidden="true">
          WS
        </span>
        {!collapsed && (
          <span className="ws-brand__text">
            <span className="ws-brand__name">WardSentry</span>
            <span className="ws-brand__sub">Municipal administrator</span>
          </span>
        )}
      </div>

      <nav className="ws-nav" aria-label="Administrator consoles">
        {!collapsed && <p className="ws-nav__label">Consoles</p>}
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <NavLink
              key={section.to}
              to={section.to}
              end={section.end}
              className={({ isActive }) => `ws-nav__item ${isActive ? "is-active" : ""}`}
              title={collapsed ? section.title : undefined}
            >
              <Icon size={18} className="ws-nav__icon" aria-hidden="true" />
              {!collapsed && (
                <>
                  <span className="ws-nav__text">
                    <span className="ws-nav__title">{section.title}</span>
                    <span className="ws-nav__hint">{section.hint}</span>
                  </span>
                  <span className="ws-nav__count">{counts[section.to]}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="ws-sidebar__foot">
        <div className="ws-officer">
          <span className="ws-officer__avatar" aria-hidden="true">
            {initials(officer)}
          </span>
          {!collapsed && (
            <span>
              <span className="ws-officer__name">{officer}</span>
              <span className="ws-officer__role">Ward officer · W-14</span>
            </span>
          )}
        </div>
        <button type="button" className="ws-collapse" onClick={onToggle} aria-expanded={!collapsed}>
          {collapsed ? <PanelLeftOpen size={15} aria-hidden="true" /> : <PanelLeftClose size={15} aria-hidden="true" />}
          {!collapsed && "Collapse"}
        </button>
      </div>
    </aside>
  );
}

function Topbar() {
  const { pathname } = useLocation();
  const { issues } = useSentinel();
  const section =
    [...SECTIONS].reverse().find((s) => (s.end ? pathname === s.to : pathname.startsWith(s.to))) ?? SECTIONS[0];

  const reports = issues.reduce((sum, issue) => sum + issue.reports.length, 0);
  const exceptions = issues.filter((issue) => issue.recurrence.postCompletion).length;

  return (
    <header className="ws-topbar">
      <div className="ws-topbar__titles">
        <p className="ws-eyebrow">CivicFix Sentinel</p>
        <h1 className="ws-topbar__title">{section.heading}</h1>
        <p className="ws-topbar__subtitle">{section.subtitle}</p>
      </div>
      <div className="ws-topbar__spacer" />
      <div className="ws-topbar__meta">
        <div className="ws-metric">
          <span className="ws-metric__value">{reports}</span>
          <span className="ws-metric__label">Reports</span>
        </div>
        <div className="ws-metric">
          <span className="ws-metric__value">{issues.length}</span>
          <span className="ws-metric__label">Civic issues</span>
        </div>
        <div className="ws-metric">
          <span className="ws-metric__value" style={{ color: exceptions ? "var(--ws-critical)" : undefined }}>
            {exceptions}
          </span>
          <span className="ws-metric__label">Work exceptions</span>
        </div>
      </div>
    </header>
  );
}

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SentinelProvider>
      <div className="ws">
        <a href="#ws-main" className="ws-skip-link">
          Skip to content
        </a>
        <div className="ws-shell" data-collapsed={collapsed}>
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
          <div className="ws-main">
            <Topbar />
            <main id="ws-main">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </SentinelProvider>
  );
}
