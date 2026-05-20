/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useEffect, useState, useMemo } from "react";
import { AlertTriangle, Bell, CheckCircle2, ExternalLink, Loader2, Banknote, History, Filter, Archive } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/utils/constants";
import { useProducts } from "@/features/products/hooks/useProducts"; 
import { useShifts } from "@/features/shifts/hooks/useShifts";

export const PantallaNotificaciones = () => {
  const { lowStockProducts, loadingLowStock, getLowStockProducts } = useProducts();
  const { allShifts, loadingAllShifts, getAllShifts } = useShifts();
  
  const [alertas, setAlertas] = useState([]);
  const [error, setError] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("todas"); 

  useEffect(() => {
    const cargarTodo = async () => {
      try {
        setError("");
        await Promise.all([
          getLowStockProducts(),
          getAllShifts({ limit: 20 })
        ]);
      } catch (err) {
        setError("Error al sincronizar las notificaciones del sistema.");
      }
    };
    cargarTodo();
  }, [getLowStockProducts, getAllShifts]);


  useEffect(() => {
    const rawProducts = Array.isArray(lowStockProducts) ? lowStockProducts : (lowStockProducts?.data || []);
    const alertasStock = rawProducts.map(p => ({
      id: `stock-${p.id}`,
      originalId: p.id,
      titulo: `${p.name || 'Producto'} con stock bajo`,
      descripcion: `Quedan ${p.currentStock} unidades (Mínimo: ${p.minStock})`,
      tipo: "Inventario",
      gravedad: (p.currentStock ?? 0) <= 0 ? "Crítica" : "Media",
      fecha: new Date(),
      ruta: ROUTES.AJUSTE_STOCK,
      leida: false
    }));

    const rawShifts = Array.isArray(allShifts) ? allShifts : (allShifts?.data || []);
    const alertasCaja = rawShifts
      .filter(s => s.discrepancyAlert === true)
      .map(s => ({
        id: `shift-${s.id}`,
        originalId: s.id,
        titulo: `Descuadre en Turno #${s.id}`,
        descripcion: `Diferencia detectada de Bs. ${Number(s.discrepancy).toFixed(2)}`,
        tipo: "Caja",
        gravedad: "Crítica",
        fecha: new Date(s.closedAt || s.openedAt),
        ruta: ROUTES.TURNOS,
        leida: false
      }));

    const todas = [...alertasStock, ...alertasCaja].sort((a, b) => b.fecha - a.fecha);
    setAlertas(todas);
  }, [lowStockProducts, allShifts]);

  const marcarLeida = (id) => {
    setAlertas(prev => prev.map(a => a.id === id ? { ...a, leida: true } : a));
  };

  const marcarTodasLeidas = () => {
    setAlertas(prev => prev.map(a => ({ ...a, leida: true })));
  };

  // Filtrado de alertas
  const alertasFiltradas = useMemo(() => {
    if (filtroActivo === "todas") return alertas;
    return alertas.filter(a => a.tipo.toLowerCase() === filtroActivo);
  }, [alertas, filtroActivo]);

  const pendientes = alertas.filter(a => !a.leida).length;
  const criticas = alertas.filter(a => a.gravedad === "Crítica" && !a.leida).length;
  const isLoading = loadingLowStock || loadingAllShifts;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        
        <div className="bg-gradient-to-br from-card via-card to-primary/5 p-8 rounded-3xl border border-border shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <Bell className="text-primary" size={28} />
                </div>
                <div>
                  <h1 className="text-4xl font-black tracking-tight text-foreground">
                    Centro de Control
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    Monitoreo en tiempo real de inventario y operaciones
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="bg-card border border-border rounded-2xl px-6 py-4 shadow-sm hover-lift">
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                  Pendientes
                </div>
                <div className="text-3xl font-black text-primary">{pendientes}</div>
              </div>
              <div className="bg-card border border-destructive/20 rounded-2xl px-6 py-4 shadow-sm hover-lift">
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                  Críticas
                </div>
                <div className="text-3xl font-black text-destructive">{criticas}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Filtros */}
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-muted-foreground" />
              <div className="flex gap-2">
                <button
                  onClick={() => setFiltroActivo("todas")}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    filtroActivo === "todas"
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Todas ({alertas.length})
                </button>
                <button
                  onClick={() => setFiltroActivo("inventario")}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    filtroActivo === "inventario"
                      ? "bg-amber-500 text-white shadow-md"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Inventario ({alertas.filter(a => a.tipo === "Inventario").length})
                </button>
                <button
                  onClick={() => setFiltroActivo("caja")}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    filtroActivo === "caja"
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Caja ({alertas.filter(a => a.tipo === "Caja").length})
                </button>
              </div>
            </div>

            {pendientes > 0 && (
              <button
                onClick={marcarTodasLeidas}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20 transition-all font-semibold text-sm"
              >
                <Archive size={16} />
                Archivar todas
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {isLoading && alertas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="animate-spin text-primary" size={48} />
              <p className="text-muted-foreground font-medium">Cargando notificaciones...</p>
            </div>
          ) : alertasFiltradas.length === 0 ? (
            <div className="text-center py-32 border-2 border-dashed border-border rounded-3xl bg-muted/20">
              <CheckCircle2 size={64} className="mx-auto mb-4 text-green-500 opacity-50" />
              <h3 className="text-xl font-bold text-foreground mb-2">Todo bajo control</h3>
              <p className="text-muted-foreground">No hay alertas activas en este momento</p>
            </div>
          ) : (
            alertasFiltradas.map((alerta, index) => (
              <div 
                key={alerta.id}
                className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl ${
                  alerta.leida 
                    ? "bg-muted/30 opacity-50 border-border/50" 
                    : "bg-card shadow-md border-border hover:border-primary/40 hover:scale-[1.01]"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`absolute left-0 top-0 h-full w-1.5 ${
                  alerta.tipo === "Caja" 
                    ? "bg-gradient-to-b from-green-500 to-green-600" 
                    : "bg-gradient-to-b from-amber-500 to-amber-600"
                }`} />

                <div className="flex items-start gap-4 p-6 pl-8">
                  {/* Icono con animación */}
                  <div className={`relative p-4 rounded-2xl transition-transform group-hover:scale-110 ${
                    alerta.tipo === "Caja" 
                      ? "bg-gradient-to-br from-green-500/10 to-green-600/10 text-green-600 dark:text-green-400" 
                      : "bg-gradient-to-br from-amber-500/10 to-amber-600/10 text-amber-600 dark:text-amber-400"
                  }`}>
                    {alerta.tipo === "Caja" ? (
                      <Banknote size={28} strokeWidth={2.5} />
                    ) : (
                      <AlertTriangle size={28} strokeWidth={2.5} />
                    )}
                    {!alerta.leida && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`inline-flex items-center text-[11px] font-black uppercase px-3 py-1 rounded-lg border ${
                        alerta.gravedad === "Crítica" 
                          ? "bg-destructive/10 text-destructive border-destructive/30" 
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                      }`}>
                        {alerta.gravedad}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium bg-muted/50 px-3 py-1 rounded-lg">
                        {alerta.fecha.toLocaleDateString("es-BO", { 
                          day: "2-digit", 
                          month: "short", 
                          year: "numeric" 
                        })}
                      </span>
                      <span className="text-xs text-muted-foreground font-semibold bg-muted/50 px-3 py-1 rounded-lg">
                        {alerta.tipo}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                      {alerta.titulo}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {alerta.descripcion}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      to={alerta.ruta}
                      className="p-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-all hover:scale-110"
                      title="Ver detalle"
                    >
                      <ExternalLink size={20} strokeWidth={2.5} />
                    </Link>
                    {!alerta.leida && (
                      <button
                        onClick={() => marcarLeida(alerta.id)}
                        className="p-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 transition-all hover:scale-110"
                        title="Marcar como leída"
                      >
                        <CheckCircle2 size={20} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};