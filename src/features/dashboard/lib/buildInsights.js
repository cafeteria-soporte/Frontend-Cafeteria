import {
  TrendingUp, TrendingDown, PackageX, Clock, Award, Sparkles,
  AlertTriangle, Coffee, DollarSign, Users, Zap, Skull,
} from "lucide-react";
import { formatCurrency } from "@/utils/formats";

// Paleta por categoría — usada por InsightsCarousel.
export const CATEGORY_META = {
  prediccion: { label: "Predicción", accent: "#0ea5e9", bg: "bg-sky-500/10", text: "text-sky-600 dark:text-sky-400" },
  alerta: { label: "Alerta", accent: "#ef4444", bg: "bg-destructive/10", text: "text-destructive" },
  oportunidad: { label: "Oportunidad", accent: "#10b981", bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
  rendimiento: { label: "Rendimiento", accent: "#8b5cf6", bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400" },
};

/**
 * Compone las tarjetas de "asesor DSS" a partir de datos que ya se piden en
 * el dashboard (dss/tab-*) + la proyección semanal. Cada tarjeta = una
 * decisión o hallazgo en lenguaje simple, no un número suelto.
 */
export function buildInsights({ principal, predictivo, marketing, forecast, crisisMode }) {
  const cards = [];

  // ── Predicciones ──────────────────────────────────────────────────────
  if (forecast && !forecast.loading && forecast.projectedRevenue > 0) {
    cards.push({
      id: "forecast-revenue",
      category: "prediccion",
      icon: TrendingUp,
      title: "Ventas de la próxima semana",
      metric: formatCurrency(forecast.projectedRevenue),
      description: `Proyección basada en el promedio de los últimos 7 días · ~${forecast.projectedOrders} órdenes esperadas${
        forecast.growthPct !== 0
          ? ` · ${forecast.growthPct > 0 ? "+" : ""}${forecast.growthPct}% vs. la semana anterior`
          : ""
      }`,
    });
  }

  if (forecast?.stockNeeds?.length) {
    const top = forecast.stockNeeds[0];
    cards.push({
      id: "forecast-stock",
      category: "prediccion",
      icon: PackageX,
      title: "Stock a reponer esta semana",
      metric: `+${top.deficit} ${top.productName}`,
      description: `Consumo ~${top.averageDailyUsage.toFixed(1)}/día · con el stock actual (${top.currentStock}) alcanza para ${top.daysRemaining} días${
        forecast.stockNeeds.length > 1 ? ` · +${forecast.stockNeeds.length - 1} producto(s) más en riesgo` : ""
      }`,
    });
  }

  if (predictivo?.operationsForecast?.peakHourStart) {
    cards.push({
      id: "peak-hour",
      category: "prediccion",
      icon: Clock,
      title: "Prepárate para la hora pico",
      metric: `${predictivo.operationsForecast.peakHourStart}–${predictivo.operationsForecast.peakHourEnd}`,
      description: "Franja con más órdenes en los últimos 30 días. Asegurá personal e insumos antes de esa hora.",
    });
  }

  // ── Alertas ───────────────────────────────────────────────────────────
  if (principal?.holisticKpis?.opportunityCostBs > 0) {
    cards.push({
      id: "opportunity-cost",
      category: "alerta",
      icon: DollarSign,
      title: "Estás dejando de vender",
      metric: formatCurrency(principal.holisticKpis.opportunityCostBs),
      description: "Por productos actualmente sin stock. Reabastecé para no seguir perdiendo ingresos.",
    });
  }

  const critical = predictivo?.inventoryPredictions?.criticalStock?.[0];
  if (critical) {
    cards.push({
      id: "critical-stock",
      category: "alerta",
      icon: AlertTriangle,
      title: `${critical.productName} se está agotando`,
      metric: critical.teaHours != null ? `${critical.teaHours} h restantes` : `${critical.currentStock} unidades`,
      description: "Tiempo estimado de agotamiento según el ritmo de venta de hoy. Reponé antes de que llegue a cero.",
    });
  }

  const shrinkage = predictivo?.expectedShrinkage?.[0];
  if (shrinkage && shrinkage.urgency !== "baja") {
    cards.push({
      id: "shrinkage",
      category: "alerta",
      icon: TrendingDown,
      title: `Merma esperada: ${shrinkage.productName}`,
      metric: `~${shrinkage.expectedLossQty} und hoy`,
      description: `Urgencia ${shrinkage.urgency}, según el historial de mermas de este día de la semana. Revisá manejo y rotación.`,
    });
  }

  const fatigue = principal?.shiftStatus;
  if (fatigue?.isOpen && fatigue.fatigueRiskScore >= (crisisMode ? 60 : 80)) {
    cards.push({
      id: "fatigue",
      category: "alerta",
      icon: Zap,
      title: `Riesgo de fatiga: ${fatigue.cashierName}`,
      metric: `${Math.round(fatigue.fatigueRiskScore)}/100`,
      description: "Muchas horas activas + pagos en efectivo consecutivos. Considerá un relevo para evitar errores.",
    });
  }

  const zombies = marketing?.menuPerformanceMatrix?.filter((m) => m.matrixType === "zombie") ?? [];
  if (zombies.length >= 2) {
    cards.push({
      id: "zombies",
      category: "alerta",
      icon: Skull,
      title: "Productos con bajo desempeño",
      metric: `${zombies.length} en el menú`,
      description: `Bajo volumen y bajos ingresos (ej. ${zombies[0].productName}). Evaluá retirarlos o rediseñarlos.`,
    });
  }

  // ── Oportunidades ─────────────────────────────────────────────────────
  if (predictivo?.operationsForecast?.growingCategory) {
    cards.push({
      id: "growing-category",
      category: "oportunidad",
      icon: Sparkles,
      title: `${predictivo.operationsForecast.growingCategory} está creciendo`,
      metric: "Tendencia al alza",
      description: "Mayor crecimiento esta semana vs. la anterior. Asegurá stock y destacala en el mostrador.",
    });
  }

  const crossSell = marketing?.crossSellingAffinity?.[0];
  if (crossSell) {
    cards.push({
      id: "cross-sell",
      category: "oportunidad",
      icon: Coffee,
      title: "Armá un combo",
      metric: `${crossSell.affinityPct}% de afinidad`,
      description: `Quien compra "${crossSell.baseProduct}" también lleva "${crossSell.matchedProduct}" — sugerilo en caja o armá un combo.`,
    });
  }

  const deadHour = marketing?.heatmapInsights?.deadHours?.[0];
  if (deadHour) {
    cards.push({
      id: "dead-hour",
      category: "oportunidad",
      icon: Clock,
      title: `Hora muerta: ${deadHour.affectedCategory}`,
      metric: `${deadHour.hourStart}–${deadHour.hourEnd}`,
      description: "Ventas muy por debajo del promedio en esa franja. Ideal para una promo o happy hour.",
    });
  }

  // ── Rendimiento ───────────────────────────────────────────────────────
  const topCashier = principal?.holisticKpis?.cashierEfficiencyRanking?.[0];
  if (topCashier) {
    cards.push({
      id: "top-cashier",
      category: "rendimiento",
      icon: Award,
      title: `${topCashier.cashierName} lidera el ranking`,
      metric: `${topCashier.efficiencyScore}/100`,
      description: "Mejor eficiencia entre ventas y precisión de caja en el período. Reconocelo frente al equipo.",
    });
  }

  const worstCashier = principal?.holisticKpis?.cashierEfficiencyRanking?.slice(-1)?.[0];
  if (worstCashier && principal.holisticKpis.cashierEfficiencyRanking.length > 1 && worstCashier.efficiencyScore < 70) {
    cards.push({
      id: "coach-cashier",
      category: "rendimiento",
      icon: Users,
      title: `${worstCashier.cashierName} necesita apoyo`,
      metric: `${worstCashier.efficiencyScore}/100`,
      description: "Eficiencia por debajo del equipo. Considerá acompañamiento en arqueo o atención.",
    });
  }

  if (marketing?.priceSensitivity?.productName) {
    const ps = marketing.priceSensitivity;
    const good = (ps.salesDropPct ?? 0) <= 0;
    cards.push({
      id: "price-sensitivity",
      category: good ? "rendimiento" : "alerta",
      icon: good ? TrendingUp : TrendingDown,
      title: `Cambio de precio: ${ps.productName}`,
      metric: `${formatCurrency(ps.priceChangeBs ?? 0)} · ${good ? "bien recibido" : `${ps.salesDropPct}% menos ventas`}`,
      description: good
        ? "Las ventas se mantuvieron tras el ajuste. El precio nuevo funciona."
        : "Las ventas cayeron tras el cambio. Considerá revertirlo o comunicar el valor agregado.",
    });
  }

  return cards;
}
