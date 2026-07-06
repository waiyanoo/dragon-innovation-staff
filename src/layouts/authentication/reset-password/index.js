// @mui material components
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../firebase";

// Images
import bgImage from "assets/images/bg-reset-cover.jpeg";
import BasicLayout from "layouts/authentication/components/BasicLayout";
import { useState } from "react";
import { Link } from "react-router-dom";

function Cover() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [color, setColor] = useState("success");

  const resetClick = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("✅ Password reset email sent! Check your inbox.");
      setColor("info");
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
      setColor("error");
    }
  }

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          py={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h3" fontWeight="medium" color="white" mt={1}>
            Reset Password
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            You will receive an e-mail for resetting your password.
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox
            component="form"
            role="form"
            onSubmit={(e) => {
              e.preventDefault();
              if (email !== "") resetClick();
            }}
          >
            <MDBox mb={3}>
              <MDInput type="email" label="Email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
            </MDBox>
            {message && <MDTypography variant="button" color={color}>{message}</MDTypography>}
            <MDBox mt={3} mb={1}>
              <MDButton variant="gradient" color="info" fullWidth disabled={email === ""} onClick={resetClick}>
                reset
              </MDButton>
            </MDBox>
          </MDBox>
          <MDBox  textAlign="center">
            <MDTypography variant="button" color="secondary">Back to {" "}
              <MDTypography
                component={Link}
                to="/authentication/sign-in"
                variant="button"
                color="info"
                fontWeight="medium"
                textGradient
              >
                Login
              </MDTypography>
            </MDTypography>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Cover;
