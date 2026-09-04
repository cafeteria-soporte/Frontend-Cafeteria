import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";
import { CATEGORY_META } from "../lib/buildInsights";

function InsightCard({ card }) {
  const meta = CATEGORY_META[card.category];
  const Icon = card.icon;
  return (
    <div
      className="group relative flex w-[280px] shrink-0 snap-start flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg sm:w-[300px]"
      style={{ borderTopColor: meta.accent, borderTopWidth: 3 }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${meta.bg}`}>
          <Icon size={17} className={meta.text} />
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.bg} ${meta.text}`}>
          {meta.label}
        </span>
      </div>

      <p className="text-sm font-semibold leading-snug text-foreground">{card.title}</p>
      <p className="mt-1.5 text-xl font-bold leading-tight" style={{ color: meta.accent }}>
        {card.metric}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{card.description}</p>
    </div>
  );
}

/**
 * Carrusel horizontal de tarjetas de recomendación / predicción para el DSS.
 * Scroll táctil + snap + flechas (desktop) + fades en los bordes.
 */
export function InsightsCarousel({ cards, loading }) {
  const scrollerRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateArrows();
  }, [cards]);

  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.85), behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="mb-6 flex gap-4 overflow-hidden">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[168px] w-[280px] shrink-0 animate-pulse rounded-2xl border border-border bg-muted/30 sm:w-[300px]" />
        ))}
      </div>
    );
  }

  if (!cards.length) return null;

  return (
    <div className="relative mb-6">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Lightbulb size={15} className="text-primary" />
          Recomendaciones del sistema
          <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
            {cards.length}
          </span>
        </div>
        <div className="hidden gap-1 sm:flex">
          <button
            onClick={() => scrollBy(-1)}
            disabled={!canLeft}
            className="rounded-full border border-border bg-card p-1.5 transition hover:bg-accent disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scrollBy(1)}
            disabled={!canRight}
            className="rounded-full border border-border bg-card p-1.5 transition hover:bg-accent disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="relative">
        {canLeft && (
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-background to-transparent" />
        )}
        {canRight && (
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-background to-transparent" />
        )}

        <div
          ref={scrollerRef}
          onScroll={updateArrows}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {cards.map((card) => (
            <InsightCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default InsightsCarousel;
