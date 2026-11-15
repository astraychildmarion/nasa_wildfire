import { describe, expect, it, vi } from 'vitest'
import { PREDICTION_PNG_OPTIONS, renderPredictionPng } from './predictionPng'

describe('prediction PNG rendering', () => {
  it('renders with a presentation-ready background and two-times pixel ratio', async () => {
    const element = {} as HTMLElement
    const renderer = vi.fn().mockResolvedValue('data:image/png;base64,test')

    await expect(renderPredictionPng(element, renderer)).resolves.toBe('data:image/png;base64,test')
    expect(renderer).toHaveBeenCalledWith(element, PREDICTION_PNG_OPTIONS)
    expect(PREDICTION_PNG_OPTIONS).toMatchObject({ backgroundColor: '#fafaf9', cacheBust: true, pixelRatio: 2 })
  })
})
