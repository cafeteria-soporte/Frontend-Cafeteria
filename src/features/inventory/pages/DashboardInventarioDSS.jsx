import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Filter,
  PackageSearch,
  PieChart as PieChartIcon,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { productsService } from "@/features/products/services/products.service";
import { formatCurrency, formatDateTime } from "@/utils/formats";
import { ExportButtons } from "../components/ExportButtons";
import { KpiStockVelocityCard } from "../components/KpiStockVelocityCard";
import {
  defaultInventoryAnalyticsFilters,
  inventoryAnalyticsService,
} from "../services/inventoryAnalytics.service";

const pieColors = ["#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

//prueba hasta que este el backend listo
const mockMovements = [
  {
    id: 1,
    fecha: "2026-05-20T09:30:00",
    producto: "Café en grano",
    productId: 1,
    categoria: "Bebidas calientes",
    tipo: "sale",
    cantidad: -4,
    stockResultante: 18,
    usuario: "Cajero Demo",
    motivo: "Venta POS",
    valorEstimado: 0,
  },
  {
    id: 2,
    fecha: "2026-05-21T11:15:00",
    producto: "Leche deslactosada",
    productId: 2,
    categoria: "Insumos",
    tipo: "shrinkage",
    cantidad: -3,
    stockResultante: 6,
    usuario: "Admin Demo",
    motivo: "Vencimiento",
    valorEstimado: 27,
  },
  {
    id: 3,
    fecha: "2026-05-22T16:00:00",
    producto: "Pan integral",
    productId: 3,
    categoria: "Panadería",
    tipo: "goods_receipt",
    cantidad: 30,
    stockResultante: 42,
    usuario: "Admin Demo",
    motivo: "Reposición proveedor",
    valorEstimado: 0,
  },
  {
    id: 4,
    fecha: "2026-05-23T10:50:00",
    producto: "Queso mozzarella",
    productId: 4,
    categoria: "Insumos",
    tipo: "manual_adjustment",
    cantidad: -2,
    stockResultante: 9,
    usuario: "Admin Demo",
    motivo: "Ajuste por conteo físico",
    valorEstimado: 18,
  },
];

const mockShrinkage = [
  { id: 1, producto: "Leche deslactosada", cantidad: 3, valor: 27, porcentaje: 33 },
  { id: 2, producto: "Queso mozzarella", cantidad: 2, valor: 18, porcentaje: 22 },
  { id: 3, producto: "Pan integral", cantidad: 8, valor: 16, porcentaje: 20 },
  { id: 4, producto: "Fruta fresca", cantidad: 5, valor: 20, porcentaje: 25 },
];

const mockVelocity = [
  {
    id: 1,
    producto: "Café en grano",
    stockActual: 18,
    stockMinimo: 10,
    velocidadDiaria: 4.5,
    diasRestantes: 4,
    estado: "alerta",
  },
  {
    id: 2,
    producto: "Leche deslactosada",
    stockActual: 6,
    stockMinimo: 6,
    velocidadDiaria: 3,
    diasRestantes: 2,
    estado: "critico",
  },
  {
    id: 3,
    producto: "Pan integral",
    stockActual: 42,
    stockMinimo: 12,
    velocidadDiaria: 6,
    diasRestantes: 7,
    estado: "alerta",
  },
  {
    id: 4,
    producto: "Chocolate en polvo",
    stockActual: 0,
    stockMinimo: 4,
    velocidadDiaria: 1.5,
    diasRestantes: 0,
    estado: "sin_stock",
  },
];

const movementTypeLabels = {
  goods_receipt: "Ingreso",
  manual_adjustment: "Ajuste manual",
  shrinkage: "Merma",
  sale: "Venta",
  sale_void: "Anulación",
};

const getProductName = (product) => product.nombre ?? product.name ?? product.productName ?? `Producto #${product.id}`;

const safeDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : formatDateTime(date);
};

const numberValue = (value) => Number(value || 0);

const LoadingGrid = () => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <Skeleton key={index} className="h-36 rounded-2xl" />
    ))}
  </div>
);

