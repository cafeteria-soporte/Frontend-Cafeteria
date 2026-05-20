"use client";

import React, { useState } from "react";
import { Search, Coffee, UtensilsCrossed, Cake, Package, Grid3x3, List, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const categoryIcons = {
  Bebidas: Coffee,
  Comidas: UtensilsCrossed,
  Postres: Cake,
  Snacks: Package,
};

export const ProductCatalog = ({ products, onAddProduct }) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [viewMode, setViewMode] = useState("grid");
console.log("Productos recibidos en ProductCatalog:", products);
  const categories = ["Todos", ...new Set(products.map((p) => p.categoria))];

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === "Todos" || p.categoria === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="flex h-full w-full flex-1 flex-col border-r border-border/40">
      
      <div className="px-5 pt-6 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Catálogo</h2>
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
              {filteredProducts.length} productos
            </p>
          </div>
          
          <div className="flex border border-border bg-card rounded-lg p-0.5 shadow-sm">
            <Button 
              variant={viewMode === "grid" ? "secondary" : "ghost"} 
              size="sm" className="h-7 w-7 p-0" onClick={() => setViewMode("grid")}
            >
              <Grid3x3 className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant={viewMode === "list" ? "secondary" : "ghost"} 
              size="sm" className="h-7 w-7 p-0" onClick={() => setViewMode("list")}
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border-border/50 h-9 pl-9 text-sm rounded-lg"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 h-7 text-[10px] font-bold border-none shadow-sm transition-all ${
                selectedCategory === cat 
                ? "bg-navbar text-navbar-foreground" 
                : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
          {filteredProducts.map((product) => {
            const Icon = categoryIcons[product.categoria] || Package;
            const isOutOfStock = product.stock === 0;
            const hasImage = Boolean(product.imageUrl);
console.log("Producto en renderizado:", product);
            return (
              <Card 
                key={product.id}
                onClick={() => !isOutOfStock && onAddProduct(product)}
                style={hasImage ? {
                  backgroundImage: `url(${hasImage ? product.imageUrl : ""})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                } : {}}
                className={`group relative border-border/30 shadow-sm hover:shadow-md transition-all cursor-pointer rounded-2xl overflow-hidden min-h-[140px] ${
                  hasImage ? "border-transparent" : "bg-card"
                } ${isOutOfStock ? "opacity-60" : ""}`}
              >
                
                {hasImage && (
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors z-0" />
                )}

                <CardContent className="p-3 relative z-10 h-full flex flex-col justify-between">
                  <div className="flex justify-center mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                      hasImage ? "bg-white/20 backdrop-blur-sm" : "bg-muted/50"
                    }`}>
                      <Icon className={`h-5 w-5 ${hasImage ? "text-white" : "text-primary/60"}`} />
                    </div>
                  </div>

                  <div className="text-center space-y-0.5 mt-auto">
                    <h3 className={`font-bold text-xs leading-tight truncate ${
                      hasImage ? "text-white drop-shadow-md" : "text-foreground"
                    }`}>
                      {product.nombre}
                    </h3>
                    
                    <p className={`text-lg font-black ${
                      hasImage ? "text-white drop-shadow-md" : "text-primary"
                    }`}>
                      <span className="text-[10px] font-medium mr-0.5">Bs</span>
                      {product.precio}
                    </p>

                    <div className="flex items-center justify-center gap-1.5 pt-1">
                      <span className={`text-[9px] font-bold uppercase ${
                        isOutOfStock 
                          ? "text-red-400" 
                          : hasImage ? "text-white/80" : "text-muted-foreground"
                      }`}>
                        Stock: {product.stock}
                      </span>
                      {!isOutOfStock && (
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
                          hasImage ? "bg-white text-black" : "bg-primary text-white"
                        }`}>
                          <Plus className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </div>

                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center z-20">
                      <Badge variant="destructive" className="text-[9px] px-2 py-0">Agotado</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};