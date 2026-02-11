import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  // TEMP: token check (will be replaced with real auth logic)
  const token = localStorage.getItem("accessToken");

  // If token exists → allow access
  // Else → redirect to login
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
