export interface MapInfoPanelData {
  anomalyPercent: number
  anomalyComparisonLabel: string
  peakPeriodLabel: string
  peakFrpMw: number
  seasonWindowLabel: string
  seasonActivityPercent: number
}

export const MOCK_MAP_INFO: MapInfoPanelData = {
  anomalyPercent: 68,
  anomalyComparisonLabel: 'vs. 20-year same-month median',
  peakPeriodLabel: 'September 2020',
  peakFrpMw: 4210,
  seasonWindowLabel: 'July – October',
  seasonActivityPercent: 82,
}

