import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ClipboardCheck,
  PackageSearch,
  Save,
} from "lucide-react";

const productos = [
  {
    id: 1,
    nombre: "Café americano",
    categoria: "Bebidas",
    stock: 38,
    stockMinimo: 10,
    ultimaActualizacion: "24 abr 2026 · 14:32",
  },
  {
    id: 2,
    nombre: "Capuccino",
    categoria: "Bebidas",
    stock: 31,
    stockMinimo: 8,
    ultimaActualizacion: "24 abr 2026 · 13:10",
  },
  {
    id: 7,
    nombre: "Croissant",
    categoria: "Panadería",
    stock: 4,
    stockMinimo: 6,
    ultimaActualizacion: "24 abr 2026 · 08:30",
  },
  {
    id: 9,
    nombre: "Café molido",
    categoria: "Insumos",
    stock: 2,
    stockMinimo: 5,
    ultimaActualizacion: "24 abr 2026 · 10:20",
  },
  {
    id: 10,
    nombre: "Leche entera",
    categoria: "Insumos",
    stock: 5,
    stockMinimo: 8,
    ultimaActualizacion: "24 abr 2026 · 09:00",
  },
];

export const PantallaAjusteStock = () => {
  const [productoId, setProductoId] = useState(productos[0].id);
  const [tipo, setTipo] = useState("Ingreso");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [proveedor, setProveedor] = useState("");

  const productoSeleccionado =
    productos.find((item) => item.id === Number(productoId)) ?? productos[0];
  const stockAntes = productoSeleccionado.stock;
  const cantidadNumerica = Number(cantidad || 0);

  const movimiento = useMemo(() => {
    if (tipo === "Ingreso") return cantidadNumerica;
    if (tipo === "Merma") return -cantidadNumerica;
    return cantidadNumerica - stockAntes;
  }, [tipo, cantidadNumerica, stockAntes]);

  const stockDespues = Math.max(0, stockAntes + movimiento);
  const mermaInvalida = tipo === "Merma" && cantidadNumerica > stockAntes;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mermaInvalida) return;
    alert(
      "Movimiento registrado en modo mock. Luego se enviará al backend/API.",
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ajuste de Stock</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Registrar ingreso de mercadería, ajuste manual o merma.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <PackageSearch size={18} />
              </div>
              <p className="text-sm font-medium">Producto seleccionado</p>
            </div>
            <p className="text-xl font-bold">{productoSeleccionado.nombre}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {productoSeleccionado.categoria}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">
              Stock actual
            </p>
            <p className="mt-2 text-3xl font-bold">{stockAntes}</p>
            <p className="text-sm text-muted-foreground">
              Mínimo: {productoSeleccionado.stockMinimo}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">
              Última actualización
            </p>
            <p className="mt-2 text-xl font-bold">
              {productoSeleccionado.ultimaActualizacion}
            </p>
            <p className="text-sm text-muted-foreground">
              Movimiento anterior registrado
            </p>
          </div>
        </div>

        {productoSeleccionado.stock <= productoSeleccionado.stockMinimo && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
            <AlertTriangle size={18} className="mt-0.5" />
            <p>
              Este producto está bajo el nivel mínimo. Prioriza un ingreso de
              mercadería.
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"
        >
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Formulario de movimiento</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="space-y-1 md:col-span-2">
                <span className="text-sm font-medium">Producto activo</span>
                <select
                  value={productoId}
                  onChange={(e) => setProductoId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none"
                >
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} — Stock {p.stock}
                    </option>
                  ))}
                </select>
              </label>
              <div className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium">Tipo de movimiento</span>
                <div className="grid gap-2 sm:grid-cols-3">
                  {["Ingreso", "Ajuste manual", "Merma"].map((item) => (
                    <label
                      key={item}
                      className={`flex cursor-pointer items-center justify-center rounded-xl border px-3 py-3 text-sm font-medium ${tipo === item ? "border-primary bg-primary/10 text-primary" : "border-border bg-background"}`}
                    >
                      <input
                        type="radio"
                        name="tipo"
                        value={item}
                        checked={tipo === item}
                        onChange={(e) => setTipo(e.target.value)}
                        className="sr-only"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
              <label className="space-y-1">
                <span className="text-sm font-medium">
                  {tipo === "Ajuste manual"
                    ? "Nuevo stock total"
                    : tipo === "Merma"
                      ? "Cantidad perdida"
                      : "Cantidad a agregar"}
                </span>
                <input
                  type="number"
                  min="0"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium">
                  {tipo === "Ingreso"
                    ? "Motivo / Proveedor"
                    : "Motivo del ajuste"}
                </span>
                <input
                  value={tipo === "Ingreso" ? proveedor : motivo}
                  onChange={(e) =>
                    tipo === "Ingreso"
                      ? setProveedor(e.target.value)
                      : setMotivo(e.target.value)
                  }
                  placeholder={
                    tipo === "Merma"
                      ? "Vencimiento / Daño / Derrame"
                      : "Justificación"
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none"
                />
              </label>
            </div>
            {mermaInvalida && (
              <p className="mt-3 text-sm text-destructive">
                La cantidad perdida no puede superar el stock disponible.
              </p>
            )}
          </section>

          <aside className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Resumen</h2>
            <div className="mt-5 space-y-4">
              <div className="flex justify-between rounded-xl bg-background p-3">
                <span className="text-muted-foreground">Stock antes</span>
                <strong>{stockAntes}</strong>
              </div>
              <div className="flex justify-between rounded-xl bg-background p-3">
                <span className="text-muted-foreground">Movimiento</span>
                <strong
                  className={
                    movimiento >= 0 ? "text-primary" : "text-destructive"
                  }
                >
                  {movimiento >= 0 ? `+${movimiento}` : movimiento}
                </strong>
              </div>
              <div className="flex justify-between rounded-xl bg-background p-3">
                <span className="text-muted-foreground">Stock después</span>
                <strong>{stockDespues}</strong>
              </div>
            </div>
            <button
              type="submit"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <Save size={16} /> Confirmar movimiento
            </button>
          </aside>
        </form>
      </div>
    </div>
  );
};
