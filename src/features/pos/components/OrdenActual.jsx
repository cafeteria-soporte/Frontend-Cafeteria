"use client";

import React from "react";
import { Trash2, Minus, Plus, ShoppingCart, Receipt, X, ClipboardList } from "lucide-react";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export const CurrentOrder = ({
  order,
  total,
  onUpdateQuantity,
  onRemoveItem,
  onClearOrder,
  onCheckout,
  onRegisterOrder, 
}) => {
  const totalItems = order.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <Card className="flex h-full flex-col border-none rounded-none bg-card shadow-none overflow-hidden">
      
      <CardHeader className="px-5 py-5 border-b border-border/40 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-xl">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold leading-none mb-1">Orden Actual</CardTitle>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                Ticket #{(new Date().getTime()).toString().slice(-4)}
              </p>
            </div>
          </div>
          {order.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearOrder}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2.5 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Limpiar</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <div className="flex-1 min-h-0 overflow-hidden bg-muted/10"> 
        <ScrollArea className="h-full w-full px-5">
          <div className="py-4 space-y-2.5">
            {order.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-center space-y-4">
                <div className="bg-muted/50 rounded-2xl p-6">
                  <Receipt className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-foreground">Orden vacía</p>
                  <p className="text-[11px] font-medium text-muted-foreground">
                    Agrega productos del catálogo
                  </p>
                </div>
              </div>
            ) : (
              order.map((item) => (
                <div 
                  key={item.id} 
                  className="group relative bg-card border border-border/40 rounded-2xl p-3 transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex justify-between items-start mb-2.5">
                    <div className="space-y-0.5 pr-6">
                      <h4 className="text-xs font-bold leading-tight uppercase text-foreground">
                        {item.nombre}
                      </h4>
                      <p className="text-[11px] font-black text-primary">
                        <span className="text-[9px] mr-0.5">Bs</span>
                        {item.precio.toFixed(2)}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7 bg-card border-none shadow-sm hover:bg-background rounded-lg transition-colors"
                        onClick={() => onUpdateQuantity(item.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-7 text-center text-[11px] font-black">
                        {item.cantidad}
                      </span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7 bg-card border-none shadow-sm hover:bg-background rounded-lg transition-colors"
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        disabled={item.cantidad >= item.stock}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mb-0.5">
                        Subtotal
                      </p>
                      <p className="text-sm font-black text-foreground">
                        <span className="text-[10px] mr-0.5">Bs</span>
                        {(item.precio * item.cantidad).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <CardFooter className="flex-col gap-4 p-5 border-t border-border/40 bg-card flex-shrink-0">
        <div className="w-full space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-muted-foreground px-1">
            <span className="uppercase tracking-wider">Subtotal</span>
            <span>Bs {total.toFixed(2)}</span>
          </div>
          
          <Separator className="bg-border/40" />
          
          <div className="flex justify-between items-end pt-1 px-1">
            <div className="space-y-1.5">
              <Badge variant="outline" className="bg-primary/10 text-primary border-transparent text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                Total a Pagar
              </Badge>
              <p className="text-3xl font-black tracking-tighter leading-none text-foreground">
                <span className="text-sm font-bold mr-1 text-muted-foreground">Bs</span>
                {total.toFixed(2)}
              </p>
            </div>
            <div className="text-right pb-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/50 px-2 py-1 rounded-md">
                {totalItems} ítems
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
          <Button 
            variant="outline"
            className="h-14 text-[11px] font-black uppercase tracking-wider border-2 hover:bg-primary/5 transition-all rounded-xl"
            disabled={order.length === 0}
            onClick={onRegisterOrder}
          >
            <ClipboardList className="mr-2 h-4 w-4" />
            Solo Registrar
          </Button>

          <Button 
            className="h-14 text-[11px] font-black uppercase tracking-wider shadow-lg shadow-primary/25 rounded-xl hover:scale-[1.02] active:scale-95 transition-all"
            disabled={order.length === 0}
            onClick={onCheckout}
          >
            <Receipt className="mr-2 h-4 w-4" />
            Cobrar Ahora
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};