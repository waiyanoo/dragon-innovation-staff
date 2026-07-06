import DashboardNavbar from "../../examples/Navbars/DashboardNavbar";
import DashboardLayout from "../../examples/LayoutContainers/DashboardLayout";
import MDBox from "../../components/MDBox";
import MDTypography from "../../components/MDTypography";
import Card from "@mui/material/Card";
import MDButton from "../../components/MDButton";
import {
  collection,
  doc, getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import { database } from "../../firebase";
import { useEffect, useState } from "react";
import MDSnackbar from "../../components/MDSnackbar";
import Footer from "../../examples/Footer";
import { calculateCommissionEach, getPreviousMonthID } from "../../functions/common-functions";

function Report_control_panel(){
  const [snack, setSnack] = useState({ open: false, message: '', color: 'success', icon: 'check' });
  const [settings, setSettings] = useState({});
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    fetchSettings();
    getOrderSnapShot();
  },[])

  const generateSalesReport = async () => {

    const snapshot = await getOrderSnapShot()
    const reportData = {};
    snapshot.forEach((doc) => {
      const { brand, amount = 0, createdBy } = doc.data();
      if (!brand) return;
      if (!reportData[brand]) {
        reportData[brand] = {
          totalAmount: 0,
          orderCount: 0,
          createdByCount: {}, // createdBy: count
        };
      }

      reportData[brand].totalAmount += +amount;
      reportData[brand].orderCount += 1;
      reportData.createAt = serverTimestamp();

      // Count per createdBy
      if (createdBy) {
        if (!reportData[brand].createdByCount[createdBy]) {
          reportData[brand].createdByCount[createdBy] = 0;
        }
        reportData[brand].createdByCount[createdBy] += 1;
      }
    });
    const reportId = getPreviousMonthID();
    setDoc(doc(database, "monthlyReports", reportId), reportData).then(_ => {
      setSnack({ open: true, message: 'Monthly sale report generate success.', color: 'success', icon: 'check' })
    })
  }

  const generateCommissionReport = () => {
    if (!snapshot || !settings.targets) {
      setSnack({ open: true, message: 'Data is still loading. Please try again.', color: 'error', icon: 'warning' })
      return;
    }
    const commissionData = {
      hanskin: { totalAmount: 0, commissionData: {} },
      sugarbear: { totalAmount: 0, commissionData: {} },
      mongdies: { totalAmount: 0, commissionData: {} },
    };
    snapshot.forEach((doc) => {
      const { brand, amount = 0, createdBy } = doc.data();
      if (!brand) return;
      if (!commissionData[brand]) {
        commissionData[brand] = {
          totalAmount: 0,
          commissionData: {},
        };
      }
      commissionData[brand].totalAmount += +amount;
      commissionData.createAt = serverTimestamp();
    });
    commissionData.hanskin.commissionData = calculateCommissionEach(commissionData.hanskin.totalAmount, settings.targets.hanskin);
    commissionData.sugarbear.commissionData = calculateCommissionEach(commissionData.sugarbear.totalAmount, settings.targets.sugarbear);
    commissionData.mongdies.commissionData = calculateCommissionEach(commissionData.mongdies.totalAmount, settings.targets.mongdies);
    const reportId = getPreviousMonthID();
    setDoc(doc(database, "monthlyCommission", reportId), commissionData).then(_ => {
      setSnack({ open: true, message: 'Monthly commission report generate success.', color: 'success', icon: 'check' })
    })
  }

  const fetchSettings = async () => {
    const docRef = doc(database, "settings", "v1")
    const docSnap = await getDoc(docRef);


    if(docSnap.exists()) {
      setSettings(docSnap.data());
    }
  }

  const getOrderSnapShot = async () => {
    const now = new Date();

    // Compute the previous month
    const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const month = now.getMonth() === 0 ? 12 : now.getMonth(); // 1-12

    const start = new Date(year, month - 1, 1); // Start of last month
    const end = new Date(year, month, 1); // Start of the current month

    const startTimestamp = Timestamp.fromDate(start);
    const endTimestamp = Timestamp.fromDate(end);

    const q = query(
      collection(database, "orders"),
      where("createdAt", ">=", startTimestamp),
      where("createdAt", "<", endTimestamp),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    setSnapshot(snap);
    return snap;
  }

  const closeSnack = () => {
    setSnack({ ...snack, open: false })
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
        <MDBox px={2} mb={2}>
          <MDTypography variant="h4">Admin Tools</MDTypography>
        </MDBox>
        <Card mx={3}>
          <MDBox display="flex" justifyContent="start" flexDirection={{xs: 'column', sm: 'row'}} gap={2} p={2}>
            <MDButton variant="gradient" color="info" onClick={generateSalesReport}>
              Generate Sales Report
            </MDButton>
            <MDButton variant="gradient" color="info" onClick={generateCommissionReport}>
              Generate Commission Report
            </MDButton>
          </MDBox>
        </Card>
        {renderSnackBar}
      </MDBox>
      <Footer />
    </DashboardLayout>
  )
}

export default Report_control_panel;
