import { useMemo, useState } from "react";
import { Eye, EyeOff, ArrowRight, Lock, User, Coffee, ShieldCheck, BarChart3 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

// Fotos de café (Unsplash CDN — sin API key). Se elige una al azar por carga.
const COFFEE_PHOTOS = [
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1400&q=80",
];

const FEATURES = [
  { icon: Coffee, text: "Punto de venta ágil" },
  { icon: ShieldCheck, text: "Control de caja y turnos" },
  { icon: BarChart3, text: "Decisiones con datos en tiempo real" },
];

export const PantallaLogin = () => {
  const { username, setUsername, password, setPassword, handleLogin, error, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const photo = useMemo(
    () => COFFEE_PHOTOS[Math.floor(Math.random() * COFFEE_PHOTOS.length)],
    [],
  );

  return (
    <div className="flex min-h-screen w-full bg-neutral-950 text-neutral-100">
      {/* ── Panel izquierdo: foto + marca ── */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-amber-950 via-neutral-900 to-neutral-950 p-10 lg:flex xl:p-14">
        {/* foto (si falla la carga, queda el degradado de fondo) */}
        <img
          src={photo}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(20,16,12,0.7)] via-[rgba(20,16,12,0.45)] to-[rgba(20,16,12,0.75)]" />

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
            <Coffee size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">Café UCB</span>
        </div>

        <div className="relative">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Sistema de gestión · Cafetería
          </p>
          <h1 className="max-w-md text-4xl font-bold leading-[1.1] text-white xl:text-5xl">
            Cada taza,<br />una decisión inteligente.
          </h1>

          <ul className="mt-8 space-y-3">
            {FEATURES.map((f) => (
              <li key={f.text} className="flex items-center gap-3 text-sm text-white/85">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur">
                  <f.icon size={15} className="text-white" />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Panel derecho: formulario ── */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* marca visible solo en mobile */}
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
              <Coffee size={18} className="text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight">Café UCB</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-neutral-50">Bienvenido de vuelta</h2>
          <p className="mt-1.5 text-sm text-neutral-400">Ingresa tus credenciales para continuar.</p>

          {error && (
            <div className="mt-6 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-7 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-300">Usuario</label>
              <div className="relative">
                <User size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="nombre.apellido"
                  required
                  autoComplete="username"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 py-2.5 pl-10 pr-3 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-neutral-300">Contraseña</label>
              </div>
              <div className="relative">
                <Lock size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 py-2.5 pl-10 pr-10 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 transition hover:text-neutral-300"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Ingresando…" : "Ingresar al sistema"}
              {!loading && <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />}
            </button>
          </form>

          <p className="mt-8 border-t border-neutral-800 pt-5 text-center text-xs text-neutral-500">
            Acceso auditado · Cada sesión queda registrada con marca de tiempo
          </p>
          <p className="mt-4 text-center text-[10px] text-neutral-600">
            Universidad Católica Boliviana · 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default PantallaLogin;
