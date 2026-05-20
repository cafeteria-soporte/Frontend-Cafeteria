import React, { useState } from "react";
import { Eye, EyeOff, ArrowRight, Lock, User } from "lucide-react";
import { useAuth } from "../hooks/useAuth";


export const PantallaLogin = () => {
  const { username, setUsername, password, setPassword, handleLogin, error } =
    useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-[0.06]"
          style={{ background: "var(--primary)" }} />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-[0.05]"
          style={{ background: "var(--navbar)" }} />
      </div>

      <div className="relative w-full max-w-[420px] animate-slide-up">

        <div className="rounded-t-2xl overflow-hidden" style={{ background: "var(--navbar)" }}>
          <div className="h-[3px] w-full" style={{
            background: "linear-gradient(90deg, var(--primary), color-mix(in srgb, var(--primary) 50%, transparent))",
          }} />

          <div className="px-7 py-5 flex items-center gap-4">
            {/* Ícono de taza SVG */}
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "color-mix(in srgb, var(--primary) 22%, transparent)" }}>
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <path d="M4 14h18v6a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6v-6z" fill="var(--primary-foreground)" opacity="0.9"/>
                <rect x="4" y="11" width="18" height="4" rx="2" fill="var(--primary-foreground)" opacity="0.4"/>
                <path d="M22 15h2a3 3 0 0 1 0 6h-2" stroke="var(--primary-foreground)" strokeWidth="1.8" strokeLinecap="round" opacity="0.65"/>
                <path d="M10 7c0 0 1.5-1.5 0-3M15 7c0 0 1.5-1.5 0-3" stroke="var(--primary-foreground)" strokeWidth="1.4" strokeLinecap="round" opacity="0.4"/>
                <rect x="7" y="25" width="12" height="1.5" rx="0.75" fill="var(--primary-foreground)" opacity="0.25"/>
              </svg>
            </div>

            <div className="flex-1">
              <p className="text-[17px] font-bold tracking-tight leading-none"
                style={{ color: "var(--navbar-foreground)" }}>
                Café UCB
              </p>
          
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: "color-mix(in srgb, var(--primary) 18%, transparent)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--primary)" }} />
             
            </div>
          </div>
        </div>

        <div className="rounded-b-2xl px-7 py-8 border border-t-0"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}>

          <div className="mb-7">
            <h2 className="text-[22px] font-semibold tracking-tight" style={{ color: "var(--foreground)" }}>
              Bienvenido de nuevo
            </h2>
            <p className="text-sm mt-1.5" style={{ color: "var(--muted-foreground)" }}>
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 animate-fade-in"
              style={{
                background: "color-mix(in srgb, var(--destructive) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--destructive) 30%, transparent)",
                color: "var(--destructive)",
              }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2"
                style={{ color: "var(--muted-foreground)" }}>
                Usuario
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    color: focusedField === "username" ? "var(--primary)" : "var(--muted-foreground)",
                    transition: "color 0.2s",
                  }} />
                <input
                  type="text"
                  value={username}
                  placeholder="nombre.apellido"
                  className="input transition-all duration-200"
                  style={{
                    paddingLeft: "40px",
                    borderColor: focusedField === "username" ? "var(--primary)" : "var(--border)",
                    boxShadow: focusedField === "username"
                      ? "0 0 0 3px color-mix(in srgb, var(--primary) 15%, transparent)" : "none",
                  }}
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setUsername(e.target.value)}
                  required autoComplete="username"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "var(--muted-foreground)" }}>
                  Contraseña
                </label>
               

              </div>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    color: focusedField === "password" ? "var(--primary)" : "var(--muted-foreground)",
                    transition: "color 0.2s",
                  }} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="••••••••••"
                  className="input pr-10 transition-all duration-200"
                  style={{
                    paddingLeft: "40px", 
                    borderColor: focusedField === "password" ? "var(--primary)" : "var(--border)",
                    boxShadow: focusedField === "password"
                      ? "0 0 0 3px color-mix(in srgb, var(--primary) 15%, transparent)" : "none",
                  }}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setPassword(e.target.value)}
                  required autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:opacity-70 transition-opacity"
                  style={{ color: "var(--muted-foreground)" }}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button type="submit"
              className="button button-default button-lg w-full mt-1 group"
              style={{ height: "44px" }}>
              <span>Iniciar sesión</span>
              <ArrowRight size={16} className="ml-2 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </form>

          <div className="mt-7 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="text-[11px] text-center" style={{ color: "var(--muted-foreground)" }}>
              Acceso auditado · Cada sesión queda registrada con marca de tiempo
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] mt-4 opacity-40" style={{ color: "var(--muted-foreground)" }}>
          Universidad Católica Boliviana · 2025
        </p>
      </div>
    </div>
  );
};