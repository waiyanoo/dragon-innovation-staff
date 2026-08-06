import MDBox from "../../components/MDBox";
import DashboardNavbar from "../../examples/Navbars/DashboardNavbar";
import DashboardLayout from "../../examples/LayoutContainers/DashboardLayout";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDTypography from "../../components/MDTypography";
import MDInput from "../../components/MDInput";
import { Autocomplete, CircularProgress, FormControl, InputLabel, Select } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import MDButton from "../../components/MDButton";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useNavigate, useSearchParams } from "react-router-dom";
import { database } from "../../firebase";
import { State_List } from "../../data/common";
import { citiesForState } from "../../data/cityList";
import MDSnackbar from "../../components/MDSnackbar";
import { useAuth } from "../../context/AuthContext";
import Footer from "../../examples/Footer";

const NUMERIC_INPUT_PROPS = { inputMode: "numeric", pattern: "[0-9]*" };

function SectionTitle({ children }) {
  return (
    <MDBox mt={3} mb={1.5}>
      <MDTypography variant="button" fontWeight="bold" textTransform="uppercase" color="text">
        {children}
      </MDTypography>
    </MDBox>
  );
}

SectionTitle.propTypes = {
  children: PropTypes.node.isRequired,
};

function Order() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userData } = useAuth();
  const id = searchParams.get("id");

  const [brand, setBrand] = useState("hanskin");
  const [orderRef, setOrderRef] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: "", color: "success", icon: "check" });
  const [isLoading, setIsLoading] = useState(false);
  const isSubmittingRef = useRef(false);
  const [collectionName, setCollectionName] = useState("orders");
  const [formData, setFormData] = useState({
    name: "",
    primaryPhone: "",
    secondaryPhone: "",
    address: "",
    state: "",
    city: "",
    items: "",
    amount: "",
    deliveryFees: "",
    paymentStatus: "COD",
    deliveryType: "1",
    paymentMode: "NoPay",
    remark: "",
    status: 0,
    invoiceNumber: "",
  });

  useEffect(() => {
    const targetCollection = userData.role === "sales" ? "ws_orders" : "orders";
    setCollectionName(targetCollection);
    async function fetchOrder() {
      const docRef = doc(database, targetCollection, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setOrderRef(docRef);
        const data = docSnap.data();
        setFormData(data);
        if (data.brand) {
          setBrand(data.brand);
        }
      } else {
        navigate(`/order`);
      }
    }

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleBrandChange = (e) => {
    const { value } = e.target;
    setBrand(value);
  };

  const setCity = (value) => {
    setFormData((prevState) => ({ ...prevState, city: value }));
  };

  // Cities are offered per state, so a leftover township from the previously
  // selected state would be wrong. Only fires on user interaction — loading an
  // existing order sets formData directly and keeps its stored city.
  const handleStateChange = (e) => {
    const { value } = e.target;
    setFormData((prevState) => ({ ...prevState, state: value, city: "" }));
  };

  const save = async () => {
    const data = {
      ...formData,
      amount: Number(formData.amount) || 0,
      deliveryFees: Number(formData.deliveryFees) || 0,
      orderType: userData.role === "sales" ? "wholesale" : "retail",
      brand: brand,
      createdBy: userData.name,
      createdAt: serverTimestamp(),
      updateHistory: [
        {
          updatedAt: new Date(),
          updatedBy: userData.name,
        },
      ],
    };

    try {
      await addDoc(collection(database, collectionName), data);
      setSnack({ open: true, message: "Order create success.", color: "success", icon: "check" });
      routeToHistory();
    } catch (e) {
      setSnack({ open: true, message: "Order create failed.", color: "error", icon: "warning" });
      setIsLoading(false);
    }
  };

  const update = async () => {
    // Drop the local copy of updateHistory and append via arrayUnion instead:
    // pushing into formData.updateHistory mutates React state in place (the
    // spread is shallow), so a retry after a failure appended twice, and
    // writing the whole array back clobbers concurrent updates.
    const { updateHistory, ...formFields } = formData;
    const data = {
      ...formFields,
      amount: Number(formData.amount) || 0,
      deliveryFees: Number(formData.deliveryFees) || 0,
      brand: brand,
      updateHistory: arrayUnion({
        updatedAt: new Date(),
        updatedBy: userData.name,
      }),
    };

    try {
      await updateDoc(orderRef, data);
      setSnack({ open: true, message: "Order update success.", color: "success", icon: "check" });
      routeToHistory();
    } catch (e) {
      setSnack({ open: true, message: "Order update failed.", color: "error", icon: "warning" });
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page reload
    // ref guard: state updates are async, so a second tap can arrive
    // before the disabled re-render on slow devices
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsLoading(true);
    try {
      if (id) {
        await update();
      } else {
        await save();
      }
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const routeToHistory = () => {
    if (userData.role === "sales") {
      navigate(`/wholesale-history/${brand}`);
    } else navigate(`/history/${brand}`);
  };

  const closeSnack = () => {
    setSnack({ ...snack, open: false });
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
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={8} mb={3}>
        <Grid container spacing={3} justifyContent="center">
          <Grid size={{ xs: 12, md: 8, lg: 8 }}>
            <Card id="order-form">
              <MDBox
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                mx={2}
                mt={-3}
                py={{ xs: 1.5, md: 2 }}
                px={2}
                mb={1}
                textAlign="center"
              >
                <MDTypography variant="h5" fontWeight="medium" color="white">
                  {id ? "Edit Order" : "New Order"}
                </MDTypography>
              </MDBox>
              <MDBox pt={3} pb={3} px={3}>
                <MDBox component="form" onSubmit={handleSubmit} role="form">
                  <Grid container columnSpacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <MDBox mb={2}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel id="brand-select-label">Brand</InputLabel>
                          <Select
                            labelId="brand-select-label"
                            id="brand-select"
                            name="brand"
                            value={brand}
                            label="Brand"
                            variant="outlined"
                            onChange={handleBrandChange}
                            sx={{ lineHeight: "3rem" }}
                          >
                            <MenuItem value="hanskin">Hanskin</MenuItem>
                            <MenuItem value="sugarbear">Sugarbear</MenuItem>
                            <MenuItem value="mongdies">Mongdies</MenuItem>
                          </Select>
                        </FormControl>
                      </MDBox>
                    </Grid>
                    {userData.role === "sales" && (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <MDBox mb={2}>
                          <MDInput
                            type="text"
                            name="invoiceNumber"
                            label="Invoice Number"
                            variant="outlined"
                            value={formData.invoiceNumber}
                            onChange={handleChange}
                            fullWidth
                          />
                        </MDBox>
                      </Grid>
                    )}
                  </Grid>

                  <SectionTitle>Customer</SectionTitle>
                  <Grid container columnSpacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <MDBox mb={2}>
                        <MDInput
                          type="text"
                          name="name"
                          label="Facebook Name"
                          variant="outlined"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          fullWidth
                        />
                      </MDBox>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <MDBox mb={2}>
                        <MDInput
                          type="tel"
                          name="primaryPhone"
                          label="Primary Phone Number"
                          variant="outlined"
                          value={formData.primaryPhone}
                          onChange={handleChange}
                          required
                          fullWidth
                        />
                      </MDBox>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <MDBox mb={2}>
                        <MDInput
                          type="tel"
                          label="Secondary Phone Number (optional)"
                          variant="outlined"
                          name="secondaryPhone"
                          value={formData.secondaryPhone}
                          onChange={handleChange}
                          fullWidth
                        />
                      </MDBox>
                    </Grid>
                  </Grid>

                  <SectionTitle>Delivery</SectionTitle>
                  <Grid container columnSpacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <MDBox mb={2}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel id="state-select-label">State</InputLabel>
                          <Select
                            labelId="state-select-label"
                            id="state-select"
                            value={formData.state}
                            label="state"
                            name="state"
                            onChange={handleStateChange}
                            sx={{ lineHeight: "3rem" }}
                            variant="outlined"
                          >
                            {State_List.map((item) => (
                              <MenuItem key={item} value={item}>
                                {item}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </MDBox>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <MDBox mb={2}>
                        <Autocomplete
                          freeSolo
                          autoHighlight
                          options={citiesForState(formData.state)}
                          value={formData.city || ""}
                          // Fires on picking an option; onInputChange covers typing.
                          onChange={(event, value) => setCity(value || "")}
                          onInputChange={(event, value) => setCity(value)}
                          renderInput={(params) => (
                            <MDInput
                              {...params}
                              type="text"
                              label="City"
                              variant="outlined"
                              name="city"
                              fullWidth
                            />
                          )}
                        />
                      </MDBox>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <MDBox mb={2}>
                        <MDInput
                          type="text"
                          label="Delivery Address"
                          variant="outlined"
                          fullWidth
                          multiline
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          required
                          minRows={2}
                          maxRows={6}
                        />
                      </MDBox>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <MDBox mb={2}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel id="delivery-select-label">Delivery Mode</InputLabel>
                          <Select
                            labelId="delivery-select-label"
                            id="delivery-select"
                            value={formData.deliveryType}
                            label="deliveryType"
                            name="deliveryType"
                            variant="outlined"
                            onChange={handleChange}
                            sx={{ lineHeight: "3rem" }}
                          >
                            <MenuItem value="1">Doorstep</MenuItem>
                            <MenuItem value="2">Car Gate</MenuItem>
                            <MenuItem value="3">Pickup</MenuItem>
                          </Select>
                        </FormControl>
                      </MDBox>
                    </Grid>
                  </Grid>

                  <SectionTitle>Order</SectionTitle>
                  <Grid container columnSpacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <MDBox mb={2}>
                        <MDInput
                          type="text"
                          label="Items"
                          variant="outlined"
                          fullWidth
                          multiline
                          name="items"
                          value={formData.items}
                          onChange={handleChange}
                          required
                          minRows={2}
                          maxRows={6}
                        />
                      </MDBox>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <MDBox mb={2}>
                        <MDInput
                          type="text"
                          inputProps={NUMERIC_INPUT_PROPS}
                          name="amount"
                          label="Total Amount (Including Delivery Fees)"
                          variant="outlined"
                          value={formData.amount}
                          onChange={handleChange}
                          required
                          fullWidth
                        />
                      </MDBox>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <MDBox mb={2}>
                        <MDInput
                          type="text"
                          inputProps={NUMERIC_INPUT_PROPS}
                          name="deliveryFees"
                          label="Delivery Fees Paid"
                          variant="outlined"
                          value={formData.deliveryFees}
                          onChange={handleChange}
                          fullWidth
                        />
                      </MDBox>
                    </Grid>
                  </Grid>

                  <SectionTitle>Payment</SectionTitle>
                  <Grid container columnSpacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <MDBox mb={2}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel id="payment-select-label">Payment Status</InputLabel>
                          <Select
                            labelId="payment-select-label"
                            id="payment-select"
                            value={formData.paymentStatus}
                            label="Payment Status"
                            name="paymentStatus"
                            variant="outlined"
                            onChange={handleChange}
                            sx={{ lineHeight: "3rem" }}
                          >
                            <MenuItem value="COD">COD</MenuItem>
                            <MenuItem value="Paid">Full Paid</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                          </Select>
                        </FormControl>
                      </MDBox>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <MDBox mb={2}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel id="payment-mode-select-label">Payment Mode</InputLabel>
                          <Select
                            labelId="payment-mode-select-label"
                            id="payment-mode-select"
                            value={formData.paymentMode}
                            label="Payment Mode"
                            name="paymentMode"
                            variant="outlined"
                            onChange={handleChange}
                            sx={{ lineHeight: "3rem" }}
                          >
                            <MenuItem value="NoPay">Not Yet Paid</MenuItem>
                            <MenuItem value="Cash">Cash</MenuItem>
                            <MenuItem value="Kpay">KPay</MenuItem>
                            <MenuItem value="Bank">Bank</MenuItem>
                            <MenuItem value="MMQR">MMQR</MenuItem>
                          </Select>
                        </FormControl>
                      </MDBox>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <MDBox mb={2}>
                        <MDInput
                          type="text"
                          label="Remark (optional)"
                          variant="outlined"
                          fullWidth
                          multiline
                          name="remark"
                          value={formData.remark}
                          onChange={handleChange}
                          minRows={2}
                          maxRows={6}
                        />
                      </MDBox>
                    </Grid>
                  </Grid>

                  <MDBox mt={2} mb={1}>
                    <MDButton
                      type="submit"
                      variant="gradient"
                      color="info"
                      fullWidth
                      disabled={isLoading}
                      startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                      {isLoading ? (id ? "Updating…" : "Creating…") : id ? "Update" : "Create"}
                    </MDButton>
                    {isLoading && (
                      <MDBox mt={1} textAlign="center">
                        <MDTypography variant="caption" color="text">
                          Saving your order — don&apos;t close this page.
                        </MDTypography>
                      </MDBox>
                    )}
                  </MDBox>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
        {renderSnackBar}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Order;
