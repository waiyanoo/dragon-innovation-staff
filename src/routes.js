

/**
  All of the routes for the Material Dashboard 2 React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav.
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that has other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
 */

// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Billing from "layouts/billing";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";

// @mui icons
import Icon from "@mui/material/Icon";
import Order from "./layouts/order";
import OrderHistory from "./layouts/history";
import PrivateRoute from "./context/PrivateRoute";
import OrderView from "./layouts/order/view";
import Unauthorized from "./layouts/authentication/unauthorized";

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
    title: "For Admin",
    color: "white"
  },{
    type: "collapse",
    name: "Summary",
    key: "summary",
    icon: <Icon fontSize="small">important_devices</Icon>,
    route: "/summary/:brand",
    routeToGo: "/summary/hanskin",
    roles: [ "admin", "super_admin"],
    component: (
      <PrivateRoute
        roles={["admin", "super_admin"]}
      >
        <Tables />
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
