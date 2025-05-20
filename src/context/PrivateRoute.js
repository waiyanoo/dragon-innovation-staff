// PrivateRoute.js
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import PropTypes from "prop-types";

export default function PrivateRoute({ children }) {
  const { authUser, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return authUser ? children : <Navigate to="/authentication/sign-in" replace />;
}

PrivateRoute.propTypes = {
  children: PropTypes.node,
};
