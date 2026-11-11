import {
  FULFILMENT,
  fulfilmentFromOrder,
  invoiceStatusFromOrder,
  isActiveOrder,
  legacyStatusFor,
} from "./orderWorkflow";

describe("order workflow compatibility", () => {
  test("maps legacy numeric statuses without losing shipped invoice orders", () => {
    expect(fulfilmentFromOrder({ status: 0 })).toBe(FULFILMENT.PENDING);
    expect(fulfilmentFromOrder({ status: 1 })).toBe(FULFILMENT.PACKED);
    expect(fulfilmentFromOrder({ status: 2 })).toBe(FULFILMENT.SHIPPED);
    expect(fulfilmentFromOrder({ status: 3, invoiceNumber: "INV-1" })).toBe(FULFILMENT.SHIPPED);
  });

  test("new fulfilment fields override legacy fields", () => {
    expect(fulfilmentFromOrder({ status: 0, fulfilmentStatus: "packed" })).toBe(FULFILMENT.PACKED);
    expect(legacyStatusFor(FULFILMENT.CANCELLED)).toBe(4);
  });

  test("cancelled and archived orders are inactive", () => {
    expect(isActiveOrder({ fulfilmentStatus: "cancelled" })).toBe(false);
    expect(isActiveOrder({ isArchived: true })).toBe(false);
    expect(isActiveOrder({ status: 0 })).toBe(true);
  });

  test("infers invoice state for legacy orders", () => {
    expect(invoiceStatusFromOrder({ invoiceNumber: "INV-1" })).toBe("issued");
    expect(invoiceStatusFromOrder({})).toBe("not_required");
  });
});
