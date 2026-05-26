const SpinnerLoader = () => (
  <div className="min-h-[240px] flex items-center justify-center rounded-3xl border border-border bg-card p-8">
    <div className="flex flex-col items-center gap-3">
      <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      <span className="text-sm font-medium text-foreground/80">Cargando...</span>
    </div>
  </div>
);

export default SpinnerLoader;
