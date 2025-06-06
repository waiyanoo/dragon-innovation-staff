import { useMaterialUIController } from "../../../../context";
import MDBox from "../../../../components/MDBox";
import MDTypography from "../../../../components/MDTypography";
import PropTypes from "prop-types";
import MDBadge from "../../../../components/MDBadge";
import { useEffect, useState } from "react";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import { useAuth } from "../../../../context/AuthContext";
import { Order_Card_Actions } from "../../../../data/common";

function OrderCard({ data, noGutter, handleClick }) {
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
  }
  const handleClose = () => {
    setAnchorEl(null);
  };

  const formattedAmount = (value) => {
    return new Intl.NumberFormat("en-MM", {
      style: "currency",
      currency: "MMK",
    }).format(value);
  };

  const TimestampDisplay = ( timestamp ) => {
    const date = timestamp.toDate();
    // const date = new Date(timestamp);
    return <p>{date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}</p>;
    // return "2021-09-23 12:00:00"
  }

  // const formattedDate = new Date(data.updatedAt).toLocaleString();
  return (
    <MDBox
      // display="flex"
      // justifyContent="space-between"
      // alignItems="flex-start"
      bgColor={darkMode ? "transparent" : "grey-100"}
      borderRadius="lg"
      pl={3} pb={3} pr={3}
      mb={3}
      mt={2}
      // onClick={handleClick}
    >
      <MDBox
        variant="gradient"
        bgColor={data.brand === 'sugarbear' ? 'primary' : data.brand === 'mongdies' ? 'success' : 'info'}
        color={data.brand === 'sugarbear' ? 'primary' : data.brand === 'mongdies' ? 'success' : 'info'}
        coloredShadow={data.brand === 'sugarbear' ? 'primary' : data.brand === 'mongdies' ? 'success' : 'info'}
        borderRadius="lg"
        display="flex"
        justifyContent="center"
        alignItems="center"
        width="5rem"
        height="1.5rem"
        mt={-1.5}
      >
        <MDTypography variant="caption" color="light" fontWeight="medium" textTransform="capitalize">
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
          <MDBox display="flex" alignItems="center" mt={{ xs: 0.5, sm: 0 }} >
            <MDTypography variant="button" fontWeight="medium" textTransform="capitalize">
              {data.name}
            </MDTypography>
            {/*<MDBadge badgeContent={data.brand} color={data.brand === 'sugarbear' ? 'primary' : data.brand === 'mongdies' ? 'success' : 'info'} variant="gradient" size="md" ml={1} />*/}
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
              {
                Order_Card_Actions.map((item) => {
                  const hasAccess = item.roles.includes(userData.role);
                  const isStatusAllowed = item.statuses.includes(data.status);
                  const isDisabled = hasAccess && !isStatusAllowed;
                  if (!hasAccess) return null;

                  return (
                    <MenuItem key={item.label} onClick={() => { handleMenuItemClick(item.type); }} disabled={isDisabled}>
                      {item.label}
                    </MenuItem>
                  )
                })
              }
              {/*<MenuItem onClick={() => { handleMenuItemClick('edit'); console.log('Edit clicked'); }} disabled={data.status !== 0}>*/}
              {/*  Edit*/}
              {/*</MenuItem>*/}
              {/*<MenuItem onClick={() => { handleMenuItemClick('packed'); console.log('Packed clicked'); }} disabled={data.status >= 1}>*/}
              {/*  Packed*/}
              {/*</MenuItem>*/}
              {/*<MenuItem onClick={() => { handleMenuItemClick('shipped'); console.log('Shipped clicked'); }} disabled={data.status >= 2}>*/}
              {/*  Shipped*/}
              {/*</MenuItem>*/}
              {/*{*/}
              {/*  userData.role === "admin" ? (<MenuItem onClick={() => { handleMenuItemClick('invoice'); console.log('Shipped clicked'); }}>*/}
              {/*    Set Invoice No.*/}
              {/*  </MenuItem>) : null*/}
              {/*}*/}

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
              {formattedAmount(data.amount)} - {data.paymentMode}{" "}
              {data.paymentMode !== "Paid" ? "" : ` - ${data.paymentType}`}
            </MDTypography>
          </MDTypography>
        </MDBox>
        <MDBox mb={1} lineHeight={0}>
          <MDTypography variant="caption" fontWeight="medium">
            Paid Delivery Fees:&nbsp;&nbsp;&nbsp;
            <MDTypography variant="caption" color="text" fontWeight="medium">
              {formattedAmount(data.deliveryFees)}
            </MDTypography>
          </MDTypography>
        </MDBox>
        <MDBox mb={1} lineHeight={0}>
          <MDTypography variant="caption" fontWeight="medium">
            Remark:&nbsp;&nbsp;&nbsp;
            <MDTypography variant="caption" color="text">
              {data.remark}
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
