import React, { useState, useEffect } from "react";
import { Search, Plus, Loader2, Edit2, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    deactivate
  } = useUserCrud();

  useEffect(() => {
    getCashiers();
  }, [getCashiers]);

  const filtered = (cashiers || []).filter(c =>
    c.fullName?.toLowerCase().includes(query.toLowerCase()) ||
    c.username?.toLowerCase().includes(query.toLowerCase()) ||
    c.email?.toLowerCase().includes(query.toLowerCase())
  );

  const onSubmit = async (payload) => {
    try {
      if (selectedCajero) {
        await update(selectedCajero.id, payload);
      } else {
        // Para cajeros usamos roleId: 3
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
      // Si está ACTIVO, llamamos al nuevo endpoint especial
      await deactivate(usuario.id);
    } else {
      // Si está INACTIVO, usamos el update normal para reactivarlo
      // (A menos que tu Swagger muestre un endpoint /activate)
      await update(usuario.id, { active: true });
    }
    
    // IMPORTANTE: Refrescar la lista después del cambio
    await getCashiers(); 
    
  } catch (error) {
    // Manejo de errores por jerarquía (según tu Swagger)
    console.error("Error al cambiar estado:", error);
    alert("No se pudo cambiar el estado. Verifica si tienes permisos sobre este rol.");
  }
};
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Gestión de Cajeros</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {cashiers.length} cajeros registrados en el sistema
          </p>
        </div>
        <Button 
          className="gap-2 h-10 shadow-sm bg-primary hover:bg-primary/90" 
          onClick={() => { setSelectedCajero(null); setIsModalOpen(true); }}
        >
          <Plus size={18} strokeWidth={2.5} /> Nuevo cajero
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar cajero..." 
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
                <TableHead className="font-semibold py-4 text-foreground">Nombre Completo</TableHead>
                <TableHead className="font-semibold text-foreground">Usuario</TableHead>
                <TableHead className="font-semibold text-foreground">Email</TableHead>
                <TableHead className="font-semibold text-center text-foreground">Estado</TableHead>
                <TableHead className="font-semibold text-right text-foreground">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin h-8 w-8 text-primary" />
                      <span className="text-sm text-muted-foreground">Cargando personal...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                    {query ? `No se encontraron resultados para "${query}"` : "No hay cajeros registrados"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((cajero) => (
                  <TableRow key={cajero.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium py-4">{cajero.fullName}</TableCell>
                    <TableCell>
                      <span className="bg-muted px-2 py-1 rounded text-xs font-mono font-bold">
                        {cajero.username}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{cajero.email}</TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant="outline"
                        className={cajero.active 
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                          : "bg-red-500/10 text-red-600 border-red-500/20"
                        }
                      >
                        {cajero.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => { setSelectedCajero(cajero); setIsModalOpen(true); }}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`h-9 w-9 ${cajero.active ? 'text-red-500 hover:bg-red-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                          onClick={() => handleToggleStatus(cajero)}
                        >
                          {cajero.active ? <PowerOff size={16} /> : <Power size={16} />}
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

      <ModalFormularioCajero 
        open={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCajero(null);
        }} 
        onSubmit={onSubmit} 
        cajero={selectedCajero} 
      />
    </div>
  );
};