import { useEffect, useMemo, useState } from "react";
import { Download, Filter, Search } from "lucide-react";
import { stockMovementsService } from "../services/stockMovements.service";
import { productsService } from "@/features/products/services/products.service";

const movimientosMock = [
  {
    id: 1,
    fecha: "2026-04-24 14:32",
    producto: "Café americano",
    tipo: "Venta",
    cantidad: -1,
    stockResultante: 38,
    usuario: "demo",
    detalle: "Venta #1084",
  },
  {
    id: 2,
    fecha: "2026-04-24 10:20",
    producto: "Café molido",
    tipo: "shrinkage",
    cantidad: -3,
    stockResultante: 2,
    usuario: "demo",
    detalle: "Vencimiento",
  },
];

export const HistorialMovimientosStock = () => {
  const [movimientos, setMovimientos] = useState(movimientosMock);
  const [productos, setProductos] = useState([]);
  const [producto, setProducto] = useState("Todos");
  const [tipo, setTipo] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");

  const cargar = async () => {
    try {
      setError("");
      const [movs, prods] = await Promise.all([
        stockMovementsService.getAll(),
        productsService.getAll().catch(() => []),
      ]);
      setMovimientos(movs.length ? movs : movimientosMock);
      setProductos(prods);
    } catch (err) {
      setError(
        "No se pudo cargar historial desde API. Se muestran datos de prueba.",
      );
      setMovimientos(movimientosMock);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const filtrados = useMemo(
    () =>
      movimientos.filter((m) => {
        const texto = `${m.producto} ${m.tipo} ${m.detalle} ${m.usuario}`
          .toLowerCase()
          .includes(busqueda.toLowerCase());
        const prodOk = producto === "Todos" || m.producto === producto;
        const tipoOk =
          tipo === "Todos" ||
          String(m.tipo).toLowerCase().includes(tipo.toLowerCase());
        return texto && prodOk && tipoOk;
      }),
    [movimientos, busqueda, producto, tipo],
  );

  const exportarCSV = () => {
    const rows = [
      [
        "Fecha",
        "Producto",
        "Tipo",
        "Cantidad",
        "Stock resultante",
        "Usuario",
        "Detalle",
      ],
      ...filtrados.map((m) => [
        m.fecha,
        m.producto,
        m.tipo,
        m.cantidad,
        m.stockResultante,
        m.usuario,
        m.detalle,
      ]),
    ];
    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "historial-stock.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Historial de movimientos de stock
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Consulta de movimientos consumidos desde API.
            </p>
          </div>
          <button
            onClick={exportarCSV}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Download size={16} /> Exportar CSV
          </button>
        </div>
        {error && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            {error}
          </div>
        )}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px_220px]">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar producto, usuario o motivo..."
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={producto}
              onChange={(e) => setProducto(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
            >
              <option>Todos</option>
              {productos.map((p) => (
                <option key={p.id}>{p.nombre}</option>
              ))}
            </select>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
            >
              <option>Todos</option>
              <option>goods_receipt</option>
              <option>manual_adjustment</option>
              <option>shrinkage</option>
              <option>sale</option>
              <option>sale_void</option>
            </select>
          </div>
          <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Filter size={16} /> {filtrados.length} registros
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-3 py-3 text-left">Fecha/hora</th>
                  <th className="px-3 py-3 text-left">Producto</th>
                  <th className="px-3 py-3 text-left">Tipo</th>
                  <th className="px-3 py-3 text-left">Cantidad</th>
                  <th className="px-3 py-3 text-left">Stock resultante</th>
                  <th className="px-3 py-3 text-left">Usuario</th>
                  <th className="px-3 py-3 text-left">Motivo/Detalle</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-border last:border-none"
                  >
                    <td className="px-3 py-4">{m.fecha || "—"}</td>
                    <td className="px-3 py-4 font-medium">{m.producto}</td>
                    <td className="px-3 py-4">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {m.tipo}
                      </span>
                    </td>
                    <td
                      className={`px-3 py-4 font-medium ${Number(m.cantidad) < 0 ? "text-destructive" : "text-primary"}`}
                    >
                      {Number(m.cantidad) > 0 ? `+${m.cantidad}` : m.cantidad}
                    </td>
                    <td className="px-3 py-4">{m.stockResultante}</td>
                    <td className="px-3 py-4">{m.usuario}</td>
                    <td className="px-3 py-4">{m.detalle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};
