/**
 * Componente ChartLoader - Estados de carga para gráficos
 */

import React from 'react';

interface ChartLoaderProps {
  height?: string;
  width?: string;
}

export const ChartLoader: React.FC<ChartLoaderProps> = ({
  height = 'h-64',
  width = 'w-full',
}) => {
  return (
    <div
      className={`${width} ${height} bg-muted/20 rounded-md border border-border flex items-center justify-center`}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 rounded-full border-2 border-border border-t-primary animate-spin" />
        </div>
        <p className="text-xs text-muted-foreground">Cargando gráfico...</p>
      </div>
    </div>
  );
};

export const SkeletonBar: React.FC = () => {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-2">
          <div className="w-24 h-6 bg-muted/30 rounded animate-pulse" />
          <div className="flex-1 h-6 bg-muted/20 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
};

export default ChartLoader;
