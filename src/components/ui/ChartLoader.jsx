import React from 'react';

export const ChartLoader = ({ isLoading, children }) => {
  if (!isLoading) return children;

  return (
    <div className="w-full h-[350px] bg-gray-50 dark:bg-zinc-900 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center p-6 space-y-3">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-amber-200 animate-pulse"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-600 animate-spin"></div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Cargando métricas de analítica...</p>
        <p className="text-xs text-gray-400">Por favor, espera un momento</p>
      </div>
    </div>
  );
};