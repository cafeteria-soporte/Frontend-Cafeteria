import { useEffect, useMemo, useState } from "react";
import { X, Search, Save, AlertTriangle } from "lucide-react";
import { Product } from "@/features/products/dto/product.dto"; 
import React from "react";


const obtenerEstadoStock = (stockActual: number, stockMinimo: number) => {
  if (stockActual <= 0 || stockActual < 3) return "Crítico";
  if (stockActual <= stockMinimo) return "Bajo";
  return "OK";
};

const obtenerClaseEstado = (estado: string) => {
  if (estado === "Crítico") return "bg-destructive/10 text-destructive";
  if (estado === "Bajo") return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  return "bg-primary/10 text-primary";
};

interface ModalConsultarStockProps {
  open: boolean;
  onClose: () => void;
  producto?: Product | any;
  productos?: Product[] | any[];
  onSave?: (data: { productId: number; movementTypeId: number; quantity: number; reason: string }) => void;
}

export const ModalConsultarStock = ({ 
  open, 
  onClose, 
  producto, 
  productos = [], 
  onSave 
}: ModalConsultarStockProps) => {
  const [busqueda, setBusqueda] = useState("");
  const [tipoMovimiento, setTipoMovimiento] = useState("Ingreso");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    if (open) {
      setCantidad("");
      setMotivo("");
      setTipoMovimiento("Ingreso");
      setBusqueda("");
    }
  }, [open, producto]);

  const stockAntes = Number(producto?.stock ?? 0);
  const cantidadNumerica = Number(cantidad || 0);

  const movimientoCalculado = useMemo(() => {
    if (!producto) return 0;
    if (tipoMovimiento === "Ingreso") return cantidadNumerica;
    if (tipoMovimiento === "Merma") return -cantidadNumerica;
    return cantidadNumerica - stockAntes; // Caso "Ajuste manual"
  }, [producto, tipoMovimiento, cantidadNumerica, stockAntes]);

  const stockDespues = Math.max(0, stockAntes + movimientoCalculado);

  const productosFiltrados = productos.filter((item) => {
    const estado = obtenerEstadoStock(item.stock, item.stockMinimo);
    return `${item.nombre} ${item.categoria || ""} ${estado}`
      .toLowerCase()
      .includes(busqueda.toLowerCase());
  });

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!producto) return;
    if (cantidadNumerica < 0) return;
    if (tipoMovimiento === "Merma" && cantidadNumerica > stockAntes) return;

    const getMovementTypeId = (tipo: string) => {
      if (tipo === "Ingreso") return 1;
      if (tipo === "Merma") return 3;
      return 2; // Ajuste manual
    };

    const quantityToSend = tipoMovimiento === "A Ajuste manual" 
      ? movimientoCalculado
      : tipoMovimiento === "Merma"
        ? -Math.abs(cantidadNumerica)
        : Math.abs(cantidadNumerica);

    onSave?.({
      productId: Number(producto.id),
      movementTypeId: getMovementTypeId(tipoMovimiento),
      quantity: quantityToSend,
      reason: motivo || tipoMovimiento,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">
              {producto ? `Stock de ${producto.nombre}` : "Consulta de stock"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Consulta niveles de stock y registra reposiciones, ajustes o mermas.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-border bg-background p-2 transition hover:bg-accent"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {producto ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-xs text-muted-foreground">Producto</p>
                <p className="mt-1 font-semibold">{producto.nombre}</p>
                <p className="text-xs text-muted-foreground">
                  {producto.categoria || "Sin categoría"}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-xs text-muted-foreground">Stock actual</p>
                <p className="mt-1 text-2xl font-bold">{stockAntes}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-xs text-muted-foreground">Stock mínimo</p>
                <p className="mt-1 text-2xl font-bold">
                  {/* Leemos producto.stockMinimo */}
                  {producto.stockMinimo}
                </p>
              </div>
            </div>

            {stockAntes <= producto.stockMinimo && (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
                <AlertTriangle size={18} className="mt-0.5" />
                <p>
                  Este producto está en nivel bajo/crítico. Se recomienda registrar un ingreso de mercadería.
                </p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-1">
                <span className="text-sm font-medium">Tipo de movimiento</span>
                <select
                  value={tipoMovimiento}
                  onChange={(e) => setTipoMovimiento(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none"
                >
                  <option>Ingreso</option>
                  <option>Ajuste manual</option>
                  <option>Merma</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium">
                  {tipoMovimiento === "Ajuste manual" ? "Nuevo stock total" : "Cantidad"}
                </span>
                <input
                  type="number"
                  min="0"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none"
                  placeholder="Ej. 10"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium">Motivo </span>
                <input
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none"
                  placeholder="Ej. Proveedor Lácteos SA"
                />
              </label>
            </div>

            <div className="grid gap-4 rounded-2xl border border-border bg-background p-4 md:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Stock antes</p>
                <p className="text-xl font-bold">{stockAntes}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Movimiento</p>
                <p
                  className={`text-xl font-bold ${movimientoCalculado >= 0 ? "text-primary" : "text-destructive"}`}
                >
                  {movimientoCalculado >= 0 ? `+${movimientoCalculado}` : movimientoCalculado}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stock después</p>
                <p className="text-xl font-bold">{stockDespues}</p>
              </div>
            </div>

            {tipoMovimiento === "Merma" && cantidadNumerica > stockAntes && (
              <p className="text-sm text-destructive">
                La merma no puede superar el stock disponible.
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                <Save size={16} /> Confirmar
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm outline-none"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="px-3 py-3 text-left">Producto</th>
                    <th className="px-3 py-3 text-left">Categoría</th>
                    <th className="px-3 py-3 text-left">Stock disponible</th>
                    <th className="px-3 py-3 text-left">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.map((item) => {
                    const estado = obtenerEstadoStock(item.stock, item.stockMinimo);
                    return (
                      <tr key={item.id} className="border-b border-border last:border-none">
                        <td className="px-3 py-3 font-medium">{item.nombre}</td>
                        <td className="px-3 py-3">{item.categoria || "N/A"}</td>
                        <td className="px-3 py-3">{item.stock}</td>
                        <td className="px-3 py-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${obtenerClaseEstado(estado)}`}
                          >
                            {estado}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                type="button"
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};