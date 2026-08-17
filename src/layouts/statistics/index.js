// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import BrandedLoader from "components/BrandedLoader";
import BrandedErrorState from "components/BrandedErrorState";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

// Material Dashboard 2 React components
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

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
import { BRANDS, BRAND_COLORS, BRAND_LABELS } from "../../data/common";
import { csvFilename, downloadCsv } from "./exportCsv";
import { changePercent, previousPeriod } from "./periods";
import { formattedAmount, getDateRanges } from "../../functions/common-functions";
import DateRangeSelector from "./components/DateRangeSelector";
import { groupByField, groupRepeatCustomers, shareOf, summarise } from "./aggregate";

const TOP_CITY_COUNT = 10;

function StatCard({ label, value, hint, change }) {
  const hasChange = typeof change === "number" && Number.isFinite(change);
  const rounded = hasChange ? Math.round(change) : 0;

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
      {hasChange && (
        <MDTypography
          variant="caption"
          fontWeight="bold"
          color={rounded < 0 ? "error" : rounded > 0 ? "success" : "text"}
        >
          {rounded > 0 ? "+" : ""}
          {rounded}%{" "}
          <MDTypography variant="caption" color="text" fontWeight="regular" component="span">
            vs previous
          </MDTypography>
        </MDTypography>
      )}
      {hint && (
        <MDTypography variant="caption" color="text" display="block">
          {hint}
        </MDTypography>
      )}
    </MDBox>
  );
}

StatCard.defaultProps = { hint: null, change: null };

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  hint: PropTypes.node,
  change: PropTypes.number,
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

// Wraps the pure period arithmetic (see periods.js) back into Timestamps.
const previousRange = (preset, range) => {
  const period = previousPeriod(preset, range.start.toDate(), range.end.toDate());
  if (!period) return null;
  return {
    start: Timestamp.fromDate(period.start),
    end: Timestamp.fromDate(period.end),
    label: period.label,
  };
};

const locationColumns = (heading) => [
  { Header: heading, accessor: "location", align: "left" },
  { Header: "orders", accessor: "orders", align: "right" },
  { Header: "sales", accessor: "sales", align: "right" },
  { Header: "share", accessor: "share", align: "right" },
];

const repeatCustomerColumns = [
  { Header: "customer", accessor: "customer", align: "left" },
  { Header: "phone", accessor: "phone", align: "left" },
  { Header: "orders", accessor: "orders", align: "right" },
  { Header: "sales", accessor: "sales", align: "right" },
  { Header: "avg order", accessor: "averageOrder", align: "right" },
  { Header: "brands", accessor: "brands", align: "left" },
  { Header: "last order", accessor: "lastOrder", align: "left" },
];

