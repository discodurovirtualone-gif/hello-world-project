import { useState, useMemo } from "react";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";
import { useGanaderia } from "@/context/GanaderiaContext";

const CANTET_TABLE: Record<number, Record<number, number>> = {
  5:  { 0: 3.916, 8: 2.764, 10: 2.546, 12: 2.35,  14: 2.173 },
  8:  { 0: 6.961, 8: 4.417, 10: 3.976, 12: 3.591, 14: 3.252 },
  10: { 0: 8.815, 8: 5.244, 10: 4.659, 12: 4.156, 14: 3.722 },
};

const ANIOS_OPTIONS = [5, 8, 10];
const TASA_OPTIONS = [0, 8, 10, 12, 14];
const CHART_COLORS = ["hsl(200, 60%, 50%)", "hsl(0, 70%, 55%)", "hsl(142, 50%, 40%)", "hsl(45, 90%, 55%)", "hsl(280, 50%, 55%)", "hsl(330, 60%, 50%)"];

const GeneticEconomicCard = () => {
  const { toros } = useGanaderia();
  const [anios, setAnios] = useState<number>(5);
  const [tasa, setTasa] = useState<number>(8);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const factor = CANTET_TABLE[anios]?.[tasa] ?? 0;

  const toggleToro = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectedToros = useMemo(
    () => toros.filter((t) => selectedIds.includes(t.id_toro)),
    [toros, selectedIds]
  );

  const results = useMemo(() => {
    return selectedToros.map((t) => {
      const ga = t.indice_inia;
      const retorno = ga * factor - t.precio_dosis;
      return { id_toro: t.id_toro, nombre: t.nombre, ga, precio: t.precio_dosis, retorno };
    });
  }, [selectedToros, factor]);

  const comparisons = useMemo(() => {
    const comps: { label: string; diff: number }[] = [];
    for (let i = 0; i < results.length; i++) {
      for (let j = i + 1; j < results.length; j++) {
        const a = results[i];
        const b = results[j];
        const diff = (a.ga - b.ga) * factor - (a.precio - b.precio);
        comps.push({ label: `${a.id_toro} vs ${b.id_toro}`, diff });
      }
    }
    return comps;
  }, [results, factor]);

  const chartData = results.map((r) => ({
    name: `${r.id_toro} - ${r.nombre}`,
    Retorno: parseFloat(r.retorno.toFixed(2)),
  }));

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-accent/50 pb-2">
        <CardTitle className="text-lg font-bold">Análisis Genético-Económico (GA INIA)</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-6">
        {/* Tabla Cantet */}
        <div>
          <p className="text-sm font-semibold mb-2">Tabla Cantet - Factores de Actualización</p>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/10">
                  <TableHead className="font-semibold text-foreground">Años</TableHead>
                  {TASA_OPTIONS.map((t) => (
                    <TableHead key={t} className="font-semibold text-foreground text-center">{t}%</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {ANIOS_OPTIONS.map((a) => (
                  <TableRow key={a} className={a === anios ? "bg-accent/30" : ""}>
                    <TableCell className="font-medium">{a}</TableCell>
                    {TASA_OPTIONS.map((t) => (
                      <TableCell
                        key={t}
                        className={`text-center ${a === anios && t === tasa ? "font-bold text-primary bg-accent" : ""}`}
                      >
                        {CANTET_TABLE[a][t]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="space-y-1">
              <Label className="text-xs">Años</Label>
              <Select value={String(anios)} onValueChange={(v) => setAnios(Number(v))}>
                <SelectTrigger className="w-24 h-8 text-sm bg-[#FFFACD] border-accent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ANIOS_OPTIONS.map((a) => (
                    <SelectItem key={a} value={String(a)}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tasa (%)</Label>
              <Select value={String(tasa)} onValueChange={(v) => setTasa(Number(v))}>
                <SelectTrigger className="w-24 h-8 text-sm bg-[#FFFACD] border-accent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASA_OPTIONS.map((t) => (
                    <SelectItem key={t} value={String(t)}>{t}%</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4 text-sm">
              Factor seleccionado: <span className="font-bold text-primary">{factor}</span>
            </div>
          </div>
        </div>

        {/* Selección de toros */}
        <div>
          <p className="text-sm font-semibold mb-2">Seleccionar Toros para Comparar</p>
          {toros.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay toros cargados. Importe toros desde "Reporte Toros".</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {toros.map((t) => (
                <label key={t.id_toro} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-accent/20">
                  <Checkbox
                    checked={selectedIds.includes(t.id_toro)}
                    onCheckedChange={() => toggleToro(t.id_toro)}
                  />
                  <span className="text-sm font-medium">{t.id_toro}</span>
                  <span className="text-xs text-muted-foreground truncate">{t.nombre}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Tabla de Resultados */}
        {results.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-2">Resultados</p>
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/10">
                  <TableHead className="font-semibold text-foreground">Toro</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">GA INIA</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">Precio Dosis ($)</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">Factor</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">Retorno ($)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r) => (
                  <TableRow key={r.id_toro}>
                    <TableCell className="font-medium">{r.id_toro} - {r.nombre}</TableCell>
                    <TableCell className="text-right">{r.ga.toFixed(4)}</TableCell>
                    <TableCell className="text-right">{r.precio.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{factor}</TableCell>
                    <TableCell className={`text-right font-bold ${r.retorno >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {r.retorno.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Retorno Comparado */}
        {comparisons.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-2">Retorno Comparado</p>
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/10">
                  <TableHead className="font-semibold text-foreground">Comparación</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">Diferencia ($)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisons.map((c) => (
                  <TableRow key={c.label}>
                    <TableCell className="font-medium">{c.label}</TableCell>
                    <TableCell className={`text-right font-bold ${c.diff >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {c.diff >= 0 ? "+" : ""}{c.diff.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Gráfico de barras */}
        {results.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-2">Comparación de Retornos</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis label={{ value: "$", angle: -90, position: "insideLeft", style: { fontSize: 12 } }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Retorno" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Fórmulas */}
        <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-1 border">
          <p className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-2">Fórmulas</p>
          <p><strong>GA INIA</strong> = Índice INIA del toro (valor publicado)</p>
          <p><strong>Retorno</strong> = (GA INIA × Factor de actualización) – Precio dosis</p>
          <p><strong>Retorno Comparado</strong> = (GA INIA A – GA INIA B) × Factor – (Precio A – Precio B)</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneticEconomicCard;
