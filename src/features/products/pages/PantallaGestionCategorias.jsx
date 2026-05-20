import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, Tags, Boxes, Ban } from "lucide-react";
import { ModalFormCategoria } from "../components/ModalFormCategoria";
import { useCategories } from "../hooks/useCategories"; 
import { useProducts } from "../hooks/useProducts"; 
import { toast } from "sonner";

export const PantallaGestionCategorias = () => {
  const { 
    categories, 
    loading: loadingCategorias, 
    getAllCategories, 
    createCategory, 
    updateCategory 
  } = useCategories();

 
  const { products = [], getAllProducts } = useProducts(); 

  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("Todas");
  const [openModal, setOpenModal] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [categoriaADesactivar, setCategoriaADesactivar] = useState(null);

  const confirmarDesactivacion = async () => {
    if (!categoriaADesactivar) return;
    try {
      await updateCategory(categoriaADesactivar.id, { active: false });
      await getAllCategories({ limit: 100, page: 1 });
      setOpenConfirmModal(false);
      setCategoriaADesactivar(null);
    } catch (err) {
      toast.error(`Error al desactivar: ${err.message}`);
    }
  };

  useEffect(() => {
    getAllCategories({ limit: 100, page: 1 });

    if (getAllProducts) {
      getAllProducts({ limit: 1000, page: 1 }); 
    }
  }, [getAllCategories, getAllProducts]);
console.log("🔍 productos desde el hook:", products) ;
const categoriasFiltradas = useMemo(() => {
  return categories
    .map((cat) => ({
      id: cat.id,
      nombre: cat.name,
      estado: cat.active ? "Activa" : "Inactiva",
      productosAsociados: products.filter(
        (p) => Number(p.category?.id) === Number(cat.id)
      ).length,
    }))
    .filter((c) => {
      const coincideTexto = c.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideEstado = estado === "Todas" || c.estado === estado;
      return coincideTexto && coincideEstado;
    });
}, [categories, products, busqueda, estado]);

  const totalActivas = categoriasFiltradas.filter((c) => c.estado === "Activa").length;
  const sinProductos = categoriasFiltradas.filter((c) => Number(c.productosAsociados) === 0).length;
  const totalProductosAsociados = categoriasFiltradas.reduce(
    (acc, item) => acc + Number(item.productosAsociados || 0),
    0
  );

  const handleSave = async (categoriaForm) => {
    try {
      const payload = {
        name: categoriaForm.nombre,
        active: categoriaForm.active,
      };

      if (categoriaForm.id) {
        await updateCategory(categoriaForm.id, payload);
      } else {
        await createCategory(payload);
      }
      await getAllCategories({ limit: 100, page: 1 });
      setOpenModal(false);
    } catch (err) {
      toast.error(`No se pudo guardar la categoría: ${err.message}`);
    }
  };

 
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Gestión de categorías conectada a API
            </p>
          </div>
          <button
            onClick={() => {
              setCategoriaSeleccionada(null);
              setOpenModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Plus size={16} /> Nueva categoría
          </button>
        </div>

        {loadingCategorias && (
          <p className="text-sm text-muted-foreground">
            Cargando categorías...
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <Card
            icon={<Tags size={18} />}
            title="Categorías activas"
            value={totalActivas}
            subtitle="Disponibles para productos"
          />
          <Card
            icon={<Boxes size={18} />}
            title="Productos asociados"
            value={totalProductosAsociados}
            subtitle="Distribuidos por categoría"
          />
          <Card
            icon={<Trash2 size={18} />}
            title="Sin productos"
            value={sinProductos}
            subtitle="Pueden inactivarse"
            warn
          />
        </div>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Lista de categorías</h2>
              <p className="text-sm text-muted-foreground">
                La API permite crear y actualizar nombre/estado.
              </p>
            </div>
            <div className="grid w-full gap-2 md:max-w-2xl md:grid-cols-[1fr_180px]">
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar categoría..."
                  className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option>Todas</option>
                <option>Activa</option>
                <option>Inactiva</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-3 py-3 text-left">Nombre</th>
                  <th className="px-3 py-3 text-left">Estado</th>
                  <th className="px-3 py-3 text-left">Productos asociados</th>
                  <th className="px-3 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categoriasFiltradas.length === 0 && !loadingCategorias ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-muted-foreground">
                      No se encontraron categorías.
                    </td>
                  </tr>
                ) : (
                  categoriasFiltradas.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-border last:border-none"
                    >
                      <td className="px-3 py-4 font-semibold">{c.nombre}</td>
                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            c.estado === "Activa"
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {c.estado}
                        </span>
                      </td>
                      <td className="px-3 py-4">{c.productosAsociados}</td>
                      <td className="px-3 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setCategoriaSeleccionada(c);
                              setOpenModal(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent"
                          >
                            <Pencil size={13} /> Editar
                          </button>
                          <button
                            onClick={() => {
                              if (c.estado === "Inactiva") {
                                alert("Esta categoría ya está inactiva.");
                                return;
                              }
                              setCategoriaADesactivar(c);
                              setOpenConfirmModal(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-500/40 px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-500/10 dark:text-amber-400"
                          >
                            <Ban size={13} /> Desactivar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <ModalFormCategoria
        open={openModal}
        onClose={() => setOpenModal(false)}
        categoria={categoriaSeleccionada}
        onSave={handleSave}
      />

      <ModalConfirmacion
        open={openConfirmModal}
        onClose={() => {
          setOpenConfirmModal(false);
          setCategoriaADesactivar(null);
        }}
        onConfirm={confirmarDesactivacion}
        categoria={categoriaADesactivar}
      />
    </div>
  );
};

const Card = ({ icon, title, value, subtitle, warn }) => (
  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
    <div className="mb-3 flex items-center gap-3">
      <div
        className={`rounded-xl p-2 ${
          warn
            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            : "bg-primary/10 text-primary"
        }`}
      >
        {icon}
      </div>
      <p className="text-sm font-medium">{title}</p>
    </div>
    <p className="text-3xl font-bold">{value}</p>
    <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
  </div>
);

const ModalConfirmacion = ({ open, onClose, onConfirm, categoria }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xl">
        <div className="mb-4 flex items-center gap-3 text-amber-500">
          <Ban size={24} />
          <h3 className="text-lg font-semibold text-foreground">¿Desactivar categoría?</h3>
        </div>
        <p className="mb-6 text-sm text-muted-foreground">
          ¿Estás seguro de que deseas desactivar la categoría <strong>"{categoria?.nombre}"</strong>? <br/><br/>
          Ya no estará disponible para asignar a nuevos productos.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
          >
            Sí, desactivar
          </button>
        </div>
      </div>
    </div>
  );
};