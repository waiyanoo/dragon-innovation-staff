// @mui material components
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Billing page components
import OrderCard from "../OrderCard";
import { useEffect, useState } from "react";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { database } from "../../../../firebase";
import PropTypes from "prop-types";
import MDButton from "../../../../components/MDButton";
import { Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, Select } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import { useNavigate } from "react-router-dom";
import MDAlert from "../../../../components/MDAlert";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

function OrderContainer({brand}) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [limitCount, setLimitCount] = useState(10);
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    filerOrders();
  }, [brand]);

  const loadMore = () => {
    setLimitCount(limitCount + 10);
    filerOrders();
  }

  const handleBrandChange = (e) => {
    navigate(`/history/${e.target.value}`);
    setLimitCount(10);
    filerOrders();
  }

  const updateOrder = (state) => {

  }

  const handleOrderCardClick = (e,order) => {
    console.log(e,order)
    switch (e) {
      case "edit":
        if (order.status === 0) {
          navigate(`/order/${order.id}`);
        }
        break;
      case "packed":
        updateOrder("packed");
        break;
      case "shipped":
        updateOrder("shipped");
        break
      default:
        break;
    }

  }

  const filerOrders = async () => {
    try {
      const brandRef = collection(database, brand);
      const q = query(
        brandRef,
        limit(limitCount),
      )

      const querySnapshot = await getDocs(q);

      const orderData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(orderData);
    } catch (e) {
      console.error("Error getting documents: ", e);
    }
  }

  return (
    <>
      <Card id="order-history">
      <MDBox pt={3} px={2}
             display="flex"
             justifyContent="space-between"
             alignItems={{ xs: "center", sm: "center" }}
             flexDirection="row">

        <MDTypography variant="h6" fontWeight="medium">
          Order History
        </MDTypography>

        <FormControl variant="outlined">
          <InputLabel id="brand-select-label">Brand</InputLabel>
          <Select
            labelId="brand-select-label"
            id="brand-select"
            name="brand"
            value={brand}
            label="Brand"
            onChange={handleBrandChange}
            sx={{ lineHeight: "3rem", width: 100 }}
          >
            <MenuItem value="hanskin">Hanskin</MenuItem>
            <MenuItem value="sugarbear">Sugarbear</MenuItem>
            <MenuItem value="mongdies">Mongdies</MenuItem>
          </Select>
        </FormControl>
      </MDBox>
      <MDBox pt={1} pb={2} px={2}>
        <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
          {
            orders.map(order => (
              <OrderCard key={order.id} data={order} noGutter handleClick={(e) => handleOrderCardClick(e,order)}/>
            ))
          }
        </MDBox>
        <MDBox>
          {
            orders.length < limitCount ? null : <MDButton variant="gradient" color="info" fullWidth onClick={loadMore}>Load More</MDButton>
          }
          {
            orders.length === 0 ? <MDAlert color="light">
              This is no orders yet.
            </MDAlert> : null
          }
        </MDBox>
      </MDBox>
    </Card>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Dialog Title</DialogTitle>
        <DialogContent>
          <Typography>This is the dialog content.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleClose} variant="contained">Confirm</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

OrderContainer.propTypes = {
  brand:PropTypes.string.isRequired
}

export default OrderContainer;
