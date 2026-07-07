import DashboardNavbar from "../../examples/Navbars/DashboardNavbar";
import DashboardLayout from "../../examples/LayoutContainers/DashboardLayout";
import MDBox from "../../components/MDBox";
import MDTypography from "../../components/MDTypography";
import Footer from "../../examples/Footer";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { useState } from "react";

import ReportsPanel from "./components/ReportsPanel";
import UserManagement from "./components/UserManagement";
import CommissionSettings from "./components/CommissionSettings";

function Report_control_panel() {
  const [tab, setTab] = useState("reports");

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={{ xs: 1, md: 3, lg: 3 }}>
        <MDBox px={2} mb={2}>
          <MDTypography variant="h4">Admin Tools</MDTypography>
        </MDBox>
        <TabContext value={tab}>
          <MDBox px={2}>
            <TabList onChange={(e, value) => setTab(value)} aria-label="Admin tools sections">
              <Tab label="Reports" value="reports" />
              <Tab label="Users" value="users" />
              <Tab label="Commission" value="commission" />
            </TabList>
          </MDBox>
          <TabPanel value="reports" sx={{ px: { xs: 0, sm: 1 } }}>
            {tab === "reports" && <ReportsPanel />}
          </TabPanel>
          <TabPanel value="users" sx={{ px: { xs: 0, sm: 1 } }}>
            {tab === "users" && <UserManagement />}
          </TabPanel>
          <TabPanel value="commission" sx={{ px: { xs: 0, sm: 1 } }}>
            {tab === "commission" && <CommissionSettings />}
          </TabPanel>
        </TabContext>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Report_control_panel;
