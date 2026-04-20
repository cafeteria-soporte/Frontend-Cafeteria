export const ROUTES = {
  // ─── Públicas ───────────────────────────────────────
  LOGIN:                    "/login",

  // ─── Comunes (todos los roles) ──────────────────────
  PERFIL:                   "/perfil",
  CAMBIO_CONTRASENA:        "/cambio-contrasena",
  SESION_EXPIRADA:          "/sesion-expirada",
  CUENTA_DESACTIVADA:       "/cuenta-desactivada",
  NO_AUTORIZADO:            "/no-autorizado",

  // ─── ROOT ────────────────────────────────────────────
  ROOT_DASHBOARD:           "/root/dashboard",
  ROOT_ADMINISTRADORES:     "/root/administradores",
  ROOT_LOGS:                "/root/logs",
  ROOT_CONFIGURACION:       "/root/configuracion",
  ROOT_BACKUPS:             "/root/backups",

  // ─── ADMINISTRADOR ───────────────────────────────────
  DASHBOARD:                "/dashboard",
  CAJEROS:                  "/cajeros",
  PRODUCTOS:                "/productos",
  CATEGORIAS:               "/categorias",
  AJUSTE_STOCK:             "/inventario/ajuste",
  HISTORIAL_STOCK:          "/inventario/historial",
  TURNOS:                   "/turnos",
  LOGS_ADMIN:               "/logs",
  NOTIFICACIONES:           "/notificaciones",

  // ─── CAJERO ──────────────────────────────────────────
  PRE_TURNO:                "/pre-turno",
  POS:                      "/pos",
  VENTAS_TURNO:             "/ventas-turno",
  VENTA_INDIVIDUAL:         "/ventas/:id",
};