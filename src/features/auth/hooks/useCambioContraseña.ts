import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service'; 
import { ROUTES } from '@/utils/constants';
import { toast } from 'sonner'; // <-- Importamos sonner

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
      await authService.changePassword(currentPassword, newPassword);

      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        userData.requiresPwdChange = false;
        localStorage.setItem('userData', JSON.stringify(userData));
      }

      toast.success("¡Contraseña actualizada con éxito!", {
        description: "Tu nueva credencial ya está activa."
      });

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
      toast.error("Error al actualizar", {
        description: err.message || "Verifica tu contraseña actual."
      });
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