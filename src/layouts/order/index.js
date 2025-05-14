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

function Order() {
  const [brand, setBrand] = useState("hanskin");
  const [payment, setPayment] = useState("cod");

  const handleChange = (event) => {
    setBrand(event.target.value);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar absolute />
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
                <MDBox component="form" role="form">
                  <MDBox mb={2}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="brand-select-label">Brand</InputLabel>
                      <Select
                        labelId="brand-select-label"
                        id="brand-select"
                        value={brand}
                        label="Brand"
                        onChange={handleChange}
                        sx={{ lineHeight: "3rem" }}
                      >
                        <MenuItem value="hanskin">Hanskin</MenuItem>
                        <MenuItem value="sugarbear">Sugarbear</MenuItem>
                        <MenuItem value="mongdies">Mongdies</MenuItem>
                      </Select>
                    </FormControl>
                  </MDBox>
                  <MDBox mb={2}>
                    <MDInput type="text" label="Facebook Name" variant="outlined" fullWidth />
                  </MDBox>
                  <MDBox mb={2}>
                    <MDInput
                      type="text"
                      label="Primary Phone Number"
                      variant="outlined"
                      fullWidth
                    />
                  </MDBox>
                  <MDBox mb={2}>
                    <MDInput
                      type="text"
                      label="Secondary Phone Number"
                      variant="outlined"
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
                      rows={4}
                    />
                  </MDBox>
                  <MDBox mb={2}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="payment-select-label">Payment</InputLabel>
                      <Select
                        labelId="payment-select-label"
                        id="payment-select"
                        value={brand}
                        label="Payment"
                        onChange={handleChange}
                        sx={{ lineHeight: "3rem" }}
                      >
                        <MenuItem value="cod">COD</MenuItem>
                        <MenuItem value="paid">Full Paid</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
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
                      rows={4}
                    />
                  </MDBox>
                  <MDBox mt={4} mb={1}>
                    <MDButton variant="gradient" color="info" fullWidth>
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
