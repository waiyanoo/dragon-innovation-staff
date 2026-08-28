// @mui material components
import Grid from "@mui/material/Grid";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Data
// Dashboard components
import { collection, getDocs, orderBy, query, Timestamp, where } from "firebase/firestore";
import { database } from "../../firebase";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { listUsersByRole } from "../../services/userService";
import StatMatrix from "./components/StatMatrix";
import {
  calculateForChart,
  getDateRanges,
  getOrderAmountByType,
  getOrderByType,
} from "../../functions/common-functions";
import TimeFrameDropDown from "./components/TimeFrameDropDown";
import hanskinLogo from "assets/images/brands/hanskin.png";
import sugarbearLogo from "assets/images/brands/sugarbear.png";
import mongdiesLogo from "assets/images/brands/mongdies.png";

function Dashboard() {
  const {userData} = useAuth();
  const [value, setValue] = useState("retail");
  const [timeFrame, setTimeFrame] = useState('thisMonth');
  const [orderTotal, setOrderTotal] = useState({ hanskin : 0, sugarbear : 0, mongdies : 0});
  const [previousOrderTotal, setPreviousOrderTotal] = useState({ hanskin : 0, sugarbear : 0, mongdies : 0});
  const [orderTotalCount, setOrderTotalCount] = useState({ hanskin : 0, sugarbear : 0, mongdies : 0});
  const [orderToPack, setOrderToPack] = useState({ hanskin : 0, sugarbear : 0, mongdies : 0});
  const [orderToShip, setOrderToShip] = useState({ hanskin : 0, sugarbear : 0, mongdies : 0});
  const [percentageChange, setPercentageChange] = useState({ hanskin : 0, sugarbear : 0, mongdies : 0});
  const [hanskinChartData, setHanskinChartData] = useState({labels : [], datasets : {label : "", data: []}});
  const [sugarbearChartData, setSugarbearChartData] = useState({labels : [], datasets : {label : "", data: []}});
  const [mongdiesChartData, setMongdiesChartData] = useState({labels : [], datasets : {label : "", data: []}});
  const [staffNames, setStaffNames] = useState([]);
  const [currentOrders, setCurrentOrders] = useState([]);

  useEffect(() => {
    setValue(userData.role === 'sales' ? 'wholesale' : 'retail');
  }, []);

  // The Individual Sales table lists the page admins who take retail orders.
  // Sales users only ever see the wholesale tab, so they skip this read.
  useEffect(() => {
    if (userData.role === 'sales') return;
    listUsersByRole('page_admin')
      .then((users) => {
        setStaffNames(
          users
            .map((user) => user.name)
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b))
        );
      })
      .catch((e) => console.error("Error loading staff list: ", e));
  }, []);

  useEffect(() => {
    if(userData){
      getCurrentOrders();
      getSixMonthOrders();
    }
  }, [value, timeFrame]);

  const getDataByDateRange = async (start, end) => {
    if (value === "wholesale") {
      return await fetchOrdersByDateRange('ws_orders', start, end);
    } else {
      return await fetchOrdersByDateRange('orders', start, end);
    }
  }

  const fetchOrdersByDateRange = async (collectionName, start, end) => {
    const q = query(
      collection(database, collectionName),
      where("createdAt", ">=", start),
      where("createdAt", "<", end),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  const getCurrentOrders = () => {
    const ranges = getDateRanges();
    const { start, end } = ranges[timeFrame];
    getDataByDateRange(start, end).then(orders => {
      calculateDataForDashboard(orders);
    });
  }

  // Per-staff counts are derived rather than stored so they can't go stale
  // against the loaded orders, and so the order fetch and the staff fetch
  // can land in either order.
  const individualSalesRows = useMemo(() => {
    const { hanskinOrder, sugarBearOrder, mongdiesOrder } = getOrderByType(currentOrders);
    // Orders record the creator's display name in createdBy.
    const countFor = (orders, name) => orders.filter((order) => order.createdBy === name).length;
    const salesFor = (name) =>
      currentOrders
        .filter((order) => order.createdBy === name)
        .reduce(
          (sum, order) => sum + ((+order.amount || 0) - (+order.deliveryFees || 0)),
          0
        );

    return staffNames.map((name) => {
      const hanskin = countFor(hanskinOrder, name);
      const sugarbear = countFor(sugarBearOrder, name);
      const mongdies = countFor(mongdiesOrder, name);
      return {
        label: name,
        values: [
          hanskin,
          sugarbear,
          mongdies,
          hanskin + sugarbear + mongdies,
          salesFor(name),
        ],
      };
    });
  }, [currentOrders, staffNames]);

  const getPreviousMonthOrders = (HTotal, STotal, MTotal) => {
    const ranges = getDateRanges();
    const { start, end } = ranges['previousMonth'];
    getDataByDateRange(start, end).then(orders => {
      const {hanskinOrder, sugarBearOrder, mongdiesOrder} = getOrderByType(orders);
      const { hanskinTotal, sugarBearTotal, mongdiesTotal } = getOrderAmountByType(hanskinOrder, sugarBearOrder, mongdiesOrder);
      setPreviousOrderTotal( { hanskin : hanskinTotal, sugarbear : sugarBearTotal, mongdies : mongdiesTotal});

      const hanskinChange = hanskinTotal > 0
          ? ((HTotal - hanskinTotal) / hanskinTotal) * 100
          : 0;

      const sugarbearChange = sugarBearTotal > 0
        ? ((STotal - sugarBearTotal) / sugarBearTotal) * 100
        : 0;

      const mongdiesChange = mongdiesTotal > 0
        ? ((MTotal - mongdiesTotal) / mongdiesTotal) * 100
        : 0;
      setPercentageChange( { hanskin : Math.round(hanskinChange), sugarbear : Math.round(sugarbearChange), mongdies : Math.round(mongdiesChange)});
    });
  }

  const getSixMonthOrders = () => {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const start = Timestamp.fromDate(new Date(sixMonthsAgo));
    const end = Timestamp.fromDate(new Date(now));
    getDataByDateRange(start, end).then(orders => {
      calculateDataForShipAndPack(orders);
    })
  }

  const calculateDataForDashboard = (orders) => {
    const {hanskinOrder, sugarBearOrder, mongdiesOrder} = getOrderByType(orders);
    //Calculate Total
    const { hanskinTotal, sugarBearTotal, mongdiesTotal } = getOrderAmountByType(hanskinOrder, sugarBearOrder, mongdiesOrder);

    setCurrentOrders(orders);

    setOrderTotal( { hanskin : hanskinTotal, sugarbear : sugarBearTotal, mongdies : mongdiesTotal});
    setOrderTotalCount( { hanskin : hanskinOrder.length, sugarbear : sugarBearOrder.length, mongdies : mongdiesOrder.length});
    setHanskinChartData(calculateForChart(hanskinOrder, "Hanskin", timeFrame));
    setSugarbearChartData(calculateForChart(sugarBearOrder, "SugarBear", timeFrame));
    setMongdiesChartData(calculateForChart(mongdiesOrder, "Mongdies", timeFrame));
    if(timeFrame === 'thisMonth')
      getPreviousMonthOrders(hanskinTotal, sugarBearTotal, mongdiesTotal);
  }

  const calculateDataForShipAndPack = (orders) => {
    const {hanskinOrder, sugarBearOrder, mongdiesOrder} = getOrderByType(orders);
    //Calculate To Packed
    const hanskinToPacked = hanskinOrder.filter(order => order.status === 0).length;
    const sugarbearToPacked = sugarBearOrder.filter(order => order.status === 0).length;
    const mongdiesToPacked = mongdiesOrder.filter(order => order.status === 0).length;

    //Calculate To Shiped
    const hanskinToShipped = hanskinOrder.filter(order => order.status === 1).length;
    const sugarbearToShipped = sugarBearOrder.filter(order => order.status === 1).length;
    const mongdiesToShipped = mongdiesOrder.filter(order => order.status === 1).length;

    setOrderToPack( { hanskin : hanskinToPacked, sugarbear : sugarbearToPacked, mongdies : mongdiesToPacked})
    setOrderToShip( { hanskin : hanskinToShipped, sugarbear : sugarbearToShipped, mongdies : mongdiesToShipped})
  }

  const formattedAmount = (value) => {
    return  new Intl.NumberFormat("en-MM", {
      style: "currency",
      currency: "MMK",
    }).format(value);
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const chartDescription = {
    today: "Sales throughout today",
    thisMonth: "Daily sales this month",
    previousMonth: "Daily sales last month",
    previousQuarter: "Monthly sales last quarter",
    thisYear: "Monthly sales this year",
    previousYear: "Monthly sales last year",
  }[timeFrame];

  const renderLayout = () => {
    return (
      <MDBox>
        <MDBox mb={5} display="flex" flexDirection="row" justifyContent="end" >
          <TimeFrameDropDown value={timeFrame} changeHandler={setTimeFrame}/>
        </MDBox>
        <Grid container spacing={3}>
          <Grid size={{xs : 12, md : 6, lg : 4}}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                image={hanskinLogo}
                imageAlt="Hanskin"
                title="Hanskin"
                count={formattedAmount(orderTotal.hanskin)}
                percentage={{
                  color: percentageChange.hanskin < 0 ? "error" : "success" ,
                  amount: percentageChange.hanskin,
                  label: `than last month ${formattedAmount(previousOrderTotal.hanskin)}`,
                }}
                showComparison={timeFrame === 'thisMonth'}
              />
            </MDBox>
          </Grid>
          <Grid size={{xs : 12, md : 6, lg : 4}}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="warning"
                image={sugarbearLogo}
                imageAlt="SugarBear"
                title="SugarBear"
                count={formattedAmount(orderTotal.sugarbear)}
                percentage={{
                  color: percentageChange.sugarbear < 0 ? "error" : "success",
                  amount: percentageChange.sugarbear,
                  label: `than last month ${formattedAmount(previousOrderTotal.sugarbear)}`,
                }}
                showComparison={timeFrame === 'thisMonth'}
              />
            </MDBox>
          </Grid>
          <Grid size={{xs : 12, md : 6, lg : 4}}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                image={mongdiesLogo}
                imageAlt="Mongdies"
                title="Mongdies"
                count={formattedAmount(orderTotal.mongdies)}
                percentage={{
                  color: percentageChange.mongdies < 0 ? "error" : "success",
                  amount: percentageChange.mongdies,
                  label: `than last month ${formattedAmount(previousOrderTotal.mongdies)}`,
                }}
                showComparison={timeFrame === 'thisMonth'}
              />
            </MDBox>
          </Grid>
        </Grid>
        <MDBox mt={3}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <StatMatrix
                color="primary"
                icon="local_shipping"
                title="Orders Status"
                columns={[
                  { key: "orders", label: "Orders" },
                  { key: "pack", label: "To pack" },
                  { key: "ship", label: "To ship" },
                ]}
                rows={[
                  {
                    label: "Hanskin",
                    dotColor: "info",
                    values: [orderTotalCount.hanskin, orderToPack.hanskin, orderToShip.hanskin],
                  },
                  {
                    label: "SugarBear",
                    dotColor: "warning",
                    values: [
                      orderTotalCount.sugarbear,
                      orderToPack.sugarbear,
                      orderToShip.sugarbear,
                    ],
                  },
                  {
                    label: "Mongdies",
                    dotColor: "success",
                    values: [orderTotalCount.mongdies, orderToPack.mongdies, orderToShip.mongdies],
                  },
                ]}
                totalRow={{
                  label: "Total",
                  values: [
                    orderTotalCount.hanskin + orderTotalCount.sugarbear + orderTotalCount.mongdies,
                    orderToPack.hanskin + orderToPack.sugarbear + orderToPack.mongdies,
                    orderToShip.hanskin + orderToShip.sugarbear + orderToShip.mongdies,
                  ],
                }}
              />
            </Grid>
          </Grid>
        </MDBox>
        {
          value === "retail" &&
          <MDBox mt={4.5}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <StatMatrix
                  color="info"
                  icon="person_outline"
                  title="Individual Sales"
                  columns={[
                    { key: "hanskin", label: "Hanskin" },
                    { key: "sugarbear", label: "SugarBear" },
                    { key: "mongdies", label: "Mongdies" },
                    { key: "total", label: "Orders" },
                    {
                      key: "sales",
                      label: "Sales amount",
                      minWidth: "7.5rem",
                      format: formattedAmount,
                    },
                  ]}
                  rows={individualSalesRows}
                />
              </Grid>
            </Grid>
          </MDBox>
        }
        <MDBox mt={6.5}>
          <Grid container spacing={3}>
            <Grid size={{xs : 12, md : 6, lg : 4}}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="info"
                  title="Hanskin sales"
                  description={chartDescription}
                  chart={hanskinChartData}
                />
              </MDBox>
            </Grid>
            <Grid size={{xs : 12, md : 6, lg : 4}}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="warning"
                  title="SugarBear sales"
                  description={chartDescription}
                  chart={sugarbearChartData}
                />
              </MDBox>
            </Grid>
            <Grid size={{xs : 12, md : 6, lg : 4}}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="success"
                  title="Mongdies Sales"
                  description={chartDescription}
                  chart={mongdiesChartData}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
    )
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <TabContext value={value}>
        <MDBox p={{xs : 1, md: 3, lg : 3}}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="Retail" value="retail" disabled={userData.role=== 'sales'}/>
            <Tab label="Wholesale" value="wholesale" disabled={userData.role=== 'page_admin'}/>
          </TabList>
        </MDBox>
        <TabPanel value="retail" sx={{px: { xs: 0, sm: 1 }}}>
          {renderLayout()}
        </TabPanel>
        <TabPanel value="wholesale" sx={{px: { xs: 0, sm: 1 }}}>
          {renderLayout()}
        </TabPanel>
      </TabContext>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
