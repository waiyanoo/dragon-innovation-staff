import { calculateForChart } from "./common-functions";

const order = (date, amount) => ({ createdAt: { toDate: () => date }, amount });

test("groups today's sales into readable four-hour buckets", () => {
  const now = new Date(2026, 7, 28, 15);
  const chart = calculateForChart([
    order(new Date(2026, 7, 28, 1), 1000),
    order(new Date(2026, 7, 28, 5), 2000),
    order(new Date(2026, 7, 28, 7), 500),
  ], "Sales", "today", now);

  expect(chart.labels).toEqual(["12am", "4am", "8am", "12pm", "4pm", "8pm"]);
  expect(chart.datasets.data).toEqual([1000, 2500, 0, 0, 0, 0]);
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
