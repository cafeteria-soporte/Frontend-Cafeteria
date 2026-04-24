import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, Tags, Boxes } from "lucide-react";
import { ModalFormCategoria } from "../components/ModalFormCategoria";

const categoriasBase = [
  {
    id: 1,
    nombre: "Bebidas",
    descripcion: "Cafés, jugos, infusiones y bebidas frías.",
    productosAsociados: 4,
    estado: "Activa",
  },
  {
    id: 2,
    nombre: "Comidas",
    descripcion: "Sándwiches, empanadas y opciones saladas.",
    productosAsociados: 3,
    estado: "Activa",
  },
  {
    id: 3,
    nombre: "Postres",
    descripcion: "Brownies, tortas y productos dulces.",
    productosAsociados: 1,
    estado: "Activa",
  },
  {
    id: 4,
    nombre: "Panadería",
    descripcion: "Croissants y productos horneados.",
    productosAsociados: 1,
    estado: "Activa",
  },
  {
    id: 5,
    nombre: "Insumos",
    descripcion: "Materias primas para preparación interna.",
    productosAsociados: 2,
    estado: "Activa",
  },
  {
    id: 6,
    nombre: "Snacks",
    descripcion: "Productos empacados listos para venta.",
    productosAsociados: 0,
    estado: "Inactiva",
  },
];

export const PantallaGestionCategorias = () => {
  const [categorias, setCategorias] = useState(categoriasBase);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("Todas");
  const [openModal, setOpenModal] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  const categoriasFiltradas = useMemo(() => {
    return categorias.filter((categoria) => {
      const coincideTexto = `${categoria.nombre} ${categoria.descripcion}`
        .toLowerCase()
        .includes(busqueda.toLowerCase());
      const coincideEstado = estado === "Todas" || categoria.estado === estado;
      return coincideTexto && coincideEstado;
    });
  }, [categorias, busqueda, estado]);

  const totalActivas = categorias.filter((c) => c.estado === "Activa").length;
  const sinProductos = categorias.filter(
    (c) => Number(c.productosAsociados) === 0,
  ).length;
  const totalProductosAsociados = categorias.reduce(
    (acc, item) => acc + Number(item.productosAsociados || 0),
    0,
  );

  const handleSave = (categoriaForm) => {
    if (categoriaForm.id) {
      setCategorias((prev) =>
        prev.map((item) =>
          item.id === categoriaForm.id ? categoriaForm : item,
        ),
      );
      return;
    }
    setCategorias((prev) => [{ ...categoriaForm, id: Date.now() }, ...prev]);
  };

  const handleEliminar = (categoria) => {
    if (Number(categoria.productosAsociados) > 0) {
      alert("No se puede eliminar una categoría con productos asociados.");
      return;
    }
    setCategorias((prev) => prev.filter((item) => item.id !== categoria.id));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Gestión de categorías del catálogo
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setCategoriaSeleccionada(null);
              setOpenModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <Plus size={16} /> Nueva categoría
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <Tags size={18} />
              </div>
              <p className="text-sm font-medium">Categorías activas</p>
            </div>
            <p className="text-3xl font-bold">{totalActivas}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Disponibles para productos
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <Boxes size={18} />
              </div>
              <p className="text-sm font-medium">Productos asociados</p>
            </div>
            <p className="text-3xl font-bold">{totalProductosAsociados}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Distribuidos por categoría
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                <Trash2 size={18} />
              </div>
              <p className="text-sm font-medium">Sin productos</p>
            </div>
            <p className="text-3xl font-bold">{sinProductos}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Pueden eliminarse
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Lista de categorías</h2>
              <p className="text-sm text-muted-foreground">
                Cada categoría puede asociarse a productos del catálogo.
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
                className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none"
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
                  <th className="px-3 py-3 text-left font-medium">Nombre</th>
                  <th className="px-3 py-3 text-left font-medium">
                    Descripción
                  </th>
                  <th className="px-3 py-3 text-left font-medium">
                    Productos asociados
                  </th>
                  <th className="px-3 py-3 text-left font-medium">Estado</th>
                  <th className="px-3 py-3 text-left font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categoriasFiltradas.map((categoria) => (
                  <tr
                    key={categoria.id}
                    className="border-b border-border last:border-none"
                  >
                    <td className="px-3 py-4 font-semibold">
                      {categoria.nombre}
                    </td>
                    <td className="px-3 py-4 text-muted-foreground">
                      {categoria.descripcion}
                    </td>
                    <td className="px-3 py-4">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {categoria.productosAsociados} productos
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${categoria.estado === "Activa" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                      >
                        {categoria.estado}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCategoriaSeleccionada(categoria);
                            setOpenModal(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium transition hover:bg-accent"
                        >
                          <Pencil size={13} /> Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEliminar(categoria)}
                          disabled={Number(categoria.productosAsociados) > 0}
                          className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-45"
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
