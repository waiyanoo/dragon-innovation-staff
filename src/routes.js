import Dashboard from "layouts/dashboard";
import Tables from "./layouts/summary";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import Icon from "@mui/material/Icon";
import Order from "./layouts/order";
import OrderHistory from "./layouts/history";
import PrivateRoute from "./context/PrivateRoute";
import OrderView from "./layouts/order/view";
import Unauthorized from "./layouts/authentication/unauthorized";
import Reward from "./layouts/reward";
import Report_control_panel from "./layouts/report_control_panel";

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
    name: "History",
    title: "History",
    key: "order-history",
    color: "white"
  },
  {
    type: "collapse",
    name: "Retail",
    key: "retail-history",
    icon: <Icon fontSize="small">local_shipping</Icon>,
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
    icon: <Icon fontSize="small">local_shipping</Icon>,
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
    icon: <Icon fontSize="small">important_devices</Icon>,
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
    name: "Report Control Panel",
    key: "controlPanel",
    icon: <Icon fontSize="small">analytics</Icon>,
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
];

export default routes;
