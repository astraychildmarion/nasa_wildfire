export const FORECAST_PROBABILITY_BANDS = [
  { label: '<5%', maximum: 0.05, colour: '#fef3c7' },
  { label: '5–10%', maximum: 0.1, colour: '#fde68a' },
  { label: '10–20%', maximum: 0.2, colour: '#fbbf24' },
  { label: '20–40%', maximum: 0.4, colour: '#f97316' },
  { label: '>40%', maximum: Infinity, colour: '#dc2626' },
] as const

export const UNAVAILABLE_PROBABILITY_COLOUR = '#cbd5e1'

export function forecastProbabilityColour(probability: number | null | undefined): string {
  if (probability === null || probability === undefined || !Number.isFinite(probability)) return UNAVAILABLE_PROBABILITY_COLOUR
  const normalized = Math.max(0, Math.min(1, probability))
  return FORECAST_PROBABILITY_BANDS.find((band) => normalized < band.maximum)?.colour ?? FORECAST_PROBABILITY_BANDS.at(-1)!.colour
}
