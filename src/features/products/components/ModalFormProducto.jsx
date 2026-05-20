/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { uploadToCloudinary } from "@/api/claudinary.service"; 
import { Loader2 } from "lucide-react";

const estadoInicial = {
  categoryId: "",
  nombre: "",
  descripcion: "",
  precio: "",
  stockMinimo: "",
  imageUrl: "",
  estado: "Activo",
};

export const ModalFormProducto = ({
  open,
  onClose,
  producto,
  categorias = [],
  onSave,
}) => {
  const [form, setForm] = useState(estadoInicial);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (producto) {

      setForm({
        categoryId: producto.categoryId || producto.category?.id || "",
        nombre: producto.nombre || producto.name || "",
        descripcion: producto.descripcion || producto.description || "",
        precio: producto.precio ?? producto.salePrice ?? "",
        stockMinimo: producto.stockMinimo ?? producto.minStock ?? "",
        imageUrl: producto.imageUrl || "",
        estado: producto.estado || (producto.active === false ? "Inactivo" : "Activo"),
      });
    } else {
      setForm({ ...estadoInicial, categoryId: categorias[0]?.id || "" });
    }
  }, [producto, open, categorias]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (error) {
      alert("Error al subir la imagen a Cloudinary");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    

    onSave?.({
      id: producto?.id,
      categoryId: Number(form.categoryId),
      name: form.nombre,
      description: form.descripcion, 
      salePrice: Number(form.precio || 0),
      minStock: Number(form.stockMinimo || 0),
      imageUrl: form.imageUrl,
      active: form.estado === "Activo",
    });
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
              Los campos se envían con la estructura esperada por la API.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent"
          >
            Cerrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            
            <label className="space-y-1.5">
              <span className="text-sm font-medium">Nombre *</span>
              <input
                required
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej. Café americano"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>

           <label className="space-y-1.5">
              <span className="text-sm font-medium">Categoría *</span>
              <select
                required
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Seleccionar categoría</option>
                {categorias
                  
                  .filter((categoria) => categoria.active || String(categoria.id) === String(form.categoryId))
                
                  .map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre || categoria.name}
                    </option>
                  ))
                }
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium">Precio de venta *</span>
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
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium">Stock mínimo *</span>
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
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium">Estado</span>
              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </label>

            <div className="space-y-1.5">
              <span className="text-sm font-medium">Imagen del Producto</span>
              <div className="flex items-center gap-3">
                {form.imageUrl && (
                  <img 
                    src={form.imageUrl} 
                    alt="Preview" 
                    className="w-10 h-10 object-cover rounded-lg border border-border shrink-0" 
                  />
                )}
                <div className="flex-1 w-full overflow-hidden">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isUploading}
                    className="block w-full text-xs text-muted-foreground 
                      file:mr-2 file:py-1.5 file:px-3 
                      file:rounded-lg file:border-0 
                      file:text-xs file:font-medium 
                      file:bg-primary/10 file:text-primary 
                      hover:file:bg-primary/20 cursor-pointer disabled:opacity-50"
                  />
                </div>
                {isUploading && <Loader2 className="animate-spin text-primary shrink-0" size={18} />}
              </div>
              <input type="hidden" name="imageUrl" value={form.imageUrl} />
            </div>

          </div>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Descripción</span>
            <textarea
              rows="4"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Describe el producto..."
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};