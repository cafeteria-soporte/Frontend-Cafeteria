/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const ModalFormularioAdmin = ({ open, onClose, onSubmit, admin = null }) => {
  const isEditing = Boolean(admin);
  const [form, setForm] = useState({ fullName: "", username: "", email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(admin ? { 
        fullName: admin.fullName, 
        username: admin.username, 
        email: admin.email, 
        password: "" 
      } : { fullName: "", username: "", email: "", password: "" });
    }
  }, [open, admin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...form };
      
      if (isEditing) {
        // Si estamos editando y no se escribió password, lo quitamos del envío
        if (!payload.password) delete payload.password;
      }

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
          <DialogTitle>{isEditing ? "Editar" : "Nuevo"} Administrador</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nombre Completo</label>
            <Input 
              value={form.fullName} 
              onChange={e => setForm({...form, fullName: e.target.value})} 
              required 
              placeholder="Ej. Juan Pérez"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Usuario</label>
            <Input 
              value={form.username} 
              onChange={e => setForm({...form, username: e.target.value})} 
              required 
              placeholder="jperez"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <Input 
              type="email" 
              value={form.email} 
              onChange={e => setForm({...form, email: e.target.value})} 
              required 
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">
              {isEditing ? "Nueva Contraseña (opcional)" : "Contraseña"}
            </label>
            <Input 
              type="password" 
              value={form.password} 
              onChange={e => setForm({...form, password: e.target.value})} 
              required={!isEditing} 
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar Administrador"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};