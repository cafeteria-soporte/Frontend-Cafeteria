/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
export const ModalFormularioCajero = ({ open, onClose, onSubmit, cajero = null }) => {
  const isEditing = Boolean(cajero);
  const [form, setForm] = useState({ fullName: "", username: "", email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(cajero ? { 
        fullName: cajero.fullName, 
        username: cajero.username, 
        email: cajero.email, 
        password: "" 
      } : { fullName: "", username: "", email: "", password: "" });
    }
  }, [open, cajero]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...form };
      if (isEditing && !payload.password) delete payload.password;

      await onSubmit(payload);
      onClose();
    } catch (error) {
      console.error("Error al procesar formulario:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditing ? "Editar Perfil" : "Registrar Nuevo"} de Cajero
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Nombre Completo</label>
            <Input 
              value={form.fullName} 
              onChange={e => setForm({...form, fullName: e.target.value})} 
              required 
              placeholder="Ej. Carlos Mendoza"
              className="focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Usuario</label>
            <Input 
              value={form.username} 
              onChange={e => setForm({...form, username: e.target.value})} 
              required 
              placeholder="cmendoza"
              className="focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Email</label>
            <Input 
              type="email" 
              value={form.email} 
              onChange={e => setForm({...form, email: e.target.value})} 
              required 
              placeholder="cajero@cafeteria.com"
              className="focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">
              {isEditing ? "Nueva Contraseña (opcional)" : "Contraseña Temporal"}
            </label>
            <Input 
              type="password" 
              value={form.password} 
              onChange={e => setForm({...form, password: e.target.value})} 
              required={!isEditing} 
              placeholder={isEditing ? "••••••••" : "Asigna una clave inicial"}
              className="focus-visible:ring-primary"
            />
          </div>
          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
              {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Guardar Cajero"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};