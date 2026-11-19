import {
  DEFAULT_STICKER_SETTINGS, sanitizeStickerSettings, stickerOrderValues, stickerSheetSize, stickerOrigin, STICKER_FIELDS, STICKER_TEXT_X, codCollectionLabel, stickerRemark,
} from "./stickerLayout";

test("default alignment uses the physically verified Canon G1010 correction", () => {
  expect(DEFAULT_STICKER_SETTINGS.offsetX).toBe(15);
  expect(DEFAULT_STICKER_SETTINGS.offsetY).toBe(3);
  expect(sanitizeStickerSettings({ offsetX: 7, offsetY: 2 })).toMatchObject({ offsetX: 7, offsetY: 2 });
});

test("individual 120 × 90 sticker with 5 mm borders uses a 130 × 100 sheet", () => {
  expect(stickerSheetSize({ ...DEFAULT_STICKER_SETTINGS, paper: "custom" })).toEqual({ width: 130, height: 100 });
  expect(stickerSheetSize({ ...DEFAULT_STICKER_SETTINGS, paper: "custom", border: 0 })).toEqual({ width: 120, height: 90 });
});

test("4 × 6 landscape centers the label without changing its 120 × 90 size", () => {
  const sheet = stickerSheetSize(DEFAULT_STICKER_SETTINGS);
  const origin = stickerOrigin(DEFAULT_STICKER_SETTINGS);
  expect(sheet).toEqual({ width: 152.4, height: 101.6 });
  expect(origin.x).toBeCloseTo(16.2);
  expect(origin.y).toBeCloseTo(5.8);
  expect(sheet.width - 2 * origin.x).toBeCloseTo(120);
  expect(sheet.height - 2 * origin.y).toBeCloseTo(90);
  expect(stickerOrigin({ ...DEFAULT_STICKER_SETTINGS, paper: "custom" })).toEqual({ x: 5, y: 5 });
});

test("invalid saved settings cannot break print dimensions", () => {
  expect(sanitizeStickerSettings(null)).toEqual(DEFAULT_STICKER_SETTINGS);
  expect(sanitizeStickerSettings({ border: "", offsetX: Infinity, offsetY: "oops", fontSize: {} })).toEqual(DEFAULT_STICKER_SETTINGS);
  expect(sanitizeStickerSettings({ border: 900, offsetX: -100, offsetY: 100, fontSize: 0 })).toEqual({
    paper: "4x6", border: 10, offsetX: -20, offsetY: 10, fontSize: 8,
  });
});

test("sticker values include both phones and destination without editing the order", () => {
  const order = Object.freeze({ name: "Customer", primaryPhone: "091", secondaryPhone: "092", address: "Street", city: "Township", state: "Yangon", remark: "Call first" });
  expect(stickerOrderValues(order)).toEqual({ name: "Customer", phone: "091 / 092", address: "Street, Township, Yangon", remark: "Call first" });
  expect(stickerOrderValues({ primaryPhone: "091", secondaryPhone: "091" }).phone).toBe("091");
  expect(stickerOrderValues({})).toEqual({ name: "", phone: "", address: "", remark: "" });
});

test("template uses measured dotted-line coordinates, not approximate text-box positions", () => {
  expect(STICKER_TEXT_X).toBe(35);
  expect(STICKER_FIELDS.flatMap(({ lines }) => lines)).toEqual([25, 33, 43, 53, 63, 71]);
  expect(STICKER_FIELDS.find(({ key }) => key === "address").height).toBe(30);
});

test("COD uses the full order amount, including any recorded delivery fees", () => {
  const order = Object.freeze({ paymentStatus: "COD", paymentMode: "Cash", amount: "119000", deliveryFees: 3000 });
  expect(codCollectionLabel(order)).toBe("COD — Collect: 119,000 MMK");
  expect(stickerRemark(order, "Call first")).toBe("COD — Collect: 119,000 MMK · Call first");
  expect(stickerRemark(order, "")).toBe("COD — Collect: 119,000 MMK");
});

test("non-COD stickers keep remarks without a collection instruction", () => {
  for (const paymentStatus of ["Paid", "Other", undefined]) {
    expect(codCollectionLabel({ paymentStatus, amount: 119000 })).toBe("");
    expect(stickerRemark({ paymentStatus }, "Call first")).toBe("Call first");
  }
});
