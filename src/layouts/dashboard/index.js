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
import { useEffect, useState } from "react";
import OrderInfoCard from "./components/OrderInfoCard";
import { useAuth } from "../../context/AuthContext";
import staffData from "./data/staffData";
import IndividualSalesInfoCard from "./components/IndividualSalesInfoCard";

function Dashboard() {
  const {userData} = useAuth();
  const [value, setValue] = useState("retail");
  const [orderTotal, setOrderTotal] = useState({ hanskin : 0, sugarbear : 0, mongdies : 0});
  const [previousOrderTotal, setPreviousOrderTotal] = useState({ hanskin : 0, sugarbear : 0, mongdies : 0});
  const [orderTotalCount, setOrderTotalCount] = useState({ hanskin : 0, sugarbear : 0, mongdies : 0});
  const [orderToPack, setOrderToPack] = useState({ hanskin : 0, sugarbear : 0, mongdies : 0});
  const [orderToShip, setOrderToShip] = useState({ hanskin : 0, sugarbear : 0, mongdies : 0});
  const [percentageChange, setPercentageChange] = useState({ hanskin : 0, sugarbear : 0, mongdies : 0});
  const [hanskinChartData, setHanskinChartData] = useState({labels : [], datasets : {label : "", data: []}});
  const [sugarbearChartData, setSugarbearChartData] = useState({labels : [], datasets : {label : "", data: []}});
  const [mongdiesChartData, setMongdiesChartData] = useState({labels : [], datasets : {label : "", data: []}});
  const [adminData, setAdminData] = useState(staffData);


  useEffect(() => {
    setValue(userData.role === 'sales' ? 'wholesale' : 'retail');
  }, []);

  useEffect(() => {
    if(userData){
      getCurrentMonthOrders();
      getSixMonthOrders();
    }
  }, [value]);

  const getDataByDateRange = async (startDate, endDate) => {
    const start = Timestamp.fromDate(new Date(startDate));
    const end = Timestamp.fromDate(new Date(endDate));

    const retailQ = query(
      collection(database, "orders"),
      where("createdAt", ">=", start),
      where("createdAt", "<", end),
      orderBy('createdAt', 'desc')
    );
    const wholesaleQ = query(
      collection(database, "ws_orders"),
      where("createdAt", ">=", start),
      where("createdAt", "<", end),
      orderBy('createdAt', 'desc')
    );

    let data;
    if (value === "wholesale") {
      const snapshot = await getDocs(wholesaleQ);
      data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } else if (value === "retail") {
      const snapshot = await getDocs(retailQ);
      data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    }

    return data;
  }

  const getCurrentMonthOrders = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    getDataByDateRange(firstDay, lastDay).then(orders => {
      calculateDataForDashboard(orders);
    });
  }

  const getOrderByType = (orders) => {
    const hanskinOrder = orders.filter(order => order.brand === 'hanskin');
    const sugarBearOrder = orders.filter(order => order.brand === 'sugarbear');
    const mongdiesOrder = orders.filter(order => order.brand === 'mongdies')

    return {hanskinOrder, sugarBearOrder, mongdiesOrder};
  }

  const getOrderAmountByType = (hanskinOrder, sugarBearOrder, mongdiesOrder) => {
    const hanskinTotal = (hanskinOrder && hanskinOrder.length > 0) ? hanskinOrder.reduce((sum, item) => sum + ((+item.amount || 0)-(+item.deliveryFees || 0)), 0) : 0;
    const sugarBearTotal = (sugarBearOrder && sugarBearOrder.length > 0) ? sugarBearOrder.reduce((sum, item) => sum + ((+item.amount || 0)-(+item.deliveryFees || 0)), 0) : 0;
    const mongdiesTotal = (mongdiesOrder && mongdiesOrder.length > 0) ? mongdiesOrder.reduce((sum, item) => sum + ((+item.amount || 0)-(+item.deliveryFees || 0)), 0) : 0;

    return { hanskinTotal, sugarBearTotal, mongdiesTotal };
  }

  const getOrderCountForEachStaff = (hanskinOrder, sugarBearOrder, mongdiesOrder) => {
    Object.keys(adminData).forEach((key) => {
      adminData[key].hanskin = hanskinOrder.filter(hanskin => hanskin.createdBy === key).length;
      adminData[key].mongdies = mongdiesOrder.filter(hanskin => hanskin.createdBy === key).length;
      adminData[key].sugarbear = sugarBearOrder.filter(hanskin => hanskin.createdBy === key).length;
      setAdminData(adminData);
    })
  }

  const getPreviousMonthOrders = (HTotal, STotal, MTotal) => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 1);
    getDataByDateRange(firstDay, lastDay).then(orders => {
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
    getDataByDateRange(sixMonthsAgo, now).then(orders => {
      calculateDataForShipAndPack(orders);
    })
  }

  const calculateDataForDashboard = (orders) => {
    const {hanskinOrder, sugarBearOrder, mongdiesOrder} = getOrderByType(orders);
    //Calculate Total
    const { hanskinTotal, sugarBearTotal, mongdiesTotal } = getOrderAmountByType(hanskinOrder, sugarBearOrder, mongdiesOrder);

    getOrderCountForEachStaff(hanskinOrder, sugarBearOrder, mongdiesOrder);

    setOrderTotal( { hanskin : hanskinTotal, sugarbear : sugarBearTotal, mongdies : mongdiesTotal});
    setOrderTotalCount( { hanskin : hanskinOrder.length, sugarbear : sugarBearOrder.length, mongdies : mongdiesOrder.length});

    getPreviousMonthOrders(hanskinTotal, sugarBearTotal, mongdiesTotal);
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

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const renderLayout = () => {
    return (
      <MDBox>
        <Grid container spacing={3}>
          <Grid size={{xs : 12, md : 6, lg : 4}}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="face"
                title="Hanskin"
                count={formattedAmount(orderTotal.hanskin)}
                percentage={{
                  color: percentageChange.hanskin < 0 ? "error" : "success" ,
                  amount: percentageChange.hanskin,
                  label: `than last month ${formattedAmount(previousOrderTotal.hanskin)}`,
                }}
              />
            </MDBox>
          </Grid>
          <Grid size={{xs : 12, md : 6, lg : 4}}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="face_3"
                title="SugarBear"
                count={formattedAmount(orderTotal.sugarbear)}
                percentage={{
                  color: percentageChange.sugarbear < 0 ? "error" : "success",
                  amount: percentageChange.sugarbear,
                  label: `than last month ${formattedAmount(previousOrderTotal.sugarbear)}`,
                }}
              />
            </MDBox>
          </Grid>
          <Grid size={{xs : 12, md : 6, lg : 4}}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="child_care"
                title="Mongdies"
                count={formattedAmount(orderTotal.mongdies)}
                percentage={{
                  color: percentageChange.mongdies < 0 ? "error" : "success",
                  amount: percentageChange.mongdies,
                  label: `than last month ${formattedAmount(previousOrderTotal.mongdies)}`,
                }}
              />
            </MDBox>
          </Grid>
        </Grid>
        <MDBox mt={3}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <OrderInfoCard
                color="primary"
                icon="local_shipping"
                count={orderTotalCount}
                toShip={orderToShip}
                toPack={orderToPack}/>
            </Grid>
          </Grid>
        </MDBox>
        {
          value === "retail" &&
          <MDBox mt={4.5}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <IndividualSalesInfoCard
                  color="info"
                  icon="person_outline"
                  count={adminData}
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
                  description="Monthly Performance"
                  chart={hanskinChartData}
                />
              </MDBox>
            </Grid>
            <Grid size={{xs : 12, md : 6, lg : 4}}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="primary"
                  title="SugarBear sales"
                  description="Monthly Performance"
                  chart={sugarbearChartData}
                />
              </MDBox>
            </Grid>
            <Grid size={{xs : 12, md : 6, lg : 4}}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="success"
                  title="Mongdies Sales"
                  description="Monthly Performance"
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
