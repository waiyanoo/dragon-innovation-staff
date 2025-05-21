// @mui material components
import Grid from "@mui/material/Grid";

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
import { collection, getDocs, query, Timestamp, where } from "firebase/firestore";
import { database } from "../../firebase";
import { useEffect, useState } from "react";
import OrderInfoCard from "../../examples/Cards/OrderInfoCard";
import { useAuth } from "../../context/AuthContext";

function Dashboard() {
  const {userData} = useAuth();
  const [lastUpdated, setLastUpdated] = useState(null);
  const [orderTotal, setOrderTotal] = useState({ hanskin : 0, sugarbear : 0, mongdies : 0});
  const [orderTotalCount, setOrderTotalCount] = useState({ hanskin : 0, sugarbear : 0, mongdies : 0});
  const [orderToPack, setOrderToPack] = useState({ hanskin : 0, sugarbear : 0, mongdies : 0});
  const [orderToShip, setOrderToShip] = useState({ hanskin : 0, sugarbear : 0, mongdies : 0});
  const [percentageChange, setPercentageChange] = useState({ hanskin : 0, sugarbear : 0, mongdies : 0});

  const [hanskinChartData, setHanskinChartData] = useState({labels : [], datasets : {label : "", data: []}});
  const [sugarbearChartData, setSugarbearChartData] = useState({labels : [], datasets : {label : "", data: []}});
  const [mongdiesChartData, setMongdiesChartData] = useState({labels : [], datasets : {label : "", data: []}});

  useEffect(() => {
    const now = new Date();
    const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    console.log("date", currentStart.toLocaleString(), nextMonthStart.toLocaleString(), previousStart.toLocaleString());
    if(userData){
      getCurrentMonthOrders();
      getSixMonthOrders();
    }
  }, [userData]);

  const getDataByDateRange = async (startDate, endDate) => {
    const start = Timestamp.fromDate(new Date(startDate));
    const end = Timestamp.fromDate(new Date(endDate));
    let constraints = [];

    if(userData.role === "sales") constraints.push("wholesale")
    else if(userData.role === "page_admin") constraints.push("retail")
    else {
      constraints.push("retail");
      constraints.push("wholesale");
    }

    const q = query(
      collection(database, "orders"),
      where("createdAt", ">=", start),
      where("createdAt", "<", end),
      where("orderType", "in", constraints),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  const getCurrentMonthOrders = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    getDataByDateRange(firstDay, lastDay).then(orders => {
      calculateDataForDashboard(orders)
    });
  }

  const getOrderByType = (orders) => {
    const hanskinOrder = orders.filter(order => order.brand === 'hanskin');
    const sugarBearOrder = orders.filter(order => order.brand === 'sugarbear');
    const mongdiesOrder = orders.filter(order => order.brand === 'mongdies')

    return {hanskinOrder, sugarBearOrder, mongdiesOrder};
  }

  const getOrderAmountByType = (hanskinOrder, sugarBearOrder, mongdiesOrder) => {
    const hanskinTotal = (hanskinOrder && hanskinOrder.length > 0) ? hanskinOrder.reduce((sum, item) => sum + (+item.amount || 0), 0) : 0;
    const sugarBearTotal = (sugarBearOrder && sugarBearOrder.length > 0) ? sugarBearOrder.reduce((sum, item) => sum + (+item.amount || 0), 0) : 0;
    const mongdiesTotal = (mongdiesOrder && mongdiesOrder.length > 0) ? mongdiesOrder.reduce((sum, item) => sum + (+item.amount || 0), 0) : 0;

    return { hanskinTotal, sugarBearTotal, mongdiesTotal };
  }

  const getPreviousMonthOrders = (HTotal, STotal, MTotal) => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 1);
    getDataByDateRange(firstDay, lastDay).then(orders => {
      const {hanskinOrder, sugarBearOrder, mongdiesOrder} = getOrderByType(orders);
      const { hanskinTotal, sugarBearTotal, mongdiesTotal } = getOrderAmountByType(hanskinOrder, sugarBearOrder, mongdiesOrder);

      const hanskinChange = hanskinTotal > 0
          ? ((HTotal - hanskinTotal) / hanskinTotal) * 100
          : 0;

      const sugarbearChange = sugarBearTotal > 0
        ? ((STotal - sugarBearTotal) / sugarBearTotal) * 100
        : 0;

      const mongdiesChange = mongdiesTotal > 0
        ? ((MTotal - mongdiesTotal) / mongdiesTotal) * 100
        : 0;

      setPercentageChange( { hanskin : hanskinChange, sugarbear : sugarbearChange, mongdies : mongdiesChange});
    });
  }

  const getSixMonthOrders = () => {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    getDataByDateRange(sixMonthsAgo, now).then(orders => {
      setLastUpdated(new Date());
      calculateDataForShipAndPack(orders);
    })
  }

  const calculateDataForDashboard = (orders) => {
    const {hanskinOrder, sugarBearOrder, mongdiesOrder} = getOrderByType(orders);
    //Calculate Total
    const { hanskinTotal, sugarBearTotal, mongdiesTotal } = getOrderAmountByType(hanskinOrder, sugarBearOrder, mongdiesOrder);

    setOrderTotal( { hanskin : hanskinTotal, sugarbear : sugarBearTotal, mongdies : mongdiesTotal});
    setOrderTotalCount( { hanskin : hanskinOrder.length, sugarbear : sugarBearOrder.length, mongdies : mongdiesOrder.length});

    getPreviousMonthOrders(orders, hanskinTotal, sugarBearTotal, mongdiesTotal);
  }

  const calculateDataForShipAndPack = (orders) => {
    const {hanskinOrder, sugarBearOrder, mongdiesOrder} = getOrderByType(orders);
    //Calculate for Chart
    setHanskinChartData(calculateForChart(hanskinOrder, "Hanskin"));
    setSugarbearChartData(calculateForChart(sugarBearOrder, "Sugarbear"));
    setMongdiesChartData(calculateForChart(mongdiesOrder, "mongdies"));

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

  const calculateForChart = (data, label) => {
    const result = {};
    const now = new Date();
    data.forEach(item => {
      const date = item.createdAt.toDate(); // convert Firestore Timestamp
      const month = date.toLocaleString("default", { month: "short" }); // e.g., "May 2025"

      if (!result[month]) result[month] = 0;
      result[month] += +item.amount || 0;
    });

    const months = [...Array(6)].map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i);
      return d.toLocaleString("default", { month: "short" });
    });

    return {labels : months, datasets : {label, data: months.map(m => (  result[m] || 0))}}
  }


  const formattedAmount = (value) => {
    return  new Intl.NumberFormat("en-MM", {
      style: "currency",
      currency: "MMK",
    }).format(value);
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="face"
                title="Hanskin"
                count={formattedAmount(orderTotal.hanskin)}
                percentage={{
                  color: "success",
                  amount: percentageChange.hanskin,
                  label: "than last month",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="face_3"
                title="SugarBear"
                count={formattedAmount(orderTotal.sugarbear)}
                percentage={{
                  color: "success",
                  amount: percentageChange.sugarbear,
                  label: "than last month",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="child_care"
                title="Mongdies"
                count={formattedAmount(orderTotal.mongdies)}
                percentage={{
                  color: "success",
                  amount: percentageChange.mongdies,
                  label: "than last month",
                }}
              />
            </MDBox>
          </Grid>
        </Grid>
        <MDBox mt={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={112} lg={12}>
              <OrderInfoCard
                color="primary"
                icon="local_shipping"
                count={orderTotalCount}
                toShip={orderToShip}
                toPack={orderToPack}/>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox mt={6.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="info"
                  title="Hanskin sales"
                  description="Monthly Performance"
                  date={`Last updated: `}
                  chart={hanskinChartData}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="primary"
                  title="SugarBear sales"
                  description="Monthly Performance"
                  date={`Last updated: `}
                  chart={sugarbearChartData}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="success"
                  title="Mongdies Sales"
                  description="Monthly Performance"
                  date={`Last updated:`}
                  chart={mongdiesChartData}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        {/*<MDBox>*/}
        {/*  <Grid container spacing={3}>*/}
        {/*    <Grid item xs={12} md={6} lg={8}>*/}
        {/*      <Projects />*/}
        {/*    </Grid>*/}
        {/*    <Grid item xs={12} md={6} lg={4}>*/}
        {/*      <OrdersOverview />*/}
        {/*    </Grid>*/}
        {/*  </Grid>*/}
        {/*</MDBox>*/}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
