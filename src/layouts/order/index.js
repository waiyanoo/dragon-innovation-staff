import MDBox from "../../components/MDBox";
import DashboardNavbar from "../../examples/Navbars/DashboardNavbar";
import DashboardLayout from "../../examples/LayoutContainers/DashboardLayout";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDTypography from "../../components/MDTypography";
import MDInput from "../../components/MDInput";
import { CircularProgress, FormControl, InputLabel, Select } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import { useEffect, useState } from "react";
import MDButton from "../../components/MDButton";
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useNavigate, useSearchParams } from "react-router-dom";
import { database } from "../../firebase";
import { State_List } from "../../data/common";
import MDSnackbar from "../../components/MDSnackbar";
import { useAuth } from "../../context/AuthContext";


function Order() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userData } = useAuth();
  const id  = searchParams.get('id');

  const [brand, setBrand] = useState('hanskin');
  const [orderRef, setOrderRef] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', color: 'success', icon: 'check' });
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    primaryPhone: "",
    secondaryPhone: "",
    address: "",
    state:"",
    city: "",
    items: "",
    amount: "",
    paymentStatus: "COD",
    deliveryType: "1",
    paymentMode: "NoPay",
    remark: "",
    status: 0,
    invoiceNumber: "",
  })

  useEffect(() => {
    async function fetchOrder() {
      const docRef = doc(database, 'orders', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setOrderRef(docRef);
        setFormData(docSnap.data());
      } else {
        navigate(`/order`);
      }
    }

    if(id){
      fetchOrder();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleBrandChange = (e) => {
    const { value } = e.target;
    setBrand(value);
  }

  const save = async () => {
    const data ={
      ...formData,
      orderType: userData.role === 'sales' ? 'wholesale' : "retail",
      brand: brand,
      createdBy: userData.name,
      createdAt: serverTimestamp(),
      updateHistory: [
        {
          updatedAt: new Date(),
          updatedBy: userData.name
        }
      ]

    }

    try {
      await addDoc(collection(database, 'orders'), data);
      setSnack({ open: true, message: 'Order create success.', color: 'success', icon: 'check' })
      navigate(`/history/${brand}`);
    } catch (e) {
      setSnack({ open: true, message: 'Order create failed.', color: 'error', icon: 'warning' })
      setLoading(false);
    }
  }

  const update = async () => {
    let data ={
      ...formData
    }
    data.updateHistory.push({
      updatedAt: new Date(),
      updatedBy: userData.name
    })

    try {
      await updateDoc(orderRef, data);
      setSnack({ open: true, message: 'Order update success.', color: 'success', icon: 'check' })
      navigate(`/history/${brand}`);
    } catch (e) {
      setSnack({ open: true, message: 'Order update failed.', color: 'error', icon: 'warning' })
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page reload
    setIsLoading(true);
    if(id){
      await update();
    } else {
      await save();
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

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={8}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={8} lg={6}>
            <Card id="order-form">
              <MDBox
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="success"
                mx={2}
                mt={-3}
                p={3}
                mb={1}
                textAlign="center"
              >
                <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
                  Dragon Innovation
                </MDTypography>
                <MDTypography display="block" variant="button" color="white" my={1}>
                  Submit your order
                </MDTypography>
              </MDBox>
              <MDBox pt={4} pb={3} px={3}>
                <MDBox component="form" onSubmit={handleSubmit} role="form">
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
                  <MDBox mb={2}>
                    <MDInput
                      type="text"
                      name="name"
                      label="Facebook Name"
                      variant="outlined"
                      value={formData.name}
                      onChange={handleChange}
                      fullWidth />
                  </MDBox>
                  <MDBox mb={2}>
                    <MDInput
                      type="text"
                      name="primaryPhone"
                      label="Primary Phone Number"
                      variant="outlined"
                      value={formData.primaryPhone}
                      onChange={handleChange}
                      fullWidth
                    />
                  </MDBox>
                  <MDBox mb={2}>
                    <MDInput
                      type="text"
                      label="Secondary Phone Number"
                      variant="outlined"
                      name="secondaryPhone"
                      value={formData.secondaryPhone}
                      onChange={handleChange}
                      fullWidth
                    />
                  </MDBox>
                  <MDBox mb={2}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="state-select-label">State</InputLabel>
                      <Select
                        labelId="state-select-label"
                        id="state-select"
                        value={formData.state}
                        label="state"
                        name="state"
                        onChange={handleChange}
                        sx={{ lineHeight: "3rem" }}
                       variant="outlined"
                      >
                        {State_List.map((item) => (
                            <MenuItem key={item} value={item}>{item}</MenuItem>
                          ))
                        }
                      </Select>
                    </FormControl>
                  </MDBox>
                  <MDBox mb={2}>
                    <MDInput
                      type="text"
                      label="City"
                      variant="outlined"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      fullWidth
                    />
                  </MDBox>
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
                      rows={4}
                    />
                  </MDBox>
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
                      rows={4}
                    />
                  </MDBox>
                  <MDBox mb={2}>
                    <MDInput
                      type="text"
                      name="amount"
                      label="Amount"
                      variant="outlined"
                      value={formData.amount}
                      onChange={handleChange}
                      fullWidth
                    />
                  </MDBox>
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
                      </Select>
                    </FormControl>
                  </MDBox>
                  <MDBox mb={2}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="delivery-select-label">Delivery Mode</InputLabel>
                      <Select
                        labelId="delivery-select-label"
                        id="delivery-select"
                        value={formData.deliveryType}
                        label="PaymentStatus"
                        name="paymentStatus"
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
                  <MDBox mb={2}>
                    <MDInput
                      type="text"
                      label="Remark"
                      variant="outlined"
                      fullWidth
                      multiline
                      name="remark"
                      value={formData.remark}
                      onChange={handleChange}
                      rows={4}
                    />
                  </MDBox>
                  <MDBox mt={4} mb={1}>
                    <MDButton type="submit" variant="gradient" color="info" fullWidth
                              disabled={isLoading}
                              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}>
                      {id ? 'Update' : 'Create'}
                    </MDButton>
                  </MDBox>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
        {renderSnackBar}
      </MDBox>
    </DashboardLayout>
  );
}

export default Order;
