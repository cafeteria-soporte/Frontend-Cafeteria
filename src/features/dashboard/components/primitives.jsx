// Primitivas visuales compartidas por los dashboards.

export function Card({ title, subtitle, action, children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-border bg-card shadow-sm ${className}`}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 border-b border-border p-4 sm:p-5">
          <div>
            {title && (
              <h2 className="text-base sm:text-lg font-semibold">{title}</h2>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function StatTile({ label, value, hint, tone = "default" }) {
  const tones = {
    default: "text-foreground",
    good: "text-emerald-600 dark:text-emerald-400",
    warn: "text-amber-600 dark:text-amber-400",
    bad: "text-destructive",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1.5 text-2xl font-bold ${tones[tone]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function EmptyState({ message = "Sin datos para este período." }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
      <p className="font-semibold text-destructive">No se pudieron cargar los datos</p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 rounded-lg border border-border bg-card px-4 py-1.5 text-sm font-medium hover:bg-accent"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}

// Paleta para gráficos (usa los tokens del tema con fallback).
export const CHART_COLORS = [
  "var(--color-primary, #d97706)",
  "#0ea5e9",
  "#10b981",
  "#8b5cf6",
  "#f43f5e",
  "#f59e0b",
  "#14b8a6",
  "#a3a3a3",
];
