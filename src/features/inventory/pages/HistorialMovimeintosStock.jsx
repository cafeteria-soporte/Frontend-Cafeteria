import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";

const movimientosBase = [
  {
    id: 1,
    fecha: "2026-04-24 14:32",
    producto: "Café americano",
    tipo: "Venta",
    cantidad: -1,
    stockResultante: 38,
    usuario: "Imanani",
    motivo: "Venta #1084",
  },
  {
    id: 2,
    fecha: "2026-04-24 10:20",
    producto: "Café molido",
    tipo: "Merma",
    cantidad: -3,
    stockResultante: 2,
    usuario: "Mantezana",
    motivo: "Vencimiento",
  },
  {
    id: 3,
    fecha: "2026-04-24 09:00",
    producto: "Leche entera",
    tipo: "Ingreso",
    cantidad: 10,
    stockResultante: 15,
    usuario: "Mantezana",
    motivo: "Proveedor Lácteos SA",
  },
  {
    id: 4,
    fecha: "2026-04-24 08:30",
    producto: "Croissant",
    tipo: "Ajuste",
    cantidad: -2,
    stockResultante: 4,
    usuario: "Mantezana",
    motivo: "Corrección inventario",
  },
  {
    id: 5,
    fecha: "2026-04-23 17:10",
    producto: "Brownie",
    tipo: "Ingreso",
    cantidad: 12,
    stockResultante: 17,
    usuario: "Mantezana",
    motivo: "Reposición producción",
  },
  {
    id: 6,
    fecha: "2026-04-23 15:45",
    producto: "Capuccino",
    tipo: "Anulación",
    cantidad: 1,
    stockResultante: 31,
    usuario: "Administrador",
    motivo: "Anulación autorizada",
  },
];

const claseTipo = (tipo) => {
  if (tipo === "Ingreso") return "bg-primary/10 text-primary";
  if (tipo === "Venta" || tipo === "Merma")
    return "bg-destructive/10 text-destructive";
  if (tipo === "Anulación")
    return "bg-blue-500/10 text-blue-600 dark:text-blue-300";
  return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
};

export const HistorialMovimientosStock = () => {
  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("Todos");
  const [desde, setDesde] = useState("2026-04-23");
  const [hasta, setHasta] = useState("2026-04-24");

  const movimientos = useMemo(() => {
    return movimientosBase.filter((mov) => {
      const coincideTexto = `${mov.producto} ${mov.usuario} ${mov.motivo}`
        .toLowerCase()
        .includes(busqueda.toLowerCase());
      const coincideTipo = tipo === "Todos" || mov.tipo === tipo;
      const fecha = mov.fecha.slice(0, 10);
      const coincideFecha =
        (!desde || fecha >= desde) && (!hasta || fecha <= hasta);
      return coincideTexto && coincideTipo && coincideFecha;
    });
  }, [busqueda, tipo, desde, hasta]);

  const exportarCSV = () => {
    const encabezados =
      "Fecha,Producto,Tipo,Cantidad,Stock resultante,Usuario,Motivo\n";
    const filas = movimientos
      .map(
        (m) =>
          `${m.fecha},${m.producto},${m.tipo},${m.cantidad},${m.stockResultante},${m.usuario},${m.motivo}`,
      )
      .join("\n");
    const blob = new Blob([encabezados + filas], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "historial_stock.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Historial de Stock
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Consulta y exportación de movimientos de inventario.
            </p>
          </div>
          <button
            type="button"
            onClick={exportarCSV}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <Download size={16} /> Exportar CSV
          </button>
        </div>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_160px_160px]">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar producto, usuario o motivo..."
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm outline-none"
              />
            </div>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none"
            >
              <option>Todos</option>
              <option>Venta</option>
              <option>Ingreso</option>
              <option>Ajuste</option>
              <option>Merma</option>
              <option>Anulación</option>
            </select>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none"
            />
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-3 py-3 text-left font-medium">
                    Fecha/hora
                  </th>
                  <th className="px-3 py-3 text-left font-medium">Producto</th>
                  <th className="px-3 py-3 text-left font-medium">Tipo</th>
                  <th className="px-3 py-3 text-left font-medium">Cantidad</th>
                  <th className="px-3 py-3 text-left font-medium">
                    Stock resultante
                  </th>
                  <th className="px-3 py-3 text-left font-medium">Usuario</th>
                  <th className="px-3 py-3 text-left font-medium">
                    Motivo/Detalle
                  </th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((mov) => (
                  <tr
                    key={mov.id}
                    className="border-b border-border last:border-none"
                  >
                    <td className="px-3 py-4 font-mono text-xs">{mov.fecha}</td>
                    <td className="px-3 py-4 font-medium">{mov.producto}</td>
                    <td className="px-3 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${claseTipo(mov.tipo)}`}
                      >
                        {mov.tipo}
                      </span>
                    </td>
                    <td
                      className={`px-3 py-4 font-semibold ${mov.cantidad >= 0 ? "text-primary" : "text-destructive"}`}
                    >
                      {mov.cantidad >= 0 ? `+${mov.cantidad}` : mov.cantidad}
                    </td>
                    <td className="px-3 py-4">{mov.stockResultante}</td>
                    <td className="px-3 py-4">{mov.usuario}</td>
                    <td className="px-3 py-4 text-muted-foreground">
                      {mov.motivo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>{movimientos.length} registros</span>
            <div className="flex gap-2">
              <button className="rounded-xl border border-border px-3 py-2">
                ← Anterior
              </button>
              <button className="rounded-xl border border-border px-3 py-2">
                Siguiente →
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
