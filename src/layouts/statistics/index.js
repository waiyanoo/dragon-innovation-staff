// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import CircularProgress from "@mui/material/CircularProgress";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import HorizontalBarChart from "examples/Charts/BarCharts/HorizontalBarChart";

import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import { collection, getDocs, orderBy, query, Timestamp, where } from "firebase/firestore";

import { database } from "../../firebase";
import { formattedAmount, getDateRanges } from "../../functions/common-functions";
import DateRangeSelector from "./components/DateRangeSelector";
import { groupByField, shareOf, summarise } from "./aggregate";

const TOP_CITY_COUNT = 10;

function StatCard({ label, value, hint }) {
  return (
    <MDBox borderRadius="lg" p={2} sx={{ backgroundColor: "grey.100", height: "100%" }}>
      <MDTypography
        variant="caption"
        color="text"
        fontWeight="medium"
        textTransform="uppercase"
        sx={{ fontSize: "0.65rem", letterSpacing: "0.03em" }}
      >
        {label}
      </MDTypography>
      <MDTypography variant="h5" sx={{ wordBreak: "break-word" }}>
        {value}
      </MDTypography>
      {hint && (
        <MDTypography variant="caption" color="text">
          {hint}
        </MDTypography>
      )}
    </MDBox>
  );
}

StatCard.defaultProps = { hint: null };

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  hint: PropTypes.node,
};

// Resolve the selected range to Firestore Timestamps. Returns null when a
// custom range is still incomplete, which suppresses the query entirely.
const resolveRange = (preset, startDate, endDate) => {
  if (preset === "custom") {
    if (!startDate || !endDate || endDate.isBefore(startDate, "day")) return null;
    return {
      start: Timestamp.fromDate(startDate.startOf("day").toDate()),
      // Query is half-open (< end), so push to the start of the following day
      // to include everything on the end date itself.
      end: Timestamp.fromDate(endDate.add(1, "day").startOf("day").toDate()),
    };
  }
  const ranges = getDateRanges();
  return ranges[preset] || null;
};

const rangeLabel = (preset, startDate, endDate) => {
  if (preset === "custom") {
    if (!startDate || !endDate) return "no range selected";
    return `${startDate.format("DD MMM YYYY")} – ${endDate.format("DD MMM YYYY")}`;
  }
  const range = getDateRanges()[preset];
  if (!range) return "";
  const from = dayjs(range.start.toDate());
  const to = dayjs(range.end.toDate()).subtract(1, "day");
  return `${from.format("DD MMM YYYY")} – ${to.format("DD MMM YYYY")}`;
};

const locationColumns = (heading) => [
  { Header: heading, accessor: "location", align: "left" },
  { Header: "orders", accessor: "orders", align: "right" },
  { Header: "sales", accessor: "sales", align: "right" },
  { Header: "share", accessor: "share", align: "right" },
];

