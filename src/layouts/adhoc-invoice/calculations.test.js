import { calculateGrandTotal, calculateInvoice, calculateLine, makeInvoiceNumber } from "./calculations";

test("calculates quantity and percentage discount", () => {
  expect(calculateLine({ quantity: 2, rate: 75000, discount: 10 })).toEqual({ gross: 150000, discountAmount: 15000, amount: 135000 });
});

test("totals invoice lines", () => {
  expect(calculateInvoice([{ quantity: 1, rate: 10000, discount: 0 }, { quantity: 2, rate: 5000, discount: 50 }])).toEqual({ subtotal: 20000, discountTotal: 5000, total: 15000 });
});

test("makes a stable meaningful number", () => {
  expect(makeInvoiceNumber("abc123456", new Date(2026, 7, 19))).toBe("DI-AH-20260819-123456");
});

test("adds delivery and applies the invoice discount without going negative", () => {
  expect(calculateGrandTotal(100000, 5000, 10000)).toBe(95000);
  expect(calculateGrandTotal(1000, 0, 2000)).toBe(0);
});
