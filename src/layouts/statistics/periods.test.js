import { changePercent, previousPeriod } from "./periods";
import { toCsv } from "./exportCsv";

// Pretend "now" is 8 Aug 2026, 10:00, with This Month spanning 1 Aug - 1 Sep.
const NOW = new Date(2026, 7, 8, 10, 0, 0);
const AUG_START = new Date(2026, 7, 1, 0, 0, 0);
const SEP_START = new Date(2026, 8, 1, 0, 0, 0);

describe("previousPeriod", () => {
  test("This Month compares the same elapsed span of last month, not the whole month", () => {
    const period = previousPeriod("thisMonth", AUG_START, SEP_START, NOW);
    // 1 Aug 00:00 -> 8 Aug 10:00 is the elapsed span, so the comparison is
    // 1 Jul 00:00 -> 8 Jul 10:00.
    expect(period.start).toEqual(new Date(2026, 6, 1, 0, 0, 0));
    expect(period.end).toEqual(new Date(2026, 6, 8, 10, 0, 0));
  });

  test("an order late in the previous month falls OUTSIDE the comparison window", () => {
    const period = previousPeriod("thisMonth", AUG_START, SEP_START, NOW);
    const lateJuly = new Date(2026, 6, 25, 10, 0, 0);
    expect(lateJuly >= period.start && lateJuly < period.end).toBe(false);
  });

  test("an order early in the previous month falls INSIDE the comparison window", () => {
    const period = previousPeriod("thisMonth", AUG_START, SEP_START, NOW);
    const earlyJuly = new Date(2026, 6, 3, 10, 0, 0);
    expect(earlyJuly >= period.start && earlyJuly < period.end).toBe(true);
  });

  test("a completed period is compared in full, not clamped", () => {
    const julStart = new Date(2026, 6, 1);
    // Previous Month is already over, so its whole length is used.
    const period = previousPeriod("previousMonth", julStart, AUG_START, NOW);
    expect(period.start).toEqual(new Date(2026, 5, 1));
    expect(period.end).toEqual(new Date(2026, 6, 1));
  });

  test("previous quarter shifts back three months", () => {
    const period = previousPeriod("previousQuarter", new Date(2026, 3, 1), new Date(2026, 6, 1), NOW);
    expect(period.start).toEqual(new Date(2026, 0, 1));
    expect(period.end).toEqual(new Date(2026, 3, 1));
  });

  test("previous year shifts back a year", () => {
    const period = previousPeriod("previousYear", new Date(2025, 0, 1), new Date(2026, 0, 1), NOW);
    expect(period.start).toEqual(new Date(2024, 0, 1));
    expect(period.end).toEqual(new Date(2025, 0, 1));
  });

  test("This Year is clamped to today, so it compares year-to-date", () => {
    const period = previousPeriod("thisYear", new Date(2026, 0, 1), new Date(2027, 0, 1), NOW);
    expect(period.start).toEqual(new Date(2025, 0, 1));
    // Same elapsed span: 1 Jan -> 8 Aug 10:00 of the previous year.
    expect(period.end).toEqual(new Date(2025, 7, 8, 10, 0, 0));
  });

  test("a past custom range shifts back by its own length", () => {
    const from = new Date(2026, 6, 1);
    const to = new Date(2026, 6, 11); // exclusive, so 10 days, all in the past
    const period = previousPeriod("custom", from, to, NOW);
    expect(period.start).toEqual(new Date(2026, 5, 21));
    expect(period.end).toEqual(from);
  });

  test("a custom range running into the future is clamped to elapsed time", () => {
    // Chosen 1-10 Aug but only 1-8 has happened, so comparing a full 10 days
    // would be unfair; only the elapsed span counts.
    const from = new Date(2026, 7, 1);
    const period = previousPeriod("custom", from, new Date(2026, 7, 11), NOW);
    expect(period.end).toEqual(from);
    expect(period.start).toEqual(new Date(2026, 6, 24, 14, 0, 0));
  });

  test("the label names the last day actually included", () => {
    const period = previousPeriod("previousMonth", new Date(2026, 6, 1), AUG_START, NOW);
    // 1 Jun -> 1 Jul exclusive, so the label ends on 30 Jun.
    expect(period.label).toBe("01 Jun – 30 Jun 2026");
  });

  test("returns null when the range has no positive span", () => {
    expect(previousPeriod("custom", AUG_START, AUG_START, NOW)).toBeNull();
    // A range entirely in the future clamps to now, leaving nothing elapsed.
    expect(previousPeriod("custom", SEP_START, new Date(2026, 8, 10), NOW)).toBeNull();
  });
});

describe("changePercent", () => {
  test("computes a rise and a fall", () => {
    expect(changePercent(40000, 20000)).toBe(100);
    expect(changePercent(15000, 20000)).toBe(-25);
  });

  test("is null when there is nothing to compare against", () => {
    // Growth from zero is not a percentage; the card hides instead of showing Infinity.
    expect(changePercent(40000, 0)).toBeNull();
    expect(changePercent(0, 0)).toBeNull();
  });
});

describe("toCsv", () => {
  test("quotes fields containing commas, quotes or newlines", () => {
    const csv = toCsv(
      ["city", "orders"],
      [
        ["Yangon, Hlaing", 3],
        ['He said "hi"', 1],
        ["two\nlines", 2],
      ]
    );
    // Rows are \r\n separated; an embedded \n stays inside its quoted field.
    const rows = csv.split("\r\n");
    expect(rows[0]).toBe("city,orders");
    expect(rows[1]).toBe('"Yangon, Hlaing",3');
    expect(rows[2]).toBe('"He said ""hi""",1');
    expect(rows[3]).toBe('"two\nlines",2');
  });

  test("leaves plain values unquoted and handles blanks", () => {
    expect(toCsv(["a"], [["Yangon"], [null], [undefined]])).toBe("a\r\nYangon\r\n\r\n");
  });
});
