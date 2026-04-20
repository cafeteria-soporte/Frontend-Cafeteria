// src/features/dashboard/pages/DashboardAdminPage.jsx
export const DashboardAdminPage = () => {
  return (
    <div className="space-y-4">
      {/* El título "Dashboard" ya lo pone el MainLayout arriba, así que aquí solo va el contenido */}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-card border border-border rounded-lg shadow-sm">
          <h3 className="text-muted-foreground text-sm font-medium">Administradores activos</h3>
          <p className="text-3xl font-bold mt-2">2</p>
        </div>
        
        <div className="p-6 bg-card border border-border rounded-lg shadow-sm">
          <h3 className="text-muted-foreground text-sm font-medium">Cajeros activos</h3>
          <p className="text-3xl font-bold mt-2">2</p>
        </div>
        
        <div className="p-6 bg-card border border-border rounded-lg shadow-sm">
          <h3 className="text-muted-foreground text-sm font-medium">Estado sistema</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">OK</p>
        </div>
      </div>
      
      <div className="mt-8 p-6 bg-card border border-border rounded-lg shadow-sm">
        <p className="text-muted-foreground">Aquí irán los accesos rápidos y la actividad reciente...</p>
      </div>
    </div>
  );
};