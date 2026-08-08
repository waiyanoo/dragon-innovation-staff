import { Component } from "react";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

/**
 * Catches render errors so one bad record cannot blank the whole screen.
 *
 * This exists because a single order missing its `items` field threw during
 * render and, with the order list rendering in one tree, took the entire
 * history page down rather than just its own row. Data written before a field
 * existed will keep finding new ways to be incomplete, so the app needs to
 * fail in a contained way.
 *
 * Pass `resetKey` (the current pathname) so navigating away clears the error.
 * Without that, a crash on one page would persist across every later route and
 * strand the user. The key is compared rather than used as a React `key` on
 * purpose: remounting the subtree on every navigation would throw away page
 * state and refetch data even when nothing had gone wrong.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // No error reporting service is wired up, so the console is the record.
    console.error("Unhandled UI error:", error, info && info.componentStack);
  }

  componentDidUpdate(prevProps) {
    const { resetKey } = this.props;
    const { error } = this.state;
    if (error && prevProps.resetKey !== resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    const { error } = this.state;
    const { children } = this.props;

    if (!error) return children;

    return (
      <MDBox
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        p={3}
      >
        <Card sx={{ maxWidth: 520, width: "100%" }}>
          <MDBox p={3} textAlign="center">
            <MDTypography variant="h1" color="warning" sx={{ lineHeight: 1 }}>
              <Icon fontSize="inherit">report_problem</Icon>
            </MDTypography>
            <MDBox mt={1} mb={1}>
              <MDTypography variant="h5">Something went wrong on this page</MDTypography>
            </MDBox>
            <MDTypography variant="body2" color="text">
              Nothing you entered has been lost unless you were part-way through a form. Try
              reloading — if it keeps happening, send this message to whoever maintains the portal.
            </MDTypography>
            {error.message && (
              <MDBox
                mt={2}
                p={1.5}
                borderRadius="lg"
                sx={{ backgroundColor: "grey.100", overflowWrap: "anywhere" }}
              >
                <MDTypography variant="caption" color="text" fontWeight="medium">
                  {error.message}
                </MDTypography>
              </MDBox>
            )}
            <MDBox
              mt={3}
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              justifyContent="center"
              gap={1.5}
            >
              <MDButton
                variant="gradient"
                color="info"
                onClick={() => window.location.reload()}
              >
                Reload page
              </MDButton>
              {/* A full page load, not a router link: the broken subtree is
                  still mounted, so a soft navigation may re-throw. */}
              <MDButton variant="outlined" color="info" href="/dashboard">
                Back to dashboard
              </MDButton>
            </MDBox>
          </MDBox>
        </Card>
      </MDBox>
    );
  }
}

ErrorBoundary.defaultProps = {
  resetKey: "",
};

ErrorBoundary.propTypes = {
  children: PropTypes.node,
  resetKey: PropTypes.string,
};

export default ErrorBoundary;
