// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import BrandedLoader from "components/BrandedLoader";
import EmptyState from "components/EmptyState";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Data
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  collection,
  count,
  getAggregateFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  sum,
  where,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { database } from "../../firebase";
import MDBadge from "../../components/MDBadge";
import MDButton from "../../components/MDButton";
import { formattedAmount, TimestampDisplay } from "../../functions/common-functions";
import { fulfilmentFromOrder } from "../../services/orderWorkflow";
import { FormControl, InputLabel, Select } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";

const columns = [
  { Header: "name", accessor: "name", align: "left" },
  { Header: "total amount", accessor: "amount", align: "left" },
  { Header: "invoice number", accessor: "invoiceNumber", align: "center" },
  { Header: "status", accessor: "status", align: "center" },
  { Header: "date", accessor: "date", align: "center" },
  { Header: "action", accessor: "action", align: "center" },
];

function StatCard({ label, value }) {
  return (
    <MDBox borderRadius="lg" p={2} sx={{ backgroundColor: "grey.100" }}>
      <MDTypography
        variant="caption"
        color="text"
        fontWeight="medium"
        textTransform="uppercase"
        sx={{ fontSize: "0.65rem", letterSpacing: "0.03em" }}
      >
        {label}
      </MDTypography>
      <MDTypography variant="h5">{value}</MDTypography>
    </MDBox>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
};

function Tables() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [dataColumns, setDataColumns] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totals, setTotals] = useState({ orders: 0, amount: 0, delivery: 0 });
  const [selectedBrand, setSelectedBrand] = useState("hanskin");
  const [paymentType, setPaymentType] = useState("NoPay");

  useEffect(() => {
    getOrders(false);
    getTotals();
  }, [selectedBrand, paymentType]);

  const handleBrandChange = (e) => setSelectedBrand(e.target.value);
  const handlePaymentChange = (e) => setPaymentType(e.target.value);

  const filters = () => [
    where("brand", "==", selectedBrand),
    where("paymentMode", "==", paymentType),
  ];

  const getTotals = async () => {
    try {
      const [allAggregate, cancelledAggregate] = await Promise.all([
        getAggregateFromServer(query(collection(database, "orders"), ...filters()), { orders: count(), amount: sum("amount"), delivery: sum("deliveryFees") }),
        getAggregateFromServer(query(collection(database, "orders"), ...filters(), where("status", "==", 4)), { orders: count(), amount: sum("amount"), delivery: sum("deliveryFees") }),
      ]);
      const all = allAggregate.data();
      const cancelled = cancelledAggregate.data();
      setTotals({
        orders: (all.orders || 0) - (cancelled.orders || 0),
        amount: (all.amount || 0) - (cancelled.amount || 0),
        delivery: (all.delivery || 0) - (cancelled.delivery || 0),
      });
    } catch (error) {
      console.error("Error loading summary totals: ", error);
    }
  };

  const getOrders = async (append = false) => {
    if (append && (!lastVisible || !hasMore || isLoadingMore)) return;
    append ? setIsLoadingMore(true) : setIsLoading(true);
    try {
      const brandRef = collection(database, "orders");
      const constraints = [...filters(), orderBy("createdAt", "desc")];
      if (append && lastVisible) constraints.push(startAfter(lastVisible));
      constraints.push(limit(50));
      const q = query(brandRef, ...constraints);

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((order) => order.status !== 4 && order.fulfilmentStatus !== "cancelled" && !order.cancelledAt && !order.isArchived);
      setOrders((current) => append ? [...current, ...data] : data);
      setDataColumns((current) => append ? [...current, ...generateRows(data)] : generateRows(data));
      setLastVisible(querySnapshot.docs.at(-1) || null);
      setHasMore(querySnapshot.size === 50);
    } catch (e) {
      console.error("Error getting documents: ", e);
      if (!append) {
        setOrders([]);
        setDataColumns([]);
      }
    } finally {
      append ? setIsLoadingMore(false) : setIsLoading(false);
    }
  };

  const generateRows = (data) =>
    data.map((order) => ({
      name: (
        <MDBox ml={-1} display="flex" flexDirection="column" gap={1}>
          <MDTypography variant="caption" color="dark" fontWeight="bold">
            {order.name}
          </MDTypography>
          <MDTypography variant="caption" color="text" fontWeight="regular">
            ({order.primaryPhone}
            {order.secondaryPhone ? `, ${order.secondaryPhone}` : ""})
          </MDTypography>
        </MDBox>
      ),
      amount: (
        <MDBox ml={-1} display="flex" flexDirection="column" gap={1}>
          <MDTypography variant="caption" color="dark" fontWeight="bold">
            Total: {formattedAmount(order.amount)}
          </MDTypography>
          {order.deliveryFees > 0 && (
            <MDTypography variant="caption" color="dark" fontWeight="regular">
              Delivery Fees: {formattedAmount(order.deliveryFees)}
            </MDTypography>
          )}
        </MDBox>
      ),
      invoiceNumber: (
        <MDTypography variant="caption" color="dark" fontWeight="bold">
          {order.invoiceNumber ? order.invoiceNumber : "NA"}
        </MDTypography>
      ),
      status: (
        <MDBox ml={-1}>
          <MDBadge
            badgeContent={fulfilmentFromOrder(order)}
            color={fulfilmentFromOrder(order) === "packed" ? "info" : fulfilmentFromOrder(order) === "shipped" ? "success" : "light"}
            variant="gradient"
            size="sm"
          />
        </MDBox>
      ),
      date: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {TimestampDisplay(order.createdAt)}
        </MDTypography>
      ),
      action: (
        <MDButton
          variant="text"
          color="info"
          size="small"
          onClick={() => navigate(`/details?id=${order.id}`)}
        >
          View
        </MDButton>
      ),
    }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="start"
                gap={3}
                alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Order List
                </MDTypography>
              </MDBox>
              <MDBox
                px={3}
                pt={3}
                display="flex"
                flexDirection={{ xs: "column", md: "row" }}
                gap={2}
              >
                <FormControl variant="outlined" sx={{ width: { xs: "100%", md: 260 } }}>
                  <InputLabel id="brand-select-label">Brand</InputLabel>
                  <Select
                    labelId="brand-select-label"
                    id="brand-select"
                    variant="outlined"
                    name="brand"
                    value={selectedBrand}
                    label="Brand"
                    onChange={handleBrandChange}
                    sx={{ lineHeight: "3rem" }}
                  >
                    <MenuItem value="hanskin">Hanskin</MenuItem>
                    <MenuItem value="sugarbear">Sugarbear</MenuItem>
                    <MenuItem value="mongdies">Mongdies</MenuItem>
                  </Select>
                </FormControl>
                <FormControl variant="outlined" sx={{ width: { xs: "100%", md: 260 } }}>
                  <InputLabel id="payment-select-label">Payment Type</InputLabel>
                  <Select
                    labelId="payment-select-label"
                    id="payment-select"
                    variant="outlined"
                    name="payment"
                    value={paymentType}
                    label="Payment Type"
                    onChange={handlePaymentChange}
                    sx={{ lineHeight: "3rem" }}
                  >
                    <MenuItem value="NoPay">COD</MenuItem>
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="Kpay">KPay</MenuItem>
                    <MenuItem value="Bank">Bank</MenuItem>
                  </Select>
                </FormControl>
              </MDBox>

              <MDBox px={3} pt={3}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard label="Orders" value={totals.orders} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard label="Total Amount" value={formattedAmount(totals.amount)} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard label="Delivery Fees" value={formattedAmount(totals.delivery)} />
                  </Grid>
                </Grid>
              </MDBox>

              <MDBox pt={1}>
                {isLoading ? (
                  <BrandedLoader label="Preparing order summary…" />
                ) : orders.length === 0 ? (
                  <EmptyState title="No matching orders" description="Adjust the date or brand filters to see more results." />
                ) : (
                  <DataTable
                    table={{ columns, rows: dataColumns }}
                    isSorted={true}
                    entriesPerPage={true}
                    showTotalEntries={true}
                    noEndBorder
                  />
                )}
                {!isLoading && hasMore && orders.length > 0 && (
                  <MDBox px={3} pb={3}>
                    <MDButton
                      variant="outlined"
                      color="info"
                      fullWidth
                      disabled={isLoadingMore}
                      onClick={() => getOrders(true)}
                    >
                      {isLoadingMore ? "Loading more…" : "Load more orders"}
                    </MDButton>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Tables;
