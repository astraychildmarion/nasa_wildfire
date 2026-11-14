# Historical calendar heatmap

## Slice interaction

Date navigation → parent date-range state → prepared calendar cells → month selection → parent
selected-month state → hotspot repository request → map marker update.

## Rendering policy

- The heatmap uses CSS Grid with January through December as columns and years as rows.
- Complete numeric activity values are interactive buttons.
- Zero is a valid observation and uses the lowest solid colour in the activity scale.
- Missing, incomplete, and out-of-range cells use a patterned neutral appearance and are not selectable.
- Activity intensity uses a sequential blue colour-blind-accessible palette.
- Native buttons provide keyboard interaction and descriptive accessible labels and tooltips.

## Date navigation

- The initial range remains the latest 12 complete available months.
- Previous and next controls shift the inclusive range by one year within the available period.
- A Latest control restores the default latest-12-month range.

## Data ownership

The calendar receives prepared cells and emits a month key. It does not access the repository.
`App.tsx` remains responsible for hotspot requests and map updates.

