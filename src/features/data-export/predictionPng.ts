import { toPng } from 'html-to-image'

export const PREDICTION_PNG_FILENAME = 'wildfire-prediction-dashboard.png'
export const PREDICTION_PNG_OPTIONS = {
  backgroundColor: '#fafaf9',
  cacheBust: true,
  pixelRatio: 2,
} as const

export type PredictionPngRenderer = (
  element: HTMLElement,
  options: typeof PREDICTION_PNG_OPTIONS,
) => Promise<string>

export function renderPredictionPng(
  element: HTMLElement,
  renderer: PredictionPngRenderer = toPng,
): Promise<string> {
  return renderer(element, PREDICTION_PNG_OPTIONS)
}

export async function downloadPredictionPng(element: HTMLElement): Promise<void> {
  const dataUrl = await renderPredictionPng(element)
  const link = document.createElement('a')
  link.download = PREDICTION_PNG_FILENAME
  link.href = dataUrl
  link.click()
}
