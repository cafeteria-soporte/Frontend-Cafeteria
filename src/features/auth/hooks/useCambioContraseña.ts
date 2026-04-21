import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service'; // Ajusta la ruta a tu servicio
import { ROUTES } from '@/utils/constants';

export const useChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Validaciones del frontend
    if (newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      // 2. Llamada al backend
      await authService.changePassword(currentPassword, newPassword);

      // 3. Actualizamos los datos locales
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        userData.requiresPwdChange = false;
        localStorage.setItem('userData', JSON.stringify(userData));
      }

      alert("¡Contraseña actualizada con éxito!");

      // 4. Redirección inteligente según el rol
      const userRole = localStorage.getItem('userRole');
      
      if (userRole === 'root') {
        navigate(ROUTES.ROOT_DASHBOARD);
      } else if (userRole === 'admin') {
        navigate(ROUTES.DASHBOARD);
      } else if (userRole === 'cajero') {
        navigate(ROUTES.PRE_TURNO);
      } else {
        navigate(ROUTES.LOGIN);
      }

    } catch (err: any) {
      setError(err.message || "No se pudo actualizar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return {
    currentPassword, setCurrentPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    error, loading,
    handleUpdate
  };
};