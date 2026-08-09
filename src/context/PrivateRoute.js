// PrivateRoute.js
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import PropTypes from "prop-types";
import BrandedLoader from "../components/BrandedLoader";

export default function PrivateRoute({ children, roles }) {
  const { authUser, loading, userData } = useAuth();

  if (loading) return <BrandedLoader label="Preparing your workspace…" fullPage />;
  if(authUser)
    if(!roles.includes(userData.role)) return <Navigate to="/unauthorized" replace />

  return authUser ? children : <Navigate to="/authentication/sign-in" replace />;
}

PrivateRoute.propTypes = {
  children: PropTypes.node,
  roles: PropTypes.array,
};
