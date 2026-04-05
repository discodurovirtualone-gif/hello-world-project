import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThresholdValues } from "./ThresholdFilters";

export interface VacaIndicadores {
  id_vaca: string;
  ejercicio: string;
  partos: number;
  edad: number;
  raza: string;
  lactancia: number;
  lc305: number;
  ipc: number;
  ips: number;
  iip: number;
  serv_conc: number;
  epp: number;
  eps: number;
  renguera: number;
  mastitis: number;
  fac_parto: number;
  longevidad: number;
  fortaleza_patas: number;
  esPrimipara: boolean;
}

interface FilteredCowsTableProps {
  vacas: VacaIndicadores[];
  thresholds: ThresholdValues;
}

const FilteredCowsTable = ({ vacas, thresholds }: FilteredCowsTableProps) => {
  const hasAnyThreshold = Object.values(thresholds).some((v) => v !== "");

  const filtered = vacas.filter((v) => {
    const t = thresholds;
    if (t.lc305_wood && v.lc305 < parseFloat(t.lc305_wood)) return false;
    if (t.renguera && v.renguera > 0 && v.renguera > parseFloat(t.renguera)) return false;
    if (t.mastitis && v.mastitis > 0 && v.mastitis > parseFloat(t.mastitis)) return false;
    if (t.fac_parto && v.fac_parto > 0 && v.fac_parto > parseFloat(t.fac_parto)) return false;
    if (t.longevidad && v.longevidad > 0 && v.longevidad < parseFloat(t.longevidad)) return false;
    if (t.fortaleza_patas && v.fortaleza_patas > 0 && v.fortaleza_patas < parseFloat(t.fortaleza_patas)) return false;
    if (t.ips && v.ips > 0 && v.ips > parseFloat(t.ips)) return false;
    if (t.ipc && v.ipc > 0 && v.ipc > parseFloat(t.ipc)) return false;
    if (t.serv_conc && v.serv_conc > 0 && v.serv_conc > parseFloat(t.serv_conc)) return false;
    if (t.epp && v.epp > 0 && v.epp > parseFloat(t.epp)) return false;
    return true;
  });

  if (!hasAnyThreshold) {
    return null;
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-accent/50 pb-2">
        <CardTitle className="text-lg font-bold">
          Vacas que cumplen los umbrales ({filtered.length} de {vacas.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            Ninguna vaca cumple todos los criterios definidos.
          </p>
        ) : (
          <div className="overflow-auto max-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/10">
                  <TableHead className="font-semibold text-foreground">ID Vaca</TableHead>
                  <TableHead className="font-semibold text-foreground">Ejercicio</TableHead>
                  <TableHead className="font-semibold text-foreground">Raza</TableHead>
                  <TableHead className="font-semibold text-foreground">Tipo</TableHead>
                  <TableHead className="font-semibold text-foreground">Partos</TableHead>
                  <TableHead className="font-semibold text-foreground">Edad</TableHead>
                  <TableHead className="font-semibold text-foreground">LC305</TableHead>
                  <TableHead className="font-semibold text-foreground">IPC</TableHead>
                  <TableHead className="font-semibold text-foreground">IPS</TableHead>
                  <TableHead className="font-semibold text-foreground">S/C</TableHead>
                  <TableHead className="font-semibold text-foreground">EPP (días)</TableHead>
                  <TableHead className="font-semibold text-foreground">EPS (días)</TableHead>
                  <TableHead className="font-semibold text-foreground">Mastitis</TableHead>
                  <TableHead className="font-semibold text-foreground">Renguera</TableHead>
                  <TableHead className="font-semibold text-foreground">Fac.Parto</TableHead>
                  <TableHead className="font-semibold text-foreground">Longev.</TableHead>
                  <TableHead className="font-semibold text-foreground">Fort.Patas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((v) => (
                  <TableRow key={`${v.id_vaca}-${v.ejercicio}`}>
                    <TableCell className="font-medium">{v.id_vaca}</TableCell>
                    <TableCell>{v.ejercicio}</TableCell>
                    <TableCell>{v.raza}</TableCell>
                    <TableCell>{v.esPrimipara ? "Primípara" : "Multípara"}</TableCell>
                    <TableCell>{v.partos}</TableCell>
                    <TableCell>{v.edad}</TableCell>
                    <TableCell>{v.lc305 > 0 ? v.lc305.toFixed(0) : "—"}</TableCell>
                    <TableCell>{v.ipc > 0 ? v.ipc.toFixed(0) : "—"}</TableCell>
                    <TableCell>{v.ips > 0 ? v.ips.toFixed(0) : "—"}</TableCell>
                    <TableCell>{v.serv_conc > 0 ? v.serv_conc.toFixed(1) : "—"}</TableCell>
                    <TableCell>{v.epp > 0 ? v.epp.toFixed(0) : "—"}</TableCell>
                    <TableCell>{v.eps > 0 ? v.eps.toFixed(0) : "—"}</TableCell>
                    <TableCell>{v.mastitis > 0 ? v.mastitis : "—"}</TableCell>
                    <TableCell>{v.renguera > 0 ? v.renguera : "—"}</TableCell>
                    <TableCell>{v.fac_parto > 0 ? v.fac_parto : "—"}</TableCell>
                    <TableCell>{v.longevidad > 0 ? v.longevidad : "—"}</TableCell>
                    <TableCell>{v.fortaleza_patas > 0 ? v.fortaleza_patas : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FilteredCowsTable;
