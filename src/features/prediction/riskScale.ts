import type { PredictionRiskLevel } from '../../shared/types'

export const RISK_LEVELS: PredictionRiskLevel[] = ['low', 'moderate', 'high', 'extreme']

export const RISK_COLOURS: Record<PredictionRiskLevel, string> = {
  low: '#fef3c7',
  moderate: '#fbbf24',
  high: '#f97316',
  extreme: '#dc2626',
}

export function riskLabel(level: PredictionRiskLevel): string {
  return level.charAt(0).toUpperCase() + level.slice(1)
}

