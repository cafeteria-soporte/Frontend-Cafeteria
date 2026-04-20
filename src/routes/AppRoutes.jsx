import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "@/utils/constants";
import { MainLayout } from "@/layouts/MainLayout";

// ════════════════════════════════════════════════════════
//  AUTH  —  Gemina
// ════════════════════════════════════════════════════════
import { PantallaLogin }                    from "@/features/auth/pages/PantallaLogin";
import { PantallaCambioContraseña }         from "@/features/auth/pages/PantallaCambioContraseña";
import { PantallaCambioContraseñaCajero }   from "@/features/auth/pages/PantallaCmabioCotraseñaCajero";
import { SesionExpirada }                   from "@/features/auth/pages/SesionExpirada";

// ════════════════════════════════════════════════════════
//  PÁGINAS COMUNES
// ════════════════════════════════════════════════════════
//  Gemina
import { PantallaPerfil }                   from "@/pages/PantallaPerfil";
import { PantallaAccesoNoAutorizado }       from "@/pages/PantallaAccesoNoAutorizado";
//  Sergio
import { CuentaDesactivada }                from "@/pages/CuentaDesactivada";

// ════════════════════════════════════════════════════════
//  DASHBOARD  —  Andrea
// ════════════════════════════════════════════════════════
import { DashboardAdminPage }               from "@/features/dashboard/pages/DashboardAdminPage";

// ════════════════════════════════════════════════════════
//  USUARIOS  —  Sergio
// ════════════════════════════════════════════════════════
import { PantallaGestionAdministradores }   from "@/features/users/pages/PantallaGestionAdministradores";
import { PantallaGestionCajeros }           from "@/features/users/pages/PantallaGestionCajeros";

// ════════════════════════════════════════════════════════
//  PRODUCTOS  —  Andrea
// ════════════════════════════════════════════════════════
import { PantallaGestionProductos }         from "@/features/products/pages/PantallaGestionProductos";
import { PantallaGestionCategorias }        from "@/features/products/pages/PantallaGestionCategorias";

// ════════════════════════════════════════════════════════
//  INVENTARIO  —  Andrea
// ════════════════════════════════════════════════════════
import { PantallaAjusteStock }              from "@/features/inventory/pages/PantallaAjusteStock";
import { HistorialMovimientosStock }        from "@/features/inventory/pages/HistorialMovimeintosStock";

// ════════════════════════════════════════════════════════
//  TURNOS  —  Sergio
// ════════════════════════════════════════════════════════       
import { PantallaTurnos }                   from "@/features/shifts/pages/PantallaTurnos";
import { PantallaResultadoCierreTurno }     from "@/features/shifts/pages/PantallaResultadoCierreTurno";
import { PantallaPreTurno }                 from "@/features/shifts/pages/PantallaPre-turno";

// ════════════════════════════════════════════════════════
//  POS  —  Sergio
// ════════════════════════════════════════════════════════
import { PantallaPos }                     from "@/features/pos/pages/PantallaPOS";
import { PantallaVentasTurnoActual }        from "@/features/pos/pages/PantallaVentasTurnoActual";
import { PantallaVentaIndividual }          from "@/features/pos/pages/PantallaVentaIndividual";

// ════════════════════════════════════════════════════════
//  NOTIFICACIONES  —  Andrea
// ════════════════════════════════════════════════════════
// (el panel vive dentro del layout, no tiene página propia separada por ahora)

