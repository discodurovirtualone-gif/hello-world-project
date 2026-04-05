import { useState, useMemo } from "react";
import FormLayout from "@/components/FormLayout";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpDown } from "lucide-react";
import { useGanaderia, calcWood } from "@/context/GanaderiaContext";
import PdfReportButton from "@/components/PdfReportButton";

const DIAS = [30, 120, 210, 270];
const POTENCIALES = [2000, 3000, 4000, 5000, 6000, 7000];
const MAX_ROWS = 20;

const calcKg = (lc305: number, pct: number) => lc305 > 0 && pct > 0 ? lc305 * (pct / 100) : 0;

const ReporteVacas = () => {
  const { registrosBasicos, registrosProductivos, registrosReproductivos, factores } = useGanaderia();
  const [sortStates, setSortStates] = useState<Record<string, { key: string; asc: boolean }>>({});

  const toggleSort = (section: string, key: string) => {
    setSortStates((prev) => {
      const cur = prev[section];
      if (cur?.key === key) return { ...prev, [section]: { key, asc: !cur.asc } };
      return { ...prev, [section]: { key, asc: false } };
    });
  };

  const computeWood305 = (prod: typeof registrosProductivos[0]) => {
    const reales = [
      parseFloat(prod.reg_1_dia30) || 0, parseFloat(prod.reg_2_dia120) || 0,
      parseFloat(prod.reg_3_dia210) || 0, parseFloat(prod.reg_4_dia270) || 0,
    ];
    if (!reales.some((v) => v > 0)) return 0;
    const pots = DIAS.map((dia, i) => {
      let closest = POTENCIALES[0]; let minD = Math.abs(calcWood(POTENCIALES[0], dia) - reales[i]);
      for (const p of POTENCIALES) { const d = Math.abs(calcWood(p, dia) - reales[i]); if (d < minD) { minD = d; closest = p; } }
      return closest;
    });
    return pots.reduce((s, v) => s + v, 0) / pots.length;
  };

  const vacaData = useMemo(() => {
    return registrosBasicos.map((vaca) => {
      const prod = registrosProductivos.find(p => p.id_vaca === vaca.id_vaca);
      const repro = registrosReproductivos.find((r) => r.id_vaca === vaca.id_vaca);

      let lc305 = 0;
      if (prod) lc305 = computeWood305(prod);

      const edad = parseInt(vaca.edad) || 0;
      const lactancia = parseInt(vaca.lactancia) || 0;
      const razaNombre = vaca.raza || "Otras";
      const factor = factores.find((f) => f.raza === razaNombre && f.edad === edad && f.lactancia === lactancia);
      const factorValue = factor ? factor.factor : 1;
      const prodCorregida = lc305 > 0 ? lc305 * factorValue : 0;

      // Use lact1-lact5 from productivo records directly
      const l1 = prod ? prod.lact1 : "";
      const l2 = prod ? prod.lact2 : "";
      const l3 = prod ? prod.lact3 : "";
      const l4 = prod ? prod.lact4 : "";
      const l5 = prod ? prod.lact5 : "";

      const pctGrasa = prod ? parseFloat(prod.porcentaje_grasa) || 0 : 0;
      const pctProt = prod ? parseFloat(prod.porcentaje_proteina) || 0 : 0;
      const kgGrasa = calcKg(lc305, pctGrasa);
      const kgProt = calcKg(lc305, pctProt);
      const kgSolidos = kgGrasa + kgProt;

      const iip = repro ? parseFloat(repro.iip) || 0 : 0;
      const ipc = repro ? parseFloat(repro.ipc) || 0 : 0;
      const servConc = repro ? parseFloat(repro.serv_conc) || 0 : 0;

      // IPS = días entre parto y primer servicio
      let ips = 0;
      if (repro && repro.parto && repro.servicio1) {
        const fp = new Date(repro.parto);
        const fs = new Date(repro.servicio1);
        if (!isNaN(fp.getTime()) && !isNaN(fs.getTime())) {
          ips = Math.round(Math.abs(fs.getTime() - fp.getTime()) / (1000 * 60 * 60 * 24));
        }
      }

      return {
        id_vaca: vaca.id_vaca,
        kgGrasa, kgProt, kgSolidos, lc305, prodCorregida,
        l1: l1 || "", l2: l2 || "", l3: l3 || "",
        l4: l4 || "", l5: l5 || "",
        iip, ipc, servConc,
      };
    });
  }, [registrosBasicos, registrosProductivos, registrosReproductivos, factores]);

  const sortAndSlice = (data: typeof vacaData, section: string, defaultKey: string) => {
    const s = sortStates[section] || { key: defaultKey, asc: false };
    const sorted = [...data].sort((a, b) => {
      const va = (a as any)[s.key] ?? 0;
      const vb = (b as any)[s.key] ?? 0;
      const numA = typeof va === "string" ? parseFloat(va) || 0 : va;
      const numB = typeof vb === "string" ? parseFloat(vb) || 0 : vb;
      return s.asc ? numA - numB : numB - numA;
    });
    return sorted.slice(0, MAX_ROWS);
  };

  const SortBtn = ({ section, field, label }: { section: string; field: string; label: string }) => (
    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort(section, field)}>
      <span className="inline-flex items-center gap-1">{label} <ArrowUpDown className="h-3 w-3" /></span>
    </TableHead>
  );

  const sections = [
    {
      id: "tabla", title: "1. Tabla General por Vaca", defaultSort: "lc305",
      cols: [
        { label: "Id Vaca", field: "id_vaca" },
        { label: "Kg Grasa", field: "kgGrasa" },
        { label: "Kg Prot", field: "kgProt" },
        { label: "L1", field: "l1" },
        { label: "L2", field: "l2" },
        { label: "L3", field: "l3" },
        { label: "L4", field: "l4" },
        { label: "L5", field: "l5" },
      ],
    },
    {
      id: "leche", title: "2. Reporte Vacas Leche (Wood305)", defaultSort: "prodCorregida",
      cols: [
        { label: "Id Vaca", field: "id_vaca" },
        { label: "Wood305", field: "prodCorregida" },
      ],
    },
    {
      id: "ips", title: "3. Reporte IPS", defaultSort: "iip",
      cols: [
        { label: "Id Vaca", field: "id_vaca" },
        { label: "IPS (días)", field: "iip" },
      ],
    },
    {
      id: "ipc", title: "4. Reporte IPC", defaultSort: "ipc",
      cols: [
        { label: "Id Vaca", field: "id_vaca" },
        { label: "IPC (días)", field: "ipc" },
      ],
    },
    {
      id: "servconc", title: "5. Reporte Servicio/Concepción", defaultSort: "servConc",
      cols: [
        { label: "Id Vaca", field: "id_vaca" },
        { label: "Serv/Conc", field: "servConc" },
      ],
    },
    {
      id: "iipReport", title: "6. Reporte IIP", defaultSort: "iip",
      cols: [
        { label: "Id Vaca", field: "id_vaca" },
        { label: "IIP (días)", field: "iip" },
      ],
    },
    {
      id: "solidos", title: "7. Producción de Sólidos", defaultSort: "kgSolidos",
      cols: [
        { label: "Id Vaca", field: "id_vaca" },
        { label: "Kg Sólidos", field: "kgSolidos" },
      ],
    },
  ];

  return (
    <FormLayout title="Reporte Vacas">
      <div className="flex justify-end mb-4">
        <PdfReportButton
          title="Reporte Vacas"
          headers={["Id Vaca", "Kg Grasa", "Kg Prot", "Kg Sólidos", "LC305", "Prod. Corr.", "L1", "L2", "L3", "L4", "L5", "IIP", "IPC", "S/C"]}
          rows={vacaData.map(v => [v.id_vaca, v.kgGrasa.toFixed(1), v.kgProt.toFixed(1), v.kgSolidos.toFixed(1), v.lc305.toFixed(0), v.prodCorregida.toFixed(0), v.l1||"—", v.l2||"—", v.l3||"—", v.l4||"—", v.l5||"—", v.iip || "—", v.ipc || "—", v.servConc || "—"])}
        />
      </div>
      <div className="space-y-6">
        {sections.map((section) => {
          const rows = sortAndSlice(vacaData, section.id, section.defaultSort);
          return (
            <Card key={section.id} className="border-2 border-primary/20">
              <CardHeader className="bg-accent/50 pb-2">
                <CardTitle className="text-lg font-bold">{section.title}</CardTitle>
                <p className="text-sm text-muted-foreground">Máximo {MAX_ROWS} vacas — ordenar con ↑↓</p>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/10">
                      {section.cols.map((col) => (
                        <SortBtn key={col.field} section={section.id} field={col.field} label={col.label} />
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={section.cols.length} className="text-center text-muted-foreground py-6">Sin datos</TableCell>
                      </TableRow>
                    ) : rows.map((row) => (
                      <TableRow key={row.id_vaca}>
                        {section.cols.map((col) => {
                          const val = (row as any)[col.field];
                          const display = typeof val === "number" ? (val > 0 ? val.toFixed(1) : "—") : (val || "—");
                          return <TableCell key={col.field}>{display}</TableCell>;
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </FormLayout>
  );
};

export default ReporteVacas;
