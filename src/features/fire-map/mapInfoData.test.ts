import { describe, expect, it } from 'vitest'
import { prepareMapInfoPanelData } from './mapInfoData'

describe('prepareMapInfoPanelData', () => {
  it('derives display values only from real calendar summary fields', () => {
    expect(prepareMapInfoPanelData({
      coverage: 'inside',
      cellCount: 313,
      unit: 'NOAA-20-equivalent hotspots per month',
      latestCompleteMonth: { month: '2026-10', value: 1804, historicalMedian: 3329.9, ratioToMedian: 0.54, percentileRank: 28 },
      peakMonth: 8,
      topYears: [{ year: 2020, total: 224814.5 }],
      viirsNativeFrom: '2012-02',
    })).toMatchObject({ latestMonth: '2026-10', anomalyPercent: -46, peakMonthLabel: 'August', topYear: 2020, topYearTotal: 224814.5 })
  })

  it('keeps unavailable API metrics unavailable', () => {
    expect(prepareMapInfoPanelData({ coverage: 'inside', cellCount: 1, unit: 'counts', latestCompleteMonth: null, peakMonth: null, topYears: [], viirsNativeFrom: '2012-02' })).toMatchObject({ anomalyPercent: null, peakMonthLabel: 'Unavailable', topYear: null })
  })
})
