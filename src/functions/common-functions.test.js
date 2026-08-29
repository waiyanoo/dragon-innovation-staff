import { calculateForChart } from "./common-functions";

const order = (date, amount) => ({ createdAt: { toDate: () => date }, amount });

test("uses the current month's daily chart for the Today view", () => {
  const now = new Date(2026, 7, 28, 15);
  const chart = calculateForChart([
    order(new Date(2026, 7, 2), 1000),
    order(new Date(2026, 7, 2), 2000),
    order(new Date(2026, 7, 28), 500),
  ], "Sales", "today", now);

  expect(chart.labels).toHaveLength(31);
  expect(chart.datasets.data[1]).toBe(3000);
  expect(chart.datasets.data[27]).toBe(500);
});

test("groups a selected month by calendar day", () => {
  const chart = calculateForChart([
    order(new Date(2026, 7, 2), 1000),
    order(new Date(2026, 7, 2), 500),
    order(new Date(2026, 7, 20), 3000),
  ], "Sales", "thisMonth", new Date(2026, 7, 28));

  expect(chart.labels).toHaveLength(31);
  expect(chart.datasets.data[1]).toBe(1500);
  expect(chart.datasets.data[19]).toBe(3000);
});
