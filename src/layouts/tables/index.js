

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Data
import authorsTableData from "layouts/tables/data/authorsTableData";
import projectsTableData from "layouts/tables/data/projectsTableData";
import { DataGrid } from '@mui/x-data-grid';
import { useDemoData } from '@mui/x-data-grid-generator';
import { useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { database } from "../../firebase";
import dayjs from "dayjs";
import team2 from "../../assets/images/team-2.jpg";
import MDBadge from "../../components/MDBadge";

//Name, Amount, delivery fees, invoice number
const columns= [
    { Header: "name", accessor: "name", align: "left" },
    { Header: "total amount", accessor: "amount", align: "left" },
    { Header: "invoice number", accessor: "invoiceNumber", align: "center" },
    { Header: "status", accessor: "status", align: "center" },
    { Header: "date", accessor: "date", align: "center" },
    { Header: "action", accessor: "action", align: "center" },
  ]

function Tables() {
  const { columns: pColumns, rows: pRows } = projectsTableData();
  const [isLoading, setIsLoading] = useState(true);
  const [dataColumns, setDataColumns] = useState([]);


  useEffect(() => {
      getOrders();
  },[])

  const getOrders = async () => {
    try {
      const brandRef = collection(database,  "orders" );
      const q = query(brandRef, orderBy('createdAt', 'desc'));

      const querySnapshot = await getDocs(q);

      // const orderData = querySnapshot.docs.map((doc) => ({
      //   id: doc.id,
      //   ...doc.data(),
      // }));
      generateRows(querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })));


    } catch (e) {
      console.error("Error getting documents: ", e);
    }
  };

  const TimestampDisplay = ( timestamp ) => {
    const date = timestamp.toDate();
    // const date = new Date(timestamp);
    return <p>{date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}</p>;
  }

  const generateRows = (orders) => {
    console.log("what is orders", orders);
    let rows=[];
    orders.forEach((order) => {
      rows.push({
        name: (
          <MDBox ml={-1} display="flex" flexDirection="column">
            <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
              {order.name}
            </MDTypography>
            <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
              {order.primaryPhone}
            </MDTypography>
          </MDBox>
        ),
        amount: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            {order.amount} - {order.deliveryFees}
          </MDTypography>
        ),
        invoiceNumber: (
          <MDBox ml={-1}>
            <MDBadge badgeContent="online" color="success" variant="gradient" size="sm" />
          </MDBox>
        ),
        status: (
          <MDBox ml={-1}>
            <MDBadge badgeContent="online" color="success" variant="gradient" size="sm" />
          </MDBox>
        ),
        date: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            {TimestampDisplay(order.createdAt)}
          </MDTypography>
        ),
        action: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            Edit
          </MDTypography>
        ),
      });
      console.log("Rows", rows);
      setDataColumns(rows);
    })
    setIsLoading(false);
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid size={{xs : 12}}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Authors Table
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                {
                  !isLoading &&
                  <DataTable
                    table={{ columns, rows: dataColumns }}
                    isSorted={true}
                    entriesPerPage={true}
                    showTotalEntries={true}
                    noEndBorder
                  />
                }
                {/*<div style={{ height: 300, width: '100%' }}>*/}
                {/*  <DataGrid {...data} loading={loading} />*/}
                {/*</div>*/}
              </MDBox>
            </Card>
          </Grid>
          <Grid size={{xs : 12}}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Projects Table
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns: pColumns, rows: pRows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Tables;
