import Card from "@mui/material/Card";
import MDBox from "../../../../components/MDBox";
import Icon from "@mui/material/Icon";
import MDTypography from "../../../../components/MDTypography";
import PropTypes from "prop-types";
import MDProgress from "../../../../components/MDProgress";

function BrandCommissionCard({ color, title, count, icon, progress }) {
  return (
    <Card>
      <MDBox display="flex" justifyContent="space-between" pt={1} px={2}>
        <MDBox
          variant="gradient"
          bgColor={color}
          color={color === "light" ? "dark" : "white"}
          coloredShadow={color}
          borderRadius="xl"
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="4rem"
          height="4rem"
          mt={-3}
        >
          <Icon fontSize="medium" color="inherit">
            {icon}
          </Icon>
        </MDBox>
        <MDBox textAlign="right" lineHeight={1.25} pb={3}>
          <MDTypography variant="button" fontWeight="medium">
            {title}
          </MDTypography>
          <MDTypography variant="h4">{count}</MDTypography>
        </MDBox>
      </MDBox>
      <MDBox p={3}>
        <MDProgress value={progress} variant="gradient" label color={color} />
      </MDBox>
    </Card>
  );
}

// Setting default values for the props of ComplexStatisticsCard
BrandCommissionCard.defaultProps = {
  color: "info",
  percentage: {
    color: "success",
    text: "",
    label: "",
  },
};

// Typechecking props for the ComplexStatisticsCard
BrandCommissionCard.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
  ]),
  title: PropTypes.string.isRequired,
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  progress: PropTypes.number.isRequired,
  icon: PropTypes.node.isRequired,
};

export default BrandCommissionCard;