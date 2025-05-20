import { useMaterialUIController } from "../../../../context";
import MDBox from "../../../../components/MDBox";
import MDTypography from "../../../../components/MDTypography";
import PropTypes from "prop-types";
import MDBadge from "../../../../components/MDBadge";
import { useEffect, useState } from "react";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";

function OrderCard({ data, noGutter, handleClick }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuItemClick = (action) => {
    setAnchorEl(null);
    handleClick(action);
  }
  const handleClose = () => {
    setAnchorEl(null);
  };
  useEffect(() => {
    console.log(data)
  }, []);

  const formattedAmount = new Intl.NumberFormat("en-MM", {
    style: "currency",
    currency: "MMK",
  }).format(data.amount);

  const TimestampDisplay = ( timestamp ) => {
    const date = timestamp.toDate();
    return <p>{date.toLocaleString()}</p>;
  }

  // const formattedDate = new Date(data.updatedAt).toLocaleString();
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
      // onClick={handleClick}
    >
      <MDBox width="100%" display="flex" flexDirection="column">
        <MDBox
          display="flex"
          justifyContent="space-between"
          alignItems={{ xs: "center", sm: "center" }}
          flexDirection={{ xs: "row", sm: "row" }}
          mb={2}
        >
          <MDBox display="flex" alignItems="center" mt={{ xs: 0, sm: 0 }} ml={{ xs: -1.5, sm: 0 }}>
            <MDTypography variant="button" fontWeight="medium" textTransform="capitalize">
              {data.name}
            </MDTypography>
            <MDBadge
              badgeContent={
              data.status === 2  ? "shipped"
                : data.status === 1 ? "Packed"
                  : data.status === 3 ? data.invoiceNumber :"Pending"}
              color={!data.invoiceNumber ? "warning" : "success"}
              variant="gradient"
              size="md"
            />
          </MDBox>
          <MDBox>
            <IconButton
              id="dropdown-button"
              aria-controls={open ? 'dropdown-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
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
              MenuListProps={{
                'aria-labelledby': 'dropdown-button',
              }}
            >
              <MenuItem onClick={() => { handleMenuItemClick('edit'); console.log('Edit clicked'); }} disabled={data.status !== 0}>
                Edit
              </MenuItem>
              <MenuItem onClick={() => { handleMenuItemClick('packed'); console.log('Packed clicked'); }} disabled={data.status >= 1}>
                Packed
              </MenuItem>
              <MenuItem onClick={() => { handleMenuItemClick('shipped'); console.log('Shipped clicked'); }} disabled={data.status >= 2}>
                Shipped
              </MenuItem>
              <MenuItem onClick={() => { handleMenuItemClick('invoice'); console.log('Shipped clicked'); }}>
                Set Invoice No.
              </MenuItem>
            </Menu>
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
            State/City:&nbsp;&nbsp;&nbsp;
            <MDTypography variant="caption" color="text">
              {data.state}/{data.city}
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
        <MDBox mt={1} lineHeight={0} textAlign="right">
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

OrderCard.defaultProps = {
  noGutter: false,
};

OrderCard.propTypes = {
  data: PropTypes.object.isRequired,
  handleClick: PropTypes.func.isRequired,
  noGutter: PropTypes.bool,
};

export default OrderCard;
