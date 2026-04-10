import { useState, useMemo } from "react";
import FormLayout from "@/components/FormLayout";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGanaderia, calcWood } from "@/context/GanaderiaContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import PdfReportButton from "@/components/PdfReportButton";
import ThresholdFilters, { defaultThresholds, ThresholdValues } from "@/components/tablero/ThresholdFilters";
import FilteredCowsTable, { VacaIndicadores } from "@/components/tablero/FilteredCowsTable";
import TorosSummaryCard from "@/components/tablero/TorosSummaryCard";
import BestAnimalsTable from "@/components/tablero/BestAnimalsTable";
import GeneticEconomicCard from "@/components/tablero/GeneticEconomicCard";

const DIAS = [30, 120, 210, 270];
const POTENCIALES = [2000, 3000, 4000, 5000, 6000, 7000];
const PIE_COLORS = [
  "hsl(142, 50%, 40%)", "hsl(45, 90%, 55%)", "hsl(200, 60%, 50%)",
  "hsl(0, 70%, 55%)", "hsl(280, 50%, 55%)", "hsl(170, 50%, 45%)",
  "hsl(30, 80%, 50%)", "hsl(330, 60%, 50%)",
];

const calcKg = (lc305: number, pct: number) => lc305 * (pct / 100);

const buildHistogram = (values: number[], binCount = 8) => {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return [{ range: `${min.toFixed(0)}`, count: values.length }];
  const step = (max - min) / binCount;
  const bins = Array.from({ length: binCount }, (_, i) => ({
    range: `${(min + i * step).toFixed(0)}-${(min + (i + 1) * step).toFixed(0)}`,
    count: 0,
  }));
  values.forEach((v) => {
    const idx = Math.min(Math.floor((v - min) / step), binCount - 1);
    bins[idx].count++;
  });
  return bins;
};

