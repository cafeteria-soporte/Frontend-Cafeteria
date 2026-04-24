import { AlertTriangle, X } from "lucide-react";

export const BannerNotificacion = ({ alerta, onClose }) => {
  if (!alerta) return null;
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="mt-0.5" />
        <div>
          <p className="font-semibold">{alerta.titulo}</p>
          <p className="mt-1">{alerta.descripcion}</p>
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 hover:bg-background/60"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
