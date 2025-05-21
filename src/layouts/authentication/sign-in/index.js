import { useEffect, useState } from "react";

// react-router-dom components
import { useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";

// @mui icons

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Images
import bgImage from "assets/images/bg-sign-in-basic.jpeg";
import { login } from "../../../services/authService";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase";

function Basic() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  const navigate = useNavigate();


  const signInClick = async () => {
    login(email, password)
      .then((user) => {
        console.log("what is user", user);
        navigate("/dashboard");
      })
      .catch((error) => {
        console.log("what is error", error);
      });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);
  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Dragon Innovation
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Please log in to access the internal system.
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form">
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </MDBox>
            {/*<MDBox display="flex" alignItems="center" ml={-1}>*/}
            {/*  <Switch checked={rememberMe} onChange={handleSetRememberMe} />*/}
            {/*  <MDTypography*/}
            {/*    variant="button"*/}
            {/*    fontWeight="regular"*/}
            {/*    color="text"*/}
            {/*    onClick={handleSetRememberMe}*/}
            {/*    sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}*/}
            {/*  >*/}
            {/*    &nbsp;&nbsp;Remember me*/}
            {/*  </MDTypography>*/}
            {/*</MDBox>*/}
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="info" fullWidth onClick={signInClick}>
                sign in
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Basic;
