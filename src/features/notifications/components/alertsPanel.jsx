import { AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";
import { ROUTES } from "@/utils/constants";
import { Link } from "react-router-dom";

const claseTipo = (tipo) => {
  if (tipo === "stock")
    return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  if (tipo === "critico") return "bg-destructive/10 text-destructive";
  return "bg-primary/10 text-primary";
};

export const AlertsPanel = ({ alertas = [], onMarcarLeida }) => {
  return (
    <div className="space-y-3">
      {alertas.map((alerta) => (
        <div
          key={alerta.id}
          className={`rounded-2xl border border-border bg-card p-4 shadow-sm ${alerta.leida ? "opacity-70" : ""}`}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex gap-3">
              <div className={`rounded-xl p-2 ${claseTipo(alerta.tipo)}`}>
                <AlertTriangle size={18} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{alerta.titulo}</h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${alerta.leida ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}
                  >
                    {alerta.leida ? "Leída" : "No leída"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {alerta.descripcion}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {alerta.fecha}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              {alerta.enlace && (
                <Link
                  to={alerta.enlace}
                  className="inline-flex items-center gap-1 rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-accent"
                >
                  <ExternalLink size={14} /> Ver detalle
                </Link>
              )}
              {!alerta.leida && (
                <button
                  type="button"
                  onClick={() => onMarcarLeida?.(alerta.id)}
                  className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
                >
                  <CheckCircle2 size={14} /> Marcar leída
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