function Statistics() {
  const [orderType, setOrderType] = useState("retail");
  const [preset, setPreset] = useState("thisMonth");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const range = useMemo(
    () => resolveRange(preset, startDate, endDate),
    [preset, startDate, endDate]
  );

  useEffect(() => {
    // An incomplete custom range has nothing to query for.
    if (!range) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const collectionName = orderType === "wholesale" ? "ws_orders" : "orders";

    const load = async () => {
      setIsLoading(true);
      setLoadError(false);
      try {
        const snapshot = await getDocs(
          query(
            collection(database, collectionName),
            where("createdAt", ">=", range.start),
            where("createdAt", "<", range.end),
            orderBy("createdAt", "desc")
          )
        );
        if (cancelled) return;
        setOrders(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
      } catch (e) {
        if (cancelled) return;
        console.error("Error loading statistics: ", e);
        setOrders([]);
        setLoadError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    // Guard against a slower earlier request overwriting a newer one when the
    // tab or range is changed quickly.
    return () => {
      cancelled = true;
    };
  }, [orderType, range]);

  const totals = useMemo(() => summarise(orders), [orders]);
  const cityStats = useMemo(
    () => groupByField(orders, "city", { normaliseLabel: true }),
    [orders]
  );
  const stateStats = useMemo(() => groupByField(orders, "state"), [orders]);

  const toRows = (stats) =>
    stats.map((row) => ({
      location: (
        <MDTypography variant="caption" color="dark" fontWeight="bold">
          {row.label}
        </MDTypography>
      ),
      orders: (
        <MDTypography variant="caption" color="dark" fontWeight="bold">
          {row.orders}
        </MDTypography>
      ),
      sales: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {formattedAmount(row.sales)}
        </MDTypography>
      ),
      share: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {shareOf(row.orders, totals.totalOrders).toFixed(1)}%
        </MDTypography>
      ),
    }));

  const topCityChart = useMemo(() => {
    const top = cityStats.slice(0, TOP_CITY_COUNT);
    return {
      labels: top.map((row) => row.label),
      datasets: [{ label: "Orders", color: "info", data: top.map((row) => row.orders) }],
    };
  }, [cityStats]);

  const renderBody = () => {
    if (isLoading) {
      return (
        <MDBox display="flex" justifyContent="center" py={6}>
          <CircularProgress color="info" />
        </MDBox>
      );
    }

    if (loadError) {
      return (
        <MDBox display="flex" justifyContent="center" py={6}>
          <MDTypography variant="button" color="error">
            Could not load orders. Please try again.
          </MDTypography>
        </MDBox>
      );
    }

    if (!range) {
      return (
        <MDBox display="flex" justifyContent="center" py={6}>
          <MDTypography variant="button" color="text">
            Choose a start and end date to see statistics.
          </MDTypography>
        </MDBox>
      );
    }

    if (orders.length === 0) {
      return (
        <MDBox display="flex" justifyContent="center" py={6}>
          <MDTypography variant="button" color="text">
            No {orderType} orders in this period.
          </MDTypography>
        </MDBox>
      );
    }

    return (
      <>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard label="Orders" value={totals.totalOrders} />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard
              label="Sales"
              value={formattedAmount(totals.totalSales)}
              hint="excludes delivery fees"
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard label="Avg order" value={formattedAmount(totals.averageOrder)} />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard
              label="Cities"
              value={cityStats.length}
              hint={`${stateStats.length} state(s)`}
            />
          </Grid>
        </Grid>

        {cityStats.length > 0 && (
          <MDBox mt={4}>
            <HorizontalBarChart
              icon={{ color: "info", component: "location_city" }}
              title={
                cityStats.length === 1
                  ? "Orders by city"
                  : `Top ${Math.min(TOP_CITY_COUNT, cityStats.length)} cities by orders`
              }
              description={rangeLabel(preset, startDate, endDate)}
              chart={topCityChart}
            />
          </MDBox>
        )}

        <MDBox mt={4}>
          <MDTypography variant="h6" mb={1}>
            Sales by city
          </MDTypography>
          <DataTable
            table={{ columns: locationColumns("city"), rows: toRows(cityStats) }}
            isSorted
            canSearch
            entriesPerPage={{ defaultValue: 10, entries: [10, 25, 50, 100] }}
            showTotalEntries
            noEndBorder
          />
        </MDBox>

        <MDBox mt={4}>
          <MDTypography variant="h6" mb={1}>
            Sales by state
          </MDTypography>
          <DataTable
            table={{ columns: locationColumns("state"), rows: toRows(stateStats) }}
            isSorted
            entriesPerPage={{ defaultValue: 15, entries: [15, 25, 50] }}
            showTotalEntries
            noEndBorder
          />
        </MDBox>
      </>
    );
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
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
              >
                <MDTypography variant="h6" color="white">
                  Statistics
                </MDTypography>
                <MDTypography variant="caption" color="white">
                  {rangeLabel(preset, startDate, endDate)}
                </MDTypography>
              </MDBox>

              <MDBox px={{ xs: 2, md: 3 }} pt={3}>
                <TabContext value={orderType}>
                  <TabList onChange={(event, value) => setOrderType(value)} aria-label="order type">
                    <Tab label="Retail" value="retail" />
                    <Tab label="Wholesale" value="wholesale" />
                  </TabList>
                </TabContext>
              </MDBox>

              <MDBox px={{ xs: 2, md: 3 }} pt={3}>
                <DateRangeSelector
                  preset={preset}
                  onPresetChange={setPreset}
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                />
              </MDBox>

              <MDBox px={{ xs: 2, md: 3 }} pt={3} pb={3}>
                {renderBody()}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Statistics;
