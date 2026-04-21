import { useEffect, useState } from "react";

const estadoInicial = {
  nombre: "",
  categoria: "",
  precio: "",
  stock: "",
  stockMinimo: "",
  estado: "Activo",
  descripcion: "",
};

export const ModalFormProducto = ({ open, onClose, producto, onSave }) => {
  const [form, setForm] = useState(estadoInicial);

  useEffect(() => {
    if (producto) {
      setForm({
        nombre: producto.nombre || "",
        categoria: producto.categoria || "",
        precio: producto.precio ?? "",
        stock: producto.stock ?? "",
        stockMinimo: producto.stockMinimo ?? "",
        estado: producto.estado || "Activo",
        descripcion: producto.descripcion || "",
      });
    } else {
      setForm(estadoInicial);
    }
  }, [producto, open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...producto,
      ...form,
      precio: Number(form.precio || 0),
      stock: Number(form.stock || 0),
      stockMinimo: Number(form.stockMinimo || 0),
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {producto ? "Editar producto" : "Nuevo producto"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Completa la información del producto.
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

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Nombre
              </label>
              <input
                required
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej. Café americano"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Categoría
              </label>
              <input
                required
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                placeholder="Ej. Bebidas"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Precio
              </label>
              <input
                required
                min="0"
                step="0.01"
                type="number"
                name="precio"
                value={form.precio}
                onChange={handleChange}
                placeholder="0"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Stock actual
              </label>
              <input
                required
                min="0"
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                placeholder="0"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Stock mínimo
              </label>
              <input
                required
                min="0"
                type="number"
                name="stockMinimo"
                value={form.stockMinimo}
                onChange={handleChange}
                placeholder="0"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Estado
              </label>
              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Descripción
            </label>
            <textarea
              rows="4"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Describe el producto..."
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
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
