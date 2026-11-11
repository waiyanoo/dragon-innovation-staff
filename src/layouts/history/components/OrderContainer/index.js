// @mui material components
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Billing page components
import OrderCard from "../OrderCard";
import { useEffect, useState } from "react";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  Timestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { database } from "../../../../firebase";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import { useLocation, useNavigate } from "react-router-dom";
import MDSnackbar from "../../../../components/MDSnackbar";
import { useAuth } from "../../../../context/AuthContext";
import MDButton from "../../../../components/MDButton";
import MDInput from "../../../../components/MDInput";
import BrandedLoader from "../../../../components/BrandedLoader";
import EmptyState from "../../../../components/EmptyState";
import FilterOrders from "../Filters";
import dayjs from "dayjs";
import {
  actorFrom,
  auditPayload,
  auditRef,
  FULFILMENT,
  fulfilmentFromOrder,
  INVOICE_STATUS,
  legacyStatusFor,
  updateOrderWithAudit,
} from "../../../../services/orderWorkflow";

function OrderContainer({ brand }) {
  const PAGE_SIZE = 100;
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [searchedOrders, setSearchedOrders] = useState([]);
  const [searchKeywords, setSearchKeywords] = useState("");
  const [checkedItems, setCheckedItems] = useState({
    pending: false,
    packed: false,
    shipped: false,
    cod: false,
    fullPaid: false,
    other: false,
    cash: false,
    kpay: false,
    bank: false,
    startDate: "",
    endDate: "",
  });
  const [selectedBrand, setSelectedBrand] = useState(brand);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [open, setOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [exceptionTarget, setExceptionTarget] = useState(null);
  const [exceptionReason, setExceptionReason] = useState("");
  const [bulkTarget, setBulkTarget] = useState(null);
  const [isBulkRunning, setIsBulkRunning] = useState(false);
  const [isBulkPreparing, setIsBulkPreparing] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [orderId, setOrderId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { authUser, userData } = useAuth();
  const [snack, setSnack] = useState({ open: false, message: "", color: "success", icon: "check" });
  const segments = location.pathname.split("/").filter(Boolean);

  useEffect(() => {
    const timer = setTimeout(() => filerOrders(false), 350);
    return () => clearTimeout(timer);
  }, [segments[0], selectedBrand, checkedItems, searchKeywords]);

  const handleClose = () => setOpen(false);

  const handleConfirm = async () => {
    await setOfficialInvoice(orderId);
    setOpen(false);
  };

  useEffect(() => {
    if (selectedBrand === "all") {
      navigate(`/${segments[0]}/all`);
    } else {
      navigate(`/${segments[0]}/${selectedBrand}`);
    }
  }, [selectedBrand, segments[0]]);

  const loadMore = () => filerOrders(true);

  const handleBrandChange = (e) => {
    const { value } = e.target;
    setSelectedBrand(value);
  };

  const updateOrder = async (fulfilmentStatus, id) => {
    const collectionName = segments[0] === "history" ? "orders" : "ws_orders";
    const dataToUpdate = {
      fulfilmentStatus,
      status: legacyStatusFor(fulfilmentStatus),
      updateHistory: arrayUnion({
        updatedAt: new Date(),
        updatedBy: userData.name,
        updatedByUid: authUser?.uid || "",
      }),
    };
    try {
      await updateOrderWithAudit({
        collectionName,
        orderId: id,
        updates: dataToUpdate,
        actor: actorFrom(authUser, userData),
        action: `order.${fulfilmentStatus}`,
      });
      setOrders((prev) => prev.map((item) => (item.id === id ? { ...item, ...dataToUpdate } : item)));
      setSearchedOrders((prev) => prev.map((item) => (item.id === id ? { ...item, ...dataToUpdate } : item)));
      setSnack({ open: true, message: `Order marked as ${fulfilmentStatus}.`, color: "success", icon: "check" });
      setOrderId("");
    } catch (e) {
      setSnack({ open: true, message: "Order update failed.", color: "error", icon: "warning" });
    }
  };

  const setOfficialInvoice = async (id) => {
    const collectionName = segments[0] === "history" ? "orders" : "ws_orders";
    try {
      await updateOrderWithAudit({
        collectionName,
        orderId: id,
        updates: {
          invoiceNumber: invoiceNumber.trim(),
          invoiceStatus: INVOICE_STATUS.ISSUED,
          updateHistory: arrayUnion({ updatedAt: new Date(), updatedBy: userData.name, updatedByUid: authUser?.uid || "" }),
        },
        actor: actorFrom(authUser, userData),
        action: "order.invoice_issued",
      });
      setOrders((prev) => prev.map((item) => item.id === id ? { ...item, invoiceNumber: invoiceNumber.trim(), invoiceStatus: INVOICE_STATUS.ISSUED } : item));
      setSearchedOrders((prev) => prev.map((item) => item.id === id ? { ...item, invoiceNumber: invoiceNumber.trim(), invoiceStatus: INVOICE_STATUS.ISSUED } : item));
      setInvoiceNumber("");
      setOrderId("");
      setSnack({ open: true, message: "Official invoice number saved.", color: "success", icon: "check" });
    } catch (e) {
      setSnack({ open: true, message: "Invoice number could not be saved.", color: "error", icon: "warning" });
    }
  };

  const confirmCancel = async () => {
    const target = cancelTarget;
    if (!target || !cancelReason.trim()) return;
    setCancelTarget(null);
    const collectionName = segments[0] === "history" ? "orders" : "ws_orders";
    try {
      const updates = {
        fulfilmentStatus: FULFILMENT.CANCELLED,
        status: legacyStatusFor(FULFILMENT.CANCELLED),
        isArchived: true,
        cancelledAt: new Date(),
        cancelledBy: userData.name,
        cancelledByUid: authUser?.uid || "",
        cancellationReason: cancelReason.trim(),
        updateHistory: arrayUnion({ updatedAt: new Date(), updatedBy: userData.name, updatedByUid: authUser?.uid || "" }),
      };
      await updateOrderWithAudit({ collectionName, orderId: target.id, updates, actor: actorFrom(authUser, userData), action: "order.cancelled", metadata: { reason: cancelReason.trim() } });
      setOrders((prev) => prev.map((item) => item.id === target.id ? { ...item, ...updates } : item));
      setSearchedOrders((prev) => prev.map((item) => item.id === target.id ? { ...item, ...updates } : item));
      setCancelReason("");
      setSnack({ open: true, message: "Order cancelled and kept in the records.", color: "success", icon: "check" });
    } catch (e) {
      setSnack({ open: true, message: "Order could not be cancelled.", color: "error", icon: "warning" });
    }
  };

  const confirmException = async () => {
    const target = exceptionTarget;
    if (!target || !exceptionReason.trim()) return;
    setExceptionTarget(null);
    const collectionName = segments[0] === "history" ? "orders" : "ws_orders";
    try {
      const updates = {
        exceptionStatus: "open",
        exceptionReason: exceptionReason.trim(),
        exceptionReportedAt: new Date(),
        exceptionReportedBy: userData.name,
        exceptionReportedByUid: authUser?.uid || "",
        updateHistory: arrayUnion({ updatedAt: new Date(), updatedBy: userData.name, updatedByUid: authUser?.uid || "" }),
      };
      await updateOrderWithAudit({ collectionName, orderId: target.id, updates, actor: actorFrom(authUser, userData), action: "order.exception_reported", metadata: { reason: exceptionReason.trim() } });
      setOrders((prev) => prev.map((item) => item.id === target.id ? { ...item, ...updates } : item));
      setSearchedOrders((prev) => prev.map((item) => item.id === target.id ? { ...item, ...updates } : item));
      setExceptionReason("");
      setSnack({ open: true, message: "Warehouse issue reported.", color: "warning", icon: "warning" });
    } catch (e) {
      setSnack({ open: true, message: "Issue could not be reported.", color: "error", icon: "warning" });
    }
  };

  const runBulkUpdate = async () => {
    const target = bulkTarget;
    setBulkTarget(null);
    if (!target || target.orders.length === 0) return;

    setIsBulkRunning(true);
    const collectionName = segments[0] === "history" ? "orders" : "ws_orders";
    const historyEntry = { updatedAt: new Date(), updatedBy: userData.name, updatedByUid: authUser?.uid || "" };

    try {
      // Each order also gets an audit record, so 200 orders = 400 writes.
      for (let i = 0; i < target.orders.length; i += 200) {
        const chunk = target.orders.slice(i, i + 200);
        const batch = writeBatch(database);
        chunk.forEach((order) => {
          batch.update(doc(database, collectionName, order.id), {
            fulfilmentStatus: target.toStatus,
            status: legacyStatusFor(target.toStatus),
            updateHistory: arrayUnion(historyEntry),
          });
          batch.set(auditRef(), auditPayload({
            actor: actorFrom(authUser, userData),
            action: `order.bulk_${target.toStatus}`,
            orderId: order.id,
            collectionName,
            before: { fulfilmentStatus: fulfilmentFromOrder(order) },
            after: { fulfilmentStatus: target.toStatus },
            metadata: { bulk: true },
          }));
        });
        await batch.commit();
      }

      const updatedIds = new Set(target.orders.map((order) => order.id));
      setSearchedOrders(
        searchedOrders.map((order) =>
          updatedIds.has(order.id)
            ? { ...order, status: legacyStatusFor(target.toStatus), fulfilmentStatus: target.toStatus, updateHistory: [...(order.updateHistory || []), historyEntry] }
            : order
        )
      );
      setSnack({
        open: true,
        message: `${target.orders.length} order(s) marked as ${target.label}.`,
        color: "success",
        icon: "check",
      });
    } catch (e) {
      setSnack({
        open: true,
        message: "Bulk update failed. Please try again.",
        color: "error",
        icon: "warning",
      });
    } finally {
      setIsBulkRunning(false);
    }
  };

  const handleOrderCardClick = async (e, order) => {
    switch (e) {
      case "view":
        navigate(`/details?type=${segments[0] === "history" ? "retail" : "wholesale"}&id=${order.id}`);
        break;
      case "edit":
        navigate(`/order?id=${order.id}`);
        break;
      case "waybill": {
        const orderType = segments[0] === "history" ? "retail" : "wholesale";
        window.open(`/waybill?type=${orderType}&id=${order.id}`, "_blank", "noopener,noreferrer");
        break;
      }
      case "adhoc_invoice": {
        const orderType = segments[0] === "history" ? "retail" : "wholesale";
        window.open(`/adhoc-invoice?type=${orderType}&id=${order.id}`, "_blank", "noopener,noreferrer");
        break;
      }
      case "cancel":
        setCancelReason("");
        setCancelTarget(order);
        break;
      case "exception":
        setExceptionReason("");
        setExceptionTarget(order);
        break;
      case "packed":
        await updateOrder(FULFILMENT.PACKED, order.id);
        break;
      case "shipped":
        await updateOrder(FULFILMENT.SHIPPED, order.id);
        break;
      case "invoice":
        setOpen(true);
        setOrderId(order.id);
        break;
      default:
        break;
    }
  };

  const selectedStatusCodes = () => {
    const statuses = [];
    if (checkedItems.pending) statuses.push(0);
    if (checkedItems.packed) statuses.push(1);
    if (checkedItems.shipped) statuses.push(2, 3);
    return [...new Set(statuses)];
  };

  const requiresCompleteDataset = () => Boolean(
    searchKeywords.trim()
    || checkedItems.cod || checkedItems.fullPaid || checkedItems.other
    || checkedItems.cash || checkedItems.kpay || checkedItems.bank
    || checkedItems.startDate || checkedItems.endDate
  );

  const buildOrderConstraints = () => {
    const constraints = [];
    if (selectedBrand !== "all") constraints.push(where("brand", "==", selectedBrand));
    const statuses = selectedStatusCodes();
    if (statuses.length) constraints.push(where("status", "in", statuses));
    if (checkedItems.startDate) constraints.push(where("createdAt", ">=", Timestamp.fromDate(new Date(checkedItems.startDate))));
    if (checkedItems.endDate) {
      const endExclusive = dayjs(checkedItems.endDate).add(1, "day").startOf("day").toDate();
      constraints.push(where("createdAt", "<", Timestamp.fromDate(endExclusive)));
    }
    constraints.push(orderBy("createdAt", "desc"));
    return constraints;
  };

  const fetchOrderDataset = async (complete = false, cursor = null) => {
    const coll = segments[0] === "history" ? "orders" : "ws_orders";
    const base = buildOrderConstraints();
    const collected = [];
    let pageCursor = cursor;
    let finalSnapshot = null;
    do {
      const pageQuery = query(
        collection(database, coll),
        ...base,
        ...(pageCursor ? [startAfter(pageCursor)] : []),
        limit(complete ? 250 : PAGE_SIZE)
      );
      finalSnapshot = await getDocs(pageQuery);
      collected.push(...finalSnapshot.docs.map((orderDoc) => ({ id: orderDoc.id, ...orderDoc.data() })));
      pageCursor = finalSnapshot.docs.at(-1) || null;
    } while (complete && finalSnapshot.size === 250);
    return { orders: collected, cursor: pageCursor, pageSize: finalSnapshot?.size || 0 };
  };

  const applyClientFilters = (source, keyword = searchKeywords) => {
    let result = [...source];
    const paymentStatuses = [];
    if (checkedItems.cod) paymentStatuses.push("COD");
    if (checkedItems.fullPaid) paymentStatuses.push("Paid");
    if (checkedItems.other) paymentStatuses.push("Other", "Partial");
    const paymentMethods = [];
    if (checkedItems.cash) paymentMethods.push("Cash");
    if (checkedItems.kpay) paymentMethods.push("KPay");
    if (checkedItems.bank) paymentMethods.push("Bank");
    if (paymentStatuses.length) result = result.filter((order) => paymentStatuses.includes(order.paymentStatus));
    if (paymentMethods.length) result = result.filter((order) => paymentMethods.includes(order.paymentMode));
    const term = keyword.trim().toLowerCase();
    if (term) {
      result = result.filter((order) => [order.name, order.primaryPhone, order.secondaryPhone, order.invoiceNumber, order.items]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)));
    }
    return result;
  };

  const prepareBulkUpdate = async (fromStatus, toStatus, label) => {
    setIsBulkPreparing(true);
    try {
      const result = await fetchOrderDataset(true);
      const visibleMatches = applyClientFilters(result.orders)
        .filter((order) => legacyStatusFor(fulfilmentFromOrder(order)) === fromStatus);
      setBulkTarget({
        toStatus,
        label,
        orders: visibleMatches,
      });
    } catch (error) {
      setSnack({ open: true, message: "Could not prepare the bulk update.", color: "error", icon: "warning" });
    } finally {
      setIsBulkPreparing(false);
    }
  };

  const filerOrders = async (append = false) => {
    if (append && (!lastVisible || !hasMore || isLoadingMore)) return;
    append ? setIsLoadingMore(true) : setIsLoading(true);
    try {
      const complete = requiresCompleteDataset();
      const result = await fetchOrderDataset(complete, append ? lastVisible : null);
      const sorted = result.orders.sort((a, b) => dayjs(b.createdAt?.toDate?.() || 0).diff(dayjs(a.createdAt?.toDate?.() || 0)));
      setOrders((current) => append ? [...current, ...sorted] : sorted);
      setLastVisible(result.cursor);
      setHasMore(!complete && result.pageSize === PAGE_SIZE);
    } catch (e) {
      console.error("Error getting documents: ", e);
    } finally {
      append ? setIsLoadingMore(false) : setIsLoading(false);
    }
  };

  useEffect(() => {
    setSearchedOrders(applyClientFilters(orders, searchKeywords));
  }, [orders, searchKeywords, checkedItems]);

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchKeywords(value);
  };

  const closeSnack = () => {
    snack.open = false;
    setSnack({ ...snack });
  };

  const renderSnackBar = (
    <MDSnackbar
      color={snack.color}
      icon={snack.icon}
      title="Dragon Innovation"
      content={snack.message}
      dateTime="0 min ago"
      open={snack.open}
      onClose={closeSnack}
      close={closeSnack}
      bgWhite
    />
  );

  return (
    <>
      <Card id="order-history">
        <MDBox
          pt={3}
          px={2}
          display="flex"
          justifyContent="space-between"
          alignItems={{ xs: "center", sm: "center" }}
          flexDirection="row"
        >
          <MDTypography variant="h6" fontWeight="medium">
            Order History
          </MDTypography>

          <FormControl variant="outlined">
            <InputLabel id="brand-select-label">Brand</InputLabel>
            <Select
              labelId="brand-select-label"
              id="brand-select"
              variant="outlined"
              name="brand"
              value={selectedBrand}
              label="Brand"
              onChange={handleBrandChange}
              sx={{ lineHeight: "3rem", width: 100 }}
            >
              <MenuItem value="hanskin">Hanskin</MenuItem>
              <MenuItem value="sugarbear">Sugarbear</MenuItem>
              <MenuItem value="mongdies">Mongdies</MenuItem>
              <MenuItem value="all">All</MenuItem>
            </Select>
          </FormControl>
        </MDBox>
        <MDBox
          p={2}
          display="flex"
          justifyContent="space-between"
          gap={2}
          alignItems="center"
          flexDirection="row"
        >
          <MDInput
            type="text"
            label="Search"
            variant="outlined"
            fullWidth
            value={searchKeywords}
            onChange={handleChange}
          />
        </MDBox>
        <MDBox px={2} pb={2}>
          <FilterOrders filerChange={(e) => setCheckedItems(e)} />
        </MDBox>
        {userData.role === "super_admin" && (
          <MDBox
            px={2}
            pb={2}
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            gap={1.5}
          >
            <MDButton
              variant="gradient"
              color="info"
              disabled={isBulkRunning || isBulkPreparing}
              onClick={() => prepareBulkUpdate(0, FULFILMENT.PACKED, "Packed")}
            >
              Mark matching pending as packed
            </MDButton>
            <MDButton
              variant="gradient"
              color="warning"
              disabled={isBulkRunning || isBulkPreparing}
              onClick={() => prepareBulkUpdate(1, FULFILMENT.SHIPPED, "Shipped")}
            >
              Mark matching packed as shipped
            </MDButton>
          </MDBox>
        )}
        {
          isLoading &&
          <BrandedLoader label="Loading order records…" />
        }
        {
          !isLoading &&
          <MDBox pt={1} pb={2} px={2}>
            <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
              {searchedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  data={order}
                  handleClick={(e) => handleOrderCardClick(e, order)}
                />
              ))}
            </MDBox>
            <MDBox>
              {!hasMore ? null : (
                <MDButton variant="gradient" color="info" fullWidth onClick={loadMore} disabled={isLoadingMore}>
                  {isLoadingMore ? "Loading more…" : "Load More"}
                </MDButton>
              )}
              {searchedOrders.length === 0 ? (
                <EmptyState
                  title="No orders found"
                  description="Try another brand, status, date range, or search term."
                />
              ) : null}
            </MDBox>
          </MDBox>
        }

      </Card>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          <MDTypography
            variant="h5"
            component="span"
            fontWeight="medium"
            textTransform="capitalize"
          >
            Set Invoice No.
          </MDTypography>
        </DialogTitle>
        <DialogContent sx={{ width: { xs: "350px", md: "450px" } }}>
          <MDBox py={2}>
            <MDInput
              type="text"
              name="Invoice Number"
              label="Invoice Number"
              variant="outlined"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              fullWidth
            />
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton variant="gradient" color="light" onClick={handleClose}>
            Cancel
          </MDButton>
          <MDButton
            variant="gradient"
            color="info"
            onClick={handleConfirm}
            disabled={invoiceNumber === ""}
          >
            Confirm
          </MDButton>
        </DialogActions>
      </Dialog>
      <Dialog open={Boolean(cancelTarget)} onClose={() => setCancelTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle>
          <MDTypography variant="h5" component="span" fontWeight="medium">
            Cancel this order?
          </MDTypography>
        </DialogTitle>
        <DialogContent>
          <MDTypography variant="body2" color="text">
            {cancelTarget
              ? `The order for "${cancelTarget.name}" will remain in history but will be excluded from active sales and fulfilment.`
              : ""}
          </MDTypography>
          <MDBox mt={2}>
            <MDInput label="Cancellation reason" value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} fullWidth required multiline minRows={2} />
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton variant="gradient" color="light" onClick={() => setCancelTarget(null)}>
            Cancel
          </MDButton>
          <MDButton variant="gradient" color="error" onClick={confirmCancel} disabled={!cancelReason.trim()}>
            Confirm cancellation
          </MDButton>
        </DialogActions>
      </Dialog>
      <Dialog open={Boolean(exceptionTarget)} onClose={() => setExceptionTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle><MDTypography variant="h5" component="span" fontWeight="medium">Report fulfilment issue</MDTypography></DialogTitle>
        <DialogContent>
          <MDTypography variant="body2" color="text">Explain what prevents the warehouse from packing or shipping this order. Admin staff will see it in the warehouse queue.</MDTypography>
          <MDBox mt={2}><MDInput label="Issue details" value={exceptionReason} onChange={(event) => setExceptionReason(event.target.value)} fullWidth required multiline minRows={3} /></MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton variant="gradient" color="light" onClick={() => setExceptionTarget(null)}>Cancel</MDButton>
          <MDButton variant="gradient" color="warning" onClick={confirmException} disabled={!exceptionReason.trim()}>Report issue</MDButton>
        </DialogActions>
      </Dialog>
      <Dialog open={Boolean(bulkTarget)} onClose={() => setBulkTarget(null)}>
        <DialogTitle>
          <MDTypography variant="h5" component="span" fontWeight="medium">
            Mark {bulkTarget ? bulkTarget.orders.length : 0} order(s) as {bulkTarget?.label}?
          </MDTypography>
        </DialogTitle>
        <DialogContent sx={{ width: { xs: "350px", md: "450px" } }}>
          <MDTypography variant="body2" color="text">
            {bulkTarget
              ? `This updates every ${
                  bulkTarget.toStatus === FULFILMENT.PACKED ? "pending" : "packed"
                } order in the current view. Narrow the brand, status, or date filters first if you only want to change some of them.`
              : ""}
          </MDTypography>
        </DialogContent>
        <DialogActions>
          <MDButton variant="gradient" color="light" onClick={() => setBulkTarget(null)}>
            Cancel
          </MDButton>
          <MDButton variant="gradient" color="info" onClick={runBulkUpdate}>
            Mark as {bulkTarget?.label}
          </MDButton>
        </DialogActions>
      </Dialog>
      {renderSnackBar}
    </>
  );
}

OrderContainer.propTypes = {
  brand: PropTypes.string.isRequired,
  hit: PropTypes.object,
};

export default OrderContainer;
