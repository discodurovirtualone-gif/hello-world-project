import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import FormLayout from "@/components/FormLayout";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { useGanaderia, Toro } from "@/context/GanaderiaContext";
import { supabase } from "@/integrations/supabase/client";

const calcINIA = (dep_leche: number, dep_grasa: number, dep_prot: number) =>
  -0.0477 * dep_leche + 0.8317 * dep_grasa + 1.4394 * dep_prot;

const calcRovere = (dep_leche: number, dep_grasa: number, dep_prot: number, dep_tph: number) =>
  -0.037 * dep_leche + 0.288 * dep_grasa + 1.977 * dep_prot + 2.298 * dep_tph;

const ReporteToros = () => {
  const { toros, setToros } = useGanaderia();
  const fileRef = useRef<HTMLInputElement>(null);
  const [sortKey, setSortKey] = useState<string>("indice_inia");
  const [sortAsc, setSortAsc] = useState(false);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: "" });

        const newToros: Toro[] = json
          .filter((row) => row.id_toro || row.Id_Toro || row.ID_TORO || row.id)
          .map((row) => {
            const id_toro = String(row.id_toro || row.Id_Toro || row.ID_TORO || row.id || "");
            const nombre = String(row.nombre || row.Nombre || "");
            const dep_leche = parseFloat(row.dep_leche || row.DEP_Leche || row.DEP_leche || 0) || 0;
            const dep_grasa = parseFloat(row.dep_grasa || row.DEP_Grasa || row.DEP_grasa || 0) || 0;
            const dep_prot = parseFloat(row.dep_prot || row.DEP_Prot || row.DEP_prot || 0) || 0;
            const dep_tph = parseFloat(row.dep_tph || row.DEP_TPH || row.DEP_tph || 0) || 0;
            const caracteristicas = String(row.caracteristicas || row.Caracteristicas || "");

            return {
              id_toro, nombre, dep_leche, dep_grasa, dep_prot, dep_tph,
              indice_inia: calcINIA(dep_leche, dep_grasa, dep_prot),
              indice_rovere: calcRovere(dep_leche, dep_grasa, dep_prot, dep_tph),
              caracteristicas,
            };
          });

        if (newToros.length > 0) {
          setToros((prev) => [...prev, ...newToros]);
          // Save to Supabase
          const dbRows = newToros.map(t => ({
            id_toro: t.id_toro, nombre: t.nombre, dep_leche: t.dep_leche,
            dep_grasa: t.dep_grasa, dep_prot: t.dep_prot, dep_tph: t.dep_tph,
            indice_inia: t.indice_inia, indice_rovere: t.indice_rovere, caracteristicas: t.caracteristicas,
          }));
          supabase.from('toros').insert(dbRows).then(({ error }) => {
            if (error) console.error('Error saving toros:', error);
          });
          toast.success(`${newToros.length} toros importados con índices calculados`);
        } else {
          toast.error("No se encontraron datos de toros válidos");
        }
      } catch {
        toast.error("Error al procesar el archivo");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const sorted = [...toros].sort((a, b) => {
    const va = (a as any)[sortKey] ?? 0;
    const vb = (b as any)[sortKey] ?? 0;
    return sortAsc ? va - vb : vb - va;
  });

  const SortBtn = ({ field, label }: { field: string; label: string }) => (
    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort(field)}>
      <span className="inline-flex items-center gap-1">{label} <ArrowUpDown className="h-3 w-3" /></span>
    </TableHead>
  );

  return (
    <FormLayout title="Reporte Toros">
      <div className="flex justify-end mb-4 gap-3">
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) processFile(f);
            e.target.value = "";
          }}
        />
        <Button onClick={() => fileRef.current?.click()} className="gap-2">
          <Upload className="h-4 w-4" /> Subir Planilla Toros
        </Button>
      </div>

      <div className="space-y-6">
        <Card className="border-2 border-primary/20">
          <CardHeader className="bg-accent/50 pb-2">
            <CardTitle className="text-lg font-bold">Índices de Toros</CardTitle>
            <p className="text-sm text-muted-foreground">
              INIA = -0.0477×DEP_Leche + 0.8317×DEP_Grasa + 1.4394×DEP_Prot | 
              Rovere = -0.037×DEP_Leche + 0.288×DEP_Grasa + 1.977×DEP_Prot + 2.298×DEP_TPH
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/10">
                  <SortBtn field="id_toro" label="Id Toro" />
                  <TableHead>Nombre</TableHead>
                  <SortBtn field="dep_leche" label="DEP Leche" />
                  <SortBtn field="dep_grasa" label="DEP Grasa" />
                  <SortBtn field="dep_prot" label="DEP Prot" />
                  <SortBtn field="dep_tph" label="DEP TPH" />
                  <SortBtn field="indice_inia" label="Índice INIA" />
                  <SortBtn field="indice_rovere" label="Índice Rovere" />
                  <TableHead>Características</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No hay toros cargados. Suba una planilla Excel con columnas: id_toro, DEP_Leche, DEP_Grasa, DEP_Prot, DEP_TPH
                    </TableCell>
                  </TableRow>
                ) : sorted.map((toro) => (
                  <TableRow key={toro.id_toro}>
                    <TableCell className="font-medium">{toro.id_toro}</TableCell>
                    <TableCell>{toro.nombre || "—"}</TableCell>
                    <TableCell>{toro.dep_leche.toFixed(2)}</TableCell>
                    <TableCell>{toro.dep_grasa.toFixed(2)}</TableCell>
                    <TableCell>{toro.dep_prot.toFixed(2)}</TableCell>
                    <TableCell>{toro.dep_tph.toFixed(2)}</TableCell>
                    <TableCell className="font-bold text-primary">{toro.indice_inia.toFixed(4)}</TableCell>
                    <TableCell className="font-bold text-primary">{toro.indice_rovere.toFixed(4)}</TableCell>
                    <TableCell>{toro.caracteristicas || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </FormLayout>
  );
};

export default ReporteToros;
