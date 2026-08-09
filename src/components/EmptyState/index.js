import Icon from "@mui/material/Icon";
import PropTypes from "prop-types";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function EmptyState({ icon, title, description }) {
  return (
    <MDBox py={5} px={2} display="flex" flexDirection="column" alignItems="center" textAlign="center">
      <MDBox
        width={52}
        height={52}
        mb={1.5}
        display="grid"
        borderRadius="xl"
        sx={({ palette: { brand } }) => ({ placeItems: "center", color: brand.primary, background: brand.softRed })}
      >
        <Icon>{icon}</Icon>
      </MDBox>
      <MDTypography variant="button" fontWeight="bold">
        {title}
      </MDTypography>
      <MDTypography variant="caption" color="text" mt={0.5}>
        {description}
      </MDTypography>
    </MDBox>
  );
}

EmptyState.defaultProps = {
  icon: "inbox",
  description: "Try adjusting your filters or check again later.",
};

EmptyState.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
};

export default EmptyState;
