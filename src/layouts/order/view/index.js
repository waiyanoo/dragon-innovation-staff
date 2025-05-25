import MDBox from "../../../components/MDBox";
import DashboardNavbar from "../../../examples/Navbars/DashboardNavbar";
import DashboardLayout from "../../../examples/LayoutContainers/DashboardLayout";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDTypography from "../../../components/MDTypography";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, useSearchParams } from "react-router-dom";
import { database } from "../../../firebase";



function OrderView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const id  = searchParams.get('id');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const formattedAmount = new Intl.NumberFormat("en-MM", {
    style: "currency",
    currency: "MMK",
  }).format(order?.amount ? order.amount : 0);

  const deliveryTypeDisplay = order?.deliveryType ? order.deliveryType === 1 ? 'Doorstep' : order.deliveryType === 2 ? 'Car Gate' : 'Pickup' : 'N/A';

  const view = [
    {
      name: "name",
      display: "Name",
    },{
      name: "invoiceNumber",
      display: "Invoice Number",
    },{
      name: "primaryPhone",
      display: "Primary Phone",
    },{
      name: "secondaryPhone",
      display: "Secondary Phone",
    },{
      name: "address",
      display: "Address",
    },{
      name: "state",
      display: "State",
    },{
      name: "city",
      display: "City",
    },{
      name: "items",
      display: "Items",
    },{
      name: "amount",
      display: "Amount",
      functional: formattedAmount,
    },{
      name: "paymentStatus",
      display: "Payment Status",
    },{
      name: "deliveryType",
      display: "Delivery Type",
      functional: deliveryTypeDisplay,
    },{
      name: "paymentMode",
      display: "Payment Mode",
    },{
      name: "remark",
      display: "Remark",
    },
  ]



  useEffect(() => {
    async function fetchOrder() {
      const docRef = doc(database, 'orders', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setOrder(docSnap.data());
        console.log("order", docSnap.data())
        setLoading(false);
      } else {
        navigate(`/order`);
      }
    }

    if(id){
      fetchOrder();
    }
  }, [id]);

  useEffect(() => {
    console.log("order", order)
  }, [order])

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {
        order !== null &&
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
                  <MDTypography display="block"  variant="h6" color="white" my={1}>
                    {order.brand.toUpperCase()}
                  </MDTypography>
                </MDBox>
                <MDBox pt={4} pb={3} px={3}>
                  {
                    view.map((item, index) => (
                      <MDBox key={index} display="flex" py={1} pr={2}>
                        <MDBox width={"150px"} >
                          <MDTypography variant="button" fontWeight="bold" textTransform="capitalize" >
                            {item.display}: &nbsp;
                          </MDTypography>
                        </MDBox>
                        <MDBox width={"100%"}>
                          <MDTypography variant="button" fontWeight="regular" color="text">
                            &nbsp;{item.functional ? item.functional : order[item.name] ? order[item.name] : 'N/A'}
                          </MDTypography>
                        </MDBox>
                      </MDBox>
                    ))
                  }

                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      }
    </DashboardLayout>
  );
}

export default OrderView;
