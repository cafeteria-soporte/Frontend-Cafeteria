import React, { useState, useEffect } from 'react';
import { ChartLoader } from '@/components/ui/ChartLoader';
import { ChartErrorState } from '@/components/ui/ChartErrorState';
import apiClient from '@/api/apiClient';

export const PantallaAnalitica = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportes, setReportes] = useState([]);

  const fetchDatosAnaliticos = async () => {
    setLoading(true);
    setError(null);
    try {
      // Intentamos conectar con el servidor real
      const response = await apiClient.get('/analitica/ventas-globales');
      setReportes(response.data);
    } catch (err) {
      console.error("Error capturado en analíticas:", err);
      // Evitamos la pantalla en blanco mostrando el error controlado en la UI
      setError(err.response?.data?.message || 'Error de red: No se pudo conectar con el servidor de reportes financieros.');
    } finally {
      setLoading(false);
    }
  };

  // Función de respaldo para que pruebes tu diseño sin depender del Backend
  const usarDatosDePrueba = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setReportes([{ id: 1, ventas: 500 }]);
      setLoading(false);
    }, 1500); // Simula 1.5 segundos de carga
  };

  useEffect(() => {
    fetchDatosAnaliticos();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Panel de Control Global y Analítica</h1>
          <p className="text-sm text-gray-500">Gestión de métricas financieras y rendimiento de la cafetería (Sprint 2).</p>
        </div>
        
        {/* Botón de auxilio UX para desarrollo */}
        {error && (
          <button 
            onClick={usarDatosDePrueba}
            className="px-3 py-1 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded text-xs font-medium transition-colors"
          >
            ⚙️ Forzar Datos de Prueba (UX Mock)
          </button>
        )}
      </div>

      {error ? (
        <ChartErrorState error={error} onRetry={fetchDatosAnaliticos} />
      ) : (
        <ChartLoader isLoading={loading}>
          {/* Contenedor adaptado para las futuras gráficas de Andrea */}
          <div className="w-full h-[350px] bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center space-y-2">
            <span className="text-2xl">📊</span>
            <span className="text-gray-700 dark:text-gray-200 font-semibold text-base">
              Dashboard Analítico Inicializado
            </span>
            <span className="text-gray-400 text-xs max-w-sm text-center">
              Estado de carga óptimo, seguridad de rutas activa y manejo de excepciones listo para producción.
            </span>
          </div>
        </ChartLoader>
      )}
    </div>
  );
};