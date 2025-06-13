import MDBox from "../../../../components/MDBox";
import Icon from "@mui/material/Icon";
import Card from "@mui/material/Card";
import MDTypography from "../../../../components/MDTypography";
import Divider from "@mui/material/Divider";
import PropTypes from "prop-types";

function OrderInfoCard({toPack, count, toShip, icon, color}){
  return (
    <Card>
      <MDBox display="flex" justifyContent="left" pt={1} px={2}>
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
          <Icon fontSize="medium" color="light">
            {icon}
          </Icon>
        </MDBox>
        <MDBox textAlign="right" lineHeight={1.25} ml={3}>
          <MDTypography variant="h5">
            Orders Status
          </MDTypography>
        </MDBox>
      </MDBox>
      <Divider />
      <MDBox pb={2} px={2}>
        <MDTypography variant="h6">
          Number of orders ({ count.sugarbear + count.hanskin + count.mongdies })
        </MDTypography>
        <MDBox mt={2} display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h6" fontWeight="light">
            Hanskin&nbsp;&nbsp;&nbsp;
            <MDTypography variant="h5" component="span" color="dark">
              {count.hanskin}
            </MDTypography>
          </MDTypography>
          <MDTypography variant="h6" fontWeight="light">
            Sugarbear&nbsp;&nbsp;&nbsp;
            <MDTypography variant="h5" component="span" color="dark">
              {count.sugarbear}
            </MDTypography>
          </MDTypography>
          <MDTypography variant="h6" fontWeight="light">
            Mongdies&nbsp;&nbsp;&nbsp;
            <MDTypography variant="h5" component="span" color="dark">
              {count.mongdies}
            </MDTypography>
          </MDTypography>
        </MDBox>
        <Divider />

        <MDTypography variant="h6">
          Orders to pack
        </MDTypography>
        <MDBox mt={2} display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h6" fontWeight="light">
            Hanskin&nbsp;&nbsp;&nbsp;
            <MDTypography variant="h5" component="span" color="dark">
              {toPack.hanskin}
            </MDTypography>
          </MDTypography>
          <MDTypography variant="h6" fontWeight="light">
            Sugarbear&nbsp;&nbsp;&nbsp;
            <MDTypography variant="h5" component="span" color="dark">
              {toPack.sugarbear}
            </MDTypography>
          </MDTypography>
          <MDTypography variant="h6" fontWeight="light">
            Mongdies&nbsp;&nbsp;&nbsp;
            <MDTypography variant="h5" component="span" color="dark">
              {toPack.mongdies}
            </MDTypography>
          </MDTypography>
        </MDBox>
        <Divider />

        <MDTypography variant="h6">
          Orders to ship
        </MDTypography>
        <MDBox mt={2} display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h6" fontWeight="light">
            Hanskin&nbsp;&nbsp;&nbsp;
            <MDTypography variant="h5" component="span" color="dark">
              {toShip.hanskin}
            </MDTypography>
          </MDTypography>
          <MDTypography variant="h6" fontWeight="light">
            Sugarbear&nbsp;&nbsp;&nbsp;
            <MDTypography variant="h5" component="span" color="dark">
              {toShip.sugarbear}
            </MDTypography>
          </MDTypography>
          <MDTypography variant="h6" fontWeight="light">
            Hanskin&nbsp;&nbsp;&nbsp;
            <MDTypography variant="h5" component="span" color="dark">
              {toShip.mongdies}
            </MDTypography>
          </MDTypography>
        </MDBox>
      </MDBox>
    </Card>
  )
}

OrderInfoCard.propTypes = {
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
  icon: PropTypes.string.isRequired,
  count: PropTypes.object.isRequired,
  toPack: PropTypes.object.isRequired,
  toShip: PropTypes.object.isRequired,
}

export default OrderInfoCard;
