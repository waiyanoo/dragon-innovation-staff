// PrivateRoute.js
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import PropTypes from "prop-types";
import myGif from "../assets/images/loading.gif";
import MDBox from "../components/MDBox";

export default function PrivateRoute({ children }) {
  const { authUser, loading } = useAuth();

  if (loading) return (
    <MDBox display="flex" justifyContent="center" alignItems="center" style={{ height: "100vh" }}>
      <img src={myGif} alt="loading" width="100"/>
    </MDBox>
  );

  return authUser ? children : <Navigate to="/authentication/sign-in" replace />;
}

PrivateRoute.propTypes = {
  children: PropTypes.node,
};
