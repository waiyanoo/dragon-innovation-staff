import DashboardLayout from "../../examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../examples/Navbars/DashboardNavbar";
import MDBox from "../../components/MDBox";
import MDTypography from "../../components/MDTypography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import BrandCommissionCard from "./components/BrandCommissionCard";
import { formattedAmount, getOrderAmountByType, getOrderByType } from "../../functions/common-functions";
import Footer from "../../examples/Footer";
import { collection, doc, getDoc, getDocs, query, Timestamp, where } from "firebase/firestore";
import { database } from "../../firebase";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

function Reward() {
  const {userData} = useAuth();
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState({});
  const [hanskinTarget, setHanskinTarget] = useState({ commissions : 0, target: 0});
  const [sugarbearTarget, setSugarbearTarget] = useState({ commissions : 0, target: 0});
  const [mongdiesTarget, setMongdiesTarget] = useState({ commissions : 0, target: 0});

  useEffect(() => {
    fetchSettings();
    fetchOrders();
    console.log("userData", userData)
  },[])

  useEffect(() => {
    if(orders.length > 0 && Object.keys(settings).length > 0) {
      calculateCommission();
    }
  }, [orders, settings]);

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

  const calculateCommissionEach = (amount, targets) => {
    if(amount < targets.level1.amount){
      return {
        commissions : 0,
        target : (amount / targets.level1.amount) * 100,
      }
    } else {
      const percentage = amount > targets.level3.amount ? targets.level3.commission
        : amount > targets.level2.amount ? targets.level2.commission
          : targets.level1.commission;

      return {
        commissions : (  percentage / 100) * amount,
        target : 100,
      }
    }
  }

  const formatNumber = (amount) => {
    return Number.isInteger(amount)
      ? +amount
      : +amount.toFixed(2);
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={{xs : 1, md: 3, lg : 3}}>
        <MDBox mb={2}>
          <MDTypography variant="h4">Retail Incentive Dashboard</MDTypography>
        </MDBox>
        <Card mx={3}>
          <MDBox display="flex" justifyContent="space-between" p={3}>
            <MDTypography variant="h5" color="dark" >
              Total Commission:
            </MDTypography>
            <MDTypography variant="h5" color="dark">
              MMK {formatNumber(hanskinTarget.commissions + mongdiesTarget.commissions + sugarbearTarget.commissions)}
            </MDTypography>
          </MDBox>
        </Card>

        <MDBox mt={5}>
          <Grid container spacing={3}>
            <Grid size={{xs : 12, md : 6, lg : 4}}>
              <MDBox mb={1.5}>
                <BrandCommissionCard
                  icon="face"
                  title="Hanskin Commission"
                  count={formattedAmount(hanskinTarget.commissions)}
                  progress={formatNumber(hanskinTarget.target)}
                />
              </MDBox>
            </Grid>

            <Grid size={{xs : 12, md : 6, lg : 4}}>
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

            <Grid size={{xs : 12, md : 6, lg : 4}}>
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
      <Footer />
    </DashboardLayout>
  );
}

export default Reward;
