import { useMemo } from "react";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGanaderia, calcWood } from "@/context/GanaderiaContext";

const DIAS = [30, 120, 210, 270];
const POTENCIALES = [2000, 3000, 4000, 5000, 6000, 7000];

const BestAnimalsTable = () => {
  const { registrosBasicos, registrosProductivos, toros, factores } = useGanaderia();

  // Replicate BV calculation from ValorCria.tsx
  const topCows = useMemo(() => {
    const h2 = 0.25;
    const R = 0.5;
    const calcH2m = (n: number) => n <= 0 ? 0 : (h2 * n) / (1 + (n - 1) * R);

    const findClosestPotencial = (prodReal: number, dia: number) => {
      let closest = POTENCIALES[0];
      let minDiff = Math.abs(calcWood(POTENCIALES[0], dia) - prodReal);
      for (const pot of POTENCIALES) {
        const diff = Math.abs(calcWood(pot, dia) - prodReal);
        if (diff < minDiff) { minDiff = diff; closest = pot; }
      }
      return closest;
    };

    const findFactor = (raza: string, edad: number, lactancia: number) => {
      const razaMap: Record<string, string> = { "1": "Holstein", "2": "Jersey" };
      const razaNombre = razaMap[raza] || raza;
      const match = factores.find((f) => f.raza === razaNombre && f.edad === edad && f.lactancia === lactancia);
      return match ? match.factor : 1;
    };

    const allVacas = registrosBasicos.map((vaca) => {
      const prod = registrosProductivos.find((p) => p.id_vaca === vaca.id_vaca);
      const reales = prod
        ? [parseFloat(prod.reg_1_dia30) || 0, parseFloat(prod.reg_2_dia120) || 0, parseFloat(prod.reg_3_dia210) || 0, parseFloat(prod.reg_4_dia270) || 0]
        : [0, 0, 0, 0];

      let potPromedio = 0;
      if (reales.some((v) => v > 0)) {
        const pots = DIAS.map((dia, i) => findClosestPotencial(reales[i], dia));
        potPromedio = pots.reduce((s, v) => s + v, 0) / pots.length;
      } else {
        potPromedio = parseFloat(vaca.potencial_vaca) || 0;
      }

      const edad = parseInt(vaca.edad) || 0;
      const lactancia = parseInt(vaca.lactancia) || 0;
      const factor = findFactor(vaca.raza, edad, lactancia);
      const wood305 = potPromedio > 0 ? potPromedio * factor : 0;

      const lactVals: number[] = [];
      if (prod) {
        for (const k of ['lact1', 'lact2', 'lact3', 'lact4', 'lact5'] as const) {
          const v = parseFloat(prod[k]);
          if (!isNaN(v) && v > 0) lactVals.push(v);
        }
      }
      const n = lactVals.length + 1;

      return { id_vaca: vaca.id_vaca, wood305, lactVals, n };
    });

    const promediosPorLact: Record<number, number> = {};
    for (let l = 1; l <= 5; l++) {
      const vacas = allVacas.filter((v) => v.lactVals.length >= l && v.lactVals[l - 1] > 0);
      if (vacas.length > 0) promediosPorLact[l] = vacas.reduce((s, v) => s + v.lactVals[l - 1], 0) / vacas.length;
    }
    const allProds = allVacas.filter((v) => v.wood305 > 0);
    const promGeneral = allProds.length > 0 ? allProds.reduce((s, v) => s + v.wood305, 0) / allProds.length : 0;

    const computed = allVacas.map((v) => {
      const h2m = calcH2m(v.n);
      let sumaDiff = 0;
      if (v.lactVals.length > 0) {
        for (let l = 0; l < v.lactVals.length; l++) {
          const promRodeo = promediosPorLact[l + 1] || promGeneral;
          if (v.lactVals[l] > 0 && promRodeo > 0) sumaDiff += v.lactVals[l] - promRodeo;
        }
      } else if (v.wood305 > 0) {
        sumaDiff = v.wood305 - promGeneral;
      }
      const valorCria = v.wood305 > 0 ? h2m * sumaDiff : 0;
      return { id_vaca: v.id_vaca, wood305: v.wood305, valorCria };
    });

    return computed
      .filter((v) => v.wood305 > 0)
      .sort((a, b) => b.valorCria - a.valorCria || b.wood305 - a.wood305)
      .slice(0, 5);
  }, [registrosBasicos, registrosProductivos, factores]);

  const topBulls = useMemo(() => {
    return [...toros]
      .filter((t) => t.indice_inia != null)
      .sort((a, b) => (Number(b.indice_inia) || 0) - (Number(a.indice_inia) || 0))
      .slice(0, 3);
  }, [toros]);

  if (topCows.length === 0 && topBulls.length === 0) return null;

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-accent/50 pb-2">
        <CardTitle className="text-lg font-bold">Selección: Mejores Vacas y Toros</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 5 Vacas */}
          <div>
            <p className="text-sm font-semibold mb-2">Top 5 Vacas (por Valor de Cría)</p>
            {topCows.length === 0 ? (
              <p className="text-muted-foreground text-sm">Sin datos de BV.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/10">
                    <TableHead className="font-semibold text-foreground">#</TableHead>
                    <TableHead className="font-semibold text-foreground">ID Vaca</TableHead>
                    <TableHead className="font-semibold text-foreground">Wood305</TableHead>
                    <TableHead className="font-semibold text-foreground">BV</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCows.map((c, i) => (
                    <TableRow key={c.id_vaca}>
                      <TableCell className="font-medium">{i + 1}</TableCell>
                      <TableCell className="font-medium">{c.id_vaca}</TableCell>
                      <TableCell>{c.wood305.toFixed(1)}</TableCell>
                      <TableCell className="font-bold">{c.valorCria.toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Top 3 Toros */}
          <div>
            <p className="text-sm font-semibold mb-2">Top 3 Toros (por Índice INIA)</p>
            {topBulls.length === 0 ? (
              <p className="text-muted-foreground text-sm">Sin datos de toros.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/10">
                    <TableHead className="font-semibold text-foreground">#</TableHead>
                    <TableHead className="font-semibold text-foreground">ID Toro</TableHead>
                    <TableHead className="font-semibold text-foreground">Nombre</TableHead>
                    <TableHead className="font-semibold text-foreground">DEP Leche</TableHead>
                    <TableHead className="font-semibold text-foreground">Índ. INIA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topBulls.map((t, i) => (
                    <TableRow key={t.id_toro}>
                      <TableCell className="font-medium">{i + 1}</TableCell>
                      <TableCell className="font-medium">{t.id_toro}</TableCell>
                      <TableCell>{t.nombre || "—"}</TableCell>
                      <TableCell className="font-bold">{Number(t.dep_leche).toFixed(1)}</TableCell>
                      <TableCell>{Number(t.indice_inia).toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BestAnimalsTable;
