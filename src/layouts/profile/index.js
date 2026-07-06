// @mui material components
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";

// prop-types
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Overview page components
import Header from "layouts/profile/components/Header";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../data/common";

function DetailRow({ icon, label, value }) {
  return (
    <MDBox display="flex" alignItems="center" gap={2} py={1.25}>
      <MDBox
        display="flex"
        justifyContent="center"
        alignItems="center"
        width="2.5rem"
        height="2.5rem"
        borderRadius="lg"
        flexShrink={0}
        sx={{ backgroundColor: "grey.100" }}
      >
        <Icon sx={{ color: "grey.700" }}>{icon}</Icon>
      </MDBox>
      <MDBox sx={{ minWidth: 0 }}>
        <MDTypography
          variant="caption"
          color="text"
          fontWeight="medium"
          textTransform="uppercase"
          sx={{ fontSize: "0.65rem", letterSpacing: "0.03em" }}
        >
          {label}
        </MDTypography>
        <MDTypography
          variant="button"
          fontWeight="medium"
          display="block"
          sx={{ wordBreak: "break-word" }}
        >
          {value || "—"}
        </MDTypography>
      </MDBox>
    </MDBox>
  );
}

DetailRow.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
};

function Overview() {
  const { userData } = useAuth();

  const rawDate = userData.createdAt;
  const joinedDate = rawDate
    ? rawDate.toDate
      ? rawDate.toDate()
      : new Date(rawDate)
    : null;
  const joinedLabel =
    joinedDate && !Number.isNaN(joinedDate.getTime())
      ? joinedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : "—";

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <Header>
        <MDBox mt={4}>
          <MDTypography variant="h6" mb={1}>
            Contact details
          </MDTypography>
          <Grid container columnSpacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <DetailRow icon="email" label="Email" value={userData.email} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <DetailRow icon="phone" label="Mobile" value={userData.mobile} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <DetailRow
                icon="badge"
                label="Role"
                value={ROLES[userData.role] || userData.role}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <DetailRow icon="event" label="Member since" value={joinedLabel} />
            </Grid>
          </Grid>
        </MDBox>
      </Header>
      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
