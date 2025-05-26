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
  });

  const handleChange = (event) => {
    setCheckedItems({
      ...checkedItems,
      [event.target.name]: event.target.checked,
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
              control={<Checkbox name="pending" onChange={handleChange} />}
              label="Pending"
            />
            <FormControlLabel
              control={<Checkbox name="packed" onChange={handleChange} />}
              label="Packed"
            />
            <FormControlLabel
              control={<Checkbox name="shipped" onChange={handleChange} />}
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
              control={<Checkbox name="cod" onChange={handleChange} />}
              label="COD"
            />
            <FormControlLabel
              control={<Checkbox name="fullPaid" onChange={handleChange} />}
              label="Full Paid"
            />
            <FormControlLabel
              control={<Checkbox name="other" onChange={handleChange} />}
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
              control={<Checkbox name="cash" onChange={handleChange} />}
              label="Cash"
            />
            <FormControlLabel
              control={<Checkbox name="kpay" onChange={handleChange} />}
              label="KPay"
            />
            <FormControlLabel
              control={<Checkbox name="bank" onChange={handleChange} />}
              label="Bank"
            />
          </FormGroup>
        </MDBox>
      </AccordionDetails>
    </Accordion>
  );
}

FilterOrders.propTypes = {
  filerChange: PropTypes.func,
};

export default FilterOrders;
