import { useState } from "react";
import FormLayout from "@/components/FormLayout";
import FieldInput from "@/components/FieldInput";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpDown } from "lucide-react";
import { useGanaderia, calcWood } from "@/context/GanaderiaContext";
import PdfReportButton from "@/components/PdfReportButton";

const DIAS = [30, 120, 210, 270];
const POTENCIALES = [2000, 3000, 4000, 5000, 6000, 7000];

const ValorCria = () => {
  const { registrosBasicos, registrosProductivos, factores } = useGanaderia();
  const [h2Leche, setH2Leche] = useState("0.25");
  const [rRepetibilidad, setRRepetibilidad] = useState("0.5");
  const [sortKey, setSortKey] = useState<string>("valor_cria");
  const [sortAsc, setSortAsc] = useState(false);

  const h2 = parseFloat(h2Leche) || 0.25;
  const R = parseFloat(rRepetibilidad) || 0.5;

  const calcH2m = (n: number): number => {
    if (n <= 0) return 0;
    return (h2 * n) / (1 + (n - 1) * R);
  };

  const findFactor = (raza: string, edad: number, lactancia: number): number => {
    const razaMap: Record<string, string> = { "1": "Holstein", "2": "Jersey" };
    const razaNombre = razaMap[raza] || raza;
    const match = factores.find(
      (f) => f.raza === razaNombre && f.edad === edad && f.lactancia === lactancia
    );
    return match ? match.factor : 1;
  };

  const findClosestPotencial = (prodReal: number, dia: number): number => {
    let closest = POTENCIALES[0];
    let minDiff = Math.abs(calcWood(POTENCIALES[0], dia) - prodReal);
    for (const pot of POTENCIALES) {
      const diff = Math.abs(calcWood(pot, dia) - prodReal);
      if (diff < minDiff) { minDiff = diff; closest = pot; }
    }
    return closest;
  };

  // Get wood305 corregida for a vaca
  const getWood305 = (vaca: typeof registrosBasicos[0]): number => {
    const prod = registrosProductivos.find((p) => p.id_vaca === vaca.id_vaca);
    const reales = prod
      ? [parseFloat(prod.reg_1_dia30) || 0, parseFloat(prod.reg_2_dia120) || 0, parseFloat(prod.reg_3_dia210) || 0, parseFloat(prod.reg_4_dia270) || 0]
      : [0, 0, 0, 0];
    const hasReales = reales.some((v) => v > 0);

    let potPromedio = 0;
    if (hasReales) {
      const potAsignados = DIAS.map((dia, i) => findClosestPotencial(reales[i], dia));
      potPromedio = potAsignados.reduce((s, v) => s + v, 0) / potAsignados.length;
    } else {
      potPromedio = parseFloat(vaca.potencial_vaca) || 0;
    }

    const edad = parseInt(vaca.edad) || 0;
    const lactancia = parseInt(vaca.lactancia) || 0;
    const factor = findFactor(vaca.raza, edad, lactancia);
    return potPromedio > 0 ? potPromedio * factor : 0;
  };

  // Get lactancia values from registros productivos (lact1..lact5)
  const getLactancias = (id_vaca: string): number[] => {
    const prod = registrosProductivos.find(p => p.id_vaca === id_vaca);
    if (!prod) return [];
    const vals: number[] = [];
    const keys = ['lact1', 'lact2', 'lact3', 'lact4', 'lact5'] as const;
    for (const k of keys) {
      const v = parseFloat(prod[k]);
      if (!isNaN(v) && v > 0) vals.push(v);
    }
    return vals;
  };

  // Get number of lactancias = registered lactancias + 1 (current one)
  const getNumLact = (id_vaca: string): number => {
    const lacts = getLactancias(id_vaca);
    return lacts.length + 1;
  };

  // Build per-lactancia averages across all vacas
  // Group vacas by their lactancia number, compute rodeo average per lactancia
  const allVacasData = registrosBasicos.map(vaca => {
    const wood305 = getWood305(vaca);
    const lactNum = getNumLact(vaca);
    const lactVals = getLactancias(vaca.id_vaca);
    return { id_vaca: vaca.id_vaca, wood305, lactNum, lactVals };
  });

  // Compute rodeo average per lactancia number (1-5)
  const promediosPorLact: Record<number, number> = {};
  for (let l = 1; l <= 5; l++) {
    const vacasConLact = allVacasData.filter(v => v.lactVals.length >= l && v.lactVals[l - 1] > 0);
    if (vacasConLact.length > 0) {
      promediosPorLact[l] = vacasConLact.reduce((s, v) => s + v.lactVals[l - 1], 0) / vacasConLact.length;
    }
  }

  // Also compute overall rodeo average from wood305
  const allProds = allVacasData.filter(v => v.wood305 > 0);
  const promedioRodeoGeneral = allProds.length > 0
    ? allProds.reduce((s, v) => s + v.wood305, 0) / allProds.length
    : 0;

  // Compute valor de cría for each vaca
  const computed = allVacasData.map((v) => {
    const n = v.lactNum;
    const h2m = calcH2m(n);

    // Sum differences per lactancia
    let sumaDiff = 0;
    let lactCount = 0;
    if (v.lactVals.length > 0) {
      for (let l = 0; l < v.lactVals.length; l++) {
        const lactNum = l + 1;
        const promRodeo = promediosPorLact[lactNum] || promedioRodeoGeneral;
        if (v.lactVals[l] > 0 && promRodeo > 0) {
          sumaDiff += v.lactVals[l] - promRodeo;
          lactCount++;
        }
      }
    } else if (v.wood305 > 0) {
      sumaDiff = v.wood305 - promedioRodeoGeneral;
      lactCount = 1;
    }

    // Valor Cría = H2m * sumaDiff
    const valorCria = v.wood305 > 0 ? h2m * sumaDiff : 0;
    const valorCriaHijas = valorCria * 0.5;

    return {
      id_vaca: v.id_vaca,
      prodCorregida: v.wood305,
      promedioRodeo: promedioRodeoGeneral,
      diffPromedio: sumaDiff,
      numLact: n,
      h2m,
      valorCria,
      valorCriaHijas,
      lactVals: v.lactVals,
    };
  });

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(key === "id_vaca"); }
  };

  const sorted = [...computed].sort((a, b) => {
    let va: number, vb: number;
    switch (sortKey) {
      case "id_vaca": va = parseInt(a.id_vaca) || 0; vb = parseInt(b.id_vaca) || 0; break;
      case "valor_cria": va = a.valorCria; vb = b.valorCria; break;
      case "valor_cria_hijas": va = a.valorCriaHijas; vb = b.valorCriaHijas; break;
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
    <FormLayout title="Valor de Cría (BV)" variant="result">
      <div className="flex justify-end mb-4">
        <PdfReportButton
          title="Valor de Cría"
          headers={["Id Vaca", "Prod. Corr.", "Prom. Rodeo", "Dif. Promedio", "n", "H2m", "Valor Cría", "VC Hijas"]}
          rows={sorted.map(r => [r.id_vaca, r.prodCorregida.toFixed(1), r.promedioRodeo.toFixed(1), r.diffPromedio.toFixed(1), String(r.numLact), r.h2m.toFixed(4), r.valorCria.toFixed(1), r.valorCriaHijas.toFixed(1)])}
        />
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Parámetros Globales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FieldInput label="Heredabilidad (h²)" value={h2Leche} onChange={setH2Leche} type="number" highlighted />
            <FieldInput label="Repetibilidad (R)" value={rRepetibilidad} onChange={setRRepetibilidad} type="number" highlighted />
          </div>
          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            <div><code className="bg-muted px-2 py-0.5 rounded">H2m = (h² × n) / (1 + (n-1) × R)</code></div>
            <div><code className="bg-muted px-2 py-0.5 rounded">Valor Cría = H2m × Σ(Prod.Lact - Prom.Rodeo.Lact)</code></div>
            <div><code className="bg-muted px-2 py-0.5 rounded">Valor Cría Hijas = Valor Cría × 0.5</code></div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <SortHead label="Id Vaca" k="id_vaca" />
              <TableHead>Prod. Corregida</TableHead>
              <TableHead>Prom. Rodeo</TableHead>
              <TableHead>Σ Dif. Lact.</TableHead>
              <TableHead>n (Lact.)</TableHead>
              <TableHead>H2m</TableHead>
              <SortHead label="Valor Cría" k="valor_cria" />
              <SortHead label="VC Hijas" k="valor_cria_hijas" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No hay vacas registradas. Ingrese vacas en Registros Básicos primero.
                </TableCell>
              </TableRow>
            ) : sorted.map((r) => (
              <TableRow key={r.id_vaca}>
                <TableCell className="font-medium">{r.id_vaca}</TableCell>
                <TableCell>{r.prodCorregida > 0 ? r.prodCorregida.toFixed(1) : "—"}</TableCell>
                <TableCell>{r.promedioRodeo > 0 ? r.promedioRodeo.toFixed(1) : "—"}</TableCell>
                <TableCell className={r.diffPromedio >= 0 ? "text-green-600 font-medium" : "text-destructive font-medium"}>
                  {r.prodCorregida > 0 ? `${r.diffPromedio >= 0 ? "+" : ""}${r.diffPromedio.toFixed(1)}` : "—"}
                </TableCell>
                <TableCell>{r.numLact}</TableCell>
                <TableCell>{r.h2m.toFixed(4)}</TableCell>
                <TableCell className="font-bold">{r.prodCorregida > 0 ? r.valorCria.toFixed(1) : "—"}</TableCell>
                <TableCell className="font-bold">{r.prodCorregida > 0 ? r.valorCriaHijas.toFixed(1) : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </FormLayout>
  );
};

export default ValorCria;
