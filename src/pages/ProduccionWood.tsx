import { useMemo } from "react";
import FormLayout from "@/components/FormLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGanaderia, calcWood } from "@/context/GanaderiaContext";
import PdfReportButton from "@/components/PdfReportButton";

const DIAS = [30, 120, 210, 270] as const;

const ProduccionWood = () => {
  const { registrosBasicos, registrosProductivos, factores } = useGanaderia();

  const POTENCIALES = useMemo(() => {
    const maxPot = Math.max(
      ...registrosBasicos.map(r => parseFloat(r.potencial_vaca) || 0),
      7000
    );
    const top = Math.ceil(maxPot / 1000) * 1000;
    const range: number[] = [];
    for (let v = 2000; v <= top; v += 1000) range.push(v);
    return range;
  }, [registrosBasicos]);
  const findFactor = (raza: string, edad: number, lactancia: number): { value: number; found: boolean } => {
    const razaMap: Record<string, string> = { "1": "Holstein", "2": "Jersey" };
    const razaNombre = razaMap[raza] || raza;
    const match = factores.find(
      (f) => f.raza === razaNombre && f.edad === edad && f.lactancia === lactancia
    );
    return match ? { value: match.factor, found: true } : { value: 1, found: false };
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

  const rows = registrosBasicos.map((vaca) => {
    const prod = registrosProductivos.find((p) => p.id_vaca === vaca.id_vaca);
    const reales = prod
      ? [parseFloat(prod.reg_1_dia30) || 0, parseFloat(prod.reg_2_dia120) || 0, parseFloat(prod.reg_3_dia210) || 0, parseFloat(prod.reg_4_dia270) || 0]
      : [0, 0, 0, 0];

    const hasReales = prod && reales.some((v) => v > 0);

    const potAsignados = hasReales
      ? DIAS.map((dia, i) => findClosestPotencial(reales[i], dia))
      : DIAS.map(() => {
          const pot = parseFloat(vaca.potencial_vaca) || 0;
          return pot > 0 ? pot : 0;
        });
    const potPromedio = potAsignados.reduce((s, v) => s + v, 0) / potAsignados.length;

    const potencialVaca = parseFloat(vaca.potencial_vaca) || 0;
    const prodWood = DIAS.map((d) => calcWood(potencialVaca, d));

    const edad = parseInt(vaca.edad) || 0;
    const lactancia = parseInt(vaca.lactancia) || 0;
    const factorResult = findFactor(vaca.raza, edad, lactancia);
    const corregida = potPromedio > 0 ? potPromedio * factorResult.value : null;

    return {
      id_vaca: vaca.id_vaca,
      potencialVaca,
      reales,
      hasReales,
      potAsignados,
      potPromedio,
      prodWood,
      factor: factorResult.value,
      factorFound: factorResult.found,
      corregida,
    };
  });

  return (
    <FormLayout title="Cálculo Producción Wood 305" variant="result">
      <div className="flex justify-end mb-4">
        <PdfReportButton
          title="Producción Wood 305"
          headers={["Id Vaca", "Potencial", "Prom. Pot.", "Factor", "Wood305"]}
          rows={rows.map(r => [r.id_vaca, r.potencialVaca > 0 ? r.potencialVaca.toString() : "—", r.potPromedio > 0 ? r.potPromedio.toFixed(0) : "—", r.factor.toFixed(3), r.corregida !== null ? r.corregida.toFixed(2) : "—"])}
        />
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Fórmula de Wood</CardTitle>
        </CardHeader>
        <CardContent>
          <code className="text-sm bg-muted px-2 py-1 rounded">
            Prod. Potencial = (potencial_vaca × 0.00318) × (día ^ 0.1027) × e^(-0.003 × día)
          </code>
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Id Vaca</TableHead>
              <TableHead>Potencial (lt)</TableHead>
              <TableHead>Real D30</TableHead>
              <TableHead>Real D120</TableHead>
              <TableHead>Real D210</TableHead>
              <TableHead>Real D270</TableHead>
              <TableHead>Pot.Asig D30</TableHead>
              <TableHead>Pot.Asig D120</TableHead>
              <TableHead>Pot.Asig D210</TableHead>
              <TableHead>Pot.Asig D270</TableHead>
              <TableHead>Prom. Pot.</TableHead>
              <TableHead>Factor</TableHead>
              <TableHead>Wood305</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="text-center text-muted-foreground py-8">
                  No hay vacas registradas. Ingrese vacas en Registros Básicos primero.
                </TableCell>
              </TableRow>
            ) : rows.map((r) => (
              <TableRow key={r.id_vaca}>
                <TableCell className="font-medium">{r.id_vaca}</TableCell>
                <TableCell>{r.potencialVaca > 0 ? r.potencialVaca.toLocaleString() : "—"}</TableCell>
                {r.reales.map((v, j) => (
                  <TableCell key={j}>{r.hasReales ? v.toFixed(1) : "—"}</TableCell>
                ))}
                {r.potAsignados.map((v, j) => (
                  <TableCell key={`pa${j}`} className="text-primary font-medium">
                    {v > 0 ? v.toLocaleString() : "—"}
                  </TableCell>
                ))}
                <TableCell className="font-bold">{r.potPromedio > 0 ? r.potPromedio.toFixed(0) : "—"}</TableCell>
                <TableCell className={r.factorFound ? "" : "text-destructive font-bold"}>
                  {r.factor.toFixed(3)}
                  {!r.factorFound && <span className="text-xs ml-1">(def)</span>}
                </TableCell>
                <TableCell className="font-bold">
                  {r.corregida !== null ? r.corregida.toFixed(2) : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </FormLayout>
  );
};

export default ProduccionWood;
