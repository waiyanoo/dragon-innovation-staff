import MDBox from "../../../components/MDBox";
import Icon from "@mui/material/Icon";
import Card from "@mui/material/Card";
import MDTypography from "../../../components/MDTypography";
import Divider from "@mui/material/Divider";
import PropTypes from "prop-types";
import {useEffect} from "react";

function OrderInfoCard({toPack, toShip, icon, color}){
  useEffect(() => {
    // console.log("what is in ordercard", toPack, toShip)
  }, []);
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
          <MDTypography variant="h4">
            Orders status
          </MDTypography>
        </MDBox>
      </MDBox>
      <Divider />
      <MDBox pb={2} px={2}>
        <MDTypography variant="h6">
          Orders to pack
        </MDTypography>
        <MDBox mt={2} display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h6" fontWeight="medium">
            Hanskin&nbsp;&nbsp;&nbsp;
            <MDTypography variant="h4" color="text">
              {toPack.hanskin}
            </MDTypography>
          </MDTypography>
          <MDTypography variant="h6" fontWeight="medium">
            Sugarbear&nbsp;&nbsp;&nbsp;
            <MDTypography variant="h4" color="text">
              {toPack.sugarbear}
            </MDTypography>
          </MDTypography>
          <MDTypography variant="h6" fontWeight="medium">
            Mongdies&nbsp;&nbsp;&nbsp;
            <MDTypography variant="h4" color="text">
              {toPack.mongdies}
            </MDTypography>
          </MDTypography>
        </MDBox>
        <Divider />
        <MDTypography variant="h6">
          Orders to ship
        </MDTypography>
        <MDBox mt={2} display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h6" fontWeight="medium">
            Hanskin&nbsp;&nbsp;&nbsp;
            <MDTypography variant="h4" color="text">
              {toShip.hanskin}
            </MDTypography>
          </MDTypography>
          <MDTypography variant="h6" fontWeight="medium">
            Sugarbear&nbsp;&nbsp;&nbsp;
            <MDTypography variant="h4" color="text">
              {toShip.sugarbear}
            </MDTypography>
          </MDTypography>
          <MDTypography variant="h6" fontWeight="medium">
            Hanskin&nbsp;&nbsp;&nbsp;
            <MDTypography variant="h4" color="text">
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
  toPack: PropTypes.object.isRequired,
  toShip: PropTypes.object.isRequired,
}

export default OrderInfoCard;
