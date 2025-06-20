// @mui material components
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Billing page components
import OrderCard from "../OrderCard";
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { database } from "../../../../firebase";
import PropTypes from "prop-types";
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import { useLocation, useNavigate } from "react-router-dom";
import MDSnackbar from "../../../../components/MDSnackbar";
import { useAuth } from "../../../../context/AuthContext";
import MDAlert from "../../../../components/MDAlert";
import MDButton from "../../../../components/MDButton";
import MDInput from "../../../../components/MDInput";
import Fuse from "fuse.js";
import { debounce } from "lodash";
import FilterOrders from "../Filters";
import dayjs from "dayjs";

function OrderContainer({ brand }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [searchedOrders, setSearchedOrders] = useState([]);
  const [searchKeywords, setSearchKeywords] = useState("");
  const [checkedItems, setCheckedItems] = useState({
    pending: false,
    packed: false,
    shipped: false,
    cod: false,
    fullPaid: false,
    other: false,
    cash: false,
    kpay: false,
    bank: false,
    startDate: "",
    endDate: "",
  });
  const [selectedBrand, setSelectedBrand] = useState(brand);
  const [limitCount, setLimitCount] = useState(500);
  const [open, setOpen] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [orderId, setOrderId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { userData } = useAuth();
  const [snack, setSnack] = useState({ open: false, message: "", color: "success", icon: "check" });
  const segments = location.pathname.split("/").filter(Boolean);

  useEffect(() => {
    filerOrders();
  }, [segments[0]]);

  const handleClose = () => setOpen(false);

  const fuse = new Fuse(orders, {
    keys: ["name", "primaryPhone", "secondaryPhone"],
    threshold: 0.3,
  });

  const handleConfirm = async () => {
    await updateOrder(3, orderId, true);
    setOpen(false);
  };

  useEffect(() => {
    if (selectedBrand === "all") {
      navigate(`/${segments[0]}/all`);
    } else {
      navigate(`/${segments[0]}/${selectedBrand}`);
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

  const updateOrder = async (status = 0, id, setInvoice = false) => {
    const docRef = doc(database, segments[0] === "history" ? "orders" : "ws_orders", id);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();
    let updateHistory = data.updateHistory;
    let dataToUpdate;
    if (setInvoice) {
      dataToUpdate = {
        invoiceNumber: invoiceNumber,
        status,
        updateHistory: [
          ...updateHistory,
          {
            updatedAt: new Date(),
            updatedBy: userData.name,
          },
        ],
      };
    } else {
      dataToUpdate = {
        status,
        updateHistory: [
          ...updateHistory,
          {
            updatedAt: new Date(),
            updatedBy: userData.name,
          },
        ],
      };
    }
    updateDoc(docRef, dataToUpdate)
      .then(() => {
        const orders = searchedOrders.map((item) => (item.id === id ? { ...item, status } : item));
        setSearchedOrders(orders);
        setSnack({ open: true, message: "Order update success.", color: "success", icon: "check" });
        setOrderId("");
        setInvoiceNumber("");
      })
      .catch(() => {
        setSnack({ open: true, message: "Order update failed.", color: "error", icon: "warning" });
      });
    console.log("Document successfully updated!");
  };

  const deleteOrder = async (id) => {
    deleteDoc(doc(database, segments[0] === "history" ? "orders" : "ws_orders", id))
      .then(() => {
        const orders = searchedOrders.filter((item) => item.id !== id);
        setSearchedOrders(orders);
        setSnack({ open: true, message: "Order delete success.", color: "success", icon: "check" });
      })
      .catch(() => {
        setSnack({ open: true, message: "Order delete failed.", color: "error", icon: "warning" });
      });
  };

  const handleOrderCardClick = async (e, order) => {
    switch (e) {
      case "view":
        navigate(`/details?id=${order.id}`);
        break;
      case "edit":
        navigate(`/order?id=${order.id}`);
        break;
      case "delete":
        await deleteOrder(order.id);
        break;
      case "packed":
        await updateOrder(1, order.id);
        break;
      case "shipped":
        await updateOrder(2, order.id);
        break;
      case "invoice":
        setOpen(true);
        setOrderId(order.id);
        break;
      default:
        break;
    }
  };

  const filerOrders = async () => {
    try {
      const segments = location.pathname.split("/").filter(Boolean);
      const brandRef = collection(database, segments[0] === "history" ? "orders" : "ws_orders");
      const q = query(brandRef, orderBy('createdAt', 'desc'), limit(limitCount),);

      const querySnapshot = await getDocs(q);

      const orderData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOrders(
        orderData.sort((a, b) => dayjs(b.createdAt.seconds).diff(dayjs(a.createdAt.seconds)))
      );
    } catch (e) {
      console.error("Error getting documents: ", e);
    }
  };

  const onSearch = (value) => {
    const filerWithChecked = (searchOrders) => {
      let tempOrders =
        selectedBrand === "all"
          ? searchOrders
          : searchOrders.filter((order) => order.brand === selectedBrand);
      let statusFilter = [];
      let paymentFilter = [];
      let paymentTypeFilter = [];

      checkedItems.pending ? statusFilter.push(0) : null;
      checkedItems.packed ? statusFilter.push(1) : null;
      checkedItems.shipped ? statusFilter.push(2) : null;

      checkedItems.cod ? paymentFilter.push("COD") : null;
      checkedItems.fullPaid ? paymentFilter.push("Paid") : null;
      checkedItems.other ? paymentFilter.push("Other") : null;

      checkedItems.cash ? paymentTypeFilter.push("Cash") : null;
      checkedItems.kpay ? paymentTypeFilter.push("KPay") : null;
      checkedItems.bank ? paymentTypeFilter.push("Bank") : null;

      if (statusFilter.length > 0) {
        tempOrders = tempOrders.filter((order) => statusFilter.includes(order.status));
      }
      if (paymentFilter.length > 0) {
        tempOrders = tempOrders.filter((order) => paymentFilter.includes(order.paymentStatus));
      }
      if (paymentTypeFilter.length > 0) {
        tempOrders = tempOrders.filter((order) => paymentTypeFilter.includes(order.paymentMode));
      }
      if (checkedItems.startDate !== "" && checkedItems.endDate !== "") {
        const startDate = dayjs(checkedItems.startDate);
        const endDate = dayjs(checkedItems.endDate);
        tempOrders = tempOrders.filter((order) => {
          const createdAt = dayjs.unix(order.createdAt.seconds); // convert Firestore timestamp
          return createdAt.isBetween(startDate, endDate, "day", "[]");
        });
      }
      return tempOrders.sort((a, b) => dayjs(b.createdAt.seconds).diff(dayjs(a.createdAt.seconds)));
    };
    if (value.trim() === "") {
      setSearchedOrders(filerWithChecked(orders));
    } else {
      const result = fuse.search(value);
      const unfilterResult = result.map((r) => r.item);
      setSearchedOrders(filerWithChecked(unfilterResult));
    }
  };

  useEffect(() => {
    debouncedSearch(searchKeywords);
  }, [searchKeywords, checkedItems, brand, orders]);

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        onSearch(value);
        setIsLoading(false)
      }, 500),
    [onSearch]
  );

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchKeywords(value);
  };

  const closeSnack = () => {
    snack.open = false;
    setSnack({ ...snack });
  };

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

  return (
    <>
      <Card id="order-history">
        <MDBox
          pt={3}
          px={2}
          display="flex"
          justifyContent="space-between"
          alignItems={{ xs: "center", sm: "center" }}
          flexDirection="row"
        >
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
        <MDBox
          p={2}
          display="flex"
          justifyContent="space-between"
          gap={2}
          alignItems="center"
          flexDirection="row"
        >
          <MDInput
            type="text"
            label="Search"
            variant="outlined"
            fullWidth
            value={searchKeywords}
            onChange={handleChange}
          />
        </MDBox>
        <MDBox px={2} pb={2}>
          <FilterOrders filerChange={(e) => setCheckedItems(e)} />
        </MDBox>
        {
          isLoading &&
          <MDBox pt={1} pb={2} px={2} display="flex" justifyContent="center">
            <CircularProgress color="success" />
          </MDBox>
        }
        {
          !isLoading &&
          <MDBox pt={1} pb={2} px={2}>
            <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
              {searchedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  data={order}
                  handleClick={(e) => handleOrderCardClick(e, order)}
                />
              ))}
            </MDBox>
            <MDBox>
              {searchedOrders.length < limitCount ? null : (
                <MDButton variant="gradient" color="info" fullWidth onClick={loadMore}>
                  Load More
                </MDButton>
              )}
              {searchedOrders.length === 0 ? (
                <MDAlert color="light">This is no orders yet.</MDAlert>
              ) : null}
            </MDBox>
          </MDBox>
        }

      </Card>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          <MDTypography
            variant="h5"
            component="span"
            fontWeight="medium"
            textTransform="capitalize"
          >
            Set Invoice No.
          </MDTypography>
        </DialogTitle>
        <DialogContent sx={{ width: { xs: "350px", md: "450px" } }}>
          <MDBox py={2}>
            <MDInput
              type="text"
              name="Invoice Number"
              label="Invoice Number"
              variant="outlined"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              fullWidth
            />
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton variant="gradient" color="light" onClick={handleClose}>
            Cancel
          </MDButton>
          <MDButton
            variant="gradient"
            color="info"
            onClick={handleConfirm}
            disabled={invoiceNumber === ""}
          >
            Confirm
          </MDButton>
        </DialogActions>
      </Dialog>
      {renderSnackBar}
    </>
  );
}

OrderContainer.propTypes = {
  brand: PropTypes.string.isRequired,
  hit: PropTypes.object,
};

export default OrderContainer;

// const searchClient = algoliasearch(
//   'LUQUCJ1X7P',
//   'eee17237305148cd06aa66b6fc86d680'
// );

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

{
  /*<InstantSearch indexName="Dragon" searchClient={searchClient}>*/
}
{
  /*  <SearchOrder/>*/
}
{
  /*  <CustomHits/>*/
}
{
  /*</InstantSearch>*/
}
