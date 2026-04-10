import { useState, useMemo } from "react";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

// Tabla Cantet - Factores de actualización (años x tasa de interés)
const CANTET_TABLE: Record<number, Record<number, number>> = {
  5:  { 0: 3.916, 8: 2.764, 10: 2.546, 12: 2.35,  14: 2.173 },
  8:  { 0: 6.961, 8: 4.417, 10: 3.976, 12: 3.591, 14: 3.252 },
  10: { 0: 8.815, 8: 5.244, 10: 4.659, 12: 4.156, 14: 3.722 },
};

const ANIOS_OPTIONS = [5, 8, 10];
const TASA_OPTIONS = [0, 8, 10, 12, 14];

// Valores económicos por defecto (editables)
const DEFAULT_VE = {
  peso_nacer: 0,
  peso_destete: 0,
  aptitud_materna: 0,
  circunferencia: 0,
};

interface Propuesta {
  id: string;
  nombre: string;
  dep_peso_nacer: string;
  dep_peso_destete: string;
  dep_aptitud_materna: string;
  dep_circunferencia: string;
  precio_dosis: string;
}

const emptyPropuesta = (id: string, nombre: string): Propuesta => ({
  id, nombre,
  dep_peso_nacer: "",
  dep_peso_destete: "",
  dep_aptitud_materna: "",
  dep_circunferencia: "",
  precio_dosis: "",
});

const CHART_COLORS = ["hsl(200, 60%, 50%)", "hsl(0, 70%, 55%)", "hsl(142, 50%, 40%)", "hsl(45, 90%, 55%)"];

