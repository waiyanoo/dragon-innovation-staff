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
import Grid from "@mui/material/Grid";
import Collapse from "@mui/material/Collapse";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Divider from "@mui/material/Divider";
import { useAuth } from "../../../../context/AuthContext";
import { Order_Card_Actions, Order_Card_Action_Groups } from "../../../../data/common";
import { formattedAmount, TimestampDisplay } from "../../../../functions/common-functions";

function RowIcon({ name, color }) {
  return (
    <Icon fontSize="small" sx={{ color, flexShrink: 0 }}>
      {name}
    </Icon>
  );
}

RowIcon.propTypes = {
  name: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
};

function InfoRow({ icon, multiline, children }) {
  return (
    <MDBox display="flex" alignItems={multiline ? "flex-start" : "center"} gap={1.5} py={0.5}>
      <MDBox display="flex" mt={multiline ? 0.25 : 0}>
        {icon}
      </MDBox>
      <MDTypography variant="body2" color="text" style={{ whiteSpace: "pre-wrap" }}>
        {children}
      </MDTypography>
    </MDBox>
  );
}

InfoRow.propTypes = {
  icon: PropTypes.node.isRequired,
  multiline: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

InfoRow.defaultProps = {
  multiline: false,
};

function OrderCard({ data, handleClick }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const { userData } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const [itemsToggled, setItemsToggled] = useState(null);
  const itemsExpanded = itemsToggled === null ? isMdUp : itemsToggled;

  // Older orders predate some of these fields. An absent one used to throw
  // here, and since the whole list renders in one tree, a single such order
  // blanked the entire history page.
  const itemsText = (data.items || "").replace(/"/g, "");
  const iconColor = darkMode ? "grey.500" : "grey.600";

  const paymentLabel =
    data.paymentMode === "Paid" ? `Paid - ${data.paymentType}` : data.paymentMode;
  const paymentColor =
    data.paymentMode === "Paid" ? "success" : data.paymentMode === "COD" ? "warning" : "info";

  // show only actions the role can use AND that apply to the order's current
  // status (super_admin bypasses the status check where allowSuper is set)
  const visibleActions = Order_Card_Actions.filter((item) => {
    if (!item.roles.includes(userData.role)) return false;
    if (userData.role === "super_admin" && item.allowSuper) return true;
    return item.statuses.includes(data.status);
  });

  const menuItems = [];
  Order_Card_Action_Groups.forEach((group) => {
    const groupActions = visibleActions.filter((item) => item.group === group);
    if (groupActions.length === 0) return;
    if (menuItems.length > 0) {
      menuItems.push(<Divider key={`divider-${group}`} />);
    }
    groupActions.forEach((item) => {
      menuItems.push(
        <MenuItem
          key={item.label}
          onClick={() => {
            handleMenuItemClick(item.type);
          }}
          sx={group === "danger" ? { color: "error.main" } : undefined}
        >
          {item.label}
        </MenuItem>
      );
    });
  });

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
      bgColor={darkMode ? "transparent" : "white"}
      borderRadius="lg"
      shadow="sm"
      px={2.5}
      pb={2}
      mb={3}
      mt={2}
      sx={{
        border: "1px solid",
        borderColor: darkMode ? "rgba(255, 255, 255, 0.2)" : "#dee2e6",
      }}
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
        <MDBox display="flex" justifyContent="space-between" alignItems="center">
          <MDBox display="flex" alignItems="center" gap={1} flexWrap="wrap" mt={0.5}>
            <MDTypography variant="button" fontWeight="medium" textTransform="capitalize">
              {data.name}
            </MDTypography>
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
              {menuItems}
            </Menu>
          </MDBox>
        </MDBox>
        <MDBox
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={1}
          pb={1.5}
          sx={{
            borderBottom: `1px solid ${darkMode ? "rgba(255, 255, 255, 0.12)" : "#f0f2f5"}`,
          }}
        >
          <MDBox display="flex" alignItems="center" gap={1}>
            <MDTypography variant="h6">{formattedAmount(data.amount)}</MDTypography>
            <MDBadge badgeContent={paymentLabel} color={paymentColor} variant="gradient" size="sm" />
          </MDBox>
          <MDTypography variant="caption" color="text" fontWeight="medium">
            + {formattedAmount(data.deliveryFees)} delivery
          </MDTypography>
        </MDBox>
        <Grid container columnSpacing={3} sx={{ pt: 1 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <InfoRow icon={<RowIcon name="phone" color={iconColor} />}>
              {data.primaryPhone}
              {data.secondaryPhone ? `, ${data.secondaryPhone}` : ""}
            </InfoRow>
            <InfoRow icon={<RowIcon name="location_city" color={iconColor} />}>
              {data.state}/{data.city}
            </InfoRow>
            <InfoRow icon={<RowIcon name="place" color={iconColor} />} multiline>
              {(data.address || "").replace(/"/g, "")}
            </InfoRow>
            {(data.remark || "").trim() !== "" && (
              <MDBox
                display="flex"
                alignItems="flex-start"
                gap={1.5}
                mt={1}
                px={1.5}
                py={1}
                borderRadius="md"
                sx={{ backgroundColor: darkMode ? "rgba(244, 67, 53, 0.15)" : "#fdecea" }}
              >
                <MDBox display="flex" mt={0.25}>
                  <RowIcon name="sticky_note_2" color="error.main" />
                </MDBox>
                <MDTypography variant="caption" color="error" fontWeight="medium">
                  {data.remark}
                </MDTypography>
              </MDBox>
            )}
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            {!isMdUp && (
              <MDBox
                display="flex"
                alignItems="center"
                gap={1.5}
                py={0.5}
                onClick={() => setItemsToggled(!itemsExpanded)}
                sx={{ cursor: "pointer" }}
              >
                <MDBox display="flex">
                  <RowIcon name="inventory_2" color={iconColor} />
                </MDBox>
                <MDTypography variant="body2" color="info" fontWeight="medium">
                  Items
                </MDTypography>
                <Icon fontSize="small">{itemsExpanded ? "expand_less" : "expand_more"}</Icon>
              </MDBox>
            )}
            <Collapse in={itemsExpanded}>
              <InfoRow
                icon={
                  isMdUp ? (
                    <RowIcon name="inventory_2" color={iconColor} />
                  ) : (
                    <MDBox style={{ width: 20 }} />
                  )
                }
                multiline
              >
                {itemsText}
              </InfoRow>
            </Collapse>
          </Grid>
        </Grid>
        <MDBox mt={1} textAlign="right">
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {TimestampDisplay(data.createdAt)} · {data.createdBy}
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
