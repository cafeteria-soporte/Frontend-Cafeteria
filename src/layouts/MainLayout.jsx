import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, FileText, Settings, Database,
  Bell, LogOut, Sun, Moon, Store, PanelLeft,
  ShoppingCart, Package, Tag, ArrowLeftRight,
  History, ClipboardList, ShieldAlert, ListOrdered,
  UserCircle, KeyRound,
} from "lucide-react";
import { ROUTES } from "@/utils/constants";
import { useTheme } from "@/providers/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ══════════════════════════════════════════════════════
//  LINKS POR ROL
// ══════════════════════════════════════════════════════
const SIDEBAR_LINKS = {

  // ── ROOT ──────────────────────────────────────────
  root: [
    { title: "Dashboard",           icon: LayoutDashboard, path: ROUTES.ROOT_DASHBOARD },
    { title: "Administradores",     icon: Users,           path: ROUTES.ROOT_ADMINISTRADORES },
    { title: "Logs de auditoría",   icon: FileText,        path: ROUTES.ROOT_LOGS },
    { title: "Configuración",       icon: Settings,        path: ROUTES.ROOT_CONFIGURACION },
    { title: "Backups",             icon: Database,        path: ROUTES.ROOT_BACKUPS },
  ],

  // ── ADMINISTRADOR ─────────────────────────────────
  admin: [
    { title: "Dashboard",           icon: LayoutDashboard, path: ROUTES.DASHBOARD },
    { title: "Cajeros",             icon: Users,           path: ROUTES.CAJEROS },
    { title: "Productos",           icon: Package,         path: ROUTES.PRODUCTOS },
    { title: "Categorías",          icon: Tag,             path: ROUTES.CATEGORIAS },
    { title: "Ajuste de Stock",     icon: ArrowLeftRight,  path: ROUTES.AJUSTE_STOCK },
    { title: "Historial Stock",     icon: History,         path: ROUTES.HISTORIAL_STOCK },
    { title: "Turnos",              icon: ClipboardList,   path: ROUTES.TURNOS },
    { title: "Logs auditoría",      icon: FileText,        path: ROUTES.LOGS_ADMIN },
    { title: "Notificaciones",      icon: Bell,            path: ROUTES.NOTIFICACIONES },
  ],

  // ── CAJERO ────────────────────────────────────────
  cajero: [
    { title: "Estado de turno",     icon: ShieldAlert,     path: ROUTES.PRE_TURNO },
    { title: "Punto de Venta",      icon: ShoppingCart,    path: ROUTES.POS },
    { title: "Ventas del turno",    icon: ListOrdered,     path: ROUTES.VENTAS_TURNO },
  ],
};

// Links comunes al pie del sidebar (todos los roles)
const SIDEBAR_BOTTOM_LINKS = [
  { title: "Mi perfil",         icon: UserCircle, path: ROUTES.PERFIL },
  { title: "Cambiar contraseña",icon: KeyRound,   path: ROUTES.CAMBIO_CONTRASENA },
];

// Etiquetas visuales por rol
const ROL_META = {
  root:   { label: "Superusuario", initials: "SU", badge: "Root" },
  admin:  { label: "Administrador", initials: "AD", badge: "Admin" },
  cajero: { label: "Cajero",        initials: "CJ", badge: "Cajero" },
};

