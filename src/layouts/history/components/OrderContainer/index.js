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

function OrderContainer() {
  return (
    <Card id="delete-account">
      <MDBox pt={3} px={2}>
        <MDTypography variant="h6" fontWeight="medium">
          Order History
        </MDTypography>
      </MDBox>
      <MDBox pt={1} pb={2} px={2}>
        <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
          <OrderCard data={data} invoiceNumber="" noGutter />
          <OrderCard data={data} invoiceNumber="HS-12345" noGutter />
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default OrderContainer;
