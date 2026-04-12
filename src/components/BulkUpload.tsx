import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  useGanaderia, RegistroBasico, RegistroProductivo, RegistroReproductivo, RegistroOtro,
  basicoToDb, productivoToDb, reproductivoToDb, otroToDb, calcEdadMeses,
} from "@/context/GanaderiaContext";

const BASICOS_COLS = ["ejercicio", "id_vaca", "partos", "fecha_nacimiento", "raza", "lactancia", "edad", "potencial_vaca"];
const PRODUCTIVOS_COLS = ["ejercicio", "id_vaca", "reg_1_dia30", "reg_2_dia120", "reg_3_dia210", "reg_4_dia270", "porcentaje_grasa", "porcentaje_proteina", "lc305_wood", "lact1", "lact2", "lact3", "lact4", "lact5"];
const REPRODUCTIVOS_COLS = ["ejercicio", "id_vaca", "parto", "raza", "servicio1", "servicio2", "servicio3", "concepcion1", "toroUsado", "aborto1", "aborto2", "parto1"];
const OTROS_COLS = ["ejercicio", "id_vaca", "renguera", "mastitis", "facParto", "longevidad", "fortalezaPatas"];

// Aliases for columns that may appear with different names in Excel
const COL_ALIASES: Record<string, string[]> = {
  facparto: ["facilidadalparto", "facilidadparto", "facparto", "fac_parto"],
  fortalezapatas: ["fortalezadepatas", "fortalezapatas", "fortaleza_patas", "fortpatas"],
};

const ALL_SECTIONS = [
  { name: "Básicos", cols: BASICOS_COLS, table: "registros_basicos" },
  { name: "Productivos", cols: PRODUCTIVOS_COLS, table: "registros_productivos" },
  { name: "Reproductivos", cols: REPRODUCTIVOS_COLS, table: "registros_reproductivos" },
  { name: "Otros", cols: OTROS_COLS, table: "registros_otros" },
];

const normalize = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");

// Convert Excel serial date number to YYYY-MM-DD string, return null-safe
const excelDateToString = (v: any): string => {
  if (!v) return "";
  // Excel serial number
  if (typeof v === "number" && v > 10000 && v < 100000) {
    const date = new Date((v - 25569) * 86400 * 1000);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
  }
  const s = String(v).trim();
  // Validate it looks like a date (YYYY-MM-DD or DD/MM/YYYY etc.)
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // Try parsing other date formats
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime()) && /\d/.test(s) && s.length >= 8) {
    return parsed.toISOString().split("T")[0];
  }
  // Not a valid date — return empty so it becomes null
  return "";
};

const DATE_COLS = new Set([
  "fecha_nacimiento", "parto", "parto1", "servicio1", "servicio2", "servicio3",
  "concepcion1", "aborto1", "aborto2",
]);

const matchSection = (headers: string[]) => {
  const normalized = headers.map(normalize);
  for (const section of ALL_SECTIONS) {
    const required = section.cols.filter((c) => c !== "ejercicio" && c !== "id_vaca");
    const matchCount = required.filter((c) => normalized.includes(normalize(c))).length;
    if (matchCount >= required.length * 0.6) return section;
  }
  return null;
};

