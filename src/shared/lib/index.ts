export {
  calculateDifferences,
  calculateHistoricalSameMonthMedian,
  calculateMedian,
  getSensorValue,
  prepareCalendarCells,
} from './historicalActivity'
export type {
  ActivityDifference,
  BaselinePeriod,
  CalendarCell,
} from './historicalActivity'
export {
  clampMonthRange,
  getLatestCompleteMonthRange,
  getUtcMonthDateRange,
  isMonthInRange,
  toMonthKey,
} from './months'
export type { MonthRange } from './months'


