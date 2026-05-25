import { useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { inventoryAnalyticsService } from "../services/inventoryAnalytics.service";

export const ExportButtons = ({ filters, disabled = false }) => {
  const [exporting, setExporting] = useState("");
  const [error, setError] = useState("");

  const handleExport = async (format) => {
    try {
      setError("");
      setExporting(format);
      await inventoryAnalyticsService.exportInventoryReport(filters, format);
    } catch (err) {
      setError(err.message || "No se pudo exportar el reporte.");
    } finally {
      setExporting("");
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={disabled || Boolean(exporting)}
          onClick={() => handleExport("csv")}
          className="gap-2"
        >
          {exporting === "csv" ? (
            <Download className="animate-bounce" size={16} />
          ) : (
            <FileSpreadsheet size={16} />
          )}
          CSV
        </Button>
        <Button
          type="button"
          disabled={disabled || Boolean(exporting)}
          onClick={() => handleExport("pdf")}
          className="gap-2"
        >
          {exporting === "pdf" ? (
            <Download className="animate-bounce" size={16} />
          ) : (
            <FileText size={16} />
          )}
          PDF
        </Button>
      </div>
      {error && <p className="max-w-md text-xs text-destructive">{error}</p>}
    </div>
  );
};
