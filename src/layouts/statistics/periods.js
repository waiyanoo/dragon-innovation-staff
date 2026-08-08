// Works out the period to compare a statistics range against.
//
// Kept free of Firestore types and of the real clock so the arithmetic can be
// tested directly: callers pass plain Dates and an explicit `now`, and wrap the
// result in Timestamps themselves.

import dayjs from "dayjs";

// How far back the comparison sits, by preset. Custom ranges shift by their
// own length instead.
const SHIFT_BY_PRESET = {
  thisMonth: [1, "month"],
  previousMonth: [1, "month"],
  previousQuarter: [3, "month"],
  thisYear: [1, "year"],
  previousYear: [1, "year"],
};

/**
 * @param preset   one of the range presets, or "custom"
 * @param start    inclusive start of the current range
 * @param end      EXCLUSIVE end of the current range
 * @param now      current time, injected so tests are deterministic
 * @returns {{start: Date, end: Date, label: string}|null}
 *
 * A period still in progress is clamped to `now` before its length is
 * measured, so "This Month" on the 8th compares eight days against the same
 * eight days of last month rather than against a whole one. Returns null when
 * there is no positive span to compare.
 */
export const previousPeriod = (preset, start, end, now = new Date()) => {
  const from = dayjs(start);
  const rawTo = dayjs(end);
  const clock = dayjs(now);
  const inProgress = rawTo.isAfter(clock);
  const to = inProgress ? clock : rawTo;

  const lengthMs = to.diff(from);
  if (lengthMs <= 0) return null;

  const shift = SHIFT_BY_PRESET[preset];
  let prevStart;
  let prevEnd;

  if (shift) {
    prevStart = from.subtract(shift[0], shift[1]);
    prevEnd = inProgress
      ? // Still running: match the elapsed span so a partial month is not
        // compared against a whole one.
        prevStart.add(lengthMs, "millisecond")
      : // Already finished: shift BOTH ends by the calendar unit. Adding a
        // fixed span instead would drift, because months and years differ in
        // length — 31 days after 1 Jun is 2 Jul, not 1 Jul.
        rawTo.subtract(shift[0], shift[1]);
  } else {
    // Custom range: the comparison sits immediately before it.
    prevStart = from.subtract(lengthMs, "millisecond");
    prevEnd = from;
  }

  return {
    start: prevStart.toDate(),
    end: prevEnd.toDate(),
    // End is exclusive, so the label shows the last day actually included.
    label: `${prevStart.format("DD MMM")} – ${prevEnd.subtract(1, "day").format("DD MMM YYYY")}`,
  };
};

export const changePercent = (current, previous) =>
  previous > 0 ? ((current - previous) / previous) * 100 : null;
