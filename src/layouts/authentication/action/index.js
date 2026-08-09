// @mui material components
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Firebase
import {
  verifyPasswordResetCode,
  confirmPasswordReset,
  applyActionCode,
} from "firebase/auth";
import { auth } from "../../../firebase";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Images
import bgImage from "assets/images/bg-reset-cover.jpeg";

import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

function Action() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");

  // status: "loading" | "form" | "success" | "error"
  const [status, setStatus] = useState("loading");
  const [heading, setHeading] = useState("");
  const [message, setMessage] = useState("");
  const [accountEmail, setAccountEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Verify the action code when the page loads.
  useEffect(() => {
    if (!oobCode) {
      setStatus("error");
      setHeading("Invalid Link");
      setMessage("This link is missing required information. Please request a new one.");
      return;
    }

    const run = async () => {
      try {
        if (mode === "resetPassword") {
          const email = await verifyPasswordResetCode(auth, oobCode);
          setAccountEmail(email);
          setStatus("form");
        } else if (mode === "verifyEmail" || mode === "recoverEmail") {
          await applyActionCode(auth, oobCode);
          setStatus("success");
          setHeading(mode === "verifyEmail" ? "Email Verified" : "Email Recovered");
          setMessage(
            mode === "verifyEmail"
              ? "Your email address has been verified. You can now sign in."
              : "Your account email has been restored. You can now sign in."
          );
        } else {
          setStatus("error");
          setHeading("Unsupported Request");
          setMessage("This action is not supported.");
        }
      } catch (error) {
        setStatus("error");
        setHeading("Link Expired");
        setMessage("This link is invalid or has already been used. Please request a new one.");
      }
    };

    run();
  }, [mode, oobCode]);

  const handleReset = async () => {
    setFormError("");

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setFormError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setStatus("success");
      setHeading("Password Changed");
      setMessage("Your password has been updated. You can now sign in with your new password.");
    } catch (error) {
      setFormError("Could not reset password. The link may have expired. Please request a new one.");
      setSubmitting(false);
    }
  };

  const headerTitle =
    status === "form" ? "Reset Password" : status === "loading" ? "Please wait" : heading;

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
            {headerTitle}
          </MDTypography>
          {status === "form" && (
            <MDTypography display="block" variant="button" color="white" my={1}>
              {accountEmail ? `for ${accountEmail}` : "Enter your new password below."}
            </MDTypography>
          )}
        </MDBox>

        <MDBox pt={4} pb={3} px={3}>
          {status === "loading" && (
            <MDBox display="flex" justifyContent="center" py={3}>
              <CircularProgress color="info" />
            </MDBox>
          )}

          {status === "form" && (
            <MDBox
              component="form"
              role="form"
              onSubmit={(e) => {
                e.preventDefault();
                if (!submitting) handleReset();
              }}
            >
              <MDBox mb={2}>
                <MDInput
                  type="password"
                  label="New Password"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </MDBox>
              <MDBox mb={2}>
                <MDInput
                  type="password"
                  label="Confirm New Password"
                  fullWidth
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </MDBox>
              {formError && (
                <MDTypography variant="button" color="error">
                  {formError}
                </MDTypography>
              )}
              <MDBox mt={3} mb={1}>
                <MDButton
                  variant="gradient"
                  color="info"
                  fullWidth
                  type="submit"
                  disabled={submitting || password === "" || confirm === ""}
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  reset password
                </MDButton>
              </MDBox>
            </MDBox>
          )}

          {(status === "success" || status === "error") && (
            <MDBox textAlign="center">
              <MDTypography variant="button" color={status === "success" ? "text" : "error"}>
                {message}
              </MDTypography>
            </MDBox>
          )}

          {status !== "loading" && (
            <MDBox mt={3} textAlign="center">
              <MDTypography variant="button" color="secondary">
                Back to{" "}
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
          )}
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Action;
