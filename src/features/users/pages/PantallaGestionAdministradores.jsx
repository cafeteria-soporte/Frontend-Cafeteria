import React, { useState, useEffect } from "react";
import { Search, Plus, Loader2, Edit2, Power, PowerOff } from "lucide-react";
import { useUserCrud } from "../hooks/useUserCrud";
import { ModalFormularioAdmin } from "../components/ModalFormularioAdmin";
import { toast } from "sonner";
import { userService } from "../services/user.service"; 

export const PantallaGestionAdministradores = () => {
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const { admins = [], loadingAdmins, getAdministrators, create, update } = useUserCrud();

  const filtered = (admins || []).filter(
    (a) =>
      a?.fullName?.toLowerCase().includes(query.toLowerCase()) ||
      a?.username?.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    getAdministrators();
  }, [getAdministrators]);

  const onSubmit = async (payload) => {
    try {
      if (selectedAdmin) {
        await update(selectedAdmin.id, payload);
      } else {
        await create({ ...payload, roleId: 2 });
      }
      await getAdministrators();
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  
const handleToggleStatus = async (admin) => {
    try {
      if (admin.active) {
        await userService.deactivate(admin.id);
        toast.success(`Administrador ${admin.username} desactivado.`);
      } else {
        toast.info("Función de activación pendiente de configurar");
      }
      await getAdministrators();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      toast.error("No se pudo cambiar el estado del administrador.");
    }
  };
  const totalAdmins = (admins || []).length;
  const adminsActivos = (admins || []).filter((a) => a.active).length;
  const adminsInactivos = (admins || []).filter((a) => !a.active).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ENCABEZADO */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Administradores</h1>
            <p className="mt-1 text-sm text-muted-foreground">Administración de usuarios con acceso al sistema</p>
          </div>
          <button
            onClick={() => { setSelectedAdmin(null); setIsModalOpen(true); }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Plus size={16} /> <span>Nuevo administrador</span>
          </button>
        </div>

        {/* CARDS DE MÉTRICAS */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Total */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl p-2 bg-primary/10 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <p className="text-sm font-medium">Total registrados</p>
            </div>
            <p className="text-3xl font-bold">{totalAdmins}</p>
            <p className="mt-1 text-sm text-muted-foreground">Administradores en el sistema</p>
          </div>

          {/* Activos */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl p-2 bg-primary/10 text-primary">
                <Power size={18} />
              </div>
              <p className="text-sm font-medium">Administradores activos</p>
            </div>
            <p className="text-3xl font-bold">{adminsActivos}</p>
            <p className="mt-1 text-sm text-muted-foreground">Con acceso habilitado</p>
          </div>

          {/* Inactivos */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl p-2 bg-destructive/10 text-destructive">
                <PowerOff size={18} />
              </div>
              <p className="text-sm font-medium">Administradores inactivos</p>
            </div>
            <p className="text-3xl font-bold">{adminsInactivos}</p>
            <p className="mt-1 text-sm text-muted-foreground">Sin acceso al sistema</p>
          </div>
        </div>

        {/* TABLA PRINCIPAL */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Equipo administrativo</h2>
            </div>
            <div className="relative w-full md:max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre o usuario..."
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
                {loadingAdmins ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin h-8 w-8 text-primary" />
                        <span className="text-sm text-muted-foreground">Obteniendo datos...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-10 text-center text-muted-foreground italic">
                      {query
                        ? `No se encontró nada para "${query}"`
                        : "No hay administradores registrados"}
                    </td>
                  </tr>
                ) : (
                  filtered.map((admin) => (
                    <tr key={admin.id} className="border-b border-border last:border-none">
                      <td className="px-3 py-4 font-medium">{admin.fullName}</td>
                      <td className="px-3 py-4">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary font-mono font-bold">
                          {admin.username}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-muted-foreground">{admin.email}</td>
                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            admin.active
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {admin.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex gap-2">
                          {/* Editar */}
                          <button
                            onClick={() => { setSelectedAdmin(admin); setIsModalOpen(true); }}
                            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent"
                          >
                            <Edit2 size={13} /> <span>Editar</span>
                          </button>

                          {/* Activar / Desactivar - CORRECCIÓN DEL TEXTO SUELTO */}
                          <button
                            onClick={() => handleToggleStatus(admin)}
                            className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs ${
                              admin.active
                                ? "border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
                                : "border-primary/40 text-primary hover:bg-primary/10"
                            }`}
                          >
                            {admin.active
                              ? <><PowerOff size={13} /> <span>Desactivar</span></>
                              : <><Power size={13} /> <span>Activar</span></>
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
      <ModalFormularioAdmin
        open={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedAdmin(null); }}
        onSubmit={onSubmit}
        admin={selectedAdmin}
      />
    </div>
  );
};