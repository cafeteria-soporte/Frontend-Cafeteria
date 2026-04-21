import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface CrudService<T, CreateDto, UpdateDto> {
  getAll(params?: Record<string, any>): Promise<T[]>;
  getById(id: string | number): Promise<T>;
  create(data: CreateDto): Promise<T>;
  update(id: string | number, data: UpdateDto): Promise<T>;
  delete(id: string | number): Promise<T>;
  deactivate(id: number | string): Promise<void>;
}

export const useCrud = <T extends { id: string | number }, CreateDto, UpdateDto>(
  serviceInstance: CrudService<T, CreateDto, UpdateDto>
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getAll = useCallback(async (params: Record<string, any> = {}) => {
    setLoading(true);
    try {
      const result = await serviceInstance.getAll(params);
      setData(result);
      return result;
    } catch (err: any) {
      toast.error('Error al obtener los datos');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [serviceInstance]);

  const create = async (newData: CreateDto) => {
    setLoading(true);
    try {
      const result = await serviceInstance.create(newData);
      setData((prev) => [...prev, result]);
      toast.success('Creado exitosamente');
      return result;
    } catch (err: any) {
      toast.error('Error al crear');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string | number, updatedData: UpdateDto) => {
    setLoading(true);
    try {
      const result = await serviceInstance.update(id, updatedData);
      setData((prev) => prev.map((item) => (item.id === id ? result : item)));
      toast.success('Actualizado correctamente');
      return result;
    } catch (err: any) {
      toast.error('Error al actualizar');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string | number) => {
    setLoading(true);
    try {
      await serviceInstance.delete(id);
      setData((prev) => prev.filter((item) => item.id !== id));
      toast.success('Eliminado correctamente');
    } catch (err: any) {
      toast.error('Error al eliminar');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deactivate = async (id: number | string) => {
    setLoading(true);
    try {
      await serviceInstance.deactivate(id);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, getAll, create, update, remove, deactivate };
};