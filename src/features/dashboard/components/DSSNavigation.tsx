/**
 * Componente DSS Navigation - Acceso rápido a los 10 dashboards
 */

import React from 'react';
import {
  TrendingUp,
  BarChart3,
  ShoppingCart,
  DollarSign,
  Users,
  Grid,
  Trash2,
  AlertCircle,
  Calendar,
  Clock,
} from 'lucide-react';

interface DSSNavItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  route: string;
}

const dssNavigationItems: DSSNavItem[] = [
  {
    id: 'executive',
    label: 'Dashboard Ejecutivo',
    description: 'Vista gerencial en tiempo real',
    icon: <TrendingUp size={20} />,
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    route: '/dashboard/executive',
  },
  {
    id: 'sales-period',
    label: 'Ventas por Período',
    description: 'Tendencias y comparativas',
    icon: <BarChart3 size={20} />,
    color: 'bg-green-50 border-green-200 text-green-700',
    route: '/dashboard/sales-period',
  },
  {
    id: 'products',
    label: 'Productos y Rentabilidad',
    description: 'Qué vender y qué revisar',
    icon: <ShoppingCart size={20} />,
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    route: '/dashboard/products',
  },
  {
    id: 'cash',
    label: 'Caja y Descuadres',
    description: 'Control financiero',
    icon: <DollarSign size={20} />,
    color: 'bg-red-50 border-red-200 text-red-700',
    route: '/dashboard/cash',
  },
  {
    id: 'cashier-performance',
    label: 'Rendimiento por Cajero',
    description: 'Gestión del equipo',
    icon: <Users size={20} />,
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    route: '/dashboard/cashier-performance',
  },
  {
    id: 'categories',
    label: 'Categorías y Menú',
    description: 'Mix de productos',
    icon: <Grid size={20} />,
    color: 'bg-amber-50 border-amber-200 text-amber-700',
    route: '/dashboard/categories',
  },
  {
    id: 'shrinkage',
    label: 'Mermas y Pérdidas',
    description: 'Control de costos',
    icon: <Trash2 size={20} />,
    color: 'bg-orange-50 border-orange-200 text-orange-700',
    route: '/dashboard/shrinkage',
  },
  {
    id: 'alerts',
    label: 'Panel DSS Core',
    description: 'Alertas y recomendaciones',
    icon: <AlertCircle size={20} />,
    color: 'bg-rose-50 border-rose-200 text-rose-700',
    route: '/dashboard/alerts',
  },
  {
    id: 'comparison',
    label: 'Comparativa de Períodos',
    description: 'Análisis avanzado',
    icon: <Calendar size={20} />,
    color: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    route: '/dashboard/comparison',
  },
  {
    id: 'demand-hours',
    label: 'Horarios y Picos de Demanda',
    description: 'Optimización operativa',
    icon: <Clock size={20} />,
    color: 'bg-teal-50 border-teal-200 text-teal-700',
    route: '/dashboard/demand-hours',
  },
];

interface DSSNavigationProps {
  onNavigate?: (route: string) => void;
  currentDashboard?: string;
}

export const DSSNavigation: React.FC<DSSNavigationProps> = ({
  onNavigate,
  currentDashboard,
}) => {
  const handleNavigate = (route: string) => {
    if (onNavigate) {
      onNavigate(route);
    } else {
      // Fallback: usar router de React Router si está disponible
      window.location.href = route;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
      {dssNavigationItems.map((item) => (
        <button
          key={item.id}
          onClick={() => handleNavigate(item.route)}
          className={`
            p-4 rounded-lg border-2 transition-all duration-200
            hover:shadow-md hover:-translate-y-1
            ${
              currentDashboard === item.id
                ? `${item.color} shadow-md`
                : `border-transparent bg-card hover:border-border`
            }
          `}
          title={item.description}
        >
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-1">{item.icon}</div>
            <div className="text-left">
              <h3 className="text-sm font-semibold">{item.label}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {item.description}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default DSSNavigation;
