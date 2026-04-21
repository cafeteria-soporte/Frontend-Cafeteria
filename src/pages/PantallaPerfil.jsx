import React, { useState } from 'react';
import { User, Mail, Lock, Shield, ChevronRight, Save } from 'lucide-react';

const ProfilePage = () => {
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Datos simulados (TPS Auditado)
  const userData = {
    nombre: "Usuario Demo",
    email: "usuario@cafeteria.com",
    rol: "Administrador / Cajero"
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("La nueva contraseña no coincide.");
      return;
    }
    alert("¡Contraseña actualizada con éxito en el perfil!");
  };

  return (
    <div className="min-h-screen bg-[#E9E7D9] p-6 font-sans text-[#442727]">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Encabezado de Perfil */}
        <div className="bg-[#FFFBE7] p-8 rounded-[2rem] shadow-sm border border-[#D2C6B2]/40 flex items-center gap-6">
          <div className="bg-[#7F793B] w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg shadow-[#7F793B]/20">
            <User className="text-[#FFFBE7]" size={40} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{userData.nombre}</h1>
            <p className="text-[#7F793B] font-medium">{userData.rol}</p>
            <p className="text-[#442727]/60 text-sm italic">Acceso auditado por el sistema</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Información Personal */}
          <div className="bg-[#FFFBE7] p-8 rounded-[2rem] shadow-sm border border-[#D2C6B2]/40">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Mail size={20} className="text-[#7F793B]" /> Datos de Usuario
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#7F793B] uppercase ml-1">Correo Electrónico</label>
                <div className="mt-1 p-3 bg-white/50 border border-[#D2C6B2] rounded-xl text-[#442727]/70">
                  {userData.email}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#7F793B] uppercase ml-1">Estado de Cuenta</label>
                <div className="mt-1 p-3 bg-white/50 border border-[#D2C6B2] rounded-xl flex items-center gap-2">
                  <Shield size={16} className="text-green-600" /> Activa y Protegida
                </div>
              </div>
            </div>
          </div>

          {/* Cambio de Contraseña Voluntario */}
          <div className="bg-[#FFFBE7] p-8 rounded-[2rem] shadow-sm border border-[#D2C6B2]/40">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Lock size={20} className="text-[#7F793B]" /> Seguridad
            </h2>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#7F793B] uppercase ml-1">Nueva Contraseña</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full mt-1 p-3 rounded-xl border border-[#D2C6B2] outline-none focus:border-[#7F793B] bg-white/50 transition-all"
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#7F793B] uppercase ml-1">Confirmar Nueva Contraseña</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full mt-1 p-3 rounded-xl border border-[#D2C6B2] outline-none focus:border-[#7F793B] bg-white/50 transition-all"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="w-full bg-[#7F793B] hover:bg-[#442727] text-[#FFFBE7] font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98]">
                Guardar Cambios <Save size={18} />
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-[11px] text-[#442727]/40 italic">
          Última actualización de seguridad: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;