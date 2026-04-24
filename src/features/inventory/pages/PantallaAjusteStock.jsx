import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ClipboardCheck,
  PackageSearch,
  Save,
} from "lucide-react";
import { productsService } from "@/features/products/services/products.service";
import {
  MOVEMENT_TYPES,
  stockMovementsService,
} from "../services/stockMovements.service";

const productosMock = [
  {
    id: 1,
    nombre: "Café americano",
    categoria: "Bebidas",
    stock: 38,
    stockMinimo: 10,
  },
  {
    id: 7,
    nombre: "Croissant",
    categoria: "Panadería",
    stock: 4,
    stockMinimo: 6,
  },
  {
    id: 9,
    nombre: "Café molido",
    categoria: "Insumos",
    stock: 2,
    stockMinimo: 5,
  },
];

export const PantallaAjusteStock = () => {
  const [productos, setProductos] = useState(productosMock);
  const [productoId, setProductoId] = useState(productosMock[0].id);
  const [tipo, setTipo] = useState("Ingreso");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [proveedor, setProveedor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cargarProductos = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await productsService.getAll();
      const activos = data.filter((p) => p.estado === "Activo");
      setProductos(activos.length ? activos : productosMock);
      setProductoId((activos[0] || productosMock[0]).id);
    } catch (err) {
      setError(
        "No se pudieron cargar productos desde API. Se muestran datos de prueba.",
      );
      setProductos(productosMock);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const productoSeleccionado =
    productos.find((item) => Number(item.id) === Number(productoId)) ??
    productos[0];
  const stockAntes = Number(productoSeleccionado?.stock || 0);
  const cantidadNumerica = Number(cantidad || 0);

  const movimiento = useMemo(() => {
    if (tipo === "Ingreso") return cantidadNumerica;
    if (tipo === "Merma") return -cantidadNumerica;
    return cantidadNumerica - stockAntes;
  }, [tipo, cantidadNumerica, stockAntes]);

  const stockDespues = Math.max(0, stockAntes + movimiento);
  const mermaInvalida = tipo === "Merma" && cantidadNumerica > stockAntes;

  const movementTypeId =
    tipo === "Ingreso"
      ? MOVEMENT_TYPES.INGRESO
      : tipo === "Merma"
        ? MOVEMENT_TYPES.MERMA
        : MOVEMENT_TYPES.AJUSTE;
  const quantity =
    tipo === "Ajuste"
      ? movimiento
      : tipo === "Merma"
        ? -Math.abs(cantidadNumerica)
        : Math.abs(cantidadNumerica);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mermaInvalida || !productoSeleccionado || !cantidadNumerica) return;
    try {
      await stockMovementsService.create({
        productId: Number(productoSeleccionado.id),
        movementTypeId,
        quantity,
        reason:
          tipo === "Ingreso" && proveedor
            ? `${motivo || "Ingreso de mercadería"} - Proveedor: ${proveedor}`
            : motivo || tipo,
      });
      alert("Movimiento registrado correctamente en la API.");
      setCantidad("");
      setMotivo("");
      setProveedor("");
      await cargarProductos();
    } catch (err) {
      alert(`No se pudo registrar el movimiento: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ajuste de Stock</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Registrar ingreso de mercadería, ajuste manual o merma con API.
          </p>
        </div>
        {error && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            {error}
          </div>
        )}
        {loading && (
          <p className="text-sm text-muted-foreground">Cargando productos...</p>
        )}
        <div className="grid gap-4 md:grid-cols-3">
          <Card
            icon={<PackageSearch size={18} />}
            title="Producto seleccionado"
            value={productoSeleccionado?.nombre || "—"}
            subtitle={productoSeleccionado?.categoria || "—"}
          />
          <Card
            title="Stock actual"
            value={stockAntes}
            subtitle={`Mínimo: ${productoSeleccionado?.stockMinimo ?? "—"}`}
          />
          <Card
            icon={<ClipboardCheck size={18} />}
            title="Stock después"
            value={stockDespues}
            subtitle={`Movimiento: ${movimiento > 0 ? "+" : ""}${movimiento}`}
            warn={stockDespues <= (productoSeleccionado?.stockMinimo || 0)}
          />
        </div>
        <form
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"
        >
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-5">
            <h2 className="text-xl font-semibold">Datos del movimiento</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-sm font-medium">Producto</span>
                <select
                  value={productoId}
                  onChange={(e) => setProductoId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} · Stock {p.stock}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium">
                  Cantidad / nuevo stock
                </span>
                <input
                  required
                  min="0"
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder={
                    tipo === "Ajuste" ? "Nuevo stock total" : "Cantidad"
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Tipo de movimiento</p>
              <div className="grid gap-2 md:grid-cols-3">
                {["Ingreso", "Ajuste", "Merma"].map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => setTipo(op)}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium ${tipo === op ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-accent"}`}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>
            {tipo === "Ingreso" && (
              <label className="block space-y-1">
                <span className="text-sm font-medium">Proveedor</span>
                <input
                  value={proveedor}
                  onChange={(e) => setProveedor(e.target.value)}
                  placeholder="Ej. Proveedor Lácteos SA"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
            )}
            <label className="block space-y-1">
              <span className="text-sm font-medium">
                Motivo / justificación *
              </span>
              <textarea
                required
                rows={4}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ej. Producto vencido, ingreso de mercadería, corrección inventario..."
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
            {mermaInvalida && (
              <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertTriangle size={16} /> La merma no puede superar el stock
                disponible.
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setCantidad("");
                  setMotivo("");
                  setProveedor("");
                }}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                Cancelar
              </button>
              <button
                disabled={mermaInvalida}
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                <Save size={16} /> Confirmar
              </button>
            </div>
          </section>
          <aside className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Resumen</h2>
            <div className="mt-4 space-y-3 text-sm">
              <Row label="Stock antes" value={stockAntes} />
              <Row
                label="Movimiento"
                value={`${movimiento > 0 ? "+" : ""}${movimiento}`}
              />
              <Row label="Stock después" value={stockDespues} />
              <Row label="Tipo API" value={`${movementTypeId}`} />
              <Row label="Producto ID" value={productoSeleccionado?.id} />
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
};

const Card = ({ icon, title, value, subtitle, warn }) => (
  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
    <div className="mb-3 flex items-center gap-3">
      {icon && (
        <div
          className={`rounded-xl p-2 ${warn ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"}`}
        >
          {icon}
        </div>
      )}
      <p className="text-sm font-medium">{title}</p>
    </div>
    <p className="text-2xl font-bold">{value}</p>
    <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
  </div>
);
const Row = ({ label, value }) => (
  <div className="flex items-center justify-between border-b border-border pb-2">
    <span className="text-muted-foreground">{label}</span>
    <strong>{value}</strong>
  </div>
);
