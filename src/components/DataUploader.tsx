import { useState, useRef } from "react";
import { Upload, X, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ColumnMapping {
  fileColumn: string;
  dbColumn: string;
  required?: boolean;
}

interface DataUploaderProps {
  table: string;
  columns: ColumnMapping[];
  onSuccess: () => void;
  label?: string;
}

export default function DataUploader({ table, columns, onSuccess, label }: DataUploaderProps) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [show, setShow] = useState(false);
  const [preview, setPreview] = useState<Record<string, any>[]>([]);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (json.length === 0) {
          toast({ title: "Error", description: "File is empty", variant: "destructive" });
          return;
        }

        const headers = Object.keys(json[0]);
        setFileHeaders(headers);
        setPreview(json.slice(0, 5));

        // Auto-map columns by matching names
        const autoMap: Record<string, string> = {};
        columns.forEach(col => {
          const match = headers.find(h =>
            h.toLowerCase().replace(/[_\s-]/g, "") === col.dbColumn.toLowerCase().replace(/[_\s-]/g, "") ||
            h.toLowerCase().replace(/[_\s-]/g, "") === col.fileColumn.toLowerCase().replace(/[_\s-]/g, "")
          );
          if (match) autoMap[col.dbColumn] = match;
        });
        setMapping(autoMap);
        setResult(null);
      } catch {
        toast({ title: "Error", description: "Could not parse file. Use CSV or Excel format.", variant: "destructive" });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    const requiredCols = columns.filter(c => c.required);
    const missingRequired = requiredCols.filter(c => !mapping[c.dbColumn]);
    if (missingRequired.length > 0) {
      toast({ title: "Error", description: `Map required columns: ${missingRequired.map(c => c.fileColumn).join(", ")}`, variant: "destructive" });
      return;
    }

    setUploading(true);
    let success = 0, failed = 0;

    // Read full file data again
    const file = fileRef.current?.files?.[0];
    if (!file) { setUploading(false); return; }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const workbook = XLSX.read(e.target?.result, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const allRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const batchSize = 50;
      for (let i = 0; i < allRows.length; i += batchSize) {
        const batch = allRows.slice(i, i + batchSize).map(row => {
          const mapped: Record<string, any> = {};
          columns.forEach(col => {
            const fileCol = mapping[col.dbColumn];
            if (fileCol && row[fileCol] !== undefined && row[fileCol] !== "") {
              mapped[col.dbColumn] = row[fileCol];
            }
          });
          return mapped;
        }).filter(row => {
          // Must have all required fields
          return requiredCols.every(c => row[c.dbColumn] !== undefined && row[c.dbColumn] !== "");
        });

        if (batch.length > 0) {
          const { error } = await (supabase.from as any)(table).insert(batch);
          if (error) { failed += batch.length; console.error("Upload error:", error); }
          else { success += batch.length; }
        }
      }

      setResult({ success, failed });
      setUploading(false);
      if (success > 0) {
        toast({ title: `✓ ${success} records uploaded`, description: failed > 0 ? `${failed} rows failed` : undefined });
        onSuccess();
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const reset = () => {
    setShow(false);
    setPreview([]);
    setFileHeaders([]);
    setMapping({});
    setResult(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const inputClass = "w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <>
      <button onClick={() => setShow(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 border neon-border-yellow text-sm neon-text-yellow">
        <Upload className="w-4 h-4" /> {label || "Upload Data"}
      </button>

      {show && (
        <div className="glass-panel rounded-xl p-5 border neon-border-yellow space-y-4 animate-slide-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 neon-text-yellow" />
              <h2 className="font-display text-sm font-semibold neon-text-yellow">UPLOAD {label?.toUpperCase() || "DATA"} (CSV / Excel)</h2>
            </div>
            <button onClick={reset}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>

          <div className="text-[10px] text-muted-foreground space-y-1">
            <p>Expected columns: {columns.map(c => `${c.fileColumn}${c.required ? " *" : ""}`).join(", ")}</p>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => e.target.files?.[0] && parseFile(e.target.files[0])}
            className={inputClass}
          />

          {fileHeaders.length > 0 && (
            <>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Column Mapping:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {columns.map(col => (
                    <div key={col.dbColumn} className="flex items-center gap-2">
                      <span className="text-[10px] w-28 truncate">{col.fileColumn}{col.required ? " *" : ""}:</span>
                      <select
                        value={mapping[col.dbColumn] || ""}
                        onChange={e => setMapping({ ...mapping, [col.dbColumn]: e.target.value })}
                        className={inputClass + " text-[10px]"}
                      >
                        <option value="">-- Select --</option>
                        {fileHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {preview.length > 0 && (
                <div className="overflow-x-auto">
                  <p className="text-[10px] text-muted-foreground mb-1">Preview (first {preview.length} rows):</p>
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="border-b border-border/50">
                        {fileHeaders.slice(0, 6).map(h => <th key={h} className="text-left p-1 truncate max-w-[100px]">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, i) => (
                        <tr key={i} className="border-b border-border/20">
                          {fileHeaders.slice(0, 6).map(h => <td key={h} className="p-1 truncate max-w-[100px] text-muted-foreground">{String(row[h] ?? "")}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {result && (
                <div className="flex items-center gap-2 text-xs">
                  {result.success > 0 && <span className="flex items-center gap-1 neon-text-green"><CheckCircle className="w-3 h-3" /> {result.success} uploaded</span>}
                  {result.failed > 0 && <span className="flex items-center gap-1 neon-text-red"><AlertCircle className="w-3 h-3" /> {result.failed} failed</span>}
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary/20 border neon-border-green text-sm neon-text-green disabled:opacity-50"
              >
                <Upload className="w-4 h-4" /> {uploading ? "Uploading..." : "Upload All"}
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
