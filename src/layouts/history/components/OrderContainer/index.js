// @mui material components
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Billing page components
import OrderCard from "../OrderCard";
import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDoc, getDocs, deleteDoc, limit, query, updateDoc } from "firebase/firestore";
import { database } from "../../../../firebase";
import PropTypes from "prop-types";
import { Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, Select } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import { useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import MDSnackbar from "../../../../components/MDSnackbar";
import { useAuth } from "../../../../context/AuthContext";
import MDAlert from "../../../../components/MDAlert";
import MDButton from "../../../../components/MDButton";
import MDInput from "../../../../components/MDInput";
import Fuse from "fuse.js";
import { debounce } from "lodash";

function OrderContainer({ brand }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [searchedOrders, setSearchedOrders] = useState([]);
  const [searchKeywords, setSearchKeywords] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(brand);
  const [showNotFound, setShowNotFound] = useState(false);
  const [limitCount, setLimitCount] = useState(50);
  const [open, setOpen] = useState(false);
  const { userData } = useAuth();
  const [snack, setSnack] = useState({ open: false, message: '', color: 'success', icon: 'check' });
  const handleClose = () => setOpen(false);
  // const searchClient = algoliasearch(
  //   'LUQUCJ1X7P',
  //   'eee17237305148cd06aa66b6fc86d680'
  // );

  const fuse = new Fuse(orders, {
    keys: ['name', 'primaryPhone', 'secondaryPhone'],
    threshold: 0.3, // 0 = exact, 1 = very fuzzy
  });

  useEffect(() => {
    filerOrders();
  }, []);

  useEffect(() => {
    if(selectedBrand === "all"){
      setSearchedOrders(orders);
      navigate(`/history/all`);
    } else {
      const result = orders.filter(order => order.brand === selectedBrand);
      setSearchedOrders(result);
      navigate(`/history/${selectedBrand}`);
    }
  }, [selectedBrand, orders]);


  const loadMore = () => {
    setLimitCount(limitCount + 10);
    filerOrders();
  };



  const handleBrandChange = (e) => {
    const { value } = e.target;
    setSelectedBrand(value);
  };

  const updateOrder = async (status, id) => {
    const docRef = doc(database, "orders", id);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();
    let updateHistory = data.updateHistory;
    updateDoc(docRef, {
      status,
      updateHistory: [...updateHistory, {
        updatedAt: new Date(),
        updatedBy: userData.name,
      }],
    }).then(() => {
      const orders = searchedOrders.map(item =>
        item.id === id ? { ...item, status } : item
      );
      setSearchedOrders(orders);
      setSnack({ open: true, message: 'Order update success.', color: 'success', icon: 'check' });
    }).catch(() => {
      setSnack({ open: true, message: 'Order update failed.', color: 'error', icon: 'warning' })
    });
    console.log("Document successfully updated!");
  };

  const deleteOrder = async (id) => {
      deleteDoc(doc(database, 'orders', id)).then(() => {
        const orders = searchedOrders.filter(item => item.id !== id);
        setSearchedOrders(orders);
        setSnack({ open: true, message: 'Order delete success.', color: 'success', icon: 'check' });
      }).catch(() => {
        setSnack({ open: true, message: 'Order delete failed.', color: 'error', icon: 'warning' })
      });
  }

  const handleOrderCardClick = async (e, order) => {
    switch (e) {
      case "edit":
        if (order.status === 0) {
          navigate(`/order?id=${order.id}`);
        }
        break;
      case "delete":
        await deleteOrder(order.id);
        break
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
      setOrders(orderData);
    } catch (e) {
      console.error("Error getting documents: ", e);
    }
  };

  const onSearch = (value) => {
    if (value.length === 0) {
      setSearchedOrders(orders);
    } else {
      const result = fuse.search(value);
      const unfilterResult = result.map(r => r.item);
      if(selectedBrand === "all"){
        setSearchedOrders(unfilterResult);
      } else {
        const filteredResult = unfilterResult.filter(order => order.brand === selectedBrand);
        setSearchedOrders(filteredResult);
      }
    }
  }

  const debouncedSearch = useMemo(() =>
    debounce((value) => {
      onSearch(value);
    }, 500), [onSearch]
  );

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchKeywords(value);
    debouncedSearch(value);
  }

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

  //  const CustomHits = () =>{
  //   const { hits } = useHits();
  //   if(hits.length === 0){
  //     return (
  //       <MDBox>
  //         <MDAlert color="light">
  //             No order found.
  //           </MDAlert>
  //       </MDBox>
  //     )
  //   }
  //   return (
  //     <div>
  //       {hits.map((hit, index) => (
  //         <OrderCard key={index} data={hit} noGutter handleClick={(e) => handleOrderCardClick(e, hit)} />
  //       ))}
  //     </div>
  //   );
  // }

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
              variant="outlined"
              name="brand"
              value={selectedBrand}
              label="Brand"
              onChange={handleBrandChange}
              sx={{ lineHeight: "3rem", width: 100 }}
            >
              <MenuItem value="hanskin">Hanskin</MenuItem>
              <MenuItem value="sugarbear">Sugarbear</MenuItem>
              <MenuItem value="mongdies">Mongdies</MenuItem>
              <MenuItem value="all">All</MenuItem>
            </Select>
          </FormControl>
        </MDBox>
        <MDBox p={2} display="flex" justifyContent="space-between" gap={2} alignItems="center" flexDirection="row">
          {/*<InstantSearch indexName="Dragon" searchClient={searchClient}>*/}
          {/*  <SearchOrder/>*/}
          {/*  <CustomHits/>*/}
          {/*</InstantSearch>*/}
          <MDInput type="text" label="Search" variant="outlined" fullWidth value={searchKeywords} onChange={handleChange} />
        </MDBox>
        <MDBox pt={1} pb={2} px={2}>
          <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
            {
              searchedOrders.map(order => (
                <OrderCard key={order.id} data={order} noGutter handleClick={(e) => handleOrderCardClick(e, order)} />
              ))
            }
          </MDBox>
          <MDBox>
            {
              searchedOrders.length < limitCount ? null :
                <MDButton variant="gradient" color="info" fullWidth onClick={loadMore}>Load More</MDButton>
            }
            {
              searchedOrders.length === 0 ? <MDAlert color="light">
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
      {renderSnackBar}
    </>
  );
}

OrderContainer.propTypes = {
  brand: PropTypes.string.isRequired,
  hit: PropTypes.object
};

export default OrderContainer;
