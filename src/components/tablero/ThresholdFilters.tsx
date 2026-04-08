import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VacaIndicadores } from "./FilteredCowsTable";

export interface ThresholdValues {
  lc305_wood: string;
  renguera: string;
  mastitis: string;
  fac_parto: string;
  longevidad: string;
  fortaleza_patas: string;
  ips: string;
  ipc: string;
  serv_conc: string;
  epp: string;
}

export const defaultThresholds: ThresholdValues = {
  lc305_wood: "",
  renguera: "",
  mastitis: "",
  fac_parto: "",
  longevidad: "",
  fortaleza_patas: "",
  ips: "",
  ipc: "",
  serv_conc: "",
  epp: "",
};

interface ThresholdFiltersProps {
  thresholds: ThresholdValues;
  onChange: (thresholds: ThresholdValues) => void;
  vacas: VacaIndicadores[];
}

const THRESHOLD_FIELDS: { key: keyof ThresholdValues; label: string; placeholder: string; valueFn: (v: VacaIndicadores) => number }[] = [
  { key: "lc305_wood", label: "Prod. Leche Wood305 (mín.)", placeholder: "Ej: 5000", valueFn: (v) => v.lc305 },
  { key: "renguera", label: "Renguera (máx. 1–5)", placeholder: "Ej: 3", valueFn: (v) => v.renguera },
  { key: "mastitis", label: "Mastitis (máx. 1–5)", placeholder: "Ej: 3", valueFn: (v) => v.mastitis },
  { key: "fac_parto", label: "Fac. Parto (máx. 1–5)", placeholder: "Ej: 3", valueFn: (v) => v.fac_parto },
  { key: "longevidad", label: "Longevidad (mín. 1–5)", placeholder: "Ej: 3", valueFn: (v) => v.longevidad },
  { key: "fortaleza_patas", label: "Fort. Patas (mín. 1–5)", placeholder: "Ej: 3", valueFn: (v) => v.fortaleza_patas },
  { key: "ips", label: "IPS (máx.)", placeholder: "Ej: 90", valueFn: (v) => v.ips },
  { key: "ipc", label: "IPC (máx.)", placeholder: "Ej: 150", valueFn: (v) => v.ipc },
  { key: "serv_conc", label: "Serv/Conc (máx.)", placeholder: "Ej: 2", valueFn: (v) => v.serv_conc },
  { key: "epp", label: "EPP (máx.)", placeholder: "Ej: 900", valueFn: (v) => v.epp },
];

const ThresholdFilters = ({ thresholds, onChange, vacas }: ThresholdFiltersProps) => {
  const handleChange = (key: keyof ThresholdValues, value: string) => {
    onChange({ ...thresholds, [key]: value });
  };

  const getMinMax = (valueFn: (v: VacaIndicadores) => number) => {
    const vals = vacas.map(valueFn).filter((v) => v > 0);
    if (vals.length === 0) return { min: "—", max: "—" };
    return { min: Math.min(...vals).toFixed(0), max: Math.max(...vals).toFixed(0) };
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-accent/50 pb-2">
        <CardTitle className="text-lg font-bold">Umbrales de Selección Vacas</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground mb-4">
          Ingrese los valores umbral. Las vacas que cumplan <strong>todos</strong> los criterios definidos se mostrarán en la tabla inferior.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {THRESHOLD_FIELDS.map((f) => {
            const range = getMinMax(f.valueFn);
            return (
              <div key={f.key} className="space-y-1">
                <Label className="text-xs font-medium">{f.label}</Label>
                <Input
                  type="number"
                  value={thresholds[f.key]}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="h-8 text-sm bg-field-highlight border-accent"
                />
                <span className="text-[10px] text-muted-foreground">
                  Mín: {range.min} | Máx: {range.max}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ThresholdFilters;
