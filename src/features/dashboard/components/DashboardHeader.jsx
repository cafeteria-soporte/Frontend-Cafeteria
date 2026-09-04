import { RefreshCw } from "lucide-react";

const PRESETS = [
  { key: "7d", label: "7 días" },
  { key: "15d", label: "15 días" },
  { key: "30d", label: "30 días" },
  { key: "90d", label: "90 días" },
];

/**
 * Encabezado común de los dashboards: título, subtítulo, selector de rango y
 * botón de refrescar. `range` viene de useDateRange().
 */
export function DashboardHeader({
  eyebrow,
  title,
  range,
  onRefresh,
  showPresets = true,
  children,
}) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {eyebrow && (
            <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition hover:bg-accent"
          >
            <RefreshCw size={15} />
            Actualizar
          </button>
        )}
      </div>

      {showPresets && range && (
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => range.setPreset(p.key)}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                range.preset === p.key
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              Últimos {p.label}
            </button>
          ))}
        </div>
      )}

      {children}
    </div>
  );
}

export default DashboardHeader;
