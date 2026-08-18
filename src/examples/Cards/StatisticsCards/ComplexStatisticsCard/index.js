

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function ComplexStatisticsCard({ color, title, count, percentage, icon, image, imageAlt, showComparison }) {
  return (
    <Card>
      <MDBox display="flex" justifyContent="space-between" pt={1} px={2} pb={showComparison ? 1 : 3}>
        <MDBox
          variant={image ? undefined : "gradient"}
          bgColor={image ? "white" : color}
          color={image ? "dark" : color === "light" ? "dark" : "white"}
          coloredShadow={image ? undefined : color}
          borderRadius="xl"
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="4rem"
          height="4rem"
          mt={-3}
          sx={image ? { border: "1px solid", borderColor: "grey.200", boxShadow: "0 8px 20px rgba(18, 38, 63, 0.12)" } : {}}
        >
          {image ? (
            <MDBox
              component="img"
              src={image}
              alt={imageAlt || title}
              width="82%"
              height="82%"
              sx={{ objectFit: "contain" }}
            />
          ) : (
            <Icon fontSize="medium" color="inherit">
              {icon}
            </Icon>
          )}
        </MDBox>
        <MDBox textAlign="right" lineHeight={1.25}>
          <MDTypography variant="button" fontWeight="medium">
            {title}
          </MDTypography>
          <MDTypography variant="h4">{count}</MDTypography>
        </MDBox>
      </MDBox>

      {
        showComparison &&
        <>
          <Divider />
          <MDBox pb={2} px={2}>
            <MDTypography component="p" variant="button" color="text" display="flex">
              <MDTypography
                component="span"
                variant="button"
                fontWeight="bold"
                color={percentage.color}
              >
                {percentage.amount}%
              </MDTypography>
              &nbsp;{percentage.label}
            </MDTypography>
          </MDBox>
        </>
      }
    </Card>
  );
}

// Setting default values for the props of ComplexStatisticsCard
ComplexStatisticsCard.defaultProps = {
  color: "info",
  percentage: {
    color: "success",
    text: "",
    label: "",
  },
  showComparison: true,
  image: null,
  imageAlt: "",
};

// Typechecking props for the ComplexStatisticsCard
ComplexStatisticsCard.propTypes = {
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
  percentage: PropTypes.shape({
    color: PropTypes.oneOf([
      "primary",
      "secondary",
      "info",
      "success",
      "warning",
      "error",
      "dark",
      "white",
    ]),
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string,
  }),
  icon: PropTypes.node,
  image: PropTypes.string,
  imageAlt: PropTypes.string,
  showComparison: PropTypes.bool,
};

export default ComplexStatisticsCard;
