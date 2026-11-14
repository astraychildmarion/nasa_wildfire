import type { MonthlyRisk } from '../../shared/types'
import { RISK_COLOURS, RISK_LEVELS, riskLabel } from './riskScale'

export interface PredictionRiskDonutProps {
  risks: MonthlyRisk[]
  highRiskMonth: string
}

const VIEWBOX_SIZE = 220
const CENTRE = VIEWBOX_SIZE / 2
const RADIUS = 78
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function PredictionRiskDonut({ risks, highRiskMonth }: PredictionRiskDonutProps) {
  const segmentLength = CIRCUMFERENCE / Math.max(1, risks.length)
  const visibleSegmentLength = Math.max(1, segmentLength - 4)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="risk-donut-title">
      <h2 id="risk-donut-title" className="text-lg font-semibold text-slate-900">Future High-Risk Months</h2>
      <div className="mt-4 flex flex-col items-center">
        <div className="relative h-56 w-56">
          <svg viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`} className="h-full w-full" role="img" aria-label={`Predicted monthly fire risk. Highest-risk period: ${highRiskMonth}`}>
            <title>Predicted monthly fire risk</title>
            <circle cx={CENTRE} cy={CENTRE} r={RADIUS} fill="none" stroke="#f1f5f9" strokeWidth="24" />
            {risks.map((risk, index) => (
              <circle
                key={risk.month}
                cx={CENTRE}
                cy={CENTRE}
                r={RADIUS}
                fill="none"
                stroke={RISK_COLOURS[risk.level]}
                strokeWidth="24"
                strokeDasharray={`${visibleSegmentLength} ${CIRCUMFERENCE - visibleSegmentLength}`}
                strokeDashoffset={-index * segmentLength}
                transform={`rotate(-90 ${CENTRE} ${CENTRE})`}
              >
                <title>{`${risk.month}: ${riskLabel(risk.level)} risk (${risk.score}/100)`}</title>
              </circle>
            ))}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">High-risk period</span>
            <strong className="mt-1 text-lg text-slate-900">{highRiskMonth}</strong>
            <span className="text-xs text-slate-500">forecast</span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-orange-950" role="note">
        <p className="font-semibold">Extreme fire risk expected in {highRiskMonth}.</p>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5">
          <li>Begin understory clearing or prescribed-burn planning two months early.</li>
          <li>Increase fire-risk monitoring and emergency readiness.</li>
        </ul>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-200 pt-4 text-xs text-slate-600" aria-label="Risk level legend">
        {RISK_LEVELS.map((level) => (
          <span key={level} className="inline-flex items-center gap-2">
            <i className="h-3 w-3 rounded-full" style={{ backgroundColor: RISK_COLOURS[level] }} />
            {riskLabel(level)}
          </span>
        ))}
      </div>
    </section>
  )
}

