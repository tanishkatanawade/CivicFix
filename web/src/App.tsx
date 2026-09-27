import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom";
import { Landing } from "./pages/Landing";
import { CitizenLayout } from "./citizen/CitizenLayout";
import { Home } from "./citizen/pages/Home";
import { ReportIssue } from "./citizen/pages/ReportIssue";
import { PublicIssues } from "./citizen/pages/PublicIssues";
import { PublicIssueDetail } from "./citizen/pages/PublicIssueDetail";
import { AdminLayout } from "./admin/AdminLayout";
import { WardOfficerDashboard } from "./admin/pages/WardOfficerDashboard";
import { FieldDispatch } from "./admin/pages/FieldDispatch";
import { ReviewerConsole } from "./admin/pages/ReviewerConsole";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        {/* Citizen portal: separate layout/route boundary, not CSS-hidden
            admin content. Prototype only - no auth exists on either side. */}
        <Route path="/citizen" element={<CitizenLayout />}>
          <Route index element={<Home />} />
          <Route path="report" element={<ReportIssue />} />
          <Route path="issues" element={<PublicIssues />} />
          <Route path="issues/:issueId" element={<PublicIssueDetail />} />
        </Route>

        {/* WardSentry administrator portal: three consoles, one per role in
            the civic pipeline. Prototype area, structured so real
            auth/authorization can be added at this boundary later. */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<WardOfficerDashboard />} />
          <Route path="dispatch" element={<FieldDispatch />} />
          <Route path="review" element={<ReviewerConsole />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/citizen" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
