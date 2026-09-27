import type { PriorityLedger } from "../state/types";

/** Priority is an auditable sum of named factors, never an opaque model score. */
export function PriorityLedgerView({ ledger }: { ledger: PriorityLedger }) {
  const formula = ledger.factors.map((f) => `+${f.points} ${f.label}`).join("  ");
  return (
    <div>
      <p className="ws-ledger__formula">
        {ledger.total} = {formula}
      </p>
      <div className="ws-ledger__total">
        <span className="ws-ledger__score">{ledger.total}</span>
        <span className="ws-ledger__max">/ {ledger.max} priority</span>
      </div>
      <ul className="ws-ledger__rows">
        {ledger.factors.map((factor) => (
          <li key={factor.key} className="ws-ledger__row">
            <span className="ws-ledger__label">{factor.label}</span>
            <span className="ws-ledger__points">+{factor.points}</span>
            <span className="ws-ledger__track" role="img" aria-label={`${factor.label} contributes ${factor.points} points`}>
              <span className="ws-ledger__fill" style={{ width: `${(factor.points / ledger.max) * 100}%` }} />
            </span>
            <span className="ws-ledger__evidence">{factor.evidence}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
