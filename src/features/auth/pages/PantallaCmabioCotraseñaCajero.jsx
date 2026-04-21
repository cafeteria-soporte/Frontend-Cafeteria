import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, ChevronRight } from 'lucide-react';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleUpdate = (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    
    alert("¡Contraseña actualizada! Entrando a tu perfil...");
    // CAMBIO AQUÍ: Ahora te manda al perfil en lugar del login
    navigate('/auth/profile'); 
  };

  return (
    <div className="min-h-screen bg-[#E9E7D9] flex items-center justify-center p-4 font-sans text-[#442727]">
      <div className="bg-[#FFFBE7] p-8 rounded-[2.5rem] shadow-md w-full max-w-[400px] border border-[#D2C6B2]/40 text-center">
        
        <div className="bg-[#7F793B] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#7F793B]/20">
          <ShieldCheck className="text-[#FFFBE7]" size={32} />
        </div>

        <h1 className="text-xl font-bold uppercase tracking-tight text-[#442727]">Cambio Obligatorio</h1>
        <p className="text-[#442727]/60 text-sm mt-2 mb-8 italic">Por seguridad, actualiza tu clave para activar tu cuenta.</p>

        <form onSubmit={handleUpdate} className="space-y-5 text-left">
          <div>
            <label className="text-xs font-bold text-[#7F793B] uppercase ml-1">Nueva Contraseña</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 text-[#D2C6B2]" size={18} />
              <input 
                type="password" 
                className="w-full pl-10 p-3.5 rounded-xl border border-[#D2C6B2] outline-none focus:border-[#7F793B] bg-white/50"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#7F793B] uppercase ml-1">Confirmar Contraseña</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 text-[#D2C6B2]" size={18} />
              <input 
                type="password" 
                className="w-full pl-10 p-3.5 rounded-xl border border-[#D2C6B2] outline-none focus:border-[#7F793B] bg-white/50"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="text-red-600 text-xs font-bold text-center">{error}</p>}

          <button type="submit" className="w-full bg-[#7F793B] hover:bg-[#442727] text-[#FFFBE7] font-semibold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98]">
            ACTUALIZAR Y ENTRAR <ChevronRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;