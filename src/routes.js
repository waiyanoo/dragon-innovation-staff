import { lazy } from "react";
import SignIn from "layouts/authentication/sign-in";
import Icon from "@mui/material/Icon";
import PrivateRoute from "./context/PrivateRoute";
import Unauthorized from "./layouts/authentication/unauthorized";
import ResetPassword from "./layouts/authentication/reset-password";
import Action from "./layouts/authentication/action";

const Dashboard = lazy(() => import("layouts/dashboard"));
const Tables = lazy(() => import("./layouts/summary"));
const Profile = lazy(() => import("layouts/profile"));
const Order = lazy(() => import("./layouts/order"));
const OrderHistory = lazy(() => import("./layouts/history"));
const OrderView = lazy(() => import("./layouts/order/view"));
const Reward = lazy(() => import("./layouts/reward"));
const Statistics = lazy(() => import("./layouts/statistics"));
const Report_control_panel = lazy(() => import("./layouts/report_control_panel"));
const Waybill = lazy(() => import("./layouts/waybill"));
const AdhocInvoice = lazy(() => import("./layouts/adhoc-invoice"));
const WarehouseQueue = lazy(() => import("./layouts/warehouse"));

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    routeToGo: "/dashboard",
    roles: ["page_admin", "warehouse", "sales", "admin", "super_admin"],
    component: (
      <PrivateRoute
        roles={["page_admin", "warehouse", "sales", "admin", "super_admin"]}
      >
        <Dashboard />
      </PrivateRoute>
    ),
  },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    routeToGo: "/profile",
    roles: ["page_admin", "warehouse", "sales", "admin", "super_admin"],
    component:(
      <PrivateRoute
        roles={["page_admin", "warehouse", "sales", "admin", "super_admin"]}
      >
        <Profile />
      </PrivateRoute>
    )
  },
  {
    type: "collapse",
    name: "Reward",
    key: "reward",
    icon: <Icon fontSize="small">emoji_events</Icon>,
    route: "/reward",
    routeToGo: "/reward",
    roles: ["page_admin", "warehouse", "admin", "super_admin"],
    component:(
      <PrivateRoute
        roles={["page_admin", "warehouse",  "admin", "super_admin"]}
      >
        <Reward />
      </PrivateRoute>
    )
  },
  {
    type: "collapse",
    name: "Warehouse Queue",
    key: "warehouse-queue",
    icon: <Icon fontSize="small">warehouse</Icon>,
    route: "/warehouse-queue",
    routeToGo: "/warehouse-queue",
    roles: ["warehouse", "admin", "super_admin"],
    component: (
      <PrivateRoute roles={["warehouse", "admin", "super_admin"]}>
        <WarehouseQueue />
      </PrivateRoute>
    ),
  },
  {
    type: "collapse",
    name: "Order",
    key: "order",
    icon: <Icon fontSize="small">shopping_cart</Icon>,
    route: "/order/:id?",
    routeToGo: "/order",
    roles: ["page_admin", "warehouse", "sales", "admin", "super_admin"],
    component: (
      <PrivateRoute
        roles={["page_admin", "warehouse", "sales", "admin", "super_admin"]}
      >
        <Order />
      </PrivateRoute>
    ),
  },
  {
    type: "",
    name: "Order",
    key: "order",
    icon: <Icon fontSize="small">shopping_cart</Icon>,
    route: "/details/:id?",
    routeToGo: "/details",
    roles: ["page_admin", "warehouse", "sales", "admin", "super_admin"],
    component: (
      <PrivateRoute
        roles={["page_admin", "warehouse", "sales", "admin", "super_admin"]}
      >
        <OrderView />
      </PrivateRoute>
    ),
  },
  {
    type: 'title',
    name: "Order Records",
    title: "Order Records",
    key: "order-history",
    color: "white"
  },
  {
    type: "collapse",
    name: "Retail",
    key: "retail-history",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/history/:brand",
    routeToGo: "/history/hanskin",
    roles: ["page_admin", "warehouse", "admin", "super_admin"],
    component: (
      <PrivateRoute
        roles={["page_admin", "warehouse", "admin", "super_admin"]}
      >
        <OrderHistory />
      </PrivateRoute>
    ),
  },{
    type: "collapse",
    name: "Wholesale",
    key: "wholesale-history",
    icon: <Icon fontSize="small">inventory_2</Icon>,
    route: "/wholesale-history/:brand",
    routeToGo: "/wholesale-history/hanskin",
    roles: ["warehouse", "sales", "admin", "super_admin"],
    component: (
      <PrivateRoute
        roles={["warehouse", "sales", "admin", "super_admin"]}
      >
        <OrderHistory />
      </PrivateRoute>
    ),
  },
  {
    type: 'title',
    name: "Admin",
    key: "admin",
    title: "For Admin",
    color: "white"
  },{
    type: "collapse",
    name: "Summary",
    key: "summary",
    icon: <Icon fontSize="small">summarize</Icon>,
    route: "/summary",
    routeToGo: "/summary",
    roles: [ "admin", "super_admin"],
    component: (
      <PrivateRoute
        roles={["admin", "super_admin"]}
      >
        <Tables />
      </PrivateRoute>
    ),
  },{
    type: "collapse",
    name: "Statistics",
    key: "statistics",
    icon: <Icon fontSize="small">query_stats</Icon>,
    route: "/statistics",
    routeToGo: "/statistics",
    roles: [ "admin", "super_admin"],
    component: (
      <PrivateRoute
        roles={["admin", "super_admin"]}
      >
        <Statistics />
      </PrivateRoute>
    ),
  },{
    type: "collapse",
    name: "Admin Tools",
    key: "controlPanel",
    icon: <Icon fontSize="small">admin_panel_settings</Icon>,
    route: "/report_control_panel",
    routeToGo: "/report_control_panel",
    roles: [ "super_admin"],
    component: (
      <PrivateRoute
        roles={["super_admin"]}
      >
        <Report_control_panel />
      </PrivateRoute>
    ),
  },
  {
    type: "",
    name: "Waybill",
    key: "waybill",
    icon: "",
    route: "/waybill",
    routeToGo: "/waybill",
    roles: ["page_admin", "warehouse", "sales", "admin", "super_admin"],
    component: (
      <PrivateRoute roles={["page_admin", "warehouse", "sales", "admin", "super_admin"]}>
        <Waybill />
      </PrivateRoute>
    ),
  },
  {
    type: "",
    name: "Ad-hoc Invoice",
    key: "adhoc-invoice",
    icon: "",
    route: "/adhoc-invoice",
    routeToGo: "/adhoc-invoice",
    roles: ["page_admin", "warehouse", "sales", "admin", "super_admin"],
    component: (
      <PrivateRoute roles={["page_admin", "warehouse", "sales", "admin", "super_admin"]}>
        <AdhocInvoice />
      </PrivateRoute>
    ),
  },
  {
    type: "",
    name: "Unauthorized",
    key: "unauthorized",
    icon: "",
    route: "/unauthorized",
    routeToGo: "/unauthorized",
    component: <Unauthorized />,
  },
  {
    type: "",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    routeToGo: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    type: "",
    name: "Reset Password",
    key: "reset-password",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/reset-password",
    routeToGo: "/authentication/reset-password",
    component: <ResetPassword />,
  },
  {
    type: "",
    name: "Action",
    key: "action",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/action",
    routeToGo: "/authentication/action",
    component: <Action />,
  },
];

export default routes;
