import { useState, useEffect } from 'react';
import { authService } from '../services/auth.service'; // Ajusta tu ruta

export const useProfile = () => {
  // Estados para contraseñas
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados de feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estado del usuario
  const [userData, setUserData] = useState({
    nombre: "Cargando...",
    email: "...",
    rol: "..."
  });

  // Cargar datos al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    const storedRole = localStorage.getItem('userRole');

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const roleDisplay = 
        storedRole === 'root' ? 'Super Administrador' :
        storedRole === 'admin' ? 'Administrador' : 'Cajero';

      setUserData({
        nombre: parsedUser.username || "Usuario",
        email: parsedUser.email || "Sin correo registrado",
        rol: roleDisplay
      });
    }
  }, []);

  // Manejar el submit (Sin redirección, ideal para el perfil)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword) {
      setError("Debes ingresar tu contraseña actual.");
      return;
    }
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
      setSuccess("¡Contraseña actualizada con éxito!");
      
      // Limpiar inputs tras el éxito
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || "Error al actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return {
    userData,
    currentPassword, setCurrentPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    loading, error, success,
    handleUpdatePassword
  };
};