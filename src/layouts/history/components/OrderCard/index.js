import { useMaterialUIController } from "../../../../context";
import MDBox from "../../../../components/MDBox";
import MDTypography from "../../../../components/MDTypography";
import PropTypes from "prop-types";
import MDBadge from "../../../../components/MDBadge";

function OrderCard({ data, invoiceNumber, noGutter }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const formattedAmount = new Intl.NumberFormat("en-MM", {
    style: "currency",
    currency: "MMK",
  }).format(data.amount);
  return (
    <MDBox
      component="li"
      display="flex"
      justifyContent="space-between"
      alignItems="flex-start"
      bgColor={darkMode ? "transparent" : "grey-100"}
      borderRadius="lg"
      p={3}
      mb={noGutter ? 0 : 1}
      mt={2}
    >
      <MDBox width="100%" display="flex" flexDirection="column">
        <MDBox
          display="flex"
          justifyContent="space-between"
          alignItems={{ xs: "center", sm: "center" }}
          flexDirection={{ xs: "row", sm: "row" }}
          mb={2}
        >
          <MDTypography variant="button" fontWeight="medium" textTransform="capitalize">
            {data.name}
          </MDTypography>

          <MDBox display="flex" alignItems="center" mt={{ xs: 0, sm: 0 }} ml={{ xs: -1.5, sm: 0 }}>
            <MDBadge
              badgeContent={invoiceNumber === "" ? "Pending" : invoiceNumber}
              color={invoiceNumber === "" ? "warning" : "success"}
              variant="gradient"
              size="md"
            />
            {/*<MDButton variant="text" color={darkMode ? "white" : "dark"}>*/}
            {/*  <Icon>edit</Icon>&nbsp;edit*/}
            {/*</MDButton>*/}
          </MDBox>
        </MDBox>
        <MDBox mb={1} lineHeight={0}>
          <MDTypography variant="caption" fontWeight="medium">
            Phone:&nbsp;&nbsp;&nbsp;
            <MDTypography variant="caption" color="text">
              {data.primaryPhone} {data.secondaryPhone ? `, ${data.secondaryPhone}` : ""}
            </MDTypography>
          </MDTypography>
        </MDBox>
        <MDBox mb={1} lineHeight={0}>
          <MDTypography variant="caption" fontWeight="medium">
            Address:&nbsp;&nbsp;&nbsp;
            <MDTypography variant="caption" color="text">
              {data.address}
            </MDTypography>
          </MDTypography>
        </MDBox>
        <MDBox mb={1} lineHeight={0}>
          <MDTypography variant="caption" fontWeight="medium">
            Items:&nbsp;&nbsp;&nbsp;
            <MDTypography variant="caption" color="text">
              {data.items}
            </MDTypography>
          </MDTypography>
        </MDBox>
        <MDBox mb={1} lineHeight={0}>
          <MDTypography variant="caption" fontWeight="medium">
            Amount:&nbsp;&nbsp;&nbsp;
            <MDTypography variant="caption" color="text" fontWeight="medium">
              {formattedAmount} - {data.paymentMode}{" "}
              {data.paymentMode !== "Paid" ? "" : ` - ${data.paymentType}`}
            </MDTypography>
          </MDTypography>
        </MDBox>
      </MDBox>
    </MDBox>
  );
}

OrderCard.defaultProps = {
  noGutter: false,
};

OrderCard.propTypes = {
  data: PropTypes.object.isRequired,
  invoiceNumber: PropTypes.string,
  noGutter: PropTypes.bool,
};

export default OrderCard;
