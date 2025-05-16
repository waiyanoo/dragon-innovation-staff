/**
 =========================================================
 * Material Dashboard 2 React - v2.2.0
 =========================================================

 * Product Page: https://www.creative-tim.com/product/material-dashboard-react
 * Copyright 2023 Creative Tim (https://www.creative-tim.com)

 Coded by www.creative-tim.com

 =========================================================

 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */

// @mui material components
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Billing page components
import OrderCard from "../OrderCard";
import { useEffect, useState } from "react";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { database } from "../../../../firebase";
import PropTypes from "prop-types";
import MDButton from "../../../../components/MDButton";
import { FormControl, InputLabel, Select } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import { useNavigate } from "react-router-dom";
import MDAlert from "../../../../components/MDAlert";

const data = {
  name: "Ko Hein Lay",
  primaryPhone: "09453159417",
  secondaryPhone: "09988327954",
  city: "Yangon",
  address: "ကနိသာယာမှတ်တိုင်ကဆင်းချယ်ရီလမ်းဆိုရောက်ပါပီ ရွှေပြည်သာ",
  items:
    "Tightening cream - 66,000ks\n" +
    "40%off -39,600ks\n" +
    "(Exp 7/25)\n" +
    "\n" +
    "Multi Oil  - 97,000ks\n" +
    "30%off -67,900ks\n" +
    " (Exp 11/25)\n" +
    "\n" +
    "Deli 3000ks\n" +
    "Total 110,500ks",
  amount: 110500,
  paymentMode: "Paid",
  deliveryType: "Express",
  paymentType: "KPay",
};

function OrderContainer({brand}) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [limitCount, setLimitCount] = useState(10);

  useEffect(() => {
    filerOrders();
  }, [brand]);

  const loadMore = () => {
    setLimitCount(limitCount + 10);
    filerOrders();
  }

  const handleBrandChange = (e) => {
    navigate(`/history/${e.target.value}`);
    setLimitCount(10);
    filerOrders();
  }

  const filerOrders = async () => {
    try {
      const brandRef = collection(database, brand);
      const q = query(
        brandRef,
        limit(limitCount),
      )

      const querySnapshot = await getDocs(q);

      const orderData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(orderData);
    } catch (e) {
      console.error("Error getting documents: ", e);
    }
  }

  return (
    <Card id="delete-account">
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
            sx={{ lineHeight: "3rem" }}
          >
            <MenuItem value="hanskin">Hanskin</MenuItem>
            <MenuItem value="sugarbear">Sugarbear</MenuItem>
            <MenuItem value="mongdies">Mongdies</MenuItem>
          </Select>
        </FormControl>
      </MDBox>
      <MDBox pt={1} pb={2} px={2}>
        <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
          {
            orders.map(order => (
              <OrderCard key={order.id} data={order} invoiceNumber="" noGutter />
            ))
          }
        </MDBox>
        <MDBox>
          {
            orders.length < limitCount ? null : <MDButton variant="gradient" color="info" fullWidth onClick={loadMore}>Load More</MDButton>
          }
          {
            orders.length === 0 ? <MDAlert color="light">
              This is no orders yet.
            </MDAlert> : null
          }
        </MDBox>
      </MDBox>
    </Card>
  );
}

OrderContainer.propTypes = {
  brand:PropTypes.string.isRequired
}

export default OrderContainer;
