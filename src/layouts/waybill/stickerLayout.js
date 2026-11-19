export const STICKER_SETTINGS_KEY = "deliveryStickerLayout.v1";
export const DEFAULT_STICKER_SETTINGS = {
  paper: "4x6", border: 5, offsetX: 15, offsetY: 3, fontSize: 10,
};
export const STICKER_FIELDS = [
  { key: "name", label: "Name", lines: [25], height: 7 },
  { key: "phone", label: "Phone", lines: [33], height: 7 },
  { key: "address", label: "Address", lines: [43, 53, 63], height: 30 },
  { key: "remark", label: "Remark", lines: [71], height: 7 },
];
// Measurements are relative to the sticker's printed border, not the paper edge.
export const STICKER_TEXT_X = 35;
export const STICKER_LINE_CLEARANCE = 1;
export function sanitizeStickerSettings(value = {}) {
  const ranges = { border: [0, 10], offsetX: [-20, 20], offsetY: [-10, 10], fontSize: [8, 13] };
  return { paper: value?.paper === "custom" ? "custom" : "4x6", ...Object.fromEntries(Object.keys(ranges).map((key) => {
    const fallback = DEFAULT_STICKER_SETTINGS[key];
    const number = value?.[key] === "" ? NaN : Number(value?.[key]);
    const [min, max] = ranges[key];
    return [key, Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback];
  })) };
}
export const stickerSheetSize = (settings) => settings.paper === "4x6" ? { width: 152.4, height: 101.6 } : ({
  width: 120 + settings.border * 2, height: 90 + settings.border * 2,
});
export const stickerOrigin = (settings) => {
  const sheet = stickerSheetSize(settings);
  return { x: (sheet.width - 120) / 2, y: (sheet.height - 90) / 2 };
};
export const codCollectionLabel = (order) => order.paymentStatus === "COD"
  ? `COD — Collect: ${(Number(order.amount) || 0).toLocaleString("en-US")} MMK`
  : "";

export const stickerRemark = (order, remark) =>
  [codCollectionLabel(order), remark].filter(Boolean).join(" · ");

export const stickerOrderValues = (order) => ({
  name: order.name || "",
  phone: [...new Set([order.primaryPhone, order.secondaryPhone].filter(Boolean))].join(" / "),
  address: [order.address, order.city, order.state].filter(Boolean).join(", "),
  remark: order.remark || "",
});
