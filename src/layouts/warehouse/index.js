import { useEffect, useMemo, useState } from "react";
import { arrayUnion, collection, getDocs, query, where } from "firebase/firestore";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import BrandedLoader from "components/BrandedLoader";
import BrandedErrorState from "components/BrandedErrorState";
import EmptyState from "components/EmptyState";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import MDSnackbar from "components/MDSnackbar";
import { useAuth } from "context/AuthContext";
import { database } from "../../firebase";
import { formattedAmount } from "../../functions/common-functions";
import {
  actorFrom,
  FULFILMENT,
  fulfilmentFromOrder,
  legacyStatusFor,
  updateOrderWithAudit,
} from "../../services/orderWorkflow";

const QUEUES = {
  pending: { label: "To Pack", empty: "No orders are waiting to be packed." },
  packed: { label: "Ready to Ship", empty: "No packed orders are waiting to ship." },
  exceptions: { label: "Exceptions", empty: "No warehouse issues are open." },
};

function WarehouseQueue() {
  const { authUser, userData } = useAuth();
  const [tab, setTab] = useState("pending");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [workingId, setWorkingId] = useState("");
  const [snack, setSnack] = useState({ open: false, message: "", color: "success", icon: "check" });

  const loadQueue = async () => {
    setLoading(true);
    setError(false);
    try {
      const loadCollection = async (collectionName, orderType) => {
        const snapshot = await getDocs(query(collection(database, collectionName), where("status", "in", [0, 1])));
        return snapshot.docs.map((orderDoc) => ({ id: orderDoc.id, collectionName, orderType, ...orderDoc.data() }));
      };
      const [retail, wholesale] = await Promise.all([
        loadCollection("orders", "Retail"),
        loadCollection("ws_orders", "Wholesale"),
      ]);
      setOrders([...retail, ...wholesale].sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)));
    } catch (loadError) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadQueue(); }, []);

  const visibleOrders = useMemo(() => orders.filter((order) => {
    if (tab === "exceptions") return order.exceptionStatus === "open";
    return fulfilmentFromOrder(order) === tab && order.exceptionStatus !== "open";
  }), [orders, tab]);

  const advance = async (order, nextStatus) => {
    setWorkingId(order.id);
    const updates = {
      fulfilmentStatus: nextStatus,
      status: legacyStatusFor(nextStatus),
      exceptionStatus: order.exceptionStatus === "open" ? "resolved" : (order.exceptionStatus || "none"),
      exceptionResolvedAt: order.exceptionStatus === "open" ? new Date() : null,
      updateHistory: arrayUnion({ updatedAt: new Date(), updatedBy: userData.name, updatedByUid: authUser?.uid || "" }),
    };
    try {
      await updateOrderWithAudit({
        collectionName: order.collectionName,
        orderId: order.id,
        updates,
        actor: actorFrom(authUser, userData),
        action: `order.${nextStatus}`,
        before: { fulfilmentStatus: fulfilmentFromOrder(order), exceptionStatus: order.exceptionStatus || "none" },
      });
      setOrders((current) => current.map((item) => item.id === order.id && item.collectionName === order.collectionName ? { ...item, ...updates } : item));
      setSnack({ open: true, message: `Order marked as ${nextStatus}.`, color: "success", icon: "check" });
    } catch (updateError) {
      setSnack({ open: true, message: "The order could not be updated.", color: "error", icon: "warning" });
    } finally {
      setWorkingId("");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={{ xs: 1, md: 3 }}>
        <MDBox mb={2}>
          <MDTypography variant="h4">Warehouse Queue</MDTypography>
          <MDTypography variant="body2" color="text">Oldest orders appear first so nothing is missed.</MDTypography>
        </MDBox>
        <TabContext value={tab}>
          <TabList onChange={(event, value) => setTab(value)} variant="scrollable" allowScrollButtonsMobile>
            {Object.entries(QUEUES).map(([value, queue]) => (
              <Tab key={value} value={value} label={`${queue.label} (${orders.filter((order) => value === "exceptions" ? order.exceptionStatus === "open" : fulfilmentFromOrder(order) === value && order.exceptionStatus !== "open").length})`} />
            ))}
          </TabList>
        </TabContext>
        {loading ? <BrandedLoader label="Loading warehouse queue…" /> : error ? (
          <BrandedErrorState title="Could not load the warehouse queue" description="Check your connection and try again." onRetry={loadQueue} />
        ) : visibleOrders.length === 0 ? (
          <EmptyState title="Queue clear" description={QUEUES[tab].empty} />
        ) : (
          <Grid container spacing={2} mt={1}>
            {visibleOrders.map((order) => (
              <Grid key={`${order.collectionName}-${order.id}`} size={{ xs: 12, lg: 6 }}>
                <Card sx={{ p: 2, height: "100%", border: order.exceptionStatus === "open" ? "1px solid #ef9aa5" : undefined }}>
                  <MDBox display="flex" justifyContent="space-between" gap={1} alignItems="flex-start">
                    <MDBox>
                      <MDTypography variant="h6">{order.name || "Unnamed customer"}</MDTypography>
                      <MDTypography variant="caption" color="text">{order.orderType} · {order.brand}</MDTypography>
                    </MDBox>
                    <MDBadge badgeContent={order.paymentStatus || "Unknown payment"} color={order.paymentStatus === "Paid" ? "success" : "warning"} variant="gradient" size="sm" />
                  </MDBox>
                  <MDBox my={1.5}>
                    <MDTypography variant="body2"><Icon fontSize="small" sx={{ mr: 1, verticalAlign: "middle" }}>phone</Icon>{[order.primaryPhone, order.secondaryPhone].filter(Boolean).join(" / ")}</MDTypography>
                    <MDTypography variant="body2" mt={0.5}><Icon fontSize="small" sx={{ mr: 1, verticalAlign: "middle" }}>place</Icon>{[order.address, order.city, order.state].filter(Boolean).join(", ")}</MDTypography>
                  </MDBox>
                  <MDBox bgcolor="grey-100" borderRadius="md" p={1.5} mb={1.5}>
                    <MDTypography variant="caption" color="text" fontWeight="bold">ITEMS</MDTypography>
                    <MDTypography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{(order.items || "Items not recorded").replace?.(/"/g, "")}</MDTypography>
                  </MDBox>
                  {order.exceptionStatus === "open" && <MDBox bgcolor="error" borderRadius="md" p={1.5} mb={1.5}><MDTypography variant="button" color="white">Issue: {order.exceptionReason}</MDTypography></MDBox>}
                  <MDBox display="flex" justifyContent="space-between" alignItems="center" gap={1} flexWrap="wrap">
                    <MDTypography variant="button" fontWeight="bold">{formattedAmount(order.amount)}</MDTypography>
                    <MDBox display="flex" gap={1}>
                      <MDButton variant="outlined" color="dark" size="small" onClick={() => window.open(`/waybill?type=${order.collectionName === "orders" ? "retail" : "wholesale"}&id=${order.id}`, "_blank", "noopener,noreferrer")}>Waybill</MDButton>
                      <MDButton variant="gradient" color="info" size="small" disabled={workingId === order.id} onClick={() => advance(order, fulfilmentFromOrder(order) === FULFILMENT.PENDING ? FULFILMENT.PACKED : FULFILMENT.SHIPPED)}>
                        {workingId === order.id ? "Updating…" : fulfilmentFromOrder(order) === FULFILMENT.PENDING ? "Mark packed" : "Mark shipped"}
                      </MDButton>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </MDBox>
      <MDSnackbar color={snack.color} icon={snack.icon} title="Dragon Innovation" content={snack.message} dateTime="0 min ago" open={snack.open} onClose={() => setSnack((current) => ({ ...current, open: false }))} close={() => setSnack((current) => ({ ...current, open: false }))} bgWhite />
      <Footer />
    </DashboardLayout>
  );
}

export default WarehouseQueue;
