import accessDenied from "../../../assets/images/unauthorized-access.png";
import MDBox from "../../../components/MDBox";
import DashboardLayout from "../../../examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../../examples/Navbars/DashboardNavbar";
import MDTypography from "../../../components/MDTypography";

function Unauthorized() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={8} align="center">
        <MDTypography color="warning" variant="h1" >403</MDTypography>
        <MDTypography color="warning" variant="h4" >Access Denied</MDTypography>
        <MDTypography color="dark" variant="title" fontWeight="light">Sorry, but you don&#39;t have permission to access this page.</MDTypography>
        <MDBox display="flex" justifyContent="center" alignItems="center" mt={5}>
          <img src={accessDenied} alt="loading" width="30%" />
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default Unauthorized;
