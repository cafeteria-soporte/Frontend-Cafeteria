import { useEffect, useMemo, useState } from "react";
import { Download, Filter, Search, Loader2 } from "lucide-react";
import { useStock } from "../hooks/useStock";
import { useProducts } from "@/features/products/hooks/useProducts";

const TRADUCCION_TIPOS = {
  "goods_receipt": "Ingreso",
  "manual_adjustment": "Ajuste manual",
  "shrinkage": "Merma",
  "sale": "Venta",
  "sale_void": "Venta anulada",
};

export const HistorialMovimientosStock = () => {
  const { movements, loadingMovements, getAllMovements } = useStock();
  const { products, loadingProducts, getAllProducts } = useProducts();
  
 
  const users = []; 

  const [productoFiltro, setProductoFiltro] = useState("Todos");
  const [tipoFiltro, setTipoFiltro] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");

  console.log("Movimientos crudos desde el hook:", movements);
  useEffect(() => {
    getAllMovements({ limit: 100 });
    getAllProducts({ limit: 100 });
   
  }, [getAllMovements, getAllProducts]);

  const movimientosMapeados = useMemo(() => {
    return movements.map((m) => {
      // Cruzar Producto
      const prod = products.find((p) => Number(p.id) === Number(m.productId));
      
 
      const fechaObj = new Date(m.createdAt);
      const fechaFormateada = !isNaN(fechaObj.getTime())
        ? fechaObj.toLocaleString("es-BO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : m.createdAt;

      const tipoOriginal = m.movementType?.name;
      const tipoTraducido = TRADUCCION_TIPOS[tipoOriginal] || tipoOriginal || "Desconocido";

      return {
        id: m.id,
        fecha: fechaFormateada,
        producto: prod?.name || `Producto ID: ${m.productId}`,
        tipo: tipoTraducido, 
        cantidad: m.quantity,
        stockResultante: m.stockAfter,
        usuario: m.user.fullName,
        detalle: m.reason || "Sin detalle",
      };
    });
  }, [movements, products, users]);

  const filtrados = useMemo(() => {
    return movimientosMapeados.filter((m) => {
      const texto = `${m.producto} ${m.tipo} ${m.detalle} ${m.usuario}`
        .toLowerCase()
        .includes(busqueda.toLowerCase());
      const prodOk = productoFiltro === "Todos" || m.producto === productoFiltro;
      const tipoOk = tipoFiltro === "Todos" || m.tipo === tipoFiltro;
      
      return texto && prodOk && tipoOk;
    });
  }, [movimientosMapeados, busqueda, productoFiltro, tipoFiltro]);

  const exportarCSV = () => {
    const rows = [
      ["Fecha", "Producto", "Tipo", "Cantidad", "Stock resultante", "Usuario", "Detalle"],
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
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "historial-stock.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const isLoading = loadingMovements || loadingProducts;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Historial de movimientos de stock
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Consulta de movimientos consumidos desde la API.
            </p>
          </div>
          <button
            onClick={exportarCSV}
            disabled={filtrados.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            <Download size={16} /> Exportar CSV
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
            <Loader2 size={16} className="animate-spin" /> Cargando historial en vivo...
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
              value={productoFiltro}
              onChange={(e) => setProductoFiltro(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
            >
              <option value="Todos">Todos los productos</option>
              {products.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
            
            {/* 3. SELECT DE TIPOS TRADUCIDO */}
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
            >
              <option value="Todos">Todos los tipos</option>
              <option value="Ingreso">Ingreso</option>
              <option value="Ajuste manual">Ajuste manual</option>
              <option value="Merma">Merma</option>
              <option value="Venta">Venta</option>
              <option value="Venta anulada">Venta anulada</option>
            </select>
          </div>
          
          <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Filter size={16} /> {filtrados.length} registros encontrados
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-3 py-3 text-left">Fecha/hora</th>
                  <th className="px-3 py-3 text-left">Producto</th>
                  <th className="px-3 py-3 text-left">Tipo</th>
                  <th className="px-3 py-3 text-left">Cantidad</th>
                  <th className="px-3 py-3 text-left">Stock</th>
                  <th className="px-3 py-3 text-left">Usuario</th>
                  <th className="px-3 py-3 text-left">Motivo/Detalle</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 && !isLoading ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-muted-foreground">
                      No se encontraron movimientos.
                    </td>
                  </tr>
                ) : (
                  filtrados.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b border-border last:border-none"
                    >
                      <td className="px-3 py-4">{m.fecha}</td>
                      <td className="px-3 py-4 font-medium">{m.producto}</td>
                      <td className="px-3 py-4">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          {m.tipo}
                        </span>
                      </td>
                      <td
                        className={`px-3 py-4 font-bold ${
                          Number(m.cantidad) < 0 ? "text-destructive" : "text-primary"
                        }`}
                      >
                        {Number(m.cantidad) > 0 ? `+${m.cantidad}` : m.cantidad}
                      </td>
                      <td className="px-3 py-4 font-semibold">{m.stockResultante}</td>
                      <td className="px-3 py-4 text-muted-foreground">{m.usuario}</td>
                      <td className="px-3 py-4">{m.detalle}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};