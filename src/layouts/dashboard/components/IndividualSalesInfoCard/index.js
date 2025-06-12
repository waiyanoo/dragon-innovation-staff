import MDBox from "../../../../components/MDBox";
import Icon from "@mui/material/Icon";
import Card from "@mui/material/Card";
import MDTypography from "../../../../components/MDTypography";
import Divider from "@mui/material/Divider";
import PropTypes from "prop-types";

function OrderInfoCard({count, icon, color}){
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
            Individual Sales
          </MDTypography>
        </MDBox>
      </MDBox>
      <Divider />
      {
        Object.entries(count).map(([key, value]) => (
          <MDBox pb={2} px={2} key={key}>
            <MDTypography variant="h6">
              { key } (Total Order : {value.hanskin + value.sugarbear + value.mongdies})
            </MDTypography>
            <MDBox mt={2} display="flex" justifyContent="space-between" alignItems="center">
              <MDTypography variant="h6" fontWeight="medium">
                Hanskin&nbsp;&nbsp;&nbsp;
                <MDTypography variant="h5" component="span" color="text">
                  {value.hanskin}
                </MDTypography>
              </MDTypography>
              <MDTypography variant="h6" fontWeight="medium">
                Sugarbear&nbsp;&nbsp;&nbsp;
                <MDTypography variant="h5" component="span" color="text">
                  {value.sugarbear}
                </MDTypography>
              </MDTypography>
              <MDTypography variant="h6" fontWeight="medium">
                Mongdies&nbsp;&nbsp;&nbsp;
                <MDTypography variant="h5" component="span" color="text">
                  {value.mongdies}
                </MDTypography>
              </MDTypography>
            </MDBox>
            <Divider />

          </MDBox>
        ) )
      }

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
}

export default OrderInfoCard;
