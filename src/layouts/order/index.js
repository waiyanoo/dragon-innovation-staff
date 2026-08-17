import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MDBox from "../../components/MDBox";
import DashboardNavbar from "../../examples/Navbars/DashboardNavbar";
import DashboardLayout from "../../examples/LayoutContainers/DashboardLayout";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDTypography from "../../components/MDTypography";
import MDInput from "../../components/MDInput";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
} from "@mui/material";
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
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useNavigate, useSearchParams } from "react-router-dom";
import { database } from "../../firebase";
import { State_List } from "../../data/common";
import { citiesForState, stateForCity } from "../../data/cityList";
import { parseMessengerText } from "./parseMessage";
import { formattedAmount } from "../../functions/common-functions";
import { normalizeMyanmarPhone } from "../../functions/phone";
import MDSnackbar from "../../components/MDSnackbar";
import { useAuth } from "../../context/AuthContext";
import { useMaterialUIController } from "../../context";
import Footer from "../../examples/Footer";

const NUMERIC_INPUT_PROPS = { inputMode: "numeric", pattern: "[0-9]*" };

const EMPTY_FORM = {
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
};

// A second order using either of the same phone numbers within a day is often
// a double-entry rather than a genuine repeat, so it is worth warning the user.
const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;

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
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const id = searchParams.get("id");

  const [brand, setBrand] = useState("hanskin");
  const [orderRef, setOrderRef] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: "", color: "success", icon: "check" });
  const [isLoading, setIsLoading] = useState(false);
  const isSubmittingRef = useRef(false);
  const [collectionName, setCollectionName] = useState("orders");
  const [formData, setFormData] = useState(EMPTY_FORM);
  // Set when a same-day order for this phone already exists; holds the pending
  // save until the user confirms it is not a duplicate.
  const [duplicate, setDuplicate] = useState(null);
  const [stateError, setStateError] = useState(false);
  const addAnotherRef = useRef(false);
  const nameInputRef = useRef(null);
  const [pasteText, setPasteText] = useState("");
  const [pasteSummary, setPasteSummary] = useState("");

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

  // A known city implies exactly one state, so fill it in rather than making
  // them pick. Only when state is still empty — silently moving a choice they
  // made deliberately would be worse than leaving it.
  const setCity = (value) => {
    const derivedState = formData.state ? null : stateForCity(value);
    if (derivedState) setStateError(false);
    setFormData((prevState) => ({
      ...prevState,
      city: value,
      ...(derivedState && !prevState.state ? { state: derivedState } : {}),
    }));
  };

  // Cities are offered per state, so a leftover township from the previously
  // selected state would be wrong. Only fires on user interaction — loading an
  // existing order sets formData directly and keeps its stored city.
  const handleStateChange = (e) => {
    const { value } = e.target;
    setStateError(false);
    setFormData((prevState) => ({ ...prevState, state: value, city: "" }));
  };

  // COD means the money has not been collected yet, so the mode follows the
  // status rather than being picked separately. Marking an order paid without
  // saying how was previously savable.
  const handlePaymentStatusChange = (e) => {
    const { value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      paymentStatus: value,
      paymentMode:
        value === "COD"
          ? "NoPay"
          : prevState.paymentMode === "NoPay"
            ? "Cash"
            : prevState.paymentMode,
    }));
  };

  // Fetch the recent window once so both phone fields can be compared against
  // both phone fields on existing orders without requiring extra indexes.
  const findSameDayOrder = async (primaryPhone, secondaryPhone) => {
    const normalizedPhones = [primaryPhone, secondaryPhone]
      .map(normalizeMyanmarPhone)
      .filter(Boolean);
    if (normalizedPhones.length === 0) return null;
    try {
      const cutoff = Date.now() - DUPLICATE_WINDOW_MS;
      const snapshot = await getDocs(
        query(
          collection(database, collectionName),
          where("createdAt", ">=", Timestamp.fromMillis(cutoff)),
          orderBy("createdAt", "desc")
        )
      );
      const match = snapshot.docs
        .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
        .find((order) => {
          const existingPhones = [order.primaryPhone, order.secondaryPhone]
            .map(normalizeMyanmarPhone)
            .filter(Boolean);
          return normalizedPhones.some((phone) => existingPhones.includes(phone));
        });

      return match || null;
    } catch (e) {
      // A failed duplicate check must never block recording the order.
      console.error("Duplicate check failed: ", e);
      return null;
    }
  };

  // Fills only what is empty, so nothing already typed is overwritten, and
  // reports what it did rather than changing fields silently.
  const applyPastedMessage = () => {
    const parsed = parseMessengerText(pasteText);
    const updates = {};
    const filled = [];

    if (parsed.phones[0] && !formData.primaryPhone) {
      updates.primaryPhone = parsed.phones[0];
      filled.push("phone");
    }
    if (parsed.phones[1] && !formData.secondaryPhone) {
      updates.secondaryPhone = parsed.phones[1];
      filled.push("second phone");
    }
    if (parsed.city && !formData.city) {
      updates.city = parsed.city;
      filled.push("city");
      const derivedState = stateForCity(parsed.city);
      if (derivedState && !formData.state) {
        updates.state = derivedState;
        filled.push("state");
      }
    }
    if (parsed.address && !formData.address) {
      updates.address = parsed.address;
      filled.push("address");
    }

    if (updates.state) setStateError(false);
    setFormData((prevState) => ({ ...prevState, ...updates }));
    setPasteSummary(
      filled.length > 0
        ? `Filled ${filled.join(", ")}. Check everything before saving.`
        : "Nothing recognised in that message — fill the fields in by hand."
    );
  };

  const resetForNextOrder = () => {
    // Brand is kept (batches tend to share one); everything customer-specific
    // is cleared, including state, so nothing carries over unnoticed.
    setFormData(EMPTY_FORM);
    setStateError(false);
    setPasteText("");
    setPasteSummary("");
    nameInputRef.current?.focus();
  };

  const save = async () => {
    const data = {
      ...formData,
      primaryPhone: normalizeMyanmarPhone(formData.primaryPhone),
      secondaryPhone: normalizeMyanmarPhone(formData.secondaryPhone),
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
      if (addAnotherRef.current) {
        setSnack({
          open: true,
          message: `Order for ${formData.name} saved. Ready for the next one.`,
          color: "success",
          icon: "check",
        });
        resetForNextOrder();
        setIsLoading(false);
      } else {
        setSnack({ open: true, message: "Order create success.", color: "success", icon: "check" });
        routeToHistory();
      }
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
      primaryPhone: normalizeMyanmarPhone(formData.primaryPhone),
      secondaryPhone: normalizeMyanmarPhone(formData.secondaryPhone),
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

    // Select does not take part in native form validation, so check it here.
    if (!formData.state) {
      setStateError(true);
      setSnack({
        open: true,
        message: "Please choose a state before saving.",
        color: "error",
        icon: "warning",
      });
      return;
    }

    const normalizedPrimaryPhone = normalizeMyanmarPhone(formData.primaryPhone);
    const normalizedSecondaryPhone = normalizeMyanmarPhone(formData.secondaryPhone);
    if (!normalizedPrimaryPhone || normalizedSecondaryPhone === null) {
      setSnack({
        open: true,
        message: "Enter Myanmar phone numbers in a valid 09 or +959 format.",
        color: "error",
        icon: "warning",
      });
      return;
    }

    isSubmittingRef.current = true;
    setIsLoading(true);
    try {
      if (id) {
        await update();
        return;
      }
      const sameDay = await findSameDayOrder(
        formData.primaryPhone,
        formData.secondaryPhone
      );
      if (sameDay) {
        // Hold the save until confirmed; the dialog resumes it.
        setDuplicate(sameDay);
        setIsLoading(false);
        return;
      }
      await save();
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const confirmDuplicateSave = async () => {
    setDuplicate(null);
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsLoading(true);
    try {
      await save();
    } finally {
      isSubmittingRef.current = false;
    }
  };

  // Everything downstream reports amount minus delivery fees, so show that
  // figure while it is being typed rather than after the fact.
  const productSales = (Number(formData.amount) || 0) - (Number(formData.deliveryFees) || 0);

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

                  {!id && (
                    <Accordion sx={{ mt: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <MDTypography variant="button" fontWeight="medium">
                          Paste from Messenger
                        </MDTypography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <MDInput
                          type="text"
                          label="Paste the customer's message"
                          variant="outlined"
                          fullWidth
                          multiline
                          minRows={3}
                          maxRows={8}
                          value={pasteText}
                          onChange={(e) => setPasteText(e.target.value)}
                        />
                        <MDBox
                          mt={1.5}
                          display="flex"
                          flexDirection={{ xs: "column", sm: "row" }}
                          alignItems={{ xs: "stretch", sm: "center" }}
                          gap={1.5}
                        >
                          <MDButton
                            type="button"
                            variant="gradient"
                            color="info"
                            size="small"
                            onClick={applyPastedMessage}
                            disabled={pasteText.trim() === ""}
                          >
                            Fill from message
                          </MDButton>
                          <MDTypography variant="caption" color="text">
                            {pasteSummary ||
                              "Picks out phone numbers and the city. Only fills empty fields."}
                          </MDTypography>
                        </MDBox>
                      </AccordionDetails>
                    </Accordion>
                  )}

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
                          autoFocus={!id}
                          inputRef={nameInputRef}
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
                        <FormControl fullWidth variant="outlined" error={stateError}>
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
                          {stateError && <FormHelperText>Choose a state.</FormHelperText>}
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
                    <Grid size={{ xs: 12 }}>
                      <MDBox mb={2} mt={-1}>
                        <MDTypography
                          variant="caption"
                          color={productSales < 0 ? "error" : "text"}
                          fontWeight="medium"
                        >
                          {productSales < 0
                            ? "Delivery fees are more than the total amount — check these figures."
                            : `Product sales after delivery fees: ${formattedAmount(productSales)}`}
                        </MDTypography>
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
                            onChange={handlePaymentStatusChange}
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
                            <MenuItem value="NoPay" disabled={formData.paymentStatus === "Paid"}>
                              Not Yet Paid
                            </MenuItem>
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

                  {/* The form is long, so on small screens the actions stick to
                      the bottom rather than living a scroll away. */}
                  <MDBox
                    mt={2}
                    mb={1}
                    sx={{
                      position: { xs: "sticky", md: "static" },
                      bottom: 0,
                      zIndex: 2,
                      pt: { xs: 1.5, md: 0 },
                      pb: { xs: 1, md: 0 },
                      backgroundColor: ({ palette }) =>
                        darkMode ? palette.background.card : palette.white.main,
                      borderTop: { xs: "1px solid", md: "none" },
                      borderColor: "grey.300",
                    }}
                  >
                    <MDBox display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={1.5}>
                      {!id && (
                        // Both buttons submit so native required-field
                        // validation still runs; onClick records which was used
                        // before the submit handler reads it.
                        <MDButton
                          type="submit"
                          variant="outlined"
                          color="info"
                          fullWidth
                          disabled={isLoading}
                          onClick={() => {
                            addAnotherRef.current = true;
                          }}
                        >
                          Save &amp; Add Another
                        </MDButton>
                      )}
                      <MDButton
                        type="submit"
                        variant="gradient"
                        color="info"
                        fullWidth
                        disabled={isLoading}
                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                        onClick={() => {
                          addAnotherRef.current = false;
                        }}
                      >
                        {isLoading ? (id ? "Updating…" : "Creating…") : id ? "Update" : "Create"}
                      </MDButton>
                    </MDBox>
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
        <Dialog open={Boolean(duplicate)} onClose={() => setDuplicate(null)}>
          <DialogTitle>
            <MDTypography variant="h5" component="span" fontWeight="medium">
              Possible duplicate order
            </MDTypography>
          </DialogTitle>
          <DialogContent sx={{ width: { xs: "320px", md: "440px" } }}>
            <MDTypography variant="body2" color="text">
              {duplicate
                ? `${duplicate.name || "This customer"} (${
                    duplicate.primaryPhone
                  }) already has an order recorded today for ${formattedAmount(
                    duplicate.amount || 0
                  )}. Matched by phone number.`
                : ""}
            </MDTypography>
            <MDBox mt={1}>
              <MDTypography variant="body2" color="text">
                Save this as a separate order anyway?
              </MDTypography>
            </MDBox>
          </DialogContent>
          <DialogActions>
            <MDButton variant="gradient" color="light" onClick={() => setDuplicate(null)}>
              Cancel
            </MDButton>
            <MDButton variant="gradient" color="info" onClick={confirmDuplicateSave}>
              Save anyway
            </MDButton>
          </DialogActions>
        </Dialog>
        {renderSnackBar}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Order;