// ════════════════════════════════════════════════════════
//  RUTAS
// ════════════════════════════════════════════════════════
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* ══════════════════════════════════════════════
            RUTAS PÚBLICAS  (sin layout)
        ══════════════════════════════════════════════ */}

        {/* Raíz → login */}
        <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />

        {/* Auth — Gemina */}
        <Route path={ROUTES.LOGIN}           element={<PantallaLogin />} />
        <Route path={ROUTES.SESION_EXPIRADA} element={<SesionExpirada />} />

        {/* Cuenta desactivada — Sergio */}
        <Route path={ROUTES.CUENTA_DESACTIVADA} element={<CuentaDesactivada />} />

        {/* Sin autorización — Gemina */}
        <Route path={ROUTES.NO_AUTORIZADO}   element={<PantallaAccesoNoAutorizado />} />


        {/* ══════════════════════════════════════════════
            ROL: ROOT  (superusuario)
            Pantallas: Gemina (login/pass) · Sergio (admins)
        ══════════════════════════════════════════════ */}
        <Route element={<MainLayout rol="root" />}>

          {/* Redirección /root → dashboard root */}
          <Route path="/root" element={<Navigate to={ROUTES.ROOT_DASHBOARD} replace />} />

          {/* Dashboard Root — usa el mismo componente de Andrea como base */}
          <Route path={ROUTES.ROOT_DASHBOARD}       element={<DashboardAdminPage />} />

          {/* Gestión de administradores — Sergio */}
          <Route path={ROUTES.ROOT_ADMINISTRADORES} element={<PantallaGestionAdministradores />} />

          {/* Logs de auditoría — (pantalla pendiente, placeholder) */}
          <Route path={ROUTES.ROOT_LOGS}            element={<div className="p-8 text-muted-foreground">Logs de auditoría — en construcción</div>} />

          {/* Configuración global — (pantalla pendiente, placeholder) */}
          <Route path={ROUTES.ROOT_CONFIGURACION}   element={<div className="p-8 text-muted-foreground">Configuración global — en construcción</div>} />

          {/* Backups — (pantalla pendiente, placeholder) */}
          <Route path={ROUTES.ROOT_BACKUPS}         element={<div className="p-8 text-muted-foreground">Gestión de backups — en construcción</div>} />

          {/* Comunes dentro del layout root */}
          <Route path={ROUTES.PERFIL}               element={<PantallaPerfil />} />
          <Route path={ROUTES.CAMBIO_CONTRASENA}    element={<PantallaCambioContraseña />} />

        </Route>


        {/* ══════════════════════════════════════════════
            ROL: ADMINISTRADOR
            Pantallas: Andrea (dashboard, productos, inventario,
                       categorías, notificaciones)
                       Sergio (cajeros, turnos)
                       Gemina (perfil, cambio contraseña)
        ══════════════════════════════════════════════ */}
        <Route element={<MainLayout rol="admin" />}>

          {/* Redirección /admin → dashboard */}
          <Route path="/admin" element={<Navigate to={ROUTES.DASHBOARD} replace />} />

          {/* Dashboard — Andrea */}
          <Route path={ROUTES.DASHBOARD}       element={<DashboardAdminPage />} />

          {/* Cajeros — Sergio */}
          <Route path={ROUTES.CAJEROS}         element={<PantallaGestionCajeros />} />

          {/* Productos — Andrea */}
          <Route path={ROUTES.PRODUCTOS}       element={<PantallaGestionProductos />} />

          {/* Categorías — Andrea */}
          <Route path={ROUTES.CATEGORIAS}      element={<PantallaGestionCategorias />} />

          {/* Inventario — Andrea */}
          <Route path={ROUTES.AJUSTE_STOCK}    element={<PantallaAjusteStock />} />
          <Route path={ROUTES.HISTORIAL_STOCK} element={<HistorialMovimientosStock />} />

          {/* Turnos — Sergio */}
          <Route path={ROUTES.TURNOS}          element={<PantallaTurnos />} />

          {/* Logs auditoría admin — (placeholder) */}
          <Route path={ROUTES.LOGS_ADMIN}      element={<div className="p-8 text-muted-foreground">Logs de auditoría — en construcción</div>} />

          {/* Notificaciones — Andrea (panel de alertas) */}
          <Route path={ROUTES.NOTIFICACIONES}  element={<div className="p-8 text-muted-foreground">Panel de notificaciones — en construcción</div>} />

          {/* Comunes dentro del layout admin */}
          <Route path={ROUTES.PERFIL}              element={<PantallaPerfil />} />
          <Route path={ROUTES.CAMBIO_CONTRASENA}   element={<PantallaCambioContraseña />} />

        </Route>


        {/* ══════════════════════════════════════════════
            ROL: CAJERO
            Pantallas: Sergio (pre-turno, POS, ventas,
                       resultado cierre)
                       Gemina (perfil, cambio contraseña)
        ══════════════════════════════════════════════ */}
        <Route element={<MainLayout rol="cajero" />}>

          {/* Redirección /cajero → pre-turno */}
          <Route path="/cajero" element={<Navigate to={ROUTES.PRE_TURNO} replace />} />

          {/* Pre-turno — Sergio */}
          <Route path={ROUTES.PRE_TURNO}       element={<PantallaPreTurno />} />

          {/* POS — Sergio */}
          <Route path={ROUTES.POS}             element={<PantallaPos />} />

          {/* Ventas del turno actual — Sergio */}
          <Route path={ROUTES.VENTAS_TURNO}    element={<PantallaVentasTurnoActual />} />

          {/* Detalle de venta individual — Sergio */}
          <Route path={ROUTES.VENTA_INDIVIDUAL} element={<PantallaVentaIndividual />} />

          {/* Resultado de cierre de turno — Sergio */}
          <Route path="/resultado-cierre"      element={<PantallaResultadoCierreTurno />} />

          {/* Cambio contraseña obligatorio primer login — Gemina */}
          <Route path={ROUTES.CAMBIO_CONTRASENA} element={<PantallaCambioContraseñaCajero />} />

          {/* Perfil — Gemina */}
          <Route path={ROUTES.PERFIL}          element={<PantallaPerfil />} />

        </Route>


        {/* ══════════════════════════════════════════════
            CATCH-ALL  →  sin autorización
        ══════════════════════════════════════════════ */}
        <Route path="*" element={<Navigate to={ROUTES.NO_AUTORIZADO} replace />} />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;