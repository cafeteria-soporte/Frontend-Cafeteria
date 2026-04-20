import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const PantallaGestionAdministradores = () => {
  const admins = [
    {
      id: 1,
      nombre: "María Antezana",
      iniciales: "MA",
      usuario: "mantezana",
      email: "m.antezana@ucb.edu.bo",
      estado: "Activo",
      creado: "01 Ene 2026",
    },
    {
      id: 2,
      nombre: "Roberto Chávez",
      iniciales: "RC",
      usuario: "rchavez",
      email: "r.chavez@ucb.edu.bo",
      estado: "Activo",
      creado: "15 Ene 2026",
    },
  ];

  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Administradores</h2>
          <p className="text-sm text-muted-foreground">
            {admins.length} usuarios registrados
          </p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus size={16} />
          Nuevo administrador
        </Button>
      </div>

      {/* Contenedor principal */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6">

          {/* Barra de búsqueda */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar por nombre o usuario..."
              className="pl-9"
            />
          </div>

          {/* Tabla */}
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead>Nombre</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id} className="border-b border-border last:border-0">

                  {/* Nombre + Avatar */}
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-primary/10 text-primary border border-primary/20">
                        {admin.iniciales}
                      </div>
                      <span className="font-medium text-foreground">{admin.nombre}</span>
                    </div>
                  </TableCell>

                  {/* Usuario */}
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {admin.usuario}
                  </TableCell>

                  {/* Email */}
                  <TableCell className="text-muted-foreground">
                    {admin.email}
                  </TableCell>

                  {/* Estado */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-primary/10 text-primary border-primary/20 rounded-full"
                    >
                      {admin.estado}
                    </Badge>
                  </TableCell>

                  {/* Fecha */}
                  <TableCell className="text-muted-foreground">
                    {admin.creado}
                  </TableCell>

                  {/* Acciones */}
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm">
                        Desactivar
                      </Button>
                    </div>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>

        </div>
      </div>
    </div>
  );
};