const BulkUpload = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const { setRegistrosBasicos, setRegistrosProductivos, setRegistrosReproductivos, setRegistrosOtros } = useGanaderia();

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        let totalRows = 0;
        const errors: string[] = [];
        const loaded: string[] = [];

        for (const sheetName of wb.SheetNames) {
          const ws = wb.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: "" });
          if (json.length === 0) continue;

          const headers = Object.keys(json[0]);
          let section = matchSection(headers);

          if (!section) {
            const sn = normalize(sheetName);
            const found = ALL_SECTIONS.find((s) => sn.includes(normalize(s.name)));
            if (!found) { errors.push(`Hoja "${sheetName}": columnas no reconocidas`); continue; }
            section = found;
          }

          const sec = section!;
          const rows = json.map((row) => {
            const mapped: Record<string, string> = {};
            for (const col of sec.cols) {
              const normCol = normalize(col);
              // Try direct match first, then aliases
              const aliases = COL_ALIASES[normCol] || [];
              const allNorms = [normCol, ...aliases];
              const key = Object.keys(row).find((k) => {
                const nk = normalize(k);
                return allNorms.includes(nk);
              });
              let val = key ? row[key] : "";
              // Convert Excel date serials
              if (DATE_COLS.has(col)) val = excelDateToString(val);
              else val = String(val);
              mapped[col] = val;
            }
            return mapped;
          }).filter((r) => r.id_vaca);

          if (rows.length === 0) { errors.push(`Hoja "${sheetName}": sin filas válidas`); continue; }

          if (sec.name === "Básicos") {
            const appRows: RegistroBasico[] = rows.map(r => ({
              ...r,
              edad: r.fecha_nacimiento ? String(calcEdadMeses(r.fecha_nacimiento)) : r.edad || "",
            } as RegistroBasico));
            setRegistrosBasicos(prev => [...prev, ...appRows]);
            const dbRows = appRows.map(basicoToDb);
            try { await supabase.from('registros_basicos').insert(dbRows); }
            catch (err: any) { errors.push(`Básicos DB: ${err.message}`); console.error(err); }
          } else if (sec.name === "Productivos") {
            const appRows: RegistroProductivo[] = rows.map(r => ({
              ...r,
              lc305_wood: r.lc305_wood || "",
              lact1: r.lact1 || "",
              lact2: r.lact2 || "",
              lact3: r.lact3 || "",
              lact4: r.lact4 || "",
              lact5: r.lact5 || "",
            } as RegistroProductivo));
            setRegistrosProductivos(prev => [...prev, ...appRows]);
            const dbRows = appRows.map(productivoToDb);
            try { await supabase.from('registros_productivos').insert(dbRows); }
            catch (err: any) { errors.push(`Productivos DB: ${err.message}`); console.error(err); }
          } else if (sec.name === "Reproductivos") {
            const appRows: RegistroReproductivo[] = rows.map(r => {
              const parto = r.parto || "";
              const parto1 = r.parto1 || "";
              const concepcion1 = r.concepcion1 || "";
              const s1 = r.servicio1 || "";
              const s2 = r.servicio2 || "";
              const s3 = r.servicio3 || "";
              let iip = "";
              if (parto && parto1) {
                const d1 = new Date(parto), d2 = new Date(parto1);
                const diff = Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
                if (diff > 0) iip = Math.round(diff).toString();
              }
              let ipc = "";
              if (parto && concepcion1) {
                const d1 = new Date(parto), d2 = new Date(concepcion1);
                const diff = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
                if (diff > 0) ipc = Math.round(diff).toString();
              }
              let serv_conc = "";
              const sCount = [s1, s2, s3].filter(Boolean).length;
              if (sCount > 0) serv_conc = sCount.toString();
              return { ...r, iip, ipc, serv_conc, toroUsado: r.toroUsado || "" } as RegistroReproductivo;
            });
            setRegistrosReproductivos(prev => [...prev, ...appRows]);
            const dbRows = appRows.map(reproductivoToDb);
            try { await supabase.from('registros_reproductivos').insert(dbRows); }
            catch (err: any) { errors.push(`Reproductivos DB: ${err.message}`); console.error(err); }
          } else if (sec.name === "Otros") {
            const appRows = rows as unknown as RegistroOtro[];
            setRegistrosOtros(prev => [...prev, ...appRows]);
            const dbRows = appRows.map(otroToDb);
            try { await supabase.from('registros_otros').insert(dbRows); }
            catch (err: any) { errors.push(`Otros DB: ${err.message}`); console.error(err); }
          }

          totalRows += rows.length;
          loaded.push(`${sec.name}: ${rows.length}`);
        }

        if (totalRows > 0) {
          setStatus({ type: "success", message: `✅ ${totalRows} registros cargados (${loaded.join(", ")})` });
          toast.success(`${totalRows} registros importados y guardados`);
        }
        if (errors.length > 0) {
          setStatus(prev => ({
            type: prev?.type === "success" ? "success" : "error",
            message: `${prev?.message || ""}\n⚠️ ${errors.join("; ")}`,
          }));
          errors.forEach(err => toast.warning(err));
        }
        if (totalRows === 0 && errors.length === 0) {
          setStatus({ type: "error", message: "No se encontraron datos válidos en el archivo" });
          toast.error("No se encontraron datos válidos");
        }
      } catch {
        setStatus({ type: "error", message: "Error al leer el archivo" });
        toast.error("Error al procesar el archivo");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="rounded-xl border-2 border-dashed border-primary/30 bg-card p-4 w-full">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <FileSpreadsheet className="h-6 w-6 text-primary shrink-0" />
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm font-semibold text-card-foreground">Carga masiva de datos</p>
          <p className="text-xs text-muted-foreground">Suba un archivo Excel o CSV — se guarda en la base de datos</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = ""; }}
        />
        <Button size="sm" onClick={() => fileRef.current?.click()} className="gap-2">
          <Upload className="h-4 w-4" /> Subir Excel/CSV
        </Button>
      </div>
      {status && (
        <div className={`mt-3 flex items-start gap-2 text-xs rounded-lg p-2 ${status.type === "success" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
          {status.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />}
          <span className="whitespace-pre-line">{status.message}</span>
        </div>
      )}
    </div>
  );
};

export default BulkUpload;