// ══════════════════════════════════════════════════════
//  COMPONENTE
// ══════════════════════════════════════════════════════
export const MainLayout = ({ rol = "admin" }) => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const links    = SIDEBAR_LINKS[rol] ?? SIDEBAR_LINKS.admin;
  const rolMeta  = ROL_META[rol]      ?? ROL_META.admin;

  // Título de la sección actual
  const allLinks = [...links, ...SIDEBAR_BOTTOM_LINKS];
  const currentTitle =
    allLinks.find((l) => location.pathname.startsWith(l.path))?.title ?? "Inicio";

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  }).replace(/,/g, "");

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">

      {/* ══════════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════════ */}
      <aside
        className={`
          ${isSidebarOpen ? "w-64" : "w-0 border-r-0"}
          bg-sidebar text-sidebar-foreground hidden md:flex relative z-20
          shadow-xl transition-all duration-300 ease-in-out border-r border-white/5
        `}
      >
        <div className="w-64 flex flex-col h-full overflow-hidden">

          {/* Logo */}
          <div className="h-20 flex items-center px-6 shrink-0 min-w-max">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mr-3 shadow-md shrink-0">
              <Store size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white leading-tight">
                Café UCB
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50">
                {rolMeta.badge}
              </span>
            </div>
          </div>

          {/* Separador */}
          <div className="mx-4 h-px bg-white/5 mb-3 shrink-0" />

          {/* Navegación principal */}
          <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 min-w-max pb-2">
            {links.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                   transition-all duration-150 group
                   ${isActive
                     ? "bg-black/25 text-primary"
                     : "text-sidebar-foreground/65 hover:bg-white/5 hover:text-white"
                   }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={16}
                      className={isActive ? "text-primary" : "opacity-70 group-hover:opacity-100"}
                    />
                    {item.title}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Separador */}
          <div className="mx-4 h-px bg-white/5 shrink-0" />

          {/* Links comunes (perfil, cambio contraseña) */}
          <div className="px-3 py-2 space-y-0.5 min-w-max shrink-0">
            {SIDEBAR_BOTTOM_LINKS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium
                   transition-all duration-150 group
                   ${isActive
                     ? "bg-black/25 text-primary"
                     : "text-sidebar-foreground/45 hover:bg-white/5 hover:text-white/80"
                   }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={14} className={isActive ? "text-primary" : "opacity-60"} />
                    {item.title}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Separador */}
          <div className="mx-4 h-px bg-white/5 shrink-0" />

          {/* Avatar de usuario */}
          <div className="p-4 shrink-0 min-w-max">
            <div className="flex items-center gap-3 px-1">
              <Avatar className="w-8 h-8 border border-white/10 shrink-0">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">
                  {rolMeta.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-white truncate">
                  {rolMeta.badge}
                </span>
                <span className="text-[10px] text-sidebar-foreground/40 truncate">
                  {rolMeta.label}
                </span>
              </div>
            </div>
          </div>

        </div>
      </aside>

      {/* ══════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">

        {/* NAVBAR */}
        <header className="h-16 px-6 flex items-center justify-between bg-sidebar border-b border-white/5 z-10 shadow-md shrink-0">

          <div className="flex items-center gap-3">
            {/* Toggle sidebar */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg w-9 h-9 text-sidebar-foreground hover:bg-white/10 hover:text-white hidden md:flex"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <PanelLeft
                size={18}
                className={!isSidebarOpen ? "rotate-180 transition-transform" : "transition-transform"}
              />
            </Button>
            <h2 className="text-base font-semibold tracking-tight text-white">
              {currentTitle}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Fecha y hora */}
            <span className="text-xs font-medium text-sidebar-foreground/50 hidden lg:block">
              {today} · {new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
            </span>

            <div className="h-5 w-px bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-1">

              {/* Tema */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-9 h-9 text-sidebar-foreground hover:bg-white/10 hover:text-white"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              </Button>

              {/* Notificaciones — solo root y admin */}
              {rol !== "cajero" && (
                <NavLink to={ROUTES.NOTIFICACIONES}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full w-9 h-9 text-sidebar-foreground hover:bg-white/10 hover:text-white relative"
                  >
                    <Bell size={16} />
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-destructive rounded-full" />
                  </Button>
                </NavLink>
              )}

              {/* Logout */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-9 h-9 text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
                onClick={() => {
                  // TODO: conectar con lógica de logout del AuthProvider
                  window.location.href = ROUTES.LOGIN;
                }}
              >
                <LogOut size={16} />
              </Button>

            </div>
          </div>
        </header>

        {/* ÁREA DE PÁGINAS */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>

      </main>
    </div>
  );
};