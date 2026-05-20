import React from 'react';

export const ChartErrorState = ({ error, onRetry }) => {
  if (!error) return null;

  return (
    <div className="w-full h-[350px] bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-full text-red-600">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
        </svg>
      </div>
      <div>
        <h4 className="text-sm font-bold text-red-800">Error en Consulta Analítica</h4>
        <p className="text-xs text-red-600 mt-1 max-w-xs">{error}</p>
      </div>
      {onRetry && (
        <button 
          onClick={onRetry} 
          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md transition-all shadow-sm"
        >
          Reintentar Solicitud
        </button>
      )}
    </div>
  );
};