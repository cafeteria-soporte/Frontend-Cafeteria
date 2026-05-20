import React, { useState, useEffect } from "react";
import { Search, Plus, Loader2, Edit2, Power, PowerOff } from "lucide-react";
import { useUserCrud } from "../hooks/useUserCrud";
import { ModalFormularioCajero } from "../components/ModalFormularioCajero";

export const PantallaGestionCajeros = () => {
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCajero, setSelectedCajero] = useState(null);

  const {
    cashiers,
    loading,
    getCashiers,
    create,
    update,
    deactivate,
  } = useUserCrud();

  useEffect(() => {
    getCashiers();
  }, [getCashiers]);

  const filtered = (cashiers || []).filter(
    (c) =>
      c.fullName?.toLowerCase().includes(query.toLowerCase()) ||
      c.username?.toLowerCase().includes(query.toLowerCase()) ||
      c.email?.toLowerCase().includes(query.toLowerCase())
  );

  const onSubmit = async (payload) => {
    try {
      if (selectedCajero) {
        await update(selectedCajero.id, payload);
      } else {
        await create({ ...payload, roleId: 3 });
      }
      await getCashiers();
    } catch (error) {
      console.error("Error al guardar cajero:", error);
    }
  };

  const handleToggleStatus = async (usuario) => {
    try {
      if (usuario.active) {
        await deactivate(usuario.id);
      } else {
        await update(usuario.id, { active: true });
      }
      await getCashiers();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert("No se pudo cambiar el estado. Verifica si tienes permisos sobre este rol.");
    }
  };

  const totalCajeros = (cashiers || []).length;
  const cajeroActivos = (cashiers || []).filter((c) => c.active).length;
  const cajeroInactivos = (cashiers || []).filter((c) => !c.active).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ENCABEZADO */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Cajeros</h1>
            <p className="mt-1 text-sm text-muted-foreground">Administración del personal de caja</p>
          </div>
          <button
            onClick={() => { setSelectedCajero(null); setIsModalOpen(true); }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Plus size={16} /> Nuevo cajero
          </button>
        </div>

        {/* CARDS DE MÉTRICAS */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Card Total */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl p-2 bg-primary/10 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <p className="text-sm font-medium">Total registrados</p>
            </div>
            <p className="text-3xl font-bold">{totalCajeros}</p>
            <p className="mt-1 text-sm text-muted-foreground">Cajeros en el sistema</p>
          </div>

          {/* Card Activos */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl p-2 bg-primary/10 text-primary">
                <Power size={18} />
              </div>
              <p className="text-sm font-medium">Cajeros activos</p>
            </div>
            <p className="text-3xl font-bold">{cajeroActivos}</p>
            <p className="mt-1 text-sm text-muted-foreground">Habilitados para operar</p>
          </div>

          {/* Card Inactivos */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl p-2 bg-destructive/10 text-destructive">
                <PowerOff size={18} />
              </div>
              <p className="text-sm font-medium">Cajeros inactivos</p>
            </div>
            <p className="text-3xl font-bold">{cajeroInactivos}</p>
            <p className="mt-1 text-sm text-muted-foreground">Sin acceso al sistema</p>
          </div>
        </div>

        {/* TABLA PRINCIPAL */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Personal de caja</h2>
            </div>
            <div className="relative w-full md:max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar cajero..."
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-3 py-3 text-left">Nombre Completo</th>
                  <th className="px-3 py-3 text-left">Usuario</th>
                  <th className="px-3 py-3 text-left">Email</th>
                  <th className="px-3 py-3 text-left">Estado</th>
                  <th className="px-3 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin h-8 w-8 text-primary" />
                        <span className="text-sm text-muted-foreground">Cargando personal...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-10 text-center text-muted-foreground italic">
                      {query
                        ? `No se encontraron resultados para "${query}"`
                        : "No hay cajeros registrados"}
                    </td>
                  </tr>
                ) : (
                  filtered.map((cajero) => (
                    <tr key={cajero.id} className="border-b border-border last:border-none">
                      <td className="px-3 py-4 font-medium">{cajero.fullName}</td>
                      <td className="px-3 py-4">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary font-mono font-bold">
                          {cajero.username}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-muted-foreground">{cajero.email}</td>
                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            cajero.active
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {cajero.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex gap-2">
                          {/* Editar */}
                          <button
                            onClick={() => { setSelectedCajero(cajero); setIsModalOpen(true); }}
                            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent"
                          >
                            <Edit2 size={13} /> Editar
                          </button>

                          {/* Activar / Desactivar */}
                          <button
                            onClick={() => handleToggleStatus(cajero)}
                            className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs ${
                              cajero.active
                                ? "border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
                                : "border-primary/40 text-primary hover:bg-primary/10"
                            }`}
                          >
                            {cajero.active
                              ? <><PowerOff size={13} /> Desactivar</>
                              : <><Power size={13} /> Activar</>
                            }
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

      {/* MODAL */}
      <ModalFormularioCajero
        open={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedCajero(null); }}
        onSubmit={onSubmit}
        cajero={selectedCajero}
      />
    </div>
  );
};