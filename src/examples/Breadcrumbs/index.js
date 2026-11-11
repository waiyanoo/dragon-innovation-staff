

// react-router-dom components
import { Link } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import { Breadcrumbs as MuiBreadcrumbs } from "@mui/material";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { useTranslation } from "react-i18next";

const titleCase = (value = "") =>
  decodeURIComponent(value)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

function Breadcrumbs({ icon, title, route, light }) {
  const { t } = useTranslation();
  const routes = route.slice(0, -1);
  const translatedRoute = (value) => {
    const key = {
      dashboard: "navigation.dashboard", profile: "navigation.profile", reward: "navigation.reward",
      order: "navigation.order", "warehouse-queue": "navigation.warehouseQueue",
      history: "navigation.retail", "wholesale-history": "navigation.wholesale",
      summary: "navigation.summary", statistics: "navigation.statistics",
      "report-control-panel": "navigation.adminTools", report_control_panel: "navigation.adminTools",
    }[value];
    return key ? t(key) : titleCase(value);
  };

  return (
    <MDBox mr={{ xs: 0, xl: 8 }}>
      <MuiBreadcrumbs
        sx={{
          "& .MuiBreadcrumbs-separator": {
            color: ({ palette: { white, grey } }) => (light ? white.main : grey[600]),
          },
        }}
      >
        <Link to="/">
          <MDTypography
            component="span"
            variant="body2"
            color={light ? "white" : "dark"}
            opacity={light ? 0.8 : 0.5}
            sx={{ lineHeight: 0 }}
          >
            <Icon>{icon}</Icon>
          </MDTypography>
        </Link>
        {routes.map((el) => (
          <Link to={`/${el}`} key={el}>
            <MDTypography
              component="span"
              variant="button"
              fontWeight="regular"
              color={light ? "white" : "dark"}
              opacity={light ? 0.8 : 0.5}
              sx={{ lineHeight: 0 }}
            >
              {translatedRoute(el)}
            </MDTypography>
          </Link>
        ))}
        <MDTypography
          variant="button"
          fontWeight="regular"
          color={light ? "white" : "dark"}
          sx={{ lineHeight: 0 }}
        >
          {translatedRoute(title)}
        </MDTypography>
      </MuiBreadcrumbs>
      <MDTypography
        fontWeight="bold"
        variant="h6"
        color={light ? "white" : "dark"}
        noWrap
      >
        {translatedRoute(title)}
      </MDTypography>
    </MDBox>
  );
}

// Setting default values for the props of Breadcrumbs
Breadcrumbs.defaultProps = {
  light: false,
};

// Typechecking props for the Breadcrumbs
Breadcrumbs.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  route: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
  light: PropTypes.bool,
};

export default Breadcrumbs;
