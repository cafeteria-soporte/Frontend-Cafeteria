/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, FileText, Settings, Database,
  Bell, LogOut, Sun, Moon, Store, PanelLeft,
  ShoppingCart, Package, Tag, ArrowLeftRight,
  History, ClipboardList, ShieldAlert, ListOrdered,
  UserCircle, KeyRound, Menu, X,
  User,
} from "lucide-react";
import { ROUTES } from "@/utils/constants";
import { useTheme } from "@/providers/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const SIDEBAR_LINKS = {

  root: [
    { title: "Dashboard",           icon: LayoutDashboard, path: ROUTES.ROOT_DASHBOARD },
    { title: "Administradores",     icon: Users,           path: ROUTES.ROOT_ADMINISTRADORES },
    { title: "Logs de auditoría",   icon: FileText,        path: ROUTES.ROOT_LOGS },
    { title: "Configuración",       icon: Settings,        path: ROUTES.ROOT_CONFIGURACION },
    { title: "Backups",             icon: Database,        path: ROUTES.ROOT_BACKUPS },
  ],

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

  cajero: [
    { title: "Punto de Venta",      icon: ShoppingCart,    path: ROUTES.POS },
    { title: "Ventas del turno",    icon: ListOrdered,     path: ROUTES.VENTAS_TURNO },
  ],
};

const SIDEBAR_BOTTOM_LINKS = [
  { title: "Mi perfil",         icon: UserCircle, path: ROUTES.PERFIL },
  { title: "Cambiar contraseña",icon: KeyRound,   path: ROUTES.CAMBIO_CONTRASENA },
];

const ROL_META = {
  root:   { label: "Superusuario", initials: "SU", badge: "Root" },
  admin:  { label: "Administrador", initials: "AD", badge: "Admin" },
  cajero: { label: "Cajero",        initials: "CJ", badge: "Cajero" },
};

// eslint-disable-next-line no-unused-vars
const SidebarContent = ({ rol, links, rolMeta, nombreUsuario, onLinkClick }) => {
  return (
    <div className="w-full flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="h-20 flex items-center px-6 shrink-0">
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
      <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 pb-2">
        {links.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onLinkClick}
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
      <div className="px-3 py-2 space-y-0.5 shrink-0">
        {SIDEBAR_BOTTOM_LINKS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onLinkClick}
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
      <div className="p-4 shrink-0">
        <div className="flex items-center gap-3 px-1">
          <Avatar className="w-8 h-8 border border-white/10 shrink-0">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">
              {rolMeta.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-white truncate">
              {nombreUsuario}
            </span>
            <span className="text-[10px] text-sidebar-foreground/40 truncate">
              {rolMeta.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MainLayout = ({ rol = "admin" }) => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  let nombreUsuario = "Usuario";
  try {
    const userDataString = localStorage.getItem("userData");
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      nombreUsuario = userData.fullName || userData.fullname || userData.nombre || "Usuario";
    }
  } catch (error) {
    console.error("Error parseando userData de localStorage", error);
  }

  const links    = SIDEBAR_LINKS[rol] ?? SIDEBAR_LINKS.admin;
  const rolMeta  = ROL_META[rol]      ?? ROL_META.admin;

  const allLinks = [...links, ...SIDEBAR_BOTTOM_LINKS];
  const currentTitle =
    allLinks.find((l) => location.pathname.startsWith(l.path))?.title ?? "Inicio";

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  }).replace(/,/g, "");

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileSidebarOpen]);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">

     
      <aside
        className={`
          ${isSidebarOpen ? "w-64" : "w-0 border-r-0"}
          bg-sidebar text-sidebar-foreground hidden md:flex relative z-20
          shadow-xl transition-all duration-300 ease-in-out border-r border-white/5
        `}
      >
        <div className="w-64">
          <SidebarContent 
            rol={rol}
            links={links}
            rolMeta={rolMeta}
            nombreUsuario={nombreUsuario}
            onLinkClick={() => {}}
          />
        </div>
      </aside>

    
      {isMobileSidebarOpen && (
        <>
         
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          
          <aside className="fixed inset-y-0 left-0 w-64 bg-sidebar text-sidebar-foreground z-50 md:hidden shadow-2xl animate-slide-right">
            <div className="relative h-full">
              {/* Botón cerrar */}
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
              >
                <X size={20} />
              </button>
              
              <SidebarContent 
                rol={rol}
                links={links}
                rolMeta={rolMeta}
                nombreUsuario={nombreUsuario}
                onLinkClick={() => setIsMobileSidebarOpen(false)}
              />
            </div>
          </aside>
        </>
      )}


      <main className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">

    
        <header className="h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between bg-sidebar border-b border-white/5 z-10 shadow-md shrink-0">

          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg w-9 h-9 text-sidebar-foreground hover:bg-white/10 hover:text-white hidden md:flex shrink-0"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <PanelLeft
                size={18}
                className={!isSidebarOpen ? "rotate-180 transition-transform" : "transition-transform"}
              />
            </Button>

   
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg w-9 h-9 text-sidebar-foreground hover:bg-white/10 hover:text-white md:hidden shrink-0"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu size={20} />
            </Button>

            <h2 className="text-sm sm:text-base font-semibold tracking-tight text-white truncate">
              {currentTitle}
            </h2>
          </div>

          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <span className="text-xs font-medium text-sidebar-foreground/50 hidden lg:block">
              {today} · {new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
            </span>

            <div className="h-5 w-px bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-1">

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-8 h-8 sm:w-9 sm:h-9 text-sidebar-foreground hover:bg-white/10 hover:text-white"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              </Button>

              {rol !== "cajero" && (
                <NavLink to={ROUTES.NOTIFICACIONES}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full w-8 h-8 sm:w-9 sm:h-9 text-sidebar-foreground hover:bg-white/10 hover:text-white relative"
                  >
                    <Bell size={16} />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full" />
                  </Button>
                </NavLink>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-8 h-8 sm:w-9 sm:h-9 text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
                onClick={() => {
                  localStorage.removeItem('accessToken');
                  localStorage.removeItem('userRole');
                  localStorage.removeItem('userData');
                  window.location.href = ROUTES.LOGIN;
                }}
              >
                <LogOut size={16} />
              </Button>

            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
          <Outlet />
        </div>

      </main>
    </div>
  );
};