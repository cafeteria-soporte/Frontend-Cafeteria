import { BrowserRouter, Routes, Route, Navigate,Outlet } from "react-router-dom";
import { ROUTES } from "@/utils/constants";
import { MainLayout } from "@/layouts/MainLayout";
import { ShiftGuard } from "@/components/guards/ShiftGuard"; // <-- Agrega este import
import { ShiftProvider } from "@/features/shifts/contexts/shiftContext"; // <-- Agrega este import
// ════════════════════════════════════════════════════════
//  AUTH  —  Gemina
// ════════════════════════════════════════════════════════
import { PantallaLogin } from "@/features/auth/pages/PantallaLogin";
import { PantallaCambioContraseña } from "@/features/auth/pages/PantallaCambioContraseña";
import { PantallaCambioContraseñaCajero } from "@/features/auth/pages/PantallaCmabioCotrasenaCajero";
import { SesionExpirada } from "@/features/auth/pages/SesionExpirada";


import { PantallaPerfil } from "@/pages/PantallaPerfil";
import { PantallaAccesoNoAutorizado } from "@/pages/PantallaAccesoNoAutorizado";
import { CuentaDesactivada } from "@/pages/CuentaDesactivada";

import { DashboardAdminPage } from "@/features/dashboard/pages/DashboardAdminPage";
import AnalyticDashboard from "@/features/dashboard/pages/AnalyticDashboard";


import { PantallaGestionAdministradores } from "@/features/users/pages/PantallaGestionAdministradores";
import { PantallaGestionCajeros } from "@/features/users/pages/PantallaGestionCajeros";

import { PantallaGestionProductos } from "@/features/products/pages/PantallaGestionProductos";
import { PantallaGestionCategorias } from "@/features/products/pages/PantallaGestionCategorias";
import FinancialDashboard from "@/features/dashboard/pages/FinancialDashboard";

import { PantallaAjusteStock } from "@/features/inventory/pages/PantallaAjusteStock";
import { HistorialMovimientosStock } from "@/features/inventory/pages/HistorialMovimeintosStock";

   
import { PantallaTurnos }                   from "@/features/shifts/pages/PantallaTurnos";
import {PantallaResultadoCierreTurno }     from "@/features/shifts/pages/PantallaResultadoCierreTurno";
import { PantallaPreTurno }                 from "@/features/shifts/pages/PantallaPre-turno";
import { PantallaVentasTurnoActual }        from "@/features/shifts/pages/PantallaVentasTurnoActual";
import { PantallaConfiguracionGlobal } from "@/pages/PantallaConfiguracionGlobal";

import { PantallaPos }                     from "@/features/pos/pages/PantallaPos";
import { PantallaVentaIndividual }          from "@/features/pos/pages/PantallaVentaIndividual";
import { PantallaDetalleVenta }            from "@/features/pos/pages/PantallaDetalleVneta";
import { PantallaComprobante }             from "@/features/pos/pages/PantallaComprobante";


import { PantallaNotificaciones } from "@/features/notifications/components/pages/PantallaNotificaciones";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("accessToken");
  const userRole = localStorage.getItem("userRole");

  if (!token) return <Navigate to={ROUTES.LOGIN} replace />;
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to={ROUTES.NO_AUTORIZADO} replace />;
  }
  return <MainLayout rol={userRole} />;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <ShiftProvider>
        <Routes>
          <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
          <Route path={ROUTES.LOGIN} element={<PantallaLogin />} />
          <Route path={ROUTES.SESION_EXPIRADA} element={<SesionExpirada />} />
          <Route path={ROUTES.CUENTA_DESACTIVADA} element={<CuentaDesactivada />} />
          <Route path={ROUTES.NO_AUTORIZADO} element={<PantallaAccesoNoAutorizado />} />

          <Route element={<ProtectedRoute allowedRoles={["root", "admin", "cajero"]} />}>
            <Route path={ROUTES.PERFIL} element={<PantallaPerfil />} />
            <Route path={ROUTES.CAMBIO_CONTRASENA} element={<PantallaCambioContraseñaCajero />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["root"]} />}>
            <Route path="/root" element={<Navigate to={ROUTES.ROOT_DASHBOARD} replace />} />
            <Route path={ROUTES.ROOT_DASHBOARD} element={<DashboardAdminPage />} />
            <Route path={ROUTES.ROOT_ADMINISTRADORES} element={<PantallaGestionAdministradores />} />
            <Route path={ROUTES.ROOT_LOGS} element={<div>Logs</div>} />
            <Route path={ROUTES.ROOT_CONFIGURACION} element={<PantallaConfiguracionGlobal />} />
            <Route path={ROUTES.ROOT_BACKUPS} element={<div>Backups</div>} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            <Route path={ROUTES.DASHBOARD} element={<DashboardAdminPage />} />
            <Route path={ROUTES.ANALYTICS} element={<AnalyticDashboard />} />
            <Route path="/auditoria-caja" element={<FinancialDashboard />} />
            <Route path={ROUTES.CAJEROS} element={<PantallaGestionCajeros />} />
            <Route path={ROUTES.PRODUCTOS} element={<PantallaGestionProductos />} />
            <Route path={ROUTES.CATEGORIAS} element={<PantallaGestionCategorias />} />
            <Route path={ROUTES.AJUSTE_STOCK} element={<PantallaAjusteStock />} />
            <Route path={ROUTES.HISTORIAL_STOCK} element={<HistorialMovimientosStock />} />
            <Route path={ROUTES.TURNOS} element={<PantallaTurnos />} />
            <Route path={ROUTES.LOGS_ADMIN} element={<div>Logs</div>} />
            <Route path={ROUTES.NOTIFICACIONES} element={<PantallaNotificaciones />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["cajero"]} />}>
            <Route path="/cajero" element={<Navigate to={ROUTES.PRE_TURNO} replace />} />
            
            <Route path={ROUTES.PRE_TURNO} element={<PantallaPreTurno />} />
            <Route path={ROUTES.RESULTADO_CIERRE} element={<PantallaResultadoCierreTurno />} />

            <Route element={<ShiftGuard />}>
              <Route path={ROUTES.POS} element={<PantallaPos />} />
              <Route path={ROUTES.VENTAS_TURNO} element={<PantallaVentasTurnoActual />} />
              <Route path={ROUTES.VENTA_INDIVIDUAL} element={<PantallaVentaIndividual />} />
              <Route path={ROUTES.DETALLE_VENTA} element={<PantallaDetalleVenta />} />
              <Route path={ROUTES.COMPROBANTE} element={<PantallaComprobante />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to={ROUTES.NO_AUTORIZADO} replace />} />
        </Routes>
      </ShiftProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;