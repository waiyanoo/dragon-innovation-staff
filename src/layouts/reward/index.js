import DashboardLayout from "../../examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../examples/Navbars/DashboardNavbar";
import MDBox from "../../components/MDBox";
import MDTypography from "../../components/MDTypography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import BrandCommissionCard from "./components/BrandCommissionCard";
import { formattedAmount } from "../../functions/common-functions";
import Footer from "../../examples/Footer";
import { collection, getDocs, query, Timestamp, where } from "firebase/firestore";
import { database } from "../../firebase";
import { useEffect, useState } from "react";

function Reward() {
  const [brandSaleTotal, setBrandSaleTotal] = useState({});

  useEffect(() => {
    fetchOrders();
  },[])

  useEffect(() => {
    if(brandSaleTotal) {
      console.log(brandSaleTotal);
    }
  }, [brandSaleTotal]);

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

    const reportData = {};
    snapshot.forEach((doc) => {
      const { brand, amount = 0 } = doc.data();
      if (!brand) return;
      if (!reportData[brand]) {
        if (!reportData[brand]) {
          reportData[brand] = {
            totalAmount: 0,
            targetPercentage: 0
          };
        }

        // Update totals
        reportData[brand].totalAmount += +amount;
        reportData[brand].orderCount += 1;
      }
      setBrandSaleTotal(reportData);
    });

  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={{xs : 1, md: 3, lg : 3}}>
        <MDBox mb={2}>
          <MDTypography variant="h4">Incentive Dashboard</MDTypography>
        </MDBox>
        <Card mx={3}>
          <MDBox display="flex" justifyContent="space-between" p={3}>
            <MDTypography variant="h5" color="dark" >
              Total Commission:
            </MDTypography>
            <MDTypography variant="h5" color="dark">
              MMK 1,000,000
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
                  count={formattedAmount(100000)}
                  progress={50}
                />
              </MDBox>
            </Grid>

            <Grid size={{xs : 12, md : 6, lg : 4}}>
              <MDBox mb={1.5}>
                <BrandCommissionCard
                  color="primary"
                  icon="face_3"
                  title="SugarBear Commission"
                  count={formattedAmount(100000)}
                  progress={40}
                />
              </MDBox>
            </Grid>

            <Grid size={{xs : 12, md : 6, lg : 4}}>
              <MDBox mb={1.5}>
                <BrandCommissionCard
                  color="success"
                  icon="child_care"
                  title="Mongdies Commission"
                  count={formattedAmount(100000)}
                  progress={70}
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
