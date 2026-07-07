import Card from "@mui/material/Card";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { where } from "firebase/firestore";
import { useEffect, useState } from "react";

import MDBox from "../../../../components/MDBox";
import MDTypography from "../../../../components/MDTypography";
import MDButton from "../../../../components/MDButton";
import MDSnackbar from "../../../../components/MDSnackbar";
import { database } from "../../../../firebase";
import { calculateCommissionEach, getPreviousMonthID } from "../../../../functions/common-functions";

function ReportsPanel() {
  const [snack, setSnack] = useState({ open: false, message: "", color: "success", icon: "check" });
  const [settings, setSettings] = useState({});
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    fetchSettings();
    getOrderSnapShot();
  }, []);

  const generateSalesReport = async () => {
    const snap = await getOrderSnapShot();
    const reportData = {};
    snap.forEach((docSnap) => {
      const { brand, amount = 0, createdBy } = docSnap.data();
      if (!brand) return;
      if (!reportData[brand]) {
        reportData[brand] = {
          totalAmount: 0,
          orderCount: 0,
          createdByCount: {},
        };
      }

      reportData[brand].totalAmount += +amount;
      reportData[brand].orderCount += 1;
      reportData.createAt = serverTimestamp();

      if (createdBy) {
        if (!reportData[brand].createdByCount[createdBy]) {
          reportData[brand].createdByCount[createdBy] = 0;
        }
        reportData[brand].createdByCount[createdBy] += 1;
      }
    });
    const reportId = getPreviousMonthID();
    setDoc(doc(database, "monthlyReports", reportId), reportData).then(() => {
      setSnack({
        open: true,
        message: "Monthly sale report generate success.",
        color: "success",
        icon: "check",
      });
    });
  };

  const generateCommissionReport = () => {
    if (!snapshot || !settings.targets) {
      setSnack({
        open: true,
        message: "Data is still loading. Please try again.",
        color: "error",
        icon: "warning",
      });
      return;
    }
    const commissionData = {
      hanskin: { totalAmount: 0, commissionData: {} },
      sugarbear: { totalAmount: 0, commissionData: {} },
      mongdies: { totalAmount: 0, commissionData: {} },
    };
    snapshot.forEach((docSnap) => {
      const { brand, amount = 0 } = docSnap.data();
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
    commissionData.hanskin.commissionData = calculateCommissionEach(
      commissionData.hanskin.totalAmount,
      settings.targets.hanskin
    );
    commissionData.sugarbear.commissionData = calculateCommissionEach(
      commissionData.sugarbear.totalAmount,
      settings.targets.sugarbear
    );
    commissionData.mongdies.commissionData = calculateCommissionEach(
      commissionData.mongdies.totalAmount,
      settings.targets.mongdies
    );
    const reportId = getPreviousMonthID();
    setDoc(doc(database, "monthlyCommission", reportId), commissionData).then(() => {
      setSnack({
        open: true,
        message: "Monthly commission report generate success.",
        color: "success",
        icon: "check",
      });
    });
  };

  const fetchSettings = async () => {
    const docRef = doc(database, "settings", "v1");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setSettings(docSnap.data());
    }
  };

  const getOrderSnapShot = async () => {
    const now = new Date();
    const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const month = now.getMonth() === 0 ? 12 : now.getMonth();

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const q = query(
      collection(database, "orders"),
      where("createdAt", ">=", Timestamp.fromDate(start)),
      where("createdAt", "<", Timestamp.fromDate(end)),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    setSnapshot(snap);
    return snap;
  };

  const renderSnackBar = (
    <MDSnackbar
      color={snack.color}
      icon={snack.icon}
      title="Dragon Innovation"
      content={snack.message}
      dateTime="0 min ago"
      open={snack.open}
      onClose={() => setSnack({ ...snack, open: false })}
      close={() => setSnack({ ...snack, open: false })}
      bgWhite
    />
  );

  return (
    <Card>
      <MDBox px={2} pt={2}>
        <MDTypography variant="h5">Reports</MDTypography>
        <MDTypography variant="caption" color="text">
          Generates last month&apos;s sales and commission reports from retail orders.
        </MDTypography>
      </MDBox>
      <MDBox display="flex" justifyContent="start" flexDirection={{ xs: "column", sm: "row" }} gap={2} p={2}>
        <MDButton variant="gradient" color="info" onClick={generateSalesReport}>
          Generate Sales Report
        </MDButton>
        <MDButton variant="gradient" color="info" onClick={generateCommissionReport}>
          Generate Commission Report
        </MDButton>
      </MDBox>
      {renderSnackBar}
    </Card>
  );
}

export default ReportsPanel;
