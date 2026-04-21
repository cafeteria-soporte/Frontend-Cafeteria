import axios from 'axios';
import { LoginRequestDto, LoginResponseDto } from '../Dtos/auth.dto';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const authService = {
  
  login: async (credentials: LoginRequestDto): Promise<LoginResponseDto> => {
    try {
      // Axios ya hace el JSON.stringify internamente y tipamos la respuesta con <LoginResponseDto>
      const response = await axios.post<LoginResponseDto>(
        `${API_URL}/auth/login`, 
        credentials
      );

      // Axios guarda la respuesta del backend dentro de la propiedad "data"
      return response.data;
      console.log(response.data);
    } catch (error: any) {
      // Axios agrupa los errores HTTP (400, 401, 500) automáticamente en el bloque catch
      if (error.response && error.response.data) {
        const data = error.response.data;
        
        // Manejo de errores basado en la respuesta de NestJS/Swagger
        const errorMessage = Array.isArray(data.message) 
          ? data.message[0] 
          : data.message || 'Error en la autenticación';
          
        throw new Error(errorMessage);
      }
      
      // Error de red (el backend está apagado o no hay internet)
      throw new Error('Error de conexión con el servidor');
    }
  },


 changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // LOG 1: Verificar si el token existe antes de enviar
      console.log("DEBUG: Iniciando changePassword");
      console.log("DEBUG: Token encontrado:", token ? "SÍ (empieza por " + token.substring(0, 10) + "...)" : "NO HAY TOKEN");

      if (!token) {
        throw new Error('No hay token de sesión. Por favor, inicia sesión de nuevo.');
      }

      const url = `${API_URL}/auth/change-password`;
      const body = { currentPassword, newPassword };

      // LOG 2: Detalles de la petición
      console.log("DEBUG: URL de la petición:", url);
      console.log("DEBUG: Body enviado:", { currentPassword: "***", newPassword: "***" }); // No logueamos claves por seguridad

      const response = await axios.patch(
        url,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // LOG 3: Éxito
      console.log("DEBUG: Respuesta del servidor (Status):", response.status);

    } catch (error: any) {
      // LOG 4: Error detallado
      console.error("DEBUG: ¡ERROR EN EL SERVICE!");
      
      if (error.response) {
        // El servidor respondió con un código fuera del rango 2xx
        console.error("DEBUG: Data del error (Backend):", error.response.data);
        console.error("DEBUG: Status del error:", error.response.status);
        console.error("DEBUG: Headers del error:", error.response.headers);
        
        const data = error.response.data;
        const errorMessage = Array.isArray(data.message) 
          ? data.message[0] 
          : data.message || 'Error en el servidor';
          
        throw new Error(errorMessage);
      } else if (error.request) {
        // La petición se hizo pero no hubo respuesta (CORS o Servidor apagado)
        console.error("DEBUG: No se recibió respuesta del servidor. Revisa si el backend está encendido o hay errores de CORS.");
        console.error("DEBUG: Request:", error.request);
        throw new Error('El servidor no responde');
      } else {
        // Error configurando la petición
        console.error("DEBUG: Error de configuración:", error.message);
        throw new Error(error.message);
      }
    }
  },

  registrarAuditoria: (evento: string, usuario: string): void => {
    console.log(`[AUDITORIA] ${evento} - Usuario: ${usuario} - ${new Date().toLocaleString()}`);
  }
};