import CircularProgress from "@mui/material/CircularProgress";
import PropTypes from "prop-types";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function BrandedLoader({ label, fullPage }) {
  return (
    <MDBox
      minHeight={fullPage ? "100vh" : 160}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={1.5}
      role="status"
      aria-live="polite"
    >
      <MDBox position="relative" width={48} height={48} display="grid" sx={{ placeItems: "center" }}>
        <CircularProgress color="info" size={48} thickness={3.5} />
        <MDTypography
          fontWeight="bold"
          sx={({ palette: { brand } }) => ({ color: brand.primary, fontSize: 13, position: "absolute" })}
        >
          D
        </MDTypography>
      </MDBox>
      <MDTypography variant="button" color="text" fontWeight="medium">
        {label}
      </MDTypography>
    </MDBox>
  );
}

BrandedLoader.defaultProps = {
  label: "Loading…",
  fullPage: false,
};

BrandedLoader.propTypes = {
  label: PropTypes.string,
  fullPage: PropTypes.bool,
};

export default BrandedLoader;
