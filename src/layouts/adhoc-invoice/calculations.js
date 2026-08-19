export const calculateLine = (item) => {
  const quantity = Math.max(0, Number(item.quantity) || 0);
  const rate = Math.max(0, Number(item.rate) || 0);
  const discount = Math.min(100, Math.max(0, Number(item.discount) || 0));
  const gross = quantity * rate;
  return { gross, discountAmount: Math.round(gross * discount / 100), amount: Math.round(gross * (1 - discount / 100)) };
};

export const calculateInvoice = (items) => items.reduce((totals, item) => {
  const line = calculateLine(item);
  return {
    subtotal: totals.subtotal + line.gross,
    discountTotal: totals.discountTotal + line.discountAmount,
    total: totals.total + line.amount,
  };
}, { subtotal: 0, discountTotal: 0, total: 0 });

export const calculateGrandTotal = (itemTotal, deliveryFees, additionalDiscount) => Math.max(
  0,
  (Number(itemTotal) || 0) + Math.max(0, Number(deliveryFees) || 0) - Math.max(0, Number(additionalDiscount) || 0)
);

export const makeInvoiceNumber = (orderId, date = new Date()) => {
  const day = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("");
  return `DI-AH-${day}-${String(orderId).slice(-6).toUpperCase()}`;
};
