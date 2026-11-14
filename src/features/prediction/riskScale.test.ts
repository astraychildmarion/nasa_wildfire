import { describe, expect, it } from 'vitest'
import { RISK_COLOURS, RISK_LEVELS, riskLabel } from './riskScale'

describe('prediction risk scale', () => {
  it('defines all four ordered risk levels and labels them accessibly', () => {
    expect(RISK_LEVELS).toEqual(['low', 'moderate', 'high', 'extreme'])
    expect(riskLabel('extreme')).toBe('Extreme')
    expect(Object.values(RISK_COLOURS)).toHaveLength(4)
  })
})

