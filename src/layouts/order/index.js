import MDBox from "../../components/MDBox";
import DashboardNavbar from "../../examples/Navbars/DashboardNavbar";
import DashboardLayout from "../../examples/LayoutContainers/DashboardLayout";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDTypography from "../../components/MDTypography";
import MDInput from "../../components/MDInput";
import { FormControl, InputLabel, Select } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import MDButton from "../../components/MDButton";
import { collection, addDoc, getDocs , serverTimestamp} from 'firebase/firestore';
import { useNavigate } from "react-router-dom";
import { auth, database } from "../../firebase";



function Order() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [brand, setBrand] = useState('hanskin');
  const [formData, setFormData] = useState({
    name: "",
    primaryPhone: "",
    secondaryPhone: "",
    address: "",
    items: "",
    amount: "",
    paymentStatus: "COD",
    deliveryType: "1",
    paymentMode: "NoPay",
    remark: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("what is name", name, value)
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleBrandChange = (e) => {
    const { value } = e.target;
    setBrand(value);
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page reload
    console.log("Form submitted:", formData);

    const data ={
      ...formData,
      createdBy: user.uid,
      updatedAt: serverTimestamp(),
      updatedBy: user.uid
    }

    try {
      const docRef = await addDoc(collection(database, brand), data);
      console.log('Document written with ID: ', docRef.id);
      navigate(`/history/${brand}`);
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

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
                    <MDButton type="submit" variant="gradient" color="info" fullWidth>
                      Create
                    </MDButton>
                  </MDBox>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default Order;
