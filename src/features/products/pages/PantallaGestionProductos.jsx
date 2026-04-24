import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Package,
  AlertTriangle,
  Boxes,
  Pencil,
} from "lucide-react";
import { ModalFormProducto } from "../components/ModalFormProducto";
import { ModalConsultarStock } from "../components/ModalConsultarStock";
import { productsService } from "../services/products.service";
import { categoriesService } from "../services/categories.service";
import { stockMovementsService } from "@/features/inventory/services/stockMovements.service";

const productosMock = [
  {
    id: 1,
    nombre: "Café americano",
    categoria: "Bebidas",
    precio: 15,
    stock: 38,
    stockMinimo: 10,
    estado: "Activo",
    descripcion: "Café clásico.",
  },
  {
    id: 7,
    nombre: "Croissant",
    categoria: "Panadería",
    precio: 14,
    stock: 4,
    stockMinimo: 6,
    estado: "Activo",
    descripcion: "Croissant de mantequilla.",
  },
  {
    id: 9,
    nombre: "Café molido",
    categoria: "Insumos",
    precio: 0,
    stock: 2,
    stockMinimo: 5,
    estado: "Inactivo",
    descripcion: "Insumo para preparación.",
  },
];

const categoriasMock = [
  { id: 1, nombre: "Bebidas" },
  { id: 2, nombre: "Comidas" },
  { id: 3, nombre: "Panadería" },
  { id: 4, nombre: "Insumos" },
];

const formatearPrecio = (precio) => (precio ? `Bs ${precio}` : "—");
const estadoStock = (stock, min) =>
  stock <= 0 ? "Crítico" : stock <= min ? "Bajo" : "Óptimo";
const barraStock = (stock, min) =>
  stock <= 0 ? "bg-destructive" : stock <= min ? "bg-amber-500" : "bg-primary";
const textoStock = (stock, min) =>
  stock <= 0
    ? "text-destructive"
    : stock <= min
      ? "text-amber-600 dark:text-amber-400"
      : "text-primary";
const porcentaje = (stock, min) =>
  Math.max(8, Math.min(100, (stock / Math.max(min * 2, 10)) * 100));

