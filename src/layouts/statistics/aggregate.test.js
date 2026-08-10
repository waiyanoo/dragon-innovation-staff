import { groupRepeatCustomers } from "./aggregate";

const timestamp = (date) => ({ toDate: () => new Date(date) });

test("groups repeated customers by normalized primary phone", () => {
  const result = groupRepeatCustomers([
    {
      name: "Mya Mya",
      primaryPhone: "09 123 456 789",
      brand: "hanskin",
      amount: 12000,
      deliveryFees: 2000,
      createdAt: timestamp("2026-08-01"),
    },
    {
      name: "Mya Mya",
      primaryPhone: "+959123456789",
      brand: "mongdies",
      amount: 25000,
      deliveryFees: 0,
      createdAt: timestamp("2026-08-05"),
    },
    {
      name: "Single Customer",
      primaryPhone: "09987654321",
      brand: "hanskin",
      amount: 5000,
      deliveryFees: 0,
      createdAt: timestamp("2026-08-03"),
    },
  ]);

  expect(result.uniqueCustomers).toBe(2);
  expect(result.repeatCustomerCount).toBe(1);
  expect(result.repeatOrders).toBe(2);
  expect(result.repeatSales).toBe(35000);
  expect(result.customers[0]).toMatchObject({
    phone: "09123456789",
    orders: 2,
    averageOrder: 17500,
  });
  expect(result.customers[0].brands).toEqual(["hanskin", "mongdies"]);
});
