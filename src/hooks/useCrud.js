import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export const useCrud = (serviceInstance) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // OBTENER TODOS
  const getAll = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await serviceInstance.getAll(params);
      // Ojo: Si tu backend paginado devuelve algo como { items: [...], total: 10 }, 
      // asegúrate de ajustar esto (ej. setData(result.items))
      setData(result); 
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al obtener los datos';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [serviceInstance]);

  // OBTENER POR ID
  const getById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await serviceInstance.getById(id);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al obtener el registro';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // CREAR
  const create = async (newData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await serviceInstance.create(newData);
      // Agregamos el nuevo item a la tabla/lista automáticamente
      setData((prev) => [...prev, result]);
      toast.success('Registro creado exitosamente');
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al crear el registro';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ACTUALIZAR
  const update = async (id, updatedData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await serviceInstance.update(id, updatedData);
      // Actualizamos el item específico en el arreglo local
      setData((prev) => prev.map((item) => (item.id === id ? result : item)));
      toast.success('Registro actualizado correctamente');
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al actualizar el registro';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ELIMINAR
  const remove = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await serviceInstance.delete(id);
      // Filtramos y sacamos el elemento eliminado del estado local
      setData((prev) => prev.filter((item) => item.id !== id));
      toast.success('Registro eliminado correctamente');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al eliminar el registro';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    getAll,
    getById,
    create,
    update,
    remove,
  };
};