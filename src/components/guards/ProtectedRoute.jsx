import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "@/utils/constants";
import { MainLayout } from "@/layouts/MainLayout";

const PROTECTED_ANALYTICS_PATHS = ["/analytics", "/auditoria-caja", "/inventario"];

const normalize = (s) => (typeof s === 'string' ? s.trim().toLowerCase() : s);

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();
  const token = localStorage.getItem("accessToken");
  const userRoleRaw = localStorage.getItem("userRole");
  const userRole = normalize(userRoleRaw);

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // If the requested path is one of the analytics paths, allow both admin and root explicitly
  const path = location.pathname || '';
  const isAnalyticsPath = PROTECTED_ANALYTICS_PATHS.some(p => path.startsWith(p));
  if (isAnalyticsPath && (userRole === 'admin' || userRole === 'root')) {
    return <MainLayout rol={userRole} />;
  }

  // Normalize allowed roles and compare
  const allowed = Array.isArray(allowedRoles) ? allowedRoles.map(normalize) : [];
  if (allowed.length > 0 && !allowed.includes(userRole)) {
    return <Navigate to={ROUTES.NO_AUTORIZADO} replace />;
  }

  return <MainLayout rol={userRole} />;
};

export default ProtectedRoute;
