import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ChangeComparison, { formatChangeValue } from "./ChangeComparison";

test("money is formatted for comparison and zero is retained", () => {
  expect(formatChangeValue("amount", 117000)).toBe("117,000 MMK");
  expect(formatChangeValue("deliveryFees", 0)).toBe("0 MMK");
  expect(formatChangeValue("remark", "")).toBe("—");
  expect(formatChangeValue("items", "First\nSecond")).toBe("First\nSecond");
});

test.each([false, true])("current and proposed stay distinctly labeled in dark mode %s", (darkMode) => {
  const html = renderToStaticMarkup(<ChangeComparison field="amount" label="Amount" current={117000} proposed={119000} darkMode={darkMode} />);
  expect(html).toContain('aria-label="Current value"');
  expect(html).toContain('aria-label="Proposed value"');
  expect(html).toContain("CURRENT · SAVED ORDER");
  expect(html).toContain("PROPOSED · REQUESTED CHANGE");
  expect(html).toContain("117,000 MMK");
  expect(html).toContain("119,000 MMK");
});
