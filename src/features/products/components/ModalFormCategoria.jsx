import { useEffect, useState } from "react";
import { X, Save } from "lucide-react";

const estadoInicial = {
  id: null,
  nombre: "",
  descripcion: "",
  productosAsociados: 0,
  estado: "Activa",
};

export const ModalFormCategoria = ({ open, onClose, categoria, onSave }) => {
  const [form, setForm] = useState(estadoInicial);

  useEffect(() => {
    if (!open) return;
    setForm(categoria ? { ...estadoInicial, ...categoria } : estadoInicial);
  }, [open, categoria]);

  if (!open) return null;

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    onSave?.({
      ...form,
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      productosAsociados: Number(form.productosAsociados || 0),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">
              {categoria ? "Editar categoría" : "Nueva categoría"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Organiza el catálogo para asociar productos correctamente.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border bg-background p-2 hover:bg-accent"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium">Nombre de categoría *</span>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej. Bebidas"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Descripción</span>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={3}
              placeholder="Ej. Bebidas calientes, frías e infusiones."
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-sm font-medium">Productos asociados</span>
              <input
                name="productosAsociados"
                type="number"
                min="0"
                value={form.productosAsociados}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">Estado</span>
              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none"
              >
                <option>Activa</option>
                <option>Inactiva</option>
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
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
              <Save size={16} /> Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
