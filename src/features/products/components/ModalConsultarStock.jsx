import { useEffect, useState } from "react";

export const ModalConsultarStock = ({ open, onClose, producto, onSave }) => {
  const [stock, setStock] = useState("");
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    setStock(producto?.stock ?? "");
    setMotivo("");
  }, [producto, open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!producto) return onClose();

    onSave({
      ...producto,
      stock: Number(stock || 0),
      ultimoMotivoStock: motivo,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {producto
                ? `Ajustar stock: ${producto.nombre}`
                : "Consulta de stock"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {producto
                ? "Actualiza la cantidad disponible del producto."
                : "Selecciona un producto desde la tabla para consultar o ajustar stock."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Cerrar
          </button>
        </div>

        {producto ? (
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Stock actual
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {producto.stock}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Stock mínimo
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {producto.stockMinimo}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Nuevo stock
              </label>
              <input
                required
                min="0"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Motivo
              </label>
              <textarea
                rows="3"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ej. Reabastecimiento, corrección de inventario..."
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Guardar cambio
              </button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-5 text-sm text-muted-foreground">
            Abre este modal desde el botón{" "}
            <span className="font-semibold text-foreground">Stock</span> de un
            producto.
          </div>
        )}
      </div>
    </div>
  );
};
