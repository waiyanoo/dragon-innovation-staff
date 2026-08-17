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

test("links customers through either phone field and Facebook name", () => {
  const result = groupRepeatCustomers([
    {
      name: "Mya Mya",
      primaryPhone: "09123456789",
      amount: 10000,
      createdAt: timestamp("2026-08-01"),
    },
    {
      name: "Different Facebook Name",
      primaryPhone: "09222222222",
      secondaryPhone: "+959123456789",
      amount: 20000,
      createdAt: timestamp("2026-08-02"),
    },
    {
      name: "  MYA   MYA ",
      primaryPhone: "09333333333",
      amount: 30000,
      createdAt: timestamp("2026-08-03"),
    },
  ]);

  expect(result.uniqueCustomers).toBe(1);
  expect(result.repeatCustomerCount).toBe(1);
  expect(result.repeatOrders).toBe(3);
  expect(result.customers[0].phone).toBe("09123456789 / 09222222222 / 09333333333");
  expect(result.customers[0].names).toEqual(["Mya Mya", "Different Facebook Name"]);
  expect(result.customers[0].orderRecords).toHaveLength(3);
});
