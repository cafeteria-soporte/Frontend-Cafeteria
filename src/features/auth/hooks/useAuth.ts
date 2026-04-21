// src/hooks/useAuth.ts
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { ROUTES } from '@/utils/constants';

export const useAuth = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    authService.registrarAuditoria("INTENTO_LOGIN", username);

    try {
      // 1. Llamada al servicio real
      const response = await authService.login({ username, password });
      
      authService.registrarAuditoria("LOGIN_EXITOSO", username);
      
      // 2. Mapear el rol del backend al rol que espera tu frontend (AppRoutes / MainLayout)
      const backendRole = response.user.role.name.toLowerCase();
      let frontendRole = 'cajero'; // Rol por defecto por seguridad
      
      if (backendRole === 'root') {
        frontendRole = 'root';
      } else if (backendRole === 'administrator' || backendRole === 'admin') {
        frontendRole = 'admin';
      } else if (backendRole === 'cashier' || backendRole === 'cajero') {
        frontendRole = 'cajero';
      }

      // 3. Guardar sesión y datos en el navegador
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('userRole', frontendRole); 
      localStorage.setItem('userData', JSON.stringify(response.user));

      // 4. Lógica de redirección
      if (frontendRole === 'cajero' && response.requiresPwdChange) {
  // Solo el cajero es enviado a la pantalla de cambio obligatorio
            navigate(ROUTES.CAMBIO_CONTRASENA);
            } else {
            // Para los demás (Root, Admin) o Cajeros que NO requieren cambio, van a su inicio normal
            if (frontendRole === 'root') {
                navigate(ROUTES.ROOT_DASHBOARD);
            } else if (frontendRole === 'admin') {
                navigate(ROUTES.DASHBOARD);
            } else {
                // Es un cajero que no tiene pendiente el cambio de contraseña
                navigate(ROUTES.PRE_TURNO);
            }
            }

    } catch (err: any) {
      authService.registrarAuditoria("LOGIN_FALLIDO", username);
      // Muestra el mensaje de error exacto que envía el backend (ej: "Credenciales incorrectas")
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para los botones de la demo
  const seleccionarRol = (rol: 'Root' | 'Admin' | 'Cajero') => {
    const presets = {
      'Root': { u: 'root', p: 'root123' },
      'Admin': { u: 'admin', p: 'admin456' },
      'Cajero': { u: 'cajero', p: 'cajero789' }
    };
    setUsername(presets[rol].u);
    setPassword(presets[rol].p);
  };

  return {
    username, 
    setUsername,
    password, 
    setPassword,
    loading, 
    error,
    handleLogin, 
    seleccionarRol
  };
};