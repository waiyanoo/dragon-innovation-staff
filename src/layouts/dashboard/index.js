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
import { useAuth } from "../../context/AuthContext";
import staffData from "./data/staffData";
import StatMatrix from "./components/StatMatrix";
import {
  calculateForChart,
  getDateRanges,
  getOrderAmountByType,
  getOrderByType,
} from "../../functions/common-functions";
import TimeFrameDropDown from "./components/TimeFrameDropDown";

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
  const [adminData, setAdminData] = useState(staffData);

  useEffect(() => {
    setValue(userData.role === 'sales' ? 'wholesale' : 'retail');
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

  const getOrderCountForEachStaff = (hanskinOrder, sugarBearOrder, mongdiesOrder) => {
    Object.keys(adminData).forEach((key) => {
      adminData[key].hanskin = hanskinOrder.filter(hanskin => hanskin.createdBy === key).length;
      adminData[key].mongdies = mongdiesOrder.filter(hanskin => hanskin.createdBy === key).length;
      adminData[key].sugarbear = sugarBearOrder.filter(hanskin => hanskin.createdBy === key).length;
      setAdminData(adminData);
    })
  }

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

    getOrderCountForEachStaff(hanskinOrder, sugarBearOrder, mongdiesOrder);

    setOrderTotal( { hanskin : hanskinTotal, sugarbear : sugarBearTotal, mongdies : mongdiesTotal});
    setOrderTotalCount( { hanskin : hanskinOrder.length, sugarbear : sugarBearOrder.length, mongdies : mongdiesOrder.length});
    if(timeFrame === 'thisMonth')
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
        <MDBox mb={5} display="flex" flexDirection="row" justifyContent="end" >
          <TimeFrameDropDown value={timeFrame} changeHandler={setTimeFrame}/>
        </MDBox>
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
                showComparison={timeFrame === 'thisMonth'}
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
                showComparison={timeFrame === 'thisMonth'}
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
                    dotColor: "primary",
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
                    { key: "total", label: "Total" },
                  ]}
                  rows={Object.entries(adminData).map(([key, val]) => ({
                    label: key,
                    values: [
                      val.hanskin,
                      val.sugarbear,
                      val.mongdies,
                      val.hanskin + val.sugarbear + val.mongdies,
                    ],
                  }))}
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
