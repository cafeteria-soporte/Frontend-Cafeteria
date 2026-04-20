// src/features/auth/pages/PantallaLogin.jsx
import { Button } from "@/components/ui/button";

export const PantallaLogin = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-md p-8 bg-card border border-border rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-center text-primary">Café UCB - Login</h1>
        <p className="text-muted-foreground text-center mb-6">Ingresa tus credenciales para continuar</p>
        
        {/* Aquí luego irá tu FoumularioLogin.jsx */}
        
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          Iniciar Sesión (Simulado)
        </Button>
      </div>
    </div>
  );
};