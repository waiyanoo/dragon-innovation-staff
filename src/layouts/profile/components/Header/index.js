// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";

// Images
import backgroundImage from "assets/images/bg-profile.jpeg";
import { useAuth } from "../../../../context/AuthContext";
import { ROLES } from "../../../../data/common";

function getInitials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function Header({ children }) {
  const { userData } = useAuth();
  const roleLabel = ROLES[userData.role] || userData.role;

  return (
    <MDBox position="relative" mb={5}>
      <MDBox
        display="flex"
        alignItems="center"
        position="relative"
        minHeight="12rem"
        borderRadius="xl"
        sx={{
          backgroundImage: ({ functions: { rgba, linearGradient }, palette: { gradients } }) =>
            `${linearGradient(
              rgba(gradients.info.main, 0.6),
              rgba(gradients.info.state, 0.6)
            )}, url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "50%",
          overflow: "hidden",
        }}
      />
      <Card
        sx={{
          position: "relative",
          mt: -8,
          mx: 3,
          py: 2,
          px: 2,
        }}
      >
        <MDBox
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          alignItems="center"
          textAlign={{ xs: "center", sm: "left" }}
          gap={2}
        >
          <MDBox
            variant="gradient"
            bgColor="info"
            coloredShadow="info"
            borderRadius="50%"
            display="flex"
            justifyContent="center"
            alignItems="center"
            width="5rem"
            height="5rem"
            flexShrink={0}
          >
            <MDTypography variant="h4" color="white" fontWeight="medium">
              {getInitials(userData.name)}
            </MDTypography>
          </MDBox>
          <MDBox display="flex" flexDirection="column" alignItems={{ xs: "center", sm: "flex-start" }}>
            <MDTypography variant="h5" fontWeight="medium">
              {userData.name}
            </MDTypography>
            {userData.position && (
              <MDTypography variant="button" color="text" fontWeight="regular" mb={0.5}>
                {userData.position}
              </MDTypography>
            )}
            <MDBadge badgeContent={roleLabel} color="info" variant="gradient" size="sm" container />
          </MDBox>
        </MDBox>
        {children}
      </Card>
    </MDBox>
  );
}

// Setting default props for the Header
Header.defaultProps = {
  children: "",
};

// Typechecking props for the Header
Header.propTypes = {
  children: PropTypes.node,
};

export default Header;