const GeneticEconomicCard = () => {
  const [ve, setVe] = useState({ ...DEFAULT_VE });
  const [anios, setAnios] = useState<number>(5);
  const [tasa, setTasa] = useState<number>(8);
  const [propuestas, setPropuestas] = useState<Propuesta[]>([
    emptyPropuesta("A", "Toro A"),
    emptyPropuesta("B", "Toro B"),
  ]);

  const handleVeChange = (key: keyof typeof DEFAULT_VE, value: string) => {
    setVe((prev) => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const handlePropChange = (idx: number, key: keyof Propuesta, value: string) => {
    setPropuestas((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [key]: value };
      return copy;
    });
  };

  const addPropuesta = () => {
    const letter = String.fromCharCode(65 + propuestas.length);
    setPropuestas((prev) => [...prev, emptyPropuesta(letter, `Toro ${letter}`)]);
  };

  const removePropuesta = (idx: number) => {
    if (propuestas.length <= 2) return;
    setPropuestas((prev) => prev.filter((_, i) => i !== idx));
  };

  const factor = CANTET_TABLE[anios]?.[tasa] ?? 0;

  const results = useMemo(() => {
    return propuestas.map((p) => {
      const ga =
        (parseFloat(p.dep_peso_nacer) || 0) * ve.peso_nacer +
        (parseFloat(p.dep_peso_destete) || 0) * ve.peso_destete +
        (parseFloat(p.dep_aptitud_materna) || 0) * ve.aptitud_materna +
        (parseFloat(p.dep_circunferencia) || 0) * ve.circunferencia;
      const precio = parseFloat(p.precio_dosis) || 0;
      const retorno = ga * factor - precio;
      return { id: p.id, nombre: p.nombre, ga, precio, retorno };
    });
  }, [propuestas, ve, factor]);

  const chartData = results.map((r) => ({
    name: `${r.id} - ${r.nombre}`,
    Retorno: parseFloat(r.retorno.toFixed(2)),
  }));

  // Retorno comparado: cada par
  const comparisons = useMemo(() => {
    const comps: { label: string; diff: number }[] = [];
    for (let i = 0; i < results.length; i++) {
      for (let j = i + 1; j < results.length; j++) {
        comps.push({
          label: `${results[i].id} vs ${results[j].id}`,
          diff: results[i].retorno - results[j].retorno,
        });
      }
    }
    return comps;
  }, [results]);

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-accent/50 pb-2">
        <CardTitle className="text-lg font-bold">Análisis Genético-Económico (GA $)</CardTitle>
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
                <SelectTrigger className="w-24 h-8 text-sm bg-field-highlight border-accent">
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
                <SelectTrigger className="w-24 h-8 text-sm bg-field-highlight border-accent">
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

        {/* Valores Económicos */}
        <div>
          <p className="text-sm font-semibold mb-2">Valores Económicos de los Caracteres (VE)</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: "peso_nacer" as const, label: "Peso al Nacer" },
              { key: "peso_destete" as const, label: "Peso al Destete" },
              { key: "aptitud_materna" as const, label: "Aptitud Materna" },
              { key: "circunferencia" as const, label: "Circunf. Escrotal" },
            ].map((item) => (
              <div key={item.key} className="space-y-1">
                <Label className="text-xs font-medium">{item.label}</Label>
                <Input
                  type="number"
                  value={ve[item.key] || ""}
                  onChange={(e) => handleVeChange(item.key, e.target.value)}
                  placeholder="0"
                  className="h-8 text-sm bg-field-highlight border-accent"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Propuestas */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold">Propuestas de Toros</p>
            <button
              onClick={addPropuesta}
              className="text-xs px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90"
            >
              + Agregar Propuesta
            </button>
          </div>
          <div className="space-y-3">
            {propuestas.map((p, idx) => (
              <div key={p.id} className="grid grid-cols-2 md:grid-cols-6 gap-2 items-end p-3 border rounded-lg bg-muted/30">
                <div className="space-y-1">
                  <Label className="text-xs">Nombre</Label>
                  <Input
                    value={p.nombre}
                    onChange={(e) => handlePropChange(idx, "nombre", e.target.value)}
                    className="h-8 text-sm bg-field-highlight border-accent"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">DEP P. Nacer</Label>
                  <Input
                    type="number"
                    value={p.dep_peso_nacer}
                    onChange={(e) => handlePropChange(idx, "dep_peso_nacer", e.target.value)}
                    className="h-8 text-sm bg-field-highlight border-accent"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">DEP P. Destete</Label>
                  <Input
                    type="number"
                    value={p.dep_peso_destete}
                    onChange={(e) => handlePropChange(idx, "dep_peso_destete", e.target.value)}
                    className="h-8 text-sm bg-field-highlight border-accent"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">DEP Apt. Materna</Label>
                  <Input
                    type="number"
                    value={p.dep_aptitud_materna}
                    onChange={(e) => handlePropChange(idx, "dep_aptitud_materna", e.target.value)}
                    className="h-8 text-sm bg-field-highlight border-accent"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">DEP Circunf.</Label>
                  <Input
                    type="number"
                    value={p.dep_circunferencia}
                    onChange={(e) => handlePropChange(idx, "dep_circunferencia", e.target.value)}
                    className="h-8 text-sm bg-field-highlight border-accent"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Precio Dosis ($)</Label>
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      value={p.precio_dosis}
                      onChange={(e) => handlePropChange(idx, "precio_dosis", e.target.value)}
                      className="h-8 text-sm bg-field-highlight border-accent"
                      placeholder="0"
                    />
                    {propuestas.length > 2 && (
                      <button
                        onClick={() => removePropuesta(idx)}
                        className="text-xs px-2 h-8 rounded bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabla de Resultados */}
        <div>
          <p className="text-sm font-semibold mb-2">Resultados</p>
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/10">
                <TableHead className="font-semibold text-foreground">Propuesta</TableHead>
                <TableHead className="font-semibold text-foreground text-right">GA $</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Precio Dosis</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Factor</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Retorno $</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.id} - {r.nombre}</TableCell>
                  <TableCell className="text-right">{r.ga.toFixed(2)}</TableCell>
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

        {/* Retorno Comparado */}
        {comparisons.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-2">Retorno Comparado</p>
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/10">
                  <TableHead className="font-semibold text-foreground">Comparación</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">Diferencia $</TableHead>
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
        {results.some((r) => r.ga !== 0) && (
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
          <p><strong>GA $</strong> = (DEP_peso_nacer × VE_peso_nacer) + (DEP_peso_destete × VE_peso_destete) + (DEP_aptitud_materna × VE_aptitud_materna) + (DEP_circunferencia × VE_circunferencia)</p>
          <p><strong>Retorno</strong> = (GA × Factor de actualización) – Precio dosis</p>
          <p><strong>Retorno Comparado</strong> = Retorno_A – Retorno_B</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneticEconomicCard;
