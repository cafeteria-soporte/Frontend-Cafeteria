/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ClipboardCheck, PackageSearch, Save } from "lucide-react";
import { useProducts } from "@/features/products/hooks/useProducts"; 
import { useStock } from "../hooks/useStock";
import { toast } from "sonner";

export const PantallaAjusteStock = () => {
  const { products, loadingProducts, getAllProducts } = useProducts();
  const { createMovement } = useStock();

  const [productoId, setProductoId] = useState("");
  const [tipo, setTipo] = useState("Ingreso");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [proveedor, setProveedor] = useState("");

  useEffect(() => {
    getAllProducts({ limit: 100, active: true });
  }, [getAllProducts]);

  const productosMapeados = useMemo(() => {
    return products
      .filter((p) => p.active) 
      .map((p) => ({
        id: p.id,
        nombre: p.name || "Sin nombre",
        categoria: p.category?.name || "Sin categoría",
        stock: p.currentStock ?? 0,
        stockMinimo: p.minStock ?? 0,
      }));
  }, [products]);

  useEffect(() => {
    if (productosMapeados.length > 0 && !productoId) {
      setProductoId(productosMapeados[0].id);
    }
  }, [productosMapeados, productoId]);

  const productoSeleccionado = productosMapeados.find((item) => Number(item.id) === Number(productoId)) || productosMapeados[0];
  const stockAntes = Number(productoSeleccionado?.stock || 0);
  const cantidadNumerica = Number(cantidad || 0);

  const movimiento = useMemo(() => {
    if (tipo === "Ingreso") return cantidadNumerica;
    if (tipo === "Merma") return -cantidadNumerica;
    return cantidadNumerica - stockAntes; 
  }, [tipo, cantidadNumerica, stockAntes]);

  const stockDespues = Math.max(0, stockAntes + movimiento);
  const mermaInvalida = tipo === "Merma" && cantidadNumerica > stockAntes;

  const getMovementTypeId = (tipoUI) => {
    if (tipoUI === "Ingreso") return 1; 
    if (tipoUI === "Merma") return 3;   
    return 2;                         
  };

  const movementTypeId = getMovementTypeId(tipo);
  
  const quantity = tipo === "Ajuste"
    ? movimiento
    : tipo === "Merma"
      ? -Math.abs(cantidadNumerica)
      : Math.abs(cantidadNumerica);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mermaInvalida || !productoSeleccionado || !cantidadNumerica) return;
    
    try {
      await createMovement({
        productId: Number(productoSeleccionado.id),
        movementTypeId: movementTypeId,
        quantity: quantity,
        reason: tipo === "Ingreso" && proveedor
          ? `${motivo || "Ingreso de mercadería"} - Proveedor: ${proveedor}`
          : motivo || tipo,
      });

      toast.success("¡Movimiento registrado correctamente!");
      
      setCantidad("");
      setMotivo("");
      setProveedor("");
      
      await getAllProducts({ limit: 100, active: true });
      
    } catch (err) {
      toast.error(`No se pudo registrar el movimiento: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ajuste de Stock</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Registrar ingreso de mercadería, ajuste manual o merma conectado a la API.
          </p>
        </div>

        {loadingProducts && (
          <p className="text-sm text-muted-foreground animate-pulse">Cargando productos...</p>
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

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
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
                  {productosMapeados.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} · Stock: {p.stock}
                    </option>
                  ))}
                </select>
              </label>
              
              <label className="space-y-1">
                <span className="text-sm font-medium">
                  {tipo === "Ajuste" ? "Nuevo stock total" : "Cantidad"}
                </span>
                <input
                  required
                  min="0"
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder={tipo === "Ajuste" ? "Nuevo stock total" : "Cantidad"}
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
                    className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                      tipo === op
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-accent"
                    }`}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>

            {tipo === "Ingreso" && (
              <label className="block space-y-1">
                <span className="text-sm font-medium">Proveedor (Opcional)</span>
                <input
                  value={proveedor}
                  onChange={(e) => setProveedor(e.target.value)}
                  placeholder="Ej. Proveedor Lácteos SA"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
            )}

            <label className="block space-y-1">
              <span className="text-sm font-medium">Motivo / justificación *</span>
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
                <AlertTriangle size={16} /> La merma no puede superar el stock disponible.
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

          <aside className="rounded-2xl border border-border bg-card p-5 shadow-sm h-fit">
            <h2 className="text-xl font-semibold">Resumen</h2>
            <div className="mt-4 space-y-3 text-sm">
              <Row label="Stock antes" value={stockAntes} />
              <Row
                label="Movimiento"
                value={
                  <span className={movimiento > 0 ? "text-primary font-bold" : movimiento < 0 ? "text-destructive font-bold" : ""}>
                    {movimiento > 0 ? "+" : ""}{movimiento}
                  </span>
                }
              />
              <Row label="Stock después" value={stockDespues} />
              <Row label="Producto " value={productoSeleccionado?.nombre || "—"} />
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
};

// Componentes de UI que ya tenías
const Card = ({ icon, title, value, subtitle, warn }) => (
  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
    <div className="mb-3 flex items-center gap-3">
      {icon && (
        <div className={`rounded-xl p-2 ${warn ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"}`}>
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