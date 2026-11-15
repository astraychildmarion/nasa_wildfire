# Historical calendar heatmap

## Slice interaction

Date navigation → parent date-range state → prepared calendar cells → month selection → parent
selected-month state → hotspot repository request → map marker update.

## Rendering policy

- The heatmap uses CSS Grid with January through December as columns and years as rows.
- Year rows are ordered newest first so the latest available year appears at the top.
- Complete numeric activity values are interactive buttons.
- Zero is a valid observation and uses the lowest solid colour in the activity scale.
- Missing, incomplete, and out-of-range cells use a patterned neutral appearance and are not selectable.
- Activity intensity uses a sequential blue colour-blind-accessible palette.
- Native buttons provide keyboard interaction and descriptive accessible labels and tooltips.

## Date navigation

- The default inclusive range is November 2011 through November 2025.
- The default or user-entered range is clamped to the period actually available from the API.
- After an AOI loads, the range end is selected automatically for the initial map grid.

## Data ownership

The calendar receives prepared cells and emits a month key. It does not access the repository.
`App.tsx` remains responsible for hotspot requests and map updates.

