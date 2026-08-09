import Icon from "@mui/material/Icon";
import PropTypes from "prop-types";

import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

function BrandedErrorState({ title, description, onRetry }) {
  return (
    <MDBox py={5} px={2} display="flex" flexDirection="column" alignItems="center" textAlign="center" role="alert">
      <MDBox
        width={52}
        height={52}
        mb={1.5}
        display="grid"
        borderRadius="xl"
        sx={({ palette: { brand } }) => ({ placeItems: "center", color: brand.primary, background: brand.softRed })}
      >
        <Icon>sync_problem</Icon>
      </MDBox>
      <MDTypography variant="button" fontWeight="bold">{title}</MDTypography>
      <MDTypography variant="caption" color="text" mt={0.5} mb={2}>{description}</MDTypography>
      <MDButton variant="outlined" color="info" size="small" onClick={onRetry}>
        <Icon sx={{ mr: 0.5 }}>refresh</Icon>
        Try again
      </MDButton>
    </MDBox>
  );
}

BrandedErrorState.defaultProps = {
  title: "Something went wrong",
  description: "We could not load this information.",
};

BrandedErrorState.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  onRetry: PropTypes.func.isRequired,
};

export default BrandedErrorState;
