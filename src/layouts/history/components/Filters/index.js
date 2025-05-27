import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MDTypography from "../../../../components/MDTypography";
import MDBox from "../../../../components/MDBox";
import { useEffect, useState } from "react";
import Checkbox from "@mui/material/Checkbox";
import PropTypes from "prop-types";

import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import MDButton from "../../../../components/MDButton";

function FilterOrders({ filerChange }) {
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
    orderDate: "",
  });
  const [orderDate, setOrderDate] = useState(null);

  const handleChange = (event) => {
    console.log(event);
    setCheckedItems({
      ...checkedItems,
      [event.target.name]: event.target.checked,
    });
  };

  const dateChange = (date) => {
    setCheckedItems({
      ...checkedItems,
      orderDate: date.toISOString(),
    });
  };

  const setNoDate = () => {
    setOrderDate(null);
    setCheckedItems({
      ...checkedItems,
      orderDate: "",
    });
  };

  useEffect(() => {
    filerChange(checkedItems);
  }, [checkedItems]);

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <MDTypography variant="button" fontWeight="light">
          Filters
        </MDTypography>
      </AccordionSummary>
      <AccordionDetails sx={{ padding: "5px" }}>
        <MDTypography variant="button" fontWeight="medium" pl={1}>
          Shipment Status
        </MDTypography>
        <MDBox display="flex" alignItems="center" justifyContent="left" px={1}>
          <FormGroup row sx={{ gap: 1 }}>
            <FormControlLabel
              control={<Checkbox name="pending" onChange={handleChange} checked={checkedItems.pending}/>}
              label="Pending"
            />
            <FormControlLabel
              control={<Checkbox name="packed" onChange={handleChange} checked={checkedItems.packed}/>}
              label="Packed"
            />
            <FormControlLabel
              control={<Checkbox name="shipped" onChange={handleChange} checked={checkedItems.shipped}/>}
              label="Shipped"
            />
          </FormGroup>
        </MDBox>

        <MDTypography variant="button" fontWeight="medium" pl={1}>
          Payment Status
        </MDTypography>
        <MDBox display="flex" alignItems="center" justifyContent="left" px={1}>
          <FormGroup row sx={{ gap: 1 }}>
            <FormControlLabel
              control={<Checkbox name="cod" onChange={handleChange} checked={checkedItems.cod} />}
              label="COD"
            />
            <FormControlLabel
              control={<Checkbox name="fullPaid" onChange={handleChange} checked={checkedItems.fullPaid}/>}
              label="Full Paid"
            />
            <FormControlLabel
              control={<Checkbox name="other" onChange={handleChange} checked={checkedItems.other}/>}
              label="Other"
            />
          </FormGroup>
        </MDBox>

        <MDTypography variant="button" fontWeight="medium" pl={1}>
          Payment Type
        </MDTypography>
        <MDBox display="flex" alignItems="center" justifyContent="left" px={1}>
          <FormGroup row sx={{ gap: 1 }}>
            <FormControlLabel
              control={<Checkbox name="cash" onChange={handleChange} checked={checkedItems.cash}/>}
              label="Cash"
            />
            <FormControlLabel
              control={<Checkbox name="kpay" onChange={handleChange} checked={checkedItems.kpay}/>}
              label="KPay"
            />
            <FormControlLabel
              control={<Checkbox name="bank" onChange={handleChange} checked={checkedItems.bank}/>}
              label="Bank"
            />
          </FormGroup>
        </MDBox>
        <MDTypography variant="button" fontWeight="medium" pl={1}>
          Order Date
        </MDTypography>
        <MDBox display="flex" alignItems="center" gap={2} justifyContent="left" px={1} mb={1}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={["DatePicker"]}>
              <DatePicker
                name="orderDate"
                label="Choose Order Date"
                value={orderDate}
                onChange={dateChange}
                slotProps={{
                  textField: {
                    placeholder: "dd/mm/yyyy",
                  },
                }}
              />
            </DemoContainer>
          </LocalizationProvider>
          <FormGroup row sx={{ gap: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  name="orderDate"
                  onChange={setNoDate}
                  checked={checkedItems.orderDate === ""}
                />
              }
              label="No Date"
            />
          </FormGroup>
        </MDBox>
        <MDBox display="flex" alignItems="center" gap={2} justifyContent="center" px={1} my={2}>
          <MDButton type="button" variant="gradient" color="info" size="small"
                    onClick={() => setCheckedItems({
                      pending: false,
                      packed: false,
                      shipped: false,
                      cod: false,
                      fullPaid: false,
                      other: false,
                      cash: false,
                      kpay: false,
                      bank: false,
                      orderDate: "",})}>
            Reset</MDButton>
        </MDBox>
      </AccordionDetails>
    </Accordion>
  );
}

FilterOrders.propTypes = {
  filerChange: PropTypes.func,
};

export default FilterOrders;
