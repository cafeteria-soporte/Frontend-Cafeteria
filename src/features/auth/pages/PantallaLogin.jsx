import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Eye, ChevronRight } from 'lucide-react';

const authService = {
  registrarAuditoria: (evento, usuario) => {
    console.log(`[AUDITORIA] ${evento} - Usuario: ${usuario} - ${new Date().toLocaleString()}`);
  }
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const seleccionarRol = (rol) => {
    if (rol === 'Root') {
      setEmail('root@cafeteria.com');
      setPassword('root123');
    } else if (rol === 'Admin') {
      setEmail('admin@cafeteria.com');
      setPassword('admin456');
    } else if (rol === 'Cajero') {
      setEmail('cajero@cafeteria.com');
      setPassword('cajero789');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    authService.registrarAuditoria("INTENTO_LOGIN", email);

    if (
      (email === "root@cafeteria.com" && password === "root123") || 
      (email === "cajero@cafeteria.com" && password === "cajero789")
    ) {
      authService.registrarAuditoria("LOGIN_EXITOSO_PRIMER_VEZ", email);
      navigate('/auth/reset-password');
    } else if (email === "admin@cafeteria.com" && password === "admin456") {
      authService.registrarAuditoria("LOGIN_EXITOSO", email);
      alert(`Bienvenido Administrador: ${email}`);
    } else {
      authService.registrarAuditoria("LOGIN_FALLIDO", email);
      alert("Credenciales incorrectas.");
    }
  };

  return (
    <div className="min-h-screen bg-[#E9E7D9] flex items-center justify-center p-4 font-sans text-[#442727]">
      <div className="bg-[#FFFBE7] p-8 rounded-[2.5rem] shadow-md w-full max-w-[450px] border border-[#D2C6B2]/40">
        
        <div className="text-center mb-8">
          <div className="bg-[#7F793B] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#7F793B]/20">
            <span className="text-white text-3xl">☕</span>
          </div>
          <h1 className="text-2xl font-bold text-[#442727]">Café UCB</h1>
          <p className="text-[#442727]/70 text-sm italic">Sistemas de Soporte a Decisiones</p>
          
          <h2 className="mt-8 text-xl font-semibold text-[#7F793B]">Bienvenido de nuevo</h2>
          <p className="text-[#442727]/60 text-sm mt-2">Ingresa tus credenciales para operar el sistema</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-xs font-bold text-[#7F793B] uppercase ml-1">Usuario</label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-3 text-[#D2C6B2]" size={18} />
              <input 
                type="text" 
                value={email}
                placeholder="Tu nombre de usuario"
                className="w-full pl-10 p-3.5 rounded-xl border border-[#D2C6B2] outline-none focus:border-[#7F793B] transition-all bg-white/50 text-[#442727]"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between">
              <label className="text-xs font-bold text-[#7F793B] uppercase ml-1">Contraseña</label>
              <span className="text-[#7F793B] text-xs font-semibold cursor-pointer hover:underline">¿Olvidaste tu clave?</span>
            </div>
            <div className="relative mt-1">
              <input 
                type="password" 
                value={password}
                placeholder="••••••••"
                className="w-full px-4 p-3.5 rounded-xl border border-[#D2C6B2] outline-none focus:border-[#7F793B] transition-all bg-white/50 text-[#442727]"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Eye className="absolute right-3 top-3.5 text-[#D2C6B2] cursor-pointer" size={18} />
            </div>
          </div>

          <button type="submit" className="w-full bg-[#7F793B] hover:bg-[#442727] text-[#FFFBE7] font-semibold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98]">
            Iniciar sesión <ChevronRight size={18} />
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-[#7F793B]/60 text-[11px] uppercase tracking-wider mb-4 font-bold">Acceso rápido demo:</p>
          <div className="flex justify-center gap-3">
            {['Root', 'Admin', 'Cajero'].map((role) => (
              <button 
                key={role} 
                type="button"
                onClick={() => seleccionarRol(role)}
                className="px-5 py-2 border border-[#7F793B]/30 rounded-full text-xs text-[#7F793B] hover:bg-[#7F793B] hover:text-[#FFFBE7] transition-all font-medium bg-white"
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-10 text-[10px] text-[#442727]/50 text-center leading-relaxed px-6 italic font-medium">
          Este es un sistema TPS auditado. Cada acceso queda registrado con marca de tiempo y usuario.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;