import React from 'react';
import { ShieldCheck, Lock, ChevronRight, KeyRound } from 'lucide-react';
import { useChangePassword } from '../hooks/useCambioContraseña'; // Importamos el nuevo hook

export const PantallaCambioContraseñaCajero = () => {
  // Desestructuramos todo lo que nos da el hook
  const {
    currentPassword, setCurrentPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    error, loading,
    handleUpdate
  } = useChangePassword();

  return (
    <div className="min-h-screen bg-[#E9E7D9] flex items-center justify-center p-4 font-sans text-[#442727]">
      <div className="bg-[#FFFBE7] p-8 rounded-[2.5rem] shadow-md w-full max-w-[400px] border border-[#D2C6B2]/40 text-center">
        
        <div className="bg-[#7F793B] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#7F793B]/20">
          <ShieldCheck className="text-[#FFFBE7]" size={32} />
        </div>

        <h1 className="text-xl font-bold uppercase tracking-tight text-[#442727]">Cambiar Contraseña</h1>
        <p className="text-[#442727]/60 text-sm mt-2 mb-8 italic">Ingresa tu clave actual y define una nueva por seguridad.</p>

        <form onSubmit={handleUpdate} className="space-y-5 text-left">
          
          <div>
            <label className="text-xs font-bold text-[#7F793B] uppercase ml-1">Contraseña Actual</label>
            <div className="relative mt-1">
              <KeyRound className="absolute left-3 top-3 text-[#D2C6B2]" size={18} />
              <input 
                type="password" 
                className="w-full pl-10 p-3.5 rounded-xl border border-[#D2C6B2] outline-none focus:border-[#7F793B] bg-white/50 text-[#442727]"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Tu clave actual"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#7F793B] uppercase ml-1">Nueva Contraseña</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 text-[#D2C6B2]" size={18} />
              <input 
                type="password" 
                className="w-full pl-10 p-3.5 rounded-xl border border-[#D2C6B2] outline-none focus:border-[#7F793B] bg-white/50 text-[#442727]"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#7F793B] uppercase ml-1">Confirmar Nueva Contraseña</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 text-[#D2C6B2]" size={18} />
              <input 
                type="password" 
                className="w-full pl-10 p-3.5 rounded-xl border border-[#D2C6B2] outline-none focus:border-[#7F793B] bg-white/50 text-[#442727]"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la nueva clave"
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-xs font-bold text-center bg-red-50 p-2 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-[#7F793B] hover:bg-[#442727] text-[#FFFBE7] font-semibold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'ACTUALIZANDO...' : 'ACTUALIZAR Y ENTRAR'} <ChevronRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};