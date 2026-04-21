import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Package,
  AlertTriangle,
  Boxes,
  Pencil,
  Warehouse,
} from "lucide-react";
import { ModalFormProducto } from "../components/ModalFormProducto";
import { ModalConsultarStock } from "../components/ModalConsultarStock";

const productosBase = [
  {
    id: 1,
    nombre: "Café americano",
    categoria: "Bebidas",
    precio: 15,
    stock: 38,
    stockMinimo: 10,
    estado: "Activo",
    descripcion: "Café clásico servido caliente.",
  },
  {
    id: 2,
    nombre: "Capuccino",
    categoria: "Bebidas",
    precio: 18,
    stock: 31,
    stockMinimo: 8,
    estado: "Activo",
    descripcion: "Capuccino con espuma de leche.",
  },
  {
    id: 3,
    nombre: "Té verde",
    categoria: "Bebidas",
    precio: 12,
    stock: 22,
    stockMinimo: 5,
    estado: "Activo",
    descripcion: "Infusión natural de té verde.",
  },
  {
    id: 4,
    nombre: "Jugo natural",
    categoria: "Bebidas",
    precio: 20,
    stock: 15,
    stockMinimo: 5,
    estado: "Activo",
    descripcion: "Jugo recién preparado.",
  },
  {
    id: 5,
    nombre: "Empanada",
    categoria: "Comidas",
    precio: 13,
    stock: 26,
    stockMinimo: 8,
    estado: "Activo",
    descripcion: "Empanada horneada del día.",
  },
  {
    id: 6,
    nombre: "Sándwich",
    categoria: "Comidas",
    precio: 32,
    stock: 20,
    stockMinimo: 6,
    estado: "Activo",
    descripcion: "Sándwich de jamón y queso.",
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
    id: 8,
    nombre: "Brownie",
    categoria: "Postres",
    precio: 16,
    stock: 11,
    stockMinimo: 5,
    estado: "Activo",
    descripcion: "Brownie de chocolate.",
  },
  {
    id: 9,
    nombre: "Café molido",
    categoria: "Insumos",
    precio: 0,
    stock: 2,
    stockMinimo: 5,
    estado: "Inactivo",
    descripcion: "Insumo para preparación de bebidas.",
  },
  {
    id: 10,
    nombre: "Leche entera",
    categoria: "Insumos",
    precio: 0,
    stock: 5,
    stockMinimo: 8,
    estado: "Inactivo",
    descripcion: "Leche usada para bebidas y postres.",
  },
];

const historialBase = [
  {
    id: 1,
    hora: "14:32",
    producto: "Café americano",
    tipo: "Venta",
    cantidad: -1,
    stockResultante: 38,
    usuario: "Imanani",
    detalle: "Venta #1084",
  },
  {
    id: 2,
    hora: "10:20",
    producto: "Café molido",
    tipo: "Merma",
    cantidad: -3,
    stockResultante: 2,
    usuario: "Mantezana",
    detalle: "Vencimiento",
  },
  {
    id: 3,
    hora: "09:00",
    producto: "Leche entera",
    tipo: "Ingreso",
    cantidad: 10,
    stockResultante: 15,
    usuario: "Mantezana",
    detalle: "Proveedor Lácteos SA",
  },
  {
    id: 4,
    hora: "08:30",
    producto: "Croissant",
    tipo: "Ajuste",
    cantidad: -2,
    stockResultante: 4,
    usuario: "Mantezana",
    detalle: "Corrección inventario",
  },
];

const formatearPrecio = (precio) => (precio ? `Bs ${precio}` : "—");

const obtenerEstadoStock = (stock, stockMinimo) => {
  if (stock <= 0) return "Crítico";
  if (stock <= stockMinimo) return "Bajo";
  return "Óptimo";
};

const obtenerClaseBarraStock = (stock, stockMinimo) => {
  if (stock <= 0) return "bg-destructive";
  if (stock <= stockMinimo) return "bg-amber-500";
  return "bg-primary";
};

