import DashboardNavbar from "../../examples/Navbars/DashboardNavbar";
import DashboardLayout from "../../examples/LayoutContainers/DashboardLayout";
import Grid from "@mui/material/Grid";
import MDBox from "../../components/MDBox";
import OrderContainer from "./components/OrderContainer";
import { useParams } from "react-router-dom";

function OrderHistory() {
  const { brand } = useParams();

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={8}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={8} lg={6}>
            <OrderContainer brand={brand} />
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default OrderHistory;
