import { useState, useCallback } from "react";

const iso = (d: Date) => d.toISOString().split("T")[0];

export type RangePreset = "7d" | "15d" | "30d" | "90d";

/**
 * Estado de rango de fechas para los dashboards, con presets relativos a hoy.
 */
export function useDateRange(initial: RangePreset = "30d") {
  const build = (preset: RangePreset) => {
    const to = new Date();
    const from = new Date();
    const days = { "7d": 7, "15d": 15, "30d": 30, "90d": 90 }[preset];
    from.setDate(to.getDate() - days);
    return { from: iso(from), to: iso(to), preset };
  };

  const [range, setRange] = useState(() => build(initial));

  const setPreset = useCallback((preset: RangePreset) => {
    setRange(build(preset));
  }, []);

  const setCustom = useCallback((from: string, to: string) => {
    setRange((r) => ({ ...r, from, to, preset: r.preset }));
  }, []);

  return {
    from: range.from,
    to: range.to,
    preset: range.preset,
    setPreset,
    setCustom,
  };
}
