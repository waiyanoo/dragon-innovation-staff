import DashboardNavbar from "../../examples/Navbars/DashboardNavbar";
import DashboardLayout from "../../examples/LayoutContainers/DashboardLayout";
import Grid from "@mui/material/Grid";
import MDBox from "../../components/MDBox";
import OrderContainer from "./components/OrderContainer";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function OrderHistory() {
  const { brand } = useParams();

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={8}>
        <Grid container spacing={3} justifyContent="center">
          <Grid size={{xs : 12, md : 12, lg : 10, xl : 8}}>
            <OrderContainer brand={brand}/>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default OrderHistory;
//
//
// <Grid item xs={12} md={6} lg={4} sx={{ ml: "auto" }}>
//   <AppBar position="static">
//     <Tabs orientation={tabsOrientation} value={tabValue} onChange={handleSetTabValue}>
//       <Tab
//         label="App"
//         icon={
//           <Icon fontSize="small" sx={{ mt: -0.25 }}>
//             home
//           </Icon>
//         }
//       />
//       <Tab
//         label="Message"
//         icon={
//           <Icon fontSize="small" sx={{ mt: -0.25 }}>
//             email
//           </Icon>
//         }
//       />
//       <Tab
//         label="Settings"
//         icon={
//           <Icon fontSize="small" sx={{ mt: -0.25 }}>
//             settings
//           </Icon>
//         }
//       />
//     </Tabs>
//   </AppBar>
// </Grid>