function Statistics() {
  const [orderType, setOrderType] = useState("retail");
  const [preset, setPreset] = useState("thisMonth");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [orders, setOrders] = useState([]);
  const [previousOrders, setPreviousOrders] = useState([]);
  const [brand, setBrand] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const range = useMemo(
    () => resolveRange(preset, startDate, endDate),
    [preset, startDate, endDate]
  );

  const comparison = useMemo(() => (range ? previousRange(preset, range) : null), [preset, range]);

  useEffect(() => {
    // An incomplete custom range has nothing to query for.
    if (!range) {
      setOrders([]);
      setPreviousOrders([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const collectionName = orderType === "wholesale" ? "ws_orders" : "orders";

    const fetchRange = async (target) => {
      const snapshot = await getDocs(
        query(
          collection(database, collectionName),
          where("createdAt", ">=", target.start),
          where("createdAt", "<", target.end),
          orderBy("createdAt", "desc")
        )
      );
      return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    };

    const load = async () => {
      setIsLoading(true);
      setLoadError(false);
      try {
        const [current, previous] = await Promise.all([
          fetchRange(range),
          comparison ? fetchRange(comparison) : Promise.resolve([]),
        ]);
        if (cancelled) return;
        setOrders(current);
        setPreviousOrders(previous);
      } catch (e) {
        if (cancelled) return;
        console.error("Error loading statistics: ", e);
        setOrders([]);
        setPreviousOrders([]);
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
  }, [orderType, range, comparison, refreshKey]);

  // The brand filter narrows the already-loaded period rather than refetching.
  const visibleOrders = useMemo(
    () => (brand === "all" ? orders : orders.filter((order) => order.brand === brand)),
    [orders, brand]
  );

  const totals = useMemo(() => summarise(visibleOrders), [visibleOrders]);

  // Compared like-for-like: the same brand filter applies to both periods.
  const previousTotals = useMemo(
    () =>
      summarise(
        brand === "all"
          ? previousOrders
          : previousOrders.filter((order) => order.brand === brand)
      ),
    [previousOrders, brand]
  );
  const ordersChange = changePercent(totals.totalOrders, previousTotals.totalOrders);
  const salesChange = changePercent(totals.totalSales, previousTotals.totalSales);
  const cityStats = useMemo(
    () => groupByField(visibleOrders, "city", { canonicalise: true }),
    [visibleOrders]
  );
  const stateStats = useMemo(() => groupByField(visibleOrders, "state"), [visibleOrders]);
  const repeatStats = useMemo(() => groupRepeatCustomers(visibleOrders), [visibleOrders]);
  const repeatRate =
    repeatStats.uniqueCustomers > 0
      ? (repeatStats.repeatCustomerCount / repeatStats.uniqueCustomers) * 100
      : 0;

  // Always computed across every brand in the period, so the split stays
  // meaningful; the table itself is hidden once a single brand is selected.
  const brandStats = useMemo(
    () =>
      groupByField(orders, "brand").map((row) => ({
        ...row,
        label: BRAND_LABELS[row.key] || row.label,
      })),
    [orders]
  );
  const periodOrderCount = orders.length;

  // `total` is the denominator for the share column — the brand table is
  // shared against every order in the period, the rest against the filtered set.
  const toRows = (stats, total = totals.totalOrders, { showBrandDot = false } = {}) =>
    stats.map((row) => ({
      location: (
        <MDBox display="flex" alignItems="center" gap={1}>
          {showBrandDot && BRAND_COLORS[row.key] && (
            <MDBox
              bgColor={BRAND_COLORS[row.key]}
              borderRadius="50%"
              width="0.6rem"
              height="0.6rem"
              flexShrink={0}
            />
          )}
          <MDTypography variant="caption" color="dark" fontWeight="bold">
            {row.label}
          </MDTypography>
        </MDBox>
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
          {shareOf(row.orders, total).toFixed(1)}%
        </MDTypography>
      ),
    }));

  // Search and paging controls are noise on a table that fits on one screen.
  const SINGLE_PAGE_LIMIT = 10;
  const tableChrome = (rowCount) =>
    rowCount > SINGLE_PAGE_LIMIT
      ? {
          entriesPerPage: { defaultValue: 10, entries: [10, 25, 50, 100] },
          canSearch: true,
          showTotalEntries: true,
        }
      : { entriesPerPage: false, canSearch: false, showTotalEntries: false };

  const exportSection = (section, stats, total) => {
    const startLabel = range ? dayjs(range.start.toDate()).format("YYYY-MM-DD") : "";
    downloadCsv(
      csvFilename(section, brand === "all" ? "all-brands" : brand, startLabel),
      [section, "orders", "sales", "share %"],
      stats.map((row) => [
        row.label,
        row.orders,
        row.sales,
        shareOf(row.orders, total).toFixed(1),
      ])
    );
  };

  const exportRepeatCustomers = () => {
    const startLabel = range ? dayjs(range.start.toDate()).format("YYYY-MM-DD") : "";
    downloadCsv(
      csvFilename("repeat-customers", brand === "all" ? "all-brands" : brand, startLabel),
      ["customer", "phone", "orders", "sales", "average order", "brands", "last order"],
      repeatStats.customers.map((customer) => [
        customer.names.join(" / ") || "Unknown",
        customer.phone,
        customer.orders,
        customer.sales,
        customer.averageOrder,
        customer.brands.map((key) => BRAND_LABELS[key] || key).join(" / "),
        customer.lastOrderAt ? dayjs(customer.lastOrderAt).format("YYYY-MM-DD") : "",
      ])
    );
  };

  const repeatCustomerRows = repeatStats.customers.map((customer) => ({
    customer: (
      <MDButton
        variant="text"
        color="info"
        size="small"
        onClick={() => setSelectedCustomer(customer)}
        sx={{ px: 0, minWidth: 0, justifyContent: "flex-start", textAlign: "left" }}
      >
        <MDBox display="flex" alignItems="center" gap={0.5}>
          <MDTypography variant="caption" color="info" fontWeight="bold">
            {customer.names.join(" / ") || "Unknown"}
          </MDTypography>
          <Icon fontSize="small">chevron_right</Icon>
        </MDBox>
      </MDButton>
    ),
    phone: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {customer.phone}
      </MDTypography>
    ),
    orders: (
      <MDTypography variant="caption" color="dark" fontWeight="bold">
        {customer.orders}
      </MDTypography>
    ),
    sales: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {formattedAmount(customer.sales)}
      </MDTypography>
    ),
    averageOrder: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {formattedAmount(customer.averageOrder)}
      </MDTypography>
    ),
    brands: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {customer.brands.map((key) => BRAND_LABELS[key] || key).join(", ")}
      </MDTypography>
    ),
    lastOrder: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {customer.lastOrderAt ? dayjs(customer.lastOrderAt).format("DD MMM YYYY") : "—"}
      </MDTypography>
    ),
  }));

  const sectionHeading = (title, onExport) => (
    <MDBox
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      gap={2}
      mb={1}
      flexWrap="wrap"
    >
      <MDTypography variant="h6">{title}</MDTypography>
      <MDButton variant="outlined" color="info" size="small" onClick={onExport}>
        <Icon sx={{ mr: 0.5 }}>download</Icon>
        CSV
      </MDButton>
    </MDBox>
  );

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
        <BrandedLoader label="Calculating statistics…" />
      );
    }

    if (loadError) {
      return (
        <BrandedErrorState
          title="Could not load statistics"
          description="Check your connection and try loading the report again."
          onRetry={() => setRefreshKey((key) => key + 1)}
        />
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

    if (visibleOrders.length === 0) {
      return (
        <MDBox display="flex" justifyContent="center" py={6}>
          <MDTypography variant="button" color="text">
            {orders.length === 0
              ? `No ${orderType} orders in this period.`
              : `No ${BRAND_LABELS[brand] || brand} orders in this period.`}
          </MDTypography>
        </MDBox>
      );
    }

    return (
      <>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard
              label="Orders"
              value={totals.totalOrders}
              change={ordersChange}
              hint={comparison ? `vs ${comparison.label}` : null}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard
              label="Sales"
              value={formattedAmount(totals.totalSales)}
              change={salesChange}
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

        {brand === "all" && brandStats.length > 1 && (
          <MDBox mt={4}>
            {sectionHeading("Sales by brand", () =>
              exportSection("brand", brandStats, periodOrderCount)
            )}
            <DataTable
              table={{
                columns: locationColumns("brand"),
                rows: toRows(brandStats, periodOrderCount, { showBrandDot: true }),
              }}
              isSorted
              entriesPerPage={false}
              showTotalEntries={false}
              noEndBorder
            />
          </MDBox>
        )}

        <MDBox mt={4}>
          {sectionHeading("Repeated customers", exportRepeatCustomers)}
          <MDTypography variant="caption" color="text" display="block" mb={2}>
            Customers with at least two orders in the selected period, matched by either phone
            number or Facebook name. Select a customer to see their purchases.
          </MDTypography>
          <Grid container spacing={2} mb={2}>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard label="Repeat customers" value={repeatStats.repeatCustomerCount} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard label="Repeat rate" value={`${repeatRate.toFixed(1)}%`} hint="of unique customers" />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard label="Repeat orders" value={repeatStats.repeatOrders} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard label="Repeat sales" value={formattedAmount(repeatStats.repeatSales)} />
            </Grid>
          </Grid>
          {repeatCustomerRows.length > 0 ? (
            <DataTable
              table={{ columns: repeatCustomerColumns, rows: repeatCustomerRows }}
              isSorted
              noEndBorder
              {...tableChrome(repeatCustomerRows.length)}
            />
          ) : (
            <MDBox py={3} textAlign="center">
              <MDTypography variant="button" color="text">
                No repeated customers in this period.
              </MDTypography>
            </MDBox>
          )}
        </MDBox>

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
          {sectionHeading("Sales by city", () =>
            exportSection("city", cityStats, totals.totalOrders)
          )}
          <DataTable
            table={{ columns: locationColumns("city"), rows: toRows(cityStats) }}
            isSorted
            noEndBorder
            {...tableChrome(cityStats.length)}
          />
        </MDBox>

        <MDBox mt={4}>
          {sectionHeading("Sales by state", () =>
            exportSection("state", stateStats, totals.totalOrders)
          )}
          <DataTable
            table={{ columns: locationColumns("state"), rows: toRows(stateStats) }}
            isSorted
            noEndBorder
            {...tableChrome(stateStats.length)}
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
                  {brand === "all" ? "All brands" : BRAND_LABELS[brand] || brand} ·{" "}
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

              <MDBox
                px={{ xs: 2, md: 3 }}
                pt={3}
                display="flex"
                flexDirection={{ xs: "column", md: "row" }}
                gap={2}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", md: "flex-start" }}
              >
                <FormControl variant="outlined" sx={{ minWidth: { xs: "100%", md: 200 } }}>
                  <InputLabel id="brand-filter-label">Brand</InputLabel>
                  <Select
                    labelId="brand-filter-label"
                    id="brand-filter"
                    variant="outlined"
                    value={brand}
                    label="Brand"
                    onChange={(event) => setBrand(event.target.value)}
                    sx={{ lineHeight: "3rem" }}
                  >
                    <MenuItem value="all">All brands</MenuItem>
                    {BRANDS.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
      <Dialog
        open={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        fullWidth
        maxWidth="md"
        scroll="paper"
      >
        <DialogTitle>
          <MDTypography variant="h5" fontWeight="medium">
            Purchase history
          </MDTypography>
          <MDTypography variant="button" color="text" display="block">
            {selectedCustomer?.names.join(" / ") || "Unknown customer"}
          </MDTypography>
          <MDTypography variant="caption" color="text" display="block">
            {selectedCustomer?.phone || "No phone recorded"} · {selectedCustomer?.orders || 0}{" "}
            orders · {formattedAmount(selectedCustomer?.sales || 0)} sales
          </MDTypography>
        </DialogTitle>
        <DialogContent dividers sx={{ px: { xs: 2, md: 3 } }}>
          {selectedCustomer?.orderRecords.map((order, index) => {
            const orderDate = order.createdAt?.toDate?.();
            return (
              <MDBox
                key={order.id || `${orderDate?.getTime?.() || "order"}-${index}`}
                py={2}
                sx={{
                  borderBottom: index < selectedCustomer.orderRecords.length - 1
                    ? "1px solid"
                    : "none",
                  borderColor: "grey.300",
                }}
              >
                <MDBox
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  gap={2}
                  mb={1}
                >
                  <MDBox>
                    <MDTypography variant="button" color="dark" fontWeight="bold" display="block">
                      {BRAND_LABELS[order.brand] || order.brand || "Unknown brand"}
                    </MDTypography>
                    <MDTypography variant="caption" color="text">
                      {orderDate ? dayjs(orderDate).format("DD MMM YYYY, h:mm A") : "Date unavailable"}
                    </MDTypography>
                  </MDBox>
                  <MDTypography variant="button" color="dark" fontWeight="bold">
                    {formattedAmount(order.amount || 0)}
                  </MDTypography>
                </MDBox>

                <MDTypography variant="caption" color="text" fontWeight="medium" display="block">
                  Purchased items
                </MDTypography>
                <MDTypography
                  variant="body2"
                  color="dark"
                  sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
                >
                  {(order.items || "Items not recorded").replace?.(/"/g, "") || "Items not recorded"}
                </MDTypography>

                <MDBox mt={1} display="flex" flexWrap="wrap" columnGap={3} rowGap={0.5}>
                  <MDTypography variant="caption" color="text">
                    Delivery fee: {formattedAmount(order.deliveryFees || 0)}
                  </MDTypography>
                  <MDTypography variant="caption" color="text">
                    Invoice: {order.invoiceNumber || "Not assigned"}
                  </MDTypography>
                </MDBox>
              </MDBox>
            );
          })}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <MDButton variant="gradient" color="info" onClick={() => setSelectedCustomer(null)}>
            Close
          </MDButton>
        </DialogActions>
      </Dialog>
      <Footer />
    </DashboardLayout>
  );
}

export default Statistics;
