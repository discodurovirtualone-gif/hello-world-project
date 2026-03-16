import FormLayout from "@/components/FormLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { useGanaderia } from "@/context/GanaderiaContext";

const IndicadoresReproductivos = () => {
  const { registrosBasicos, registrosReproductivos } = useGanaderia();
  const [sortKey, setSortKey] = useState<string>("ranking");
  const [sortAsc, setSortAsc] = useState(true);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  // Build indicators from registrosReproductivos
  const scored = registrosBasicos.map((vaca) => {
    const repro = registrosReproductivos.find((r) => r.id_vaca === vaca.id_vaca);
    const iip = repro ? parseFloat(repro.iip) || 9999 : 9999;
    const ipc = repro ? parseFloat(repro.ipc) || 9999 : 9999;
    const sc = repro ? parseInt(repro.serv_conc) || 99 : 99;
    const score = iip + ipc + sc * 30;
    return {
      id_vaca: vaca.id_vaca,
      iip: repro?.iip || "",
      ipc: repro?.ipc || "",
      serv_conc: repro?.serv_conc || "",
      score,
      hasData: !!repro,
    };
  });

  // Rank by score
  const ranked = [...scored].sort((a, b) => a.score - b.score).map((s, i) => ({ ...s, ranking: i + 1 }));

  // Apply user sort
  const sorted = [...ranked].sort((a, b) => {
    let va: number, vb: number;
    switch (sortKey) {
      case "id_vaca": va = parseInt(a.id_vaca) || 0; vb = parseInt(b.id_vaca) || 0; break;
      case "iip": va = parseFloat(a.iip) || 9999; vb = parseFloat(b.iip) || 9999; break;
      case "ipc": va = parseFloat(a.ipc) || 9999; vb = parseFloat(b.ipc) || 9999; break;
      case "serv_conc": va = parseInt(a.serv_conc) || 99; vb = parseInt(b.serv_conc) || 99; break;
      case "ranking": va = a.ranking; vb = b.ranking; break;
      default: va = 0; vb = 0;
    }
    return sortAsc ? va - vb : vb - va;
  });

  const SortHead = ({ label, k }: { label: string; k: string }) => (
    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort(k)}>
      <span className="flex items-center gap-1">{label} <ArrowUpDown className="h-3 w-3" /></span>
    </TableHead>
  );

  return (
    <FormLayout title="Indicadores Reproductivos" variant="result">
      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <SortHead label="Id Vaca" k="id_vaca" />
              <SortHead label="IIP (días)" k="iip" />
              <SortHead label="IPC (días)" k="ipc" />
              <SortHead label="Serv/Conc" k="serv_conc" />
              <SortHead label="Ranking" k="ranking" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No hay vacas registradas. Ingrese datos reproductivos en Registros Reproductivos.
                </TableCell>
              </TableRow>
            ) : sorted.map((r) => (
              <TableRow key={r.id_vaca}>
                <TableCell className="font-medium">{r.id_vaca}</TableCell>
                <TableCell>{r.iip || "—"}</TableCell>
                <TableCell>{r.ipc || "—"}</TableCell>
                <TableCell>{r.serv_conc || "—"}</TableCell>
                <TableCell className="font-bold text-primary">{r.hasData ? r.ranking : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {registrosReproductivos.length > 0 && (
        <Card className="mt-4">
          <CardContent className="py-4 text-sm text-muted-foreground">
            <strong>Ranking:</strong> Se calcula automáticamente combinando IIP + IPC + (Serv/Conc × 30). Menor puntaje = mejor posición reproductiva.
          </CardContent>
        </Card>
      )}
    </FormLayout>
  );
};

export default IndicadoresReproductivos;
