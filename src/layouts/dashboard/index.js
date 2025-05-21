// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

// Dashboard components
import { collection, getDocs, query, Timestamp, where } from "firebase/firestore";
import { database } from "../../firebase";
import { useEffect, useState } from "react";
import OrderInfoCard from "../../examples/Cards/OrderInfoCard";

function Dashboard() {
  const { sales, tasks } = reportsLineChartData;

  const [orders, setOrders] = useState([]);
  const [orderTotalEach, setOrderTotalEach] = useState({ hanskin : 0, sugarbear : 0, mongdies : 0});
  const [orderToPackedEach, setOrderToPackedEach] = useState({ hanskin : 0, sugarbear : 0, mongdies : 0});
  const [orderToShippedEach, setOrderToShippedEach] = useState({ hanskin : 0, sugarbear : 0, mongdies : 0});

  useEffect(() => {
    getCurrentMonthOrders();
  }, []);

  const getDataByDateRange = async (startDate, endDate) => {
    const start = Timestamp.fromDate(new Date(startDate)); // e.g. "2025-05-01"
    const end = Timestamp.fromDate(new Date(endDate));     // e.g. "2025-05-31"

    const q = query(
      collection(database, "orders"),
      where("createdAt", ">=", start),
      where("createdAt", "<=", end)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  const getCurrentMonthOrders = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    getDataByDateRange(firstDay, lastDay).then(orders => {
      console.log("what is orders", orders);
      setOrders(orders);
      calculateDataForDashboard(orders);
    });
  }

  const calculateDataForDashboard = (orders) => {
    const hanskinOrder = orders.filter(order => order.brand === 'hanskin');
    const sugarBearOrder = orders.filter(order => order.brand === 'sugarbear');
    const mongdiesOrder = orders.filter(order => order.brand === 'mongdies')
    console.log("orders", hanskinOrder, sugarBearOrder, mongdiesOrder);
    //Calculate Total
    const hanskinTotal = (hanskinOrder && hanskinOrder.length > 0) ? hanskinOrder.reduce((sum, item) => sum + (+item.amount || 0), 0) : 0;
    const sugarBearTotal = (sugarBearOrder && sugarBearOrder.length > 0) ? sugarBearOrder.reduce((sum, item) => sum + (+item.amount || 0), 0) : 0;
    const mongdiesTotal = (mongdiesOrder && mongdiesOrder.length > 0) ? mongdiesOrder.reduce((sum, item) => sum + (+item.amount || 0), 0) : 0;

    //Calculate To Packed
    const hanskinToPacked = hanskinOrder.filter(order => order.status === 0).length;
    const sugarbearToPacked = sugarBearOrder.filter(order => order.status === 0).length;
    const mongdiesToPacked = mongdiesOrder.filter(order => order.status === 0).length;

    //Calculate To Shiped
    const hanskinToShipped = hanskinOrder.filter(order => order.status === 1).length;
    const sugarbearToShipped = sugarBearOrder.filter(order => order.status === 1).length;
    const mongdiesToShipped = mongdiesOrder.filter(order => order.status === 1).length;


    setOrderTotalEach( { hanskin : hanskinTotal, sugarbear : sugarBearTotal, mongdies : mongdiesTotal})
    setOrderToPackedEach( { hanskin : hanskinToPacked, sugarbear : sugarbearToPacked, mongdies : mongdiesToPacked})
    setOrderToShippedEach( { hanskin : hanskinToShipped, sugarbear : sugarbearToShipped, mongdies : mongdiesToShipped})

    console.log("what is calculated", { hanskin : hanskinToPacked, sugarbear : sugarbearToPacked, mongdies : mongdiesToPacked}, { hanskin : hanskinToShipped, sugarbear : sugarbearToShipped, mongdies : mongdiesToShipped})
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
                count={formattedAmount(orderTotalEach.hanskin)}
                percentage={{
                  color: "success",
                  amount: "+55%",
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
                count={formattedAmount(orderTotalEach.sugarbear)}
                percentage={{
                  color: "success",
                  amount: "+3%",
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
                count={formattedAmount(orderTotalEach.mongdies)}
                percentage={{
                  color: "success",
                  amount: "+1%",
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
                toShip={orderToShippedEach}
                toPack={orderToPackedEach}/>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox mt={5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsBarChart
                  color="info"
                  title="Hanskin Sales"
                  description="Monthly Performance"
                  date="Just Updated"
                  chart={reportsBarChartData}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="primary"
                  title="SugarBear sales"
                  description="Monthly Performance"
                  date="updated 4 min ago"
                  chart={sales}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="success"
                  title="Mongdies Sales"
                  description="Monthly Performance"
                  date="Just Updated"
                  chart={tasks}
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