const obtenerClaseTextoStock = (stock, stockMinimo) => {
  if (stock <= 0) return "text-destructive";
  if (stock <= stockMinimo) return "text-amber-600 dark:text-amber-400";
  return "text-primary";
};

const obtenerPorcentajeBarra = (stock, stockMinimo) => {
  const maximoVisual = Math.max(stockMinimo * 2, 10);
  const porcentaje = (stock / maximoVisual) * 100;
  return Math.max(8, Math.min(100, porcentaje));
};

const obtenerClaseMovimiento = (tipo) => {
  switch (tipo) {
    case "Venta":
      return "bg-destructive/10 text-destructive";
    case "Ingreso":
      return "bg-primary/10 text-primary";
    case "Merma":
      return "bg-destructive/15 text-destructive";
    default:
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
  }
};

export const PantallaGestionProductos = () => {
  const [busqueda, setBusqueda] = useState("");
  const [productos, setProductos] = useState(productosBase);
  const [historial] = useState(historialBase);
  const [openModalProducto, setOpenModalProducto] = useState(false);
  const [openModalStock, setOpenModalStock] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const productosFiltrados = useMemo(() => {
    return productos.filter((producto) =>
      `${producto.nombre} ${producto.categoria} ${producto.estado}`
        .toLowerCase()
        .includes(busqueda.toLowerCase()),
    );
  }, [productos, busqueda]);

  const productosActivos = productos.filter(
    (p) => p.estado === "Activo",
  ).length;
  const stockBajo = productos.filter(
    (p) => p.stock > 0 && p.stock <= p.stockMinimo,
  ).length;
  const stockCritico = productos.filter(
    (p) => p.stock <= 0 || p.stock < 3,
  ).length;

  const handleGuardarProducto = (productoForm) => {
    if (productoForm.id) {
      setProductos((prev) =>
        prev.map((item) => (item.id === productoForm.id ? productoForm : item)),
      );
      return;
    }

    const nuevoProducto = {
      ...productoForm,
      id: Date.now(),
    };

    setProductos((prev) => [nuevoProducto, ...prev]);
  };

  const handleGuardarStock = (productoActualizado) => {
    setProductos((prev) =>
      prev.map((item) =>
        item.id === productoActualizado.id ? productoActualizado : item,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Gestión de productos y stock
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setProductoSeleccionado(null);
                setOpenModalStock(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              <Warehouse size={16} />
              Ajustar stock
            </button>

            <button
              type="button"
              onClick={() => {
                setProductoSeleccionado(null);
                setOpenModalProducto(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <Plus size={16} />
              Nuevo producto
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <Package size={18} />
              </div>
              <p className="text-sm font-medium">Productos activos</p>
            </div>
            <p className="text-3xl font-bold">{productosActivos}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              En catálogo POS
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle size={18} />
              </div>
              <p className="text-sm font-medium">Alertas stock bajo</p>
            </div>
            <p className="text-3xl font-bold">{stockBajo}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Requieren reposición
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl bg-destructive/10 p-2 text-destructive">
                <Boxes size={18} />
              </div>
              <p className="text-sm font-medium">Stock crítico</p>
            </div>
            <p className="text-3xl font-bold">{stockCritico}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Necesita atención
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Catálogo de productos</h2>
              <p className="text-sm text-muted-foreground">
                Lista general de productos registrados
              </p>
            </div>

            <div className="relative w-full md:max-w-sm">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar producto o categoría..."
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-3 py-3 text-left font-medium">Producto</th>
                  <th className="px-3 py-3 text-left font-medium">Categoría</th>
                  <th className="px-3 py-3 text-left font-medium">Precio</th>
                  <th className="px-3 py-3 text-left font-medium">Stock</th>
                  <th className="px-3 py-3 text-left font-medium">Mínimo</th>
                  <th className="px-3 py-3 text-left font-medium">
                    Estado stock
                  </th>
                  <th className="px-3 py-3 text-left font-medium">Estado</th>
                  <th className="px-3 py-3 text-left font-medium">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {productosFiltrados.map((producto) => {
                  const estadoStock = obtenerEstadoStock(
                    producto.stock,
                    producto.stockMinimo,
                  );
                  const barraClase = obtenerClaseBarraStock(
                    producto.stock,
                    producto.stockMinimo,
                  );
                  const textoClase = obtenerClaseTextoStock(
                    producto.stock,
                    producto.stockMinimo,
                  );
                  const porcentaje = obtenerPorcentajeBarra(
                    producto.stock,
                    producto.stockMinimo,
                  );

                  return (
                    <tr
                      key={producto.id}
                      className="border-b border-border last:border-none"
                    >
                      <td className="px-3 py-4 font-medium">
                        {producto.nombre}
                      </td>

                      <td className="px-3 py-4">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          {producto.categoria}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        {formatearPrecio(producto.precio)}
                      </td>
                      <td className="px-3 py-4 font-medium">
                        {producto.stock}
                      </td>
                      <td className="px-3 py-4">{producto.stockMinimo}</td>

                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2.5 w-24 overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full ${barraClase}`}
                              style={{ width: `${porcentaje}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${textoClase}`}>
                            {estadoStock}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            producto.estado === "Activo"
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {producto.estado}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setProductoSeleccionado(producto);
                              setOpenModalProducto(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium transition hover:bg-accent hover:text-accent-foreground"
                          >
                            <Pencil size={13} />
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setProductoSeleccionado(producto);
                              setOpenModalStock(true);
                            }}
                            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium transition hover:bg-accent hover:text-accent-foreground"
                          >
                            Stock
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
            <div>
              <h2 className="text-xl font-semibold">
                Historial de movimientos
              </h2>
              <p className="text-sm text-muted-foreground">
                Últimos movimientos de inventario
              </p>
            </div>

            <button
              type="button"
              className="text-sm font-medium text-primary underline underline-offset-4"
            >
              Ver completo
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-3 py-3 text-left font-medium">Hora</th>
                  <th className="px-3 py-3 text-left font-medium">Producto</th>
                  <th className="px-3 py-3 text-left font-medium">Tipo</th>
                  <th className="px-3 py-3 text-left font-medium">Cantidad</th>
                  <th className="px-3 py-3 text-left font-medium">
                    Stock resultante
                  </th>
                  <th className="px-3 py-3 text-left font-medium">Usuario</th>
                  <th className="px-3 py-3 text-left font-medium">Detalle</th>
                </tr>
              </thead>

              <tbody>
                {historial.map((movimiento) => (
                  <tr
                    key={movimiento.id}
                    className="border-b border-border last:border-none"
                  >
                    <td className="px-3 py-4">{movimiento.hora}</td>
                    <td className="px-3 py-4 font-medium">
                      {movimiento.producto}
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${obtenerClaseMovimiento(movimiento.tipo)}`}
                      >
                        {movimiento.tipo}
                      </span>
                    </td>
                    <td
                      className={`px-3 py-4 font-medium ${
                        movimiento.cantidad > 0
                          ? "text-primary"
                          : "text-destructive"
                      }`}
                    >
                      {movimiento.cantidad > 0
                        ? `+${movimiento.cantidad}`
                        : movimiento.cantidad}
                    </td>
                    <td className="px-3 py-4">{movimiento.stockResultante}</td>
                    <td className="px-3 py-4">{movimiento.usuario}</td>
                    <td className="px-3 py-4">{movimiento.detalle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <ModalFormProducto
          open={openModalProducto}
          onClose={() => setOpenModalProducto(false)}
          producto={productoSeleccionado}
          onSave={handleGuardarProducto}
        />

        <ModalConsultarStock
          open={openModalStock}
          onClose={() => setOpenModalStock(false)}
          producto={productoSeleccionado}
          onSave={handleGuardarStock}
        />
      </div>
    </div>
  );
};
