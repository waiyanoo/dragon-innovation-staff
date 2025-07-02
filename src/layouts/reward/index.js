import DashboardLayout from "../../examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../examples/Navbars/DashboardNavbar";
import MDBox from "../../components/MDBox";
import MDTypography from "../../components/MDTypography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import BrandCommissionCard from "./components/BrandCommissionCard";
import {
  calculateCommissionEach,
  formattedAmount,
  getOrderAmountByType,
  getOrderByType, getPreviousMonthID,
} from "../../functions/common-functions";
import Footer from "../../examples/Footer";
import { collection, doc, getDoc, getDocs, query, setDoc, Timestamp, where } from "firebase/firestore";
import { database } from "../../firebase";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import TimeFrameDropDown from "../dashboard/components/TimeFrameDropDown";
import MDSnackbar from "../../components/MDSnackbar";

function Reward() {
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState({});
  const [hanskinTarget, setHanskinTarget] = useState({ commissions : 0, target: 0});
  const [sugarbearTarget, setSugarbearTarget] = useState({ commissions : 0, target: 0});
  const [mongdiesTarget, setMongdiesTarget] = useState({ commissions : 0, target: 0});
  const [timeFrame, setTimeFrame] = useState('thisMonth');
  const [snack, setSnack] = useState({ open: false, message: '', color: 'success', icon: 'check' });

  useEffect(() => {
    fetchSettings();
  },[])

  useEffect(() => {
    if(orders.length > 0 && Object.keys(settings).length > 0) {
      calculateCommission();
    }
  }, [orders, settings]);

  useEffect(() => {
    if(timeFrame === 'thisMonth') {
      fetchOrders();
    } else if(timeFrame === 'previousMonth') {
      fetchCommissionHistory();
    }
  },[timeFrame]);

  const fetchOrders = async () => {
    const now = new Date();

    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const startTimestamp = Timestamp.fromDate(start);
    const endTimestamp = Timestamp.fromDate(end);

    const snapshot = await getDocs( query(
          collection(database,"orders"),
          where("createdAt", ">=", startTimestamp),
          where("createdAt", "<", endTimestamp)
    ))
    let data=  snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setOrders(data);
  }

  const fetchCommissionHistory = async () => {
    const id = getPreviousMonthID();
    const docRef = doc(database, "monthlyCommission", id)
    const docSnap = await getDoc(docRef);


    if(docSnap.exists()) {
      const data = docSnap.data();
      setHanskinTarget(data.hanskin.commissionData);
      setSugarbearTarget(data.sugarbear.commissionData);
      setMongdiesTarget(data.mongdies.commissionData);
    } else {
      setSnack({ open: true, message: 'Previous Month Data Not Found.', color: 'error', icon: 'warning' })
      setTimeFrame('thisMonth');
    }
  }

  const fetchSettings = async () => {
    const docRef = doc(database, "settings", "v1")
    const docSnap = await getDoc(docRef);


    if(docSnap.exists()) {
      setSettings(docSnap.data());
    }
  }

  const calculateCommission = () => {
    const {hanskinOrder, sugarBearOrder, mongdiesOrder} = getOrderByType(orders);
    const { hanskinTotal, sugarBearTotal, mongdiesTotal } = getOrderAmountByType(hanskinOrder, sugarBearOrder, mongdiesOrder);
    const hanskinTarget = settings.targets.hanskin;
    setHanskinTarget(calculateCommissionEach(hanskinTotal, hanskinTarget));


    const sugarbearTarget = settings.targets.sugarbear;
    setSugarbearTarget(calculateCommissionEach(sugarBearTotal, sugarbearTarget));

    const mongdiesTarget = settings.targets.mongdies;
    setMongdiesTarget(calculateCommissionEach(mongdiesTotal, mongdiesTarget));
  }

  const formatNumber = (amount) => {
    return Number.isInteger(amount)
      ? +amount
      : +amount.toFixed(2);
  }

  const closeSnack = () => {
    snack.open = false;
    setSnack({ ...snack })
  }

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
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={{ xs: 1, md: 3, lg: 3 }}>
        <MDBox mb={2} display="flex" flexDirection={{ xs: "column", md: "row" }} justifyContent="space-between" gap={2}>
          <MDTypography variant="h4">Retail Incentive Dashboard</MDTypography>
          <TimeFrameDropDown value={timeFrame} changeHandler={setTimeFrame} isShort={true}/>
        </MDBox>
        <Card mx={3}>
          <MDBox display="flex" justifyContent="space-between" p={3}>
            <MDTypography variant="h5" color="dark">
              Total Commission:
            </MDTypography>
            <MDTypography variant="h5" color="dark">
              MMK{" "}
              {formatNumber(
                hanskinTarget.commissions + mongdiesTarget.commissions + sugarbearTarget.commissions
              )}
            </MDTypography>
          </MDBox>
        </Card>

        <MDBox mt={5}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <MDBox mb={1.5}>
                <BrandCommissionCard
                  icon="face"
                  title="Hanskin Commission"
                  count={formattedAmount(hanskinTarget.commissions)}
                  progress={formatNumber(hanskinTarget.target)}
                />
              </MDBox>
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <MDBox mb={1.5}>
                <BrandCommissionCard
                  color="primary"
                  icon="face_3"
                  title="SugarBear Commission"
                  count={formattedAmount(sugarbearTarget.commissions)}
                  progress={formatNumber(sugarbearTarget.target)}
                />
              </MDBox>
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <MDBox mb={1.5}>
                <BrandCommissionCard
                  color="success"
                  icon="child_care"
                  title="Mongdies Commission"
                  count={formattedAmount(mongdiesTarget.commissions)}
                  progress={formatNumber(mongdiesTarget.target)}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      {renderSnackBar}
      <Footer />
    </DashboardLayout>
  );
}

export default Reward;
