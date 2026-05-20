"use client";

import React, { useState } from "react";
import { Search, X, PackageOpen } from "lucide-react";

export const ModalStock = ({ open, onClose, productos = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!open) return null;

  const filteredProducts = productos.filter((p) =>
    (p.name || p.nombre || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div 
        className="relative flex flex-col w-full max-w-2xl max-h-[85vh] rounded-3xl border border-border/50 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{ backgroundColor: "var(--card)" }} // Usa el color oscuro de tu tema
      >
        
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Consulta de stock
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Consulta niveles de stock y revisa el estado de tus productos.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 bg-muted/30 hover:bg-muted text-muted-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-border/50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-muted-foreground/70"
            />
          </div>
        </div>

        <div className="px-6 py-3 border-y border-border/40 bg-muted/10 grid grid-cols-4 gap-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <div className="col-span-2">Producto</div>
          <div className="text-right pr-4">Stock disponible</div>
          <div className="text-center">Estado</div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-[200px] px-2">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <PackageOpen size={32} className="mb-3 opacity-20" />
              <p className="text-sm">No se encontraron productos.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredProducts.map((producto, index) => {
                const nombre = producto.name || producto.nombre || "Sin nombre";
                const categoria = producto.category?.name || "Sin categoría";
                const stock = producto.currentStock ?? producto.stock ?? 0;
                
                const isLowStock = stock <= (producto.minStock || 3);
                const isOutOfStock = stock <= 0;

                return (
                  <div 
                    key={producto.id || index}
                    className="grid grid-cols-4 gap-4 items-center px-4 py-4 border-b border-border/30 hover:bg-muted/10 transition-colors"
                  >
                    <div className="col-span-2 flex flex-col gap-0.5">
                      <span className="font-semibold text-sm text-foreground">{nombre}</span>
                      <span className="text-xs text-muted-foreground">{categoria}</span>
                    </div>
                    
                    <div className="text-right pr-6 font-mono text-sm">
                      {stock}
                    </div>
                    
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                        isOutOfStock 
                          ? 'bg-destructive/10 text-destructive border-destructive/20' 
                          : isLowStock 
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            : 'bg-green-500/10 text-green-500 border-green-500/20'
                      }`}>
                        {isOutOfStock ? 'Agotado' : isLowStock ? 'Bajo' : 'OK'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 pt-4 border-t border-border/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};