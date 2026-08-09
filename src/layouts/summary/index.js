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
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { database } from "../../firebase";
import MDBadge from "../../components/MDBadge";
import MDButton from "../../components/MDButton";
import { formattedAmount, TimestampDisplay } from "../../functions/common-functions";
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
  const [selectedBrand, setSelectedBrand] = useState("hanskin");
  const [paymentType, setPaymentType] = useState("NoPay");

  useEffect(() => {
    getOrders();
  }, [selectedBrand, paymentType]);

  const handleBrandChange = (e) => setSelectedBrand(e.target.value);
  const handlePaymentChange = (e) => setPaymentType(e.target.value);

  const getOrders = async () => {
    setIsLoading(true);
    try {
      const brandRef = collection(database, "orders");
      const q = query(
        brandRef,
        where("brand", "==", selectedBrand),
        where("paymentMode", "==", paymentType),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(data);
      setDataColumns(generateRows(data));
    } catch (e) {
      console.error("Error getting documents: ", e);
      setOrders([]);
      setDataColumns([]);
    } finally {
      setIsLoading(false);
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
            badgeContent={
              order.status === 2
                ? "shipped"
                : order.status === 1
                  ? "Packed"
                  : order.status === 3
                    ? order.invoiceNumber
                    : "Pending"
            }
            color={
              order.status === 1
                ? "info"
                : order.status === 2
                  ? "warning"
                  : order.status === 3
                    ? "success"
                    : "light"
            }
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

  const totalAmount = orders.reduce((sum, order) => sum + (+order.amount || 0), 0);
  const totalDelivery = orders.reduce((sum, order) => sum + (+order.deliveryFees || 0), 0);

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
                    <StatCard label="Orders" value={orders.length} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard label="Total Amount" value={formattedAmount(totalAmount)} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard label="Delivery Fees" value={formattedAmount(totalDelivery)} />
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
