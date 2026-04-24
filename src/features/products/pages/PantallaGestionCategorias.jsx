import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, Tags, Boxes } from "lucide-react";
import { ModalFormCategoria } from "../components/ModalFormCategoria";
import { categoriesService } from "../services/categories.service";
import { productsService } from "../services/products.service";

const categoriasMock = [
  { id: 1, nombre: "Bebidas", productosAsociados: 0, estado: "Activa" },
  { id: 2, nombre: "Comidas", productosAsociados: 0, estado: "Activa" },
  { id: 3, nombre: "Postres", productosAsociados: 0, estado: "Activa" },
];

export const PantallaGestionCategorias = () => {
  const [categorias, setCategorias] = useState(categoriasMock);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("Todas");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      setError("");
      const [categoriasApi, productosApi] = await Promise.all([
        categoriesService.getAll(),
        productsService.getAll().catch(() => []),
      ]);
      const conConteo = categoriasApi.map((cat) => ({
        ...cat,
        productosAsociados: productosApi.filter(
          (p) => Number(p.categoryId) === Number(cat.id),
        ).length,
      }));
      setCategorias(conConteo.length ? conConteo : categoriasMock);
    } catch (err) {
      setError(
        "No se pudieron cargar categorías desde API. Se muestran datos de prueba.",
      );
      setCategorias(categoriasMock);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const categoriasFiltradas = useMemo(
    () =>
      categorias.filter((c) => {
        const coincideTexto = `${c.nombre} ${c.name}`
          .toLowerCase()
          .includes(busqueda.toLowerCase());
        const coincideEstado = estado === "Todas" || c.estado === estado;
        return coincideTexto && coincideEstado;
      }),
    [categorias, busqueda, estado],
  );

  const totalActivas = categorias.filter((c) => c.estado === "Activa").length;
  const sinProductos = categorias.filter(
    (c) => Number(c.productosAsociados) === 0,
  ).length;
  const totalProductosAsociados = categorias.reduce(
    (acc, item) => acc + Number(item.productosAsociados || 0),
    0,
  );

  const handleSave = async (categoriaForm) => {
    try {
      if (categoriaForm.id)
        await categoriesService.update(categoriaForm.id, categoriaForm);
      else await categoriesService.create(categoriaForm);
      await cargarCategorias();
    } catch (err) {
      alert(`No se pudo guardar la categoría: ${err.message}`);
    }
  };

  const handleEliminar = (categoria) => {
    if (Number(categoria.productosAsociados) > 0) {
      alert("No se puede eliminar una categoría con productos asociados.");
      return;
    }
    alert(
      "El backend no expone DELETE de categorías; se recomienda marcarla como Inactiva en Editar.",
    );
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
        {error && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            {error}
          </div>
        )}
        {loading && (
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
                {categoriasFiltradas.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border last:border-none"
                  >
                    <td className="px-3 py-4 font-semibold">{c.nombre}</td>
                    <td className="px-3 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${c.estado === "Activa" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
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
                          onClick={() => handleEliminar(c)}
                          className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 size={13} /> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
    </div>
  );
};

const Card = ({ icon, title, value, subtitle, warn }) => (
  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
    <div className="mb-3 flex items-center gap-3">
      <div
        className={`rounded-xl p-2 ${warn ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-primary/10 text-primary"}`}
      >
        {icon}
      </div>
      <p className="text-sm font-medium">{title}</p>
    </div>
    <p className="text-3xl font-bold">{value}</p>
    <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
  </div>
);
