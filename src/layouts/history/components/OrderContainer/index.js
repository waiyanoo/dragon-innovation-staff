// @mui material components
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Billing page components
import OrderCard from "../OrderCard";
import { useState } from "react";
import { collection, doc, getDoc, getDocs, limit, query, updateDoc } from "firebase/firestore";
import { database } from "../../../../firebase";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import { useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import MDSnackbar from "../../../../components/MDSnackbar";
import { useAuth } from "../../../../context/AuthContext";
import { liteClient as algoliasearch } from "algoliasearch/lite";
import { InstantSearch, useHits } from "react-instantsearch";
import SearchOrder from "../Search";

function OrderContainer({ brand }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [limitCount, setLimitCount] = useState(10);
  const [open, setOpen] = useState(false);
  const { userData } = useAuth();
  const [snack, setSnack] = useState({ open: false, message: '', color: 'success', icon: 'check' });
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const searchClient = algoliasearch(
    'LUQUCJ1X7P',
    'eee17237305148cd06aa66b6fc86d680'
  );

  const handleBrandChange = (e) => {
    navigate(`/history/${e.target.value}`);
    setLimitCount(10);
    filerOrders();
  };

  const updateOrder = async (status, id) => {
    const docRef = doc(database, "orders", id);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();
    let updateHistory = data.updateHistory;
    console.log("what is user", userData)
    updateDoc(docRef, {
      status,
      updateHistory: [...updateHistory, {
        updatedAt: new Date(),
        updatedBy: userData.name,
      }],
    }).then(() => {
      filerOrders();
      setSnack({ open: true, message: 'Order update success.', color: 'success', icon: 'check' });
    }).catch(() => {
      setSnack({ open: true, message: 'Order update failed.', color: 'error', icon: 'warning' })
    });
    console.log("Document successfully updated!");
  };

  const handleOrderCardClick = async (e, order) => {
    switch (e) {
      case "edit":
        if (order.status === 0) {
          navigate(`/order?id=${order.id}`);
        }
        break;
      case "packed":
        await updateOrder(1, order.id);
        break;
      case "shipped":
        await updateOrder(2, order.id);
        break;
      default:
        break;
    }

  };

  const filerOrders = async () => {
    try {
      const brandRef = collection(database, "orders");
      const q = query(
        brandRef,
        limit(limitCount),
      );

      const querySnapshot = await getDocs(q);

      const orderData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("what is orderData", orderData)
      setOrders(orderData);
    } catch (e) {
      console.error("Error getting documents: ", e);
    }
  };

  const closeSnack = () => {
    snack.open = false;
    setSnack({ ...snack })
  }

  const renderSnackBar = (
    <MDSnackbar
      color={snack.color}
      icon={snack.icon}
      title="Dragon Innovation"
      content={snack.message}
      dateTime="0 min ago"
      open={snack.open}
      onClose={closeSnack}
      close={closeSnack}
      bgWhite
    />
  );

   const CustomHits = () =>{
    const { hits } = useHits();

    return (
      <div>
        {hits.map((hit, index) => (
          <OrderCard key={index} data={hit} noGutter handleClick={(e) => handleOrderCardClick(e, hit)} />
        ))}
      </div>
    );
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
        <MDBox p={2}>
          <InstantSearch indexName="Dragon" searchClient={searchClient}>
            <SearchOrder/>
            <CustomHits/>
          </InstantSearch>
        </MDBox>
        <MDBox pt={1} pb={2} px={2}>
          <MDBox>
            {/*{*/}
            {/*  orders.length === 0 ? <MDAlert color="light">*/}
            {/*    This is no orders yet.*/}
            {/*  </MDAlert> : null*/}
            {/*}*/}
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
      {renderSnackBar}
    </>
  );
}

OrderContainer.propTypes = {
  brand: PropTypes.string.isRequired,
  hit: PropTypes.object
};

export default OrderContainer;
