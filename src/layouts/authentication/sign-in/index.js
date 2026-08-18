import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import PageLayout from "examples/LayoutContainers/PageLayout";

import companyLogoLight from "assets/images/DragonInnovation.png";
import companyLogoDark from "assets/images/DragonInnovationDark.png";
import { login, logout } from "../../../services/authService";
import { doc, getDoc } from "firebase/firestore";
import { database } from "../../../firebase";

const BENEFITS = [
  { icon: "assignment_turned_in", label: "One clear order record from admin to warehouse" },
  { icon: "inventory_2", label: "Faster packing and delivery coordination" },
  { icon: "insights", label: "Sales and commission visibility for every team" },
];

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState(false);
  const [suspended, setSuspended] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const signIn = async (event) => {
    event.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setErrors(false);
    setSuspended(false);

    try {
      const credential = await login(email, password);
      const userSnapshot = await getDoc(doc(database, "users", credential.user.uid));
      if (userSnapshot.exists() && userSnapshot.data().status === "suspended") {
        await logout();
        setSuspended(true);
        setIsLoading(false);
        return;
      }
      navigate("/dashboard");
    } catch {
      setErrors(true);
      setIsLoading(false);
    }
  };

  return (
    <PageLayout>
      <MDBox
        minHeight="100vh"
        width="100%"
        position="relative"
        overflow="hidden"
        sx={{
          background:
            "radial-gradient(circle at 8% 12%, rgba(50, 93, 154, 0.42), transparent 31%), linear-gradient(125deg, #172f55 0%, #0b1d33 52%, #082a31 100%)",
          "&::before": {
            content: '""',
            position: "absolute",
            width: 560,
            height: 560,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow: "0 0 0 70px rgba(255,255,255,0.025), 0 0 0 140px rgba(255,255,255,0.018)",
            top: -310,
            right: -170,
          },
          "&::after": {
            content: '""',
            position: "absolute",
            width: 380,
            height: 380,
            borderRadius: "50%",
            background: "rgba(218, 172, 66, 0.06)",
            bottom: -260,
            left: "36%",
          },
        }}
      >
        <Grid
          container
          minHeight="100vh"
          maxWidth="1280px"
          mx="auto"
          px={{ xs: 2, sm: 4, md: 6 }}
          py={{ xs: 3, md: 5 }}
          alignItems="center"
          position="relative"
          zIndex={1}
        >
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: { xs: "none", md: "block" } }}>
            <MDBox maxWidth="560px" pr={{ md: 5, lg: 8 }}>
              <MDBox
                component="img"
                src={companyLogoLight}
                alt="Dragon Innovation"
                width="190px"
                height="auto"
                mb={2.5}
              />
              <MDTypography
                variant="h2"
                color="white"
                fontWeight="bold"
                sx={{ fontSize: { md: "2.65rem", lg: "3.25rem" }, lineHeight: 1.08 }}
              >
                Every order, clearly handed over.
              </MDTypography>
              <MDTypography
                variant="h6"
                mt={2.5}
                mb={4}
                sx={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.65, fontWeight: 400 }}
              >
                A shared workspace for admin, sales and warehouse teams to move orders from
                customer request to packing and delivery.
              </MDTypography>

              <MDBox display="flex" flexDirection="column" gap={2}>
                {BENEFITS.map((benefit) => (
                  <MDBox key={benefit.icon} display="flex" alignItems="center" gap={1.5}>
                    <MDBox
                      width="2.6rem"
                      height="2.6rem"
                      borderRadius="50%"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      sx={{ backgroundColor: "rgba(255,255,255,0.09)", color: "#f0c85a" }}
                    >
                      <Icon>{benefit.icon}</Icon>
                    </MDBox>
                    <MDTypography variant="button" color="white" fontWeight="medium">
                      {benefit.label}
                    </MDTypography>
                  </MDBox>
                ))}
              </MDBox>
            </MDBox>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} display="flex" justifyContent={{ xs: "center", md: "flex-end" }}>
            <Card
              sx={{
                width: "100%",
                maxWidth: 500,
                borderRadius: { xs: "20px", sm: "28px" },
                boxShadow: "0 28px 80px rgba(2, 12, 27, 0.38)",
                overflow: "visible",
              }}
            >
              <MDBox p={{ xs: 3, sm: 5 }}>
                <MDBox display="flex" alignItems="center" gap={1.5} mb={3.5}>
                  <MDBox
                    component="img"
                    src={companyLogoDark}
                    alt="Dragon Innovation"
                    width={{ xs: "86px", sm: "105px" }}
                    height="auto"
                  />
                  <MDBox>
                    <MDTypography variant="h6" fontWeight="bold" color="dark">
                      Staff Portal
                    </MDTypography>
                    <MDTypography variant="caption" color="text">
                      Internal order workspace
                    </MDTypography>
                  </MDBox>
                </MDBox>

                <MDTypography variant="h3" fontWeight="bold" color="dark" mb={0.75}>
                  Welcome back
                </MDTypography>
                <MDTypography variant="body2" color="text" mb={3}>
                  Sign in with your staff account to continue.
                </MDTypography>

                <MDBox component="form" role="form" onSubmit={signIn}>
                  <MDBox mb={2}>
                    <MDInput
                      type="email"
                      label="Email address"
                      fullWidth
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </MDBox>
                  <MDBox mb={1.5}>
                    <MDInput
                      type="password"
                      label="Password"
                      fullWidth
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </MDBox>

                  {(errors || suspended) && (
                    <MDBox
                      mb={2}
                      px={1.5}
                      py={1.25}
                      borderRadius="lg"
                      display="flex"
                      alignItems="flex-start"
                      gap={1}
                      sx={{ backgroundColor: "rgba(244, 67, 54, 0.08)" }}
                    >
                      <Icon color="error" fontSize="small">error_outline</Icon>
                      <MDTypography variant="caption" color="error" fontWeight="medium">
                        {suspended
                          ? "Your account has been suspended. Contact an administrator."
                          : "The email or password is incorrect. Please try again."}
                      </MDTypography>
                    </MDBox>
                  )}

                  <MDBox display="flex" justifyContent="flex-end" mb={2.5}>
                    <MDTypography
                      component={Link}
                      to="/authentication/reset-password"
                      variant="button"
                      color="info"
                      fontWeight="medium"
                    >
                      Forgot password?
                    </MDTypography>
                  </MDBox>

                  <MDButton
                    type="submit"
                    variant="gradient"
                    color="info"
                    fullWidth
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                    sx={{ minHeight: 48, fontSize: "0.9rem" }}
                  >
                    {isLoading ? "Signing in…" : "Sign in"}
                  </MDButton>
                </MDBox>

                <MDBox mt={3} pt={2.5} sx={{ borderTop: "1px solid", borderColor: "grey.200" }}>
                  <MDTypography variant="caption" color="text" display="block" textAlign="center">
                    Secure access for authorised Dragon Innovation staff only.
                  </MDTypography>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </PageLayout>
  );
}

export default SignIn;