export const DashboardInventarioDSS = () => {
  const [filters, setFilters] = useState(defaultInventoryAnalyticsFilters);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [shrinkage, setShrinkage] = useState([]);
  const [stockVelocity, setStockVelocity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async (activeFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      setIsDemoMode(false);

      const [movementsData, shrinkageData, velocityData, productData] = await Promise.all([
        inventoryAnalyticsService.getMovements(activeFilters),
        inventoryAnalyticsService.getShrinkage(activeFilters),
        inventoryAnalyticsService.getStockVelocity(activeFilters),
        productsService.getAll().catch(() => []),
      ]);

      setMovements(movementsData);
      setShrinkage(shrinkageData);
      setStockVelocity(velocityData);
      setProducts(productData);
    } catch {
      setError(
        "El backend analítico de inventario todavía no respondió. La pantalla queda completa con datos demo para validar diseño, filtros y gráficos.",
      );
      setIsDemoMode(true);
      setMovements(mockMovements);
      setShrinkage(mockShrinkage);
      setStockVelocity(mockVelocity);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard(defaultInventoryAnalyticsFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadDashboard(filters);
    }, 450);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.startDate, filters.endDate, filters.productId, filters.movementType, filters.reason]);

  const productOptions = useMemo(() => {
    const fromApi = products.map((product) => ({ id: product.id, name: getProductName(product) }));
    const fromMovements = movements.map((movement) => ({ id: movement.productId, name: movement.producto }));
    const all = [...fromApi, ...fromMovements].filter((item) => item.id || item.name);

    return Array.from(new Map(all.map((item) => [String(item.id || item.name), item])).values());
  }, [products, movements]);

  const filteredMovements = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return movements.filter((movement) => {
      if (!normalizedSearch) return true;
      return `${movement.producto} ${movement.categoria} ${movement.tipo} ${movement.usuario} ${movement.motivo}`
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [movements, searchTerm]);

  const summary = useMemo(() => {
    const totalShrinkage = shrinkage.reduce((acc, item) => acc + numberValue(item.valor), 0);
    const critical = stockVelocity.filter((item) => numberValue(item.diasRestantes) <= 3).length;
    const noStock = stockVelocity.filter((item) => numberValue(item.stockActual) <= 0).length;
    const movementsQty = filteredMovements.length;

    return { totalShrinkage, critical, noStock, movementsQty };
  }, [filteredMovements.length, shrinkage, stockVelocity]);

  const shrinkageChartData = useMemo(
    () =>
      shrinkage.map((item) => ({
        name: item.producto,
        value: numberValue(item.valor || item.cantidad),
        cantidad: numberValue(item.cantidad),
        valor: numberValue(item.valor),
      })),
    [shrinkage],
  );

  const velocityChartData = useMemo(
    () =>
      stockVelocity.map((item) => ({
        producto: item.producto,
        dias: numberValue(item.diasRestantes),
        stock: numberValue(item.stockActual),
      })),
    [stockVelocity],
  );

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <PackageSearch size={14} /> Módulo DSS de Inventario
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight md:text-3xl">
                Monitoreo de suministros e inventario
              </h1>
              <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                Historial de movimientos con filtros dinámicos, distribución de mermas por producto, alertas predictivas de días restantes y exportación gerencial.
              </p>
            </div>
          </div>

          <ExportButtons filters={filters} disabled={loading || isDemoMode} />
        </header>

        {error && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter size={18} /> Filtros analíticos
            </CardTitle>
            <CardDescription>
              Realiza consultas dinámicas de movimientos, mermas y velocidad de stock. 
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
              <label className="space-y-1 text-xs font-semibold text-muted-foreground">
                Desde
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(event) => updateFilter("startDate", event.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="space-y-1 text-xs font-semibold text-muted-foreground">
                Hasta
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(event) => updateFilter("endDate", event.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="space-y-1 text-xs font-semibold text-muted-foreground xl:col-span-2">
                Producto
                <select
                  value={filters.productId}
                  onChange={(event) => updateFilter("productId", event.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Todos los productos</option>
                  {productOptions.map((product) => (
                    <option key={product.id || product.name} value={product.id || product.name}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-xs font-semibold text-muted-foreground">
                Tipo movimiento
                <select
                  value={filters.movementType}
                  onChange={(event) => updateFilter("movementType", event.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Todos</option>
                  {Object.entries(movementTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full gap-2"
                  onClick={() => loadDashboard(filters)}
                  disabled={loading}
                >
                  <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                  Actualizar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <LoadingGrid />
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardContent className="px-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Total mermas
                </p>
                <p className="mt-2 text-2xl font-black">{formatCurrency(summary.totalShrinkage)}</p>
                <p className="text-xs text-muted-foreground">Según rango filtrado</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="px-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Movimientos
                </p>
                <p className="mt-2 text-2xl font-black">{summary.movementsQty}</p>
                <p className="text-xs text-muted-foreground">Registros visibles en tabla</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="px-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Alertas críticas
                </p>
                <p className="mt-2 text-2xl font-black">{summary.critical}</p>
                <p className="text-xs text-muted-foreground">Productos con ≤ 3 días</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="px-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Sin stock
                </p>
                <p className="mt-2 text-2xl font-black">{summary.noStock}</p>
                <p className="text-xs text-muted-foreground">Requieren reposición inmediata</p>
              </CardContent>
            </Card>
          </section>
        )}

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Alertas de días de stock restante</h2>
              <p className="text-sm text-muted-foreground">
                Tarjetas KPI con alertas visuales según días restantes y velocidad de agotamiento.
              </p>
            </div>
          </div>
          {loading ? (
            <LoadingGrid />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {stockVelocity.slice(0, 8).map((item) => (
                <KpiStockVelocityCard key={item.id || item.producto} item={item} />
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon size={18} /> Distribución de mermas por producto
              </CardTitle>
              <CardDescription>
                Gráfico de pastel que calcula porcentaje de mermas por producto según valor o cantidad. 
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[360px]">
              {loading ? (
                <Skeleton className="h-full rounded-2xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={shrinkageChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={105}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {shrinkageChartData.map((entry, index) => (
                        <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${formatCurrency(props.payload.valor)} · ${props.payload.cantidad} u.`,
                        name,
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 size={18} /> Días estimados de stock
              </CardTitle>
              <CardDescription>
                Apoyo visual para priorizar compras según velocidad de agotamiento.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[360px]">
              {loading ? (
                <Skeleton className="h-full rounded-2xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={velocityChartData} margin={{ top: 10, right: 20, bottom: 70, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                    <XAxis dataKey="producto" angle={-35} textAnchor="end" interval={0} height={85} />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [`${value} ${name === "dias" ? "días" : "u."}`, name]} />
                    <Legend />
                    <Bar dataKey="dias" name="Días restantes" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader className="gap-3 lg:flex lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays size={18} /> Tabla de movimientos históricos
              </CardTitle>
              <CardDescription>
                Revisa el detalle de cada movimiento con filtros dinámicos y búsqueda por texto libre. Ideal para auditorías y análisis gerencial.
              </CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar producto, categoría, usuario o motivo..."
                className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full min-w-[1050px] text-sm">
                <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Fecha/hora</th>
                    <th className="px-4 py-3 text-left">Producto</th>
                    <th className="px-4 py-3 text-left">Categoría</th>
                    <th className="px-4 py-3 text-left">Tipo movimiento</th>
                    <th className="px-4 py-3 text-right">Cantidad</th>
                    <th className="px-4 py-3 text-right">Stock resultante</th>
                    <th className="px-4 py-3 text-right">Valor estimado</th>
                    <th className="px-4 py-3 text-left">Motivo</th>
                    <th className="px-4 py-3 text-left">Registrado por</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, index) => (
                      <tr key={index} className="border-t border-border">
                        <td colSpan={9} className="px-4 py-3">
                          <Skeleton className="h-7 w-full" />
                        </td>
                      </tr>
                    ))
                  ) : filteredMovements.length ? (
                    filteredMovements.map((movement) => (
                      <tr key={movement.id} className="border-t border-border hover:bg-muted/40">
                        <td className="px-4 py-3 text-muted-foreground">{safeDateTime(movement.fecha)}</td>
                        <td className="px-4 py-3 font-semibold">{movement.producto}</td>
                        <td className="px-4 py-3">{movement.categoria}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            {movementTypeLabels[movement.tipo] ?? movement.tipo}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-right font-bold ${numberValue(movement.cantidad) < 0 ? "text-destructive" : "text-emerald-600"}`}>
                          {numberValue(movement.cantidad) > 0 ? `+${movement.cantidad}` : movement.cantidad}
                        </td>
                        <td className="px-4 py-3 text-right">{movement.stockResultante}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(numberValue(movement.valorEstimado))}</td>
                        <td className="px-4 py-3">{movement.motivo}</td>
                        <td className="px-4 py-3">{movement.usuario}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                        No hay movimientos con los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