// Calcular días entre dos fechas (strings)
const diffDias = (fechaA: string, fechaB: string): number => {
  if (!fechaA || !fechaB) return 0;
  const a = new Date(fechaA);
  const b = new Date(fechaB);
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return 0;
  return Math.round(Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
};

// Primípara: lactancia <= 1, Multípara: lactancia >= 2
const esVacaPrimipara = (vaca: { lactancia: string }): boolean => {
  const lact = parseInt(vaca.lactancia) || 0;
  return lact <= 1;
};

const calcServConcepcion = (repro?: {
  serv_conc: string;
  servicio1: string;
  servicio2: string;
  servicio3: string;
  concepcion1: string;
}) => {
  if (!repro) return 0;

  const stored = parseFloat(repro.serv_conc) || 0;
  if (stored > 0) return stored;

  const servicios = [repro.servicio1, repro.servicio2, repro.servicio3].filter(
    (fecha) => !!fecha,
  );

  if (servicios.length === 0) return 0;
  if (!repro.concepcion1) return servicios.length;

  const idx = servicios.findIndex((fecha) => fecha === repro.concepcion1);
  return idx >= 0 ? idx + 1 : servicios.length;
};

const TableroFinal = () => {
  const { registrosBasicos, registrosProductivos, registrosReproductivos, registrosOtros, toros } = useGanaderia();

  const ejercicios = useMemo(() => {
    const set = new Set<string>();
    registrosBasicos.forEach((v) => { if (v.ejercicio) set.add(v.ejercicio); });
    return Array.from(set).sort();
  }, [registrosBasicos]);

  const [selectedEjercicio, setSelectedEjercicio] = useState<string>("all");
  const [thresholds, setThresholds] = useState<ThresholdValues>(defaultThresholds);

  const filteredBasicos = useMemo(() => {
    const base = selectedEjercicio === "all"
      ? registrosBasicos
      : registrosBasicos.filter((v) => v.ejercicio === selectedEjercicio);

    const latestByVaca = new Map<string, typeof base[number]>();
    base.forEach((vaca) => {
      latestByVaca.set(vaca.id_vaca, vaca);
    });

    return Array.from(latestByVaca.values());
  }, [registrosBasicos, selectedEjercicio]);

  const vacaData: VacaIndicadores[] = useMemo(() => {
    const productivosPorVaca = new Map(registrosProductivos.map((p) => [p.id_vaca, p]));
    const reproductivosPorVaca = new Map(registrosReproductivos.map((r) => [r.id_vaca, r]));
    const otrosPorVaca = new Map(registrosOtros.map((o) => [o.id_vaca, o]));

    return filteredBasicos.map((vaca) => {
      const prod = productivosPorVaca.get(vaca.id_vaca);
      const repro = reproductivosPorVaca.get(vaca.id_vaca);
      const otro = otrosPorVaca.get(vaca.id_vaca);

      let lc305 = 0;
      if (prod) {
        const reales = [parseFloat(prod.reg_1_dia30) || 0, parseFloat(prod.reg_2_dia120) || 0, parseFloat(prod.reg_3_dia210) || 0, parseFloat(prod.reg_4_dia270) || 0];
        if (reales.some((v) => v > 0)) {
          const pots = DIAS.map((dia, i) => {
            let closest = POTENCIALES[0];
            let minD = Math.abs(calcWood(POTENCIALES[0], dia) - reales[i]);
            for (const p of POTENCIALES) { const d = Math.abs(calcWood(p, dia) - reales[i]); if (d < minD) { minD = d; closest = p; } }
            return closest;
          });
          lc305 = pots.reduce((s, v) => s + v, 0) / pots.length;
        }
      }

      const ipc = repro ? parseFloat(repro.ipc) || diffDias(repro.parto, repro.parto1) : 0;
      const iip = repro ? parseFloat(repro.iip) || diffDias(repro.parto, repro.parto1) : 0;
      const serv_conc = calcServConcepcion(repro);
      const edad = parseInt(vaca.edad) || 0;
      const partos = parseInt(vaca.partos) || 0;
      const lactancia = parseInt(vaca.lactancia) || 0;

      const ips = repro ? diffDias(repro.parto, repro.servicio1) : 0;
      const epp = repro && repro.parto && vaca.fecha_nacimiento
        ? diffDias(vaca.fecha_nacimiento, repro.parto)
        : 0;
      const eps = repro && repro.parto1 && vaca.fecha_nacimiento
        ? diffDias(vaca.fecha_nacimiento, repro.parto1)
        : 0;

      const renguera = otro ? parseFloat(otro.renguera) || 0 : 0;
      const mastitis = otro ? parseFloat(otro.mastitis) || 0 : 0;
      const fac_parto = otro ? parseFloat(otro.facParto) || 0 : 0;
      const longevidad = otro ? parseFloat(otro.longevidad) || 0 : 0;
      const fortaleza_patas = otro ? parseFloat(otro.fortalezaPatas) || 0 : 0;
      const esPrimipara = esVacaPrimipara(vaca);

      return {
        id_vaca: vaca.id_vaca, ejercicio: vaca.ejercicio, partos, edad, raza: vaca.raza,
        lactancia, lc305, ipc, ips, iip, serv_conc, epp, eps,
        renguera, mastitis, fac_parto, longevidad, fortaleza_patas,
        esPrimipara,
      };
    });
  }, [filteredBasicos, registrosProductivos, registrosReproductivos, registrosOtros]);

  // Histograms
  const histograms = useMemo(() => {
    const vals = (key: keyof VacaIndicadores) => vacaData.map((v) => v[key] as number).filter((v) => v > 0);
    return [
      { title: "Leche 305 Wood", data: buildHistogram(vals("lc305")) },
      { title: "Kg Grasa", data: buildHistogram(vacaData.map((v) => { const prod = registrosProductivos.find(p => p.id_vaca === v.id_vaca); return v.lc305 > 0 && prod ? calcKg(v.lc305, parseFloat(prod.porcentaje_grasa) || 0) : 0; }).filter(v => v > 0)) },
      { title: "Kg Proteína", data: buildHistogram(vacaData.map((v) => { const prod = registrosProductivos.find(p => p.id_vaca === v.id_vaca); return v.lc305 > 0 && prod ? calcKg(v.lc305, parseFloat(prod.porcentaje_proteina) || 0) : 0; }).filter(v => v > 0)) },
      { title: "Kg Sólidos Totales", data: buildHistogram(vacaData.map((v) => { const prod = registrosProductivos.find(p => p.id_vaca === v.id_vaca); if (!prod || v.lc305 <= 0) return 0; return calcKg(v.lc305, parseFloat(prod.porcentaje_grasa) || 0) + calcKg(v.lc305, parseFloat(prod.porcentaje_proteina) || 0); }).filter(v => v > 0)) },
      { title: "IPS", data: buildHistogram(vals("ips")) },
      { title: "IPC", data: buildHistogram(vals("ipc")) },
      { title: "EPP", data: buildHistogram(vals("epp")) },
      { title: "EPS", data: buildHistogram(vals("eps")) },
    ];
  }, [vacaData, registrosProductivos]);

  // Summary primíparas / multíparas
  const summary = useMemo(() => {
    const primiparas = vacaData.filter((v) => v.lactancia <= 1);
    const multiparas = vacaData.filter((v) => v.lactancia >= 2);

    const calcAvg = (group: VacaIndicadores[], key: string) => {
      const vals = group.map((v) => {
        switch (key) {
          case "ipc": return v.ipc;
          case "ips": return v.ips;
          case "serv_conc": return v.serv_conc;
          case "mastitis": return v.mastitis;
          case "renguera": return v.renguera;
          case "fac_parto": return v.fac_parto;
          case "iip": return v.iip;
          case "epp": return v.epp;
          case "eps": return v.eps;
          default: return 0;
        }
      }).filter((v) => v > 0);
      return vals.length > 0 ? (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1) : "—";
    };

    const indicators = [
      { label: "IPC (días)", key: "ipc" },
      { label: "IPS (días)", key: "ips" },
      { label: "Serv/Conc", key: "serv_conc" },
      { label: "Ind. Mastitis", key: "mastitis" },
      { label: "Ind. Renguera", key: "renguera" },
      { label: "Ind. Fac. Parto", key: "fac_parto" },
      { label: "IIP (días)", key: "iip" },
      { label: "EPP (días)", key: "epp" },
      { label: "EPS (días)", key: "eps" },
    ];

    return indicators.map((ind) => ({
      label: ind.label,
      primiparas: calcAvg(primiparas, ind.key),
      multiparas: calcAvg(multiparas, ind.key),
    }));
  }, [vacaData]);

  // Pie chart: age distribution
  const ageDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredBasicos.forEach((v) => {
      const edad = parseInt(v.edad) || 0;
      const label = `${edad} años`;
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0])).map(([name, value]) => ({ name, value }));
  }, [filteredBasicos]);

  return (
    <FormLayout title="Tablero Final">
      <div className="space-y-6">
        {/* PDF + Filtro ejercicio */}
        <div className="flex items-center gap-4">
          <PdfReportButton
            title="Tablero Final"
            headers={["Indicador", "Primíparas", "Multíparas"]}
            rows={summary.map(s => [s.label, s.primiparas, s.multiparas])}
          />
          <span className="text-sm font-medium">Ejercicio:</span>
          <Select value={selectedEjercicio} onValueChange={setSelectedEjercicio}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {ejercicios.map((e) => (
                <SelectItem key={e} value={e}>{e}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {filteredBasicos.length} vacas
          </span>
        </div>

        {/* Histogramas */}
        <Card className="border-2 border-primary/20">
          <CardHeader className="bg-accent/50 pb-2">
            <CardTitle className="text-lg font-bold">Histogramas de Frecuencia</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {filteredBasicos.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No hay datos. Ingrese registros primero.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {histograms.map((h) => (
                  <div key={h.title}>
                    <p className="text-sm font-semibold mb-2">{h.title}</p>
                    {h.data.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={h.data}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="range" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={50} />
                          <YAxis allowDecimals={false} label={{ value: "n", angle: -90, position: "insideLeft", style: { fontSize: 12 } }} />
                          <Tooltip />
                          <Bar dataKey="count" fill="hsl(142, 50%, 40%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Sin datos</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cuadro resumen primíparas / multíparas */}
        <Card className="border-2 border-primary/20">
          <CardHeader className="bg-accent/50 pb-2">
            <CardTitle className="text-lg font-bold">Indicadores: Primíparas vs Multíparas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/10">
                  <TableHead className="font-semibold text-foreground">Indicador</TableHead>
                  <TableHead className="font-semibold text-foreground">Primíparas</TableHead>
                  <TableHead className="font-semibold text-foreground">Multíparas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.map((row) => (
                  <TableRow key={row.label}>
                    <TableCell className="font-medium">{row.label}</TableCell>
                    <TableCell>{row.primiparas}</TableCell>
                    <TableCell>{row.multiparas}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Gráfico de torta - edad */}
        <Card className="border-2 border-primary/20">
          <CardHeader className="bg-accent/50 pb-2">
            <CardTitle className="text-lg font-bold">Distribución por Edad de Vacas</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {ageDistribution.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">Sin datos de edad.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={ageDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {ageDistribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Umbrales de Selección Vacas */}
        <ThresholdFilters thresholds={thresholds} onChange={setThresholds} vacas={vacaData} />

        {/* Tabla de vacas filtradas por umbrales */}
        <FilteredCowsTable vacas={vacaData} thresholds={thresholds} />

        {/* Umbrales de Selección de Toros */}
        <TorosSummaryCard />

        {/* Selección mejores vacas y toros */}
        <BestAnimalsTable />

        {/* Análisis Genético-Económico */}
        <GeneticEconomicCard />
      </div>
    </FormLayout>
  );
};

export default TableroFinal;
