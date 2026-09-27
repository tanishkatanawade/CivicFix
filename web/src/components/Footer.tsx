import { Link } from 'react-router-dom';
import { MapPin, CheckCircle2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-muted/80 border-t border-border mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center space-x-3">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg transform rotate-12" />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg transform -rotate-12" />
                <div className="absolute inset-0 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
              </div>
              <span className="text-xl font-bold text-foreground tracking-tight">
                CivicFix
              </span>
            </Link>
            <p className="text-secondary text-sm leading-relaxed">
              Transparent civic issue triage &amp; accountability. Citizen reports grouped by underlying problem and cross-referenced with real MPLADS public works.
            </p>
            <div className="flex items-center gap-2 text-xs text-secondary font-mono">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              Pune Municipal Corporation
            </div>
          </div>

          {/* Citizen Portal */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">
              Citizen Portal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/citizen" className="text-secondary hover:text-foreground transition-colors">
                  Citizen Home
                </Link>
              </li>
              <li>
                <Link to="/citizen/report" className="text-secondary hover:text-foreground transition-colors">
                  Report an Issue
                </Link>
              </li>
              <li>
                <Link to="/citizen/issues" className="text-secondary hover:text-foreground transition-colors">
                  Browse Public Issues
                </Link>
              </li>
            </ul>
          </div>

          {/* Admin Console */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">
              Admin Console
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/admin" className="text-secondary hover:text-foreground transition-colors">
                  Ward Officer Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin/dispatch" className="text-secondary hover:text-foreground transition-colors">
                  Field Dispatch &amp; Verification
                </Link>
              </li>
              <li>
                <Link to="/admin/review" className="text-secondary hover:text-foreground transition-colors">
                  Reviewer / Vigilance Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Methodology & Tech */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">
              Accountability
            </h4>
            <ul className="space-y-2 text-xs text-secondary">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span>Deterministic priority formulas, never opaque black-box models.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span>60,000+ government MPLADS records for evidence verification.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span>Multilingual voice intake (English, Hindi, Marathi).</span>
              </li>
            </ul>
            <div className="flex space-x-3 pt-2">
              <a
                href="https://github.com/swarajdeshmukh4249/CivicFix"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 bg-border/70 hover:bg-border rounded-lg flex items-center justify-center text-foreground transition-colors"
                aria-label="GitHub Repository"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-border/70 hover:bg-border rounded-lg flex items-center justify-center text-foreground transition-colors"
                aria-label="Twitter / X"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-secondary gap-3">
          <p>
            © {new Date().getFullYear()} CivicFix · Pune Civic Issue Triage Prototype. Data shown is generated for demonstration.
          </p>
          <div className="flex space-x-6">
            <span className="hover:text-foreground cursor-pointer transition-colors">
              Privacy Policy
            </span>
            <span className="hover:text-foreground cursor-pointer transition-colors">
              Terms of Service
            </span>
            <span className="hover:text-foreground cursor-pointer transition-colors">
              Open Data License
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
