import React, { useState, useEffect } from "react";
import { Search, Plus, Loader2, Edit2, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUserCrud } from "../hooks/useUserCrud";
import { ModalFormularioAdmin } from "../components/ModalFormularioAdmin";

export const PantallaGestionAdministradores = () => {
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // Extraemos lo necesario de nuestro hook (el hook puede ser .ts, pero lo consumimos aquí sin problemas)
 // Si useUserCrud por alguna razón devuelve undefined, admins será un array vacío
const { admins = [], loadingAdmins, getAdministrators, create, update } = useUserCrud();

// Y en el filtro, añade una validación extra por si acaso
const filtered = (admins || []).filter(a =>
  a?.fullName?.toLowerCase().includes(query.toLowerCase()) ||
  a?.username?.toLowerCase().includes(query.toLowerCase())
);

  useEffect(() => {
    getAdministrators();
  }, [getAdministrators]);


  const onSubmit = async (payload) => {
    try {
      if (selectedAdmin) {
        // Modo Edición
        await update(selectedAdmin.id, payload);
      } else {
        // Modo Creación: Forzamos el roleId 2 (Administrator)
        await create({ ...payload, roleId: 2 });
      }
      // Actualizamos la tabla
      await getAdministrators();
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const handleToggleStatus = async (admin) => {
    // Simplemente enviamos el estado contrario al que tiene actualmente
    await update(admin.id, { active: !admin.active });
    await getAdministrators();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Gestión de Administradores</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {admins.length} usuarios registrados en el sistema
          </p>
        </div>
        <Button 
          className="gap-2 h-10 shadow-sm" 
          onClick={() => { setSelectedAdmin(null); setIsModalOpen(true); }}
        >
          <Plus size={18} strokeWidth={2.5} /> Nuevo administrador
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nombre, usuario o email..." 
              className="pl-9 bg-background focus-visible:ring-primary" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
            />
          </div>
        </div>

        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold py-4">Nombre Completo</TableHead>
                <TableHead className="font-semibold">Usuario</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold text-center">Estado</TableHead>
                <TableHead className="font-semibold text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingAdmins ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin h-8 w-8 text-primary" />
                      <span className="text-sm text-muted-foreground">Obteniendo datos...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                    {query ? `No se encontró nada para "${query}"` : "No hay administradores registrados"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((admin) => (
                  <TableRow key={admin.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium py-4">{admin.fullName}</TableCell>
                    <TableCell>
                      <span className="bg-muted px-2 py-1 rounded text-xs font-mono font-bold">
                        {admin.username}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{admin.email}</TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant="outline"
                        className={admin.active 
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                          : "bg-red-500/10 text-red-600 border-red-500/20"
                        }
                      >
                        {admin.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => { setSelectedAdmin(admin); setIsModalOpen(true); }}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`h-9 w-9 ${admin.active ? 'text-red-500 hover:bg-red-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                          onClick={() => handleToggleStatus(admin)}
                        >
                          {admin.active ? <PowerOff size={16} /> : <Power size={16} />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ModalFormularioAdmin 
        open={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAdmin(null);
        }} 
        onSubmit={onSubmit} 
        admin={selectedAdmin} 
      />
    </div>
  );
};