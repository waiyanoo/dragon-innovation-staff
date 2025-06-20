import { useMaterialUIController } from "../../../../context";
import MDBox from "../../../../components/MDBox";
import MDTypography from "../../../../components/MDTypography";
import PropTypes from "prop-types";
import MDBadge from "../../../../components/MDBadge";
import { useState } from "react";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import { useAuth } from "../../../../context/AuthContext";
import { Order_Card_Actions } from "../../../../data/common";
import { formattedAmount, TimestampDisplay } from "../../../../functions/common-functions";
import { ReactComponent as Address } from "assets/images/icons/custom/location.svg";
import { ReactComponent as Items } from "assets/images/icons/custom/inventory.svg";
import { ReactComponent as City } from "assets/images/icons/custom/maps.svg";
import { ReactComponent as Delivery } from "assets/images/icons/custom/delivery-truck.svg";
import { ReactComponent as Money } from "assets/images/icons/custom/cash-on-delivery.svg";
import { ReactComponent as Remark } from "assets/images/icons/custom/feedback.svg";
import { ReactComponent as Phone } from "assets/images/icons/custom/call-center.svg";
import Divider from "@mui/material/Divider";

function OrderCard({ data, handleClick }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const { userData } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuItemClick = (action) => {
    setAnchorEl(null);
    handleClick(action);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <MDBox
      // display="flex"
      // justifyContent="space-between"
      // alignItems="flex-start"
      bgColor={darkMode ? "transparent" : "grey-100"}
      borderRadius="lg"
      pl={3}
      pb={3}
      pr={3}
      mb={3}
      mt={2}
      // onClick={handleClick}
    >
      <MDBox
        variant="gradient"
        bgColor={
          data.brand === "sugarbear" ? "primary" : data.brand === "mongdies" ? "success" : "info"
        }
        color={
          data.brand === "sugarbear" ? "primary" : data.brand === "mongdies" ? "success" : "info"
        }
        coloredShadow={
          data.brand === "sugarbear" ? "primary" : data.brand === "mongdies" ? "success" : "info"
        }
        borderRadius="lg"
        display="flex"
        justifyContent="center"
        alignItems="center"
        width="5rem"
        height="1.5rem"
        mt={-1.5}
      >
        <MDTypography
          variant="caption"
          color="light"
          fontWeight="medium"
          textTransform="capitalize"
        >
          {data.brand}
        </MDTypography>
      </MDBox>
      <MDBox width="100%" display="flex" flexDirection="column">
        <MDBox
          display="flex"
          justifyContent="space-between"
          alignItems={{ xs: "center", sm: "center" }}
          flexDirection={{ xs: "row", sm: "row" }}
          mb={2}
        >
          <MDBox display="flex" alignItems="center" mt={{ xs: 0.5, sm: 0 }}>
            <MDTypography variant="button" fontWeight="medium" textTransform="capitalize">
              {data.name}
            </MDTypography>
            {/*<MDBadge badgeContent={data.brand} color={data.brand === 'sugarbear' ? 'primary' : data.brand === 'mongdies' ? 'success' : 'info'} variant="gradient" size="md" ml={1} />*/}
            <MDBadge
              badgeContent={
                data.status === 2
                  ? "shipped"
                  : data.status === 1
                    ? "Packed"
                    : data.status === 3
                      ? data.invoiceNumber
                      : "Pending"
              }
              color={
                data.status === 1
                  ? "info"
                  : data.status === 2
                    ? "warning"
                    : data.status === 3
                      ? "success"
                      : "light"
              }
              variant="gradient"
              size="md"
            />
          </MDBox>
          <MDBox>
            <IconButton
              id="dropdown-button"
              aria-controls={open ? "dropdown-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={handleMenuClick}
              variant="contained"
            >
              <Icon>more_vert</Icon>
            </IconButton>

            <Menu
              id="dropdown-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              slotProps={{
                list: { "aria-labelledby": "dropdown-button" },
              }}
            >
              {Order_Card_Actions.map((item) => {
                const hasAccess = item.roles.includes(userData.role);
                const isStatusAllowed = item.statuses.includes(data.status);
                const isDisabled =
                  userData.role === "super_admin" && item.allowSuper
                    ? false
                    : hasAccess && !isStatusAllowed;
                if (!hasAccess) return null;

                return (
                  <MenuItem
                    key={item.label}
                    onClick={() => {
                      handleMenuItemClick(item.type);
                    }}
                    disabled={isDisabled}
                  >
                    {item.label}
                  </MenuItem>
                );
              })}
            </Menu>
          </MDBox>
        </MDBox>
        <MDBox
          lineHeight={0}
          display="flex"
          flexDirection="row"
          alignItems="center"
          gap={2}
        >
          <MDBox>
            <Phone style={{ width: 24, height: 24 }} />
          </MDBox>
          <MDTypography variant="caption" color="black" fontWeight="medium">
            {data.primaryPhone} {data.secondaryPhone ? `, ${data.secondaryPhone}` : ""}
          </MDTypography>
        </MDBox>
        <Divider p={-4} m={0}/>
        <MDBox
          lineHeight={0}
          display="flex"
          flexDirection="row"
          alignItems="center"
          gap={2}
        >
          <MDBox>
            <City style={{ width: 24, height: 24 }} />
          </MDBox>
          <MDTypography variant="caption" color="black" fontWeight="medium">
            {data.state}/{data.city}
          </MDTypography>
        </MDBox>
        <Divider p={-4} m={0}/>
        <MDBox
          lineHeight={0}
          display="flex"
          flexDirection="row"
          alignItems="center"
          gap={2}
        >
          <MDBox>
            <Address style={{ width: 24, height: 24 }} />
          </MDBox>
          <MDTypography
            variant="caption"
            color="black"
            fontWeight="medium"
            style={{ whiteSpace: "pre-wrap" }}
          >
            {data.address.replace(/"/g, "")}
          </MDTypography>
        </MDBox>
        <Divider p={-4} m={0}/>
        <MDBox
          lineHeight={0}
          display="flex"
          flexDirection="row"
          alignItems="center"
          gap={2}
        >
          <MDBox>
            <Items style={{ width: 24, height: 24 }} />
          </MDBox>
          <MDTypography
            variant="caption"
            color="black"
            fontWeight="medium"
            style={{ whiteSpace: "pre-wrap" }}
          >
            {data.items.replace(/"/g, "")}
          </MDTypography>
        </MDBox>
        <Divider p={-4} m={0}/>
        <MDBox
          lineHeight={0}
          display="flex"
          flexDirection="row"
          alignItems="center"
          gap={2}
        >
          <MDBox>
            <Money style={{ width: 24, height: 24 }} />
          </MDBox>
          <MDTypography variant="caption" color="black" fontWeight="medium">
            {formattedAmount(data.amount)} - {data.paymentMode}{" "}
            {data.paymentMode !== "Paid" ? "" : ` - ${data.paymentType}`}
          </MDTypography>
        </MDBox>
        <Divider p={-4} m={0}/>
        <MDBox
          lineHeight={0}
          display="flex"
          flexDirection="row"
          alignItems="center"
          gap={2}
        >
          <MDBox>
            <Delivery style={{ width: 24, height: 24 }} />
          </MDBox>
          <MDTypography variant="caption" color="black" fontWeight="medium">
            {formattedAmount(data.deliveryFees)}
          </MDTypography>
        </MDBox>
        {data.remark.trim() !== "" && (
          <MDBox
            mb={1.5}
            lineHeight={0}
            display="flex"
            flexDirection="row"
            alignItems="center"
            gap={2}
          >
            <MDBox>
              <Remark style={{ width: 24, height: 24 }} />
            </MDBox>
            <MDTypography variant="caption" color="error">
              {data.remark}
            </MDTypography>
          </MDBox>
        )}

        <MDBox mt={1.5} lineHeight={0} textAlign="right">
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {TimestampDisplay(data.createdAt)}
          </MDTypography>
        </MDBox>
        <MDBox mt={0} lineHeight={0} textAlign="right">
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {data.createdBy}
          </MDTypography>
        </MDBox>
      </MDBox>
    </MDBox>
  );
}

OrderCard.propTypes = {
  data: PropTypes.object.isRequired,
  handleClick: PropTypes.func.isRequired,
};

export default OrderCard;
