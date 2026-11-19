jest.mock("layouts/authentication/sign-in", () => () => null);
jest.mock("../authentication/unauthorized", () => () => null);
jest.mock("../authentication/reset-password", () => () => null);
jest.mock("../authentication/action", () => () => null);
jest.mock("../../context/PrivateRoute", () => () => null);

const routes = require("../../routes").default;

test("Order Approvals has a standalone navigation route guarded for Super Admin only", () => {
  const route = routes.find((item) => item.key === "order-approvals");
  expect(route).toMatchObject({
    name: "Order Approvals", type: "collapse", route: "/order-approvals",
    routeToGo: "/order-approvals", roles: ["super_admin"],
  });
  expect(route.component.props.roles).toEqual(["super_admin"]);
  expect(routes.filter((item) => item.route === "/order-approvals")).toHaveLength(1);
});

test("Admin Tools retains its independent route", () => {
  const route = routes.find((item) => item.key === "controlPanel");
  expect(route.route).toBe("/report_control_panel");
  expect(route.roles).toEqual(["super_admin"]);
});