export const PantallaGestionProductos = () => {
  const [busqueda, setBusqueda] = useState("");
  const [productos, setProductos] = useState(productosMock);
  const [categorias, setCategorias] = useState(categoriasMock);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openModalProducto, setOpenModalProducto] = useState(false);
  const [openModalStock, setOpenModalStock] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");
      const [productosApi, categoriasApi, movimientosApi] = await Promise.all([
        productsService.getAll(),
        categoriesService.getAll(),
        stockMovementsService.getAll().catch(() => []),
      ]);
      setProductos(productosApi.length ? productosApi : productosMock);
      setCategorias(categoriasApi.length ? categoriasApi : categoriasMock);
      setHistorial(movimientosApi.slice(0, 4));
    } catch (err) {
      setError("No se pudo consumir la API. Se muestran datos de prueba.");
      setProductos(productosMock);
      setCategorias(categoriasMock);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const productosFiltrados = useMemo(
    () =>
      productos.filter((p) =>
        `${p.nombre} ${p.categoria} ${p.estado}`
          .toLowerCase()
          .includes(busqueda.toLowerCase()),
      ),
    [productos, busqueda],
  );
  const productosActivos = productos.filter(
    (p) => p.estado === "Activo",
  ).length;
  const stockBajo = productos.filter(
    (p) => p.stock > 0 && p.stock <= p.stockMinimo,
  ).length;
  const stockCritico = productos.filter(
    (p) => p.stock <= 0 || p.stock < 3,
  ).length;

  const guardarProducto = async (producto) => {
    try {
      if (producto.id) await productsService.update(producto.id, producto);
      else await productsService.create(producto);
      await cargarDatos();
    } catch (err) {
      alert(`No se pudo guardar en API: ${err.message}`);
    }
  };

  const eliminarProducto = async (producto) => {
    if (!confirm(`¿Eliminar/desactivar ${producto.nombre}?`)) return;
    try {
      await productsService.remove(producto.id);
      await cargarDatos();
    } catch (err) {
      alert(`No se pudo eliminar: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Gestión de productos y stock conectado a API
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setProductoSeleccionado(null);
              setOpenModalProducto(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <Plus size={16} /> Nuevo producto
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            {error}
          </div>
        )}
        {loading && (
          <div className="text-sm text-muted-foreground">
            Cargando datos desde API...
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card
            icon={<Package size={18} />}
            title="Productos activos"
            value={productosActivos}
            subtitle="En catálogo POS"
          />
          <Card
            icon={<AlertTriangle size={18} />}
            title="Alertas stock bajo"
            value={stockBajo}
            subtitle="Requieren reposición"
            warn
          />
          <Card
            icon={<Boxes size={18} />}
            title="Stock crítico"
            value={stockCritico}
            subtitle="Necesita atención"
            danger
          />
        </div>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Catálogo de productos</h2>
              <p className="text-sm text-muted-foreground">
                Productos consumidos desde API con fallback mock.
              </p>
            </div>
            <div className="relative w-full md:max-w-sm">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar producto o categoría..."
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-3 py-3 text-left">Producto</th>
                  <th className="px-3 py-3 text-left">Categoría</th>
                  <th className="px-3 py-3 text-left">Precio</th>
                  <th className="px-3 py-3 text-left">Stock</th>
                  <th className="px-3 py-3 text-left">Mínimo</th>
                  <th className="px-3 py-3 text-left">Estado stock</th>
                  <th className="px-3 py-3 text-left">Estado</th>
                  <th className="px-3 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((p) => {
                  const est = estadoStock(p.stock, p.stockMinimo);
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-border last:border-none"
                    >
                      <td className="px-3 py-4 font-medium">{p.nombre}</td>
                      <td className="px-3 py-4">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          {p.categoria}
                        </span>
                      </td>
                      <td className="px-3 py-4">{formatearPrecio(p.precio)}</td>
                      <td className="px-3 py-4 font-medium">{p.stock}</td>
                      <td className="px-3 py-4">{p.stockMinimo}</td>
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2.5 w-24 overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full ${barraStock(p.stock, p.stockMinimo)}`}
                              style={{
                                width: `${porcentaje(p.stock, p.stockMinimo)}%`,
                              }}
                            />
                          </div>
                          <span
                            className={`text-xs font-medium ${textoStock(p.stock, p.stockMinimo)}`}
                          >
                            {est}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${p.estado === "Activo" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                        >
                          {p.estado}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setProductoSeleccionado(p);
                              setOpenModalProducto(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent"
                          >
                            <Pencil size={13} /> Editar
                          </button>
                          <button
                            onClick={() => {
                              setProductoSeleccionado(p);
                              setOpenModalStock(true);
                            }}
                            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent"
                          >
                            Stock
                          </button>
                          <button
                            onClick={() => eliminarProducto(p)}
                            className="rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Historial reciente</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-3 py-3 text-left">Fecha</th>
                  <th className="px-3 py-3 text-left">Producto</th>
                  <th className="px-3 py-3 text-left">Tipo</th>
                  <th className="px-3 py-3 text-left">Cantidad</th>
                  <th className="px-3 py-3 text-left">Usuario</th>
                  <th className="px-3 py-3 text-left">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-border last:border-none"
                  >
                    <td className="px-3 py-4">{m.fecha || "—"}</td>
                    <td className="px-3 py-4 font-medium">{m.producto}</td>
                    <td className="px-3 py-4">{m.tipo}</td>
                    <td className="px-3 py-4">{m.cantidad}</td>
                    <td className="px-3 py-4">{m.usuario}</td>
                    <td className="px-3 py-4">{m.detalle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <ModalFormProducto
        open={openModalProducto}
        onClose={() => setOpenModalProducto(false)}
        producto={productoSeleccionado}
        categorias={categorias}
        onSave={guardarProducto}
      />
      <ModalConsultarStock
        open={openModalStock}
        onClose={() => setOpenModalStock(false)}
        producto={productoSeleccionado}
      />
    </div>
  );
};

const Card = ({ icon, title, value, subtitle, warn, danger }) => (
  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
    <div className="mb-3 flex items-center gap-3">
      <div
        className={`rounded-xl p-2 ${danger ? "bg-destructive/10 text-destructive" : warn ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-primary/10 text-primary"}`}
      >
        {icon}
      </div>
      <p className="text-sm font-medium">{title}</p>
    </div>
    <p className="text-3xl font-bold">{value}</p>
    <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
  </div>
);
