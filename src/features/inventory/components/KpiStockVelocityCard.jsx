import { AlertTriangle, CheckCircle2, GaugeCircle, PackageX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const statusMeta = {
  sin_stock: {
    label: "Sin stock",
    icon: PackageX,
    className: "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-300",
  },
  critico: {
    label: "Crítico",
    icon: AlertTriangle,
    className: "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-300",
  },
  alerta: {
    label: "Alerta",
    icon: GaugeCircle,
    className: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300",
  },
  ok: {
    label: "OK",
    icon: CheckCircle2,
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  },
};

const normalizeStatus = (item) => {
  if (item.estado) return item.estado;
  if (Number(item.diasRestantes) <= 0) return "sin_stock";
  if (Number(item.diasRestantes) <= 3) return "critico";
  if (Number(item.diasRestantes) <= 7) return "alerta";
  return "ok";
};

export const KpiStockVelocityCard = ({ item }) => {
  const estado = normalizeStatus(item);
  const meta = statusMeta[estado] ?? statusMeta.ok;
  const Icon = meta.icon;
  const dias = Number(item.diasRestantes ?? 0);

  return (
    <Card className={`border ${meta.className}`}>
      <CardContent className="space-y-4 px-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
              {meta.label}
            </p>
            <h3 className="mt-1 line-clamp-2 text-base font-bold text-foreground">
              {item.producto}
            </h3>
          </div>
          <div className="rounded-xl bg-background/70 p-2 shadow-sm">
            <Icon size={18} />
          </div>
        </div>

        <div>
          <p className="text-3xl font-black tracking-tight text-foreground">
            {dias <= 0 ? "0" : dias.toFixed(dias % 1 === 0 ? 0 : 1)}
            <span className="ml-1 text-sm font-semibold text-muted-foreground">
              días
            </span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Stock actual: {item.stockActual} · Salida diaria: {item.velocidadDiaria}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
