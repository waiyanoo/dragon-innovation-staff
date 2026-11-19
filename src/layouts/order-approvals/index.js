import { Paper } from "@mui/material";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../../examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../examples/Navbars/DashboardNavbar";
import Footer from "../../examples/Footer";
import MDBox from "../../components/MDBox";
import MDTypography from "../../components/MDTypography";
import OrderChangeRequests from "../../components/OrderChangeRequests";

export default function OrderApprovals() {
  const { t } = useTranslation();
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3} px={{ xs: 0, md: 2 }}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="bold">
            {t("navigation.orderApprovals")}
          </MDTypography>
          <MDTypography variant="body2" color="text" mt={1}>
            Review retail and wholesale edit or void requests before changes are applied.
          </MDTypography>
        </MDBox>
        <Paper sx={{ p: { xs: 1.5, md: 3 }, borderRadius: 3 }}>
          <OrderChangeRequests review />
        </Paper>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
