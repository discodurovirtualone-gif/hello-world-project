import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  eep: string;
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
  eep: "",
};

interface ThresholdFiltersProps {
  thresholds: ThresholdValues;
  onChange: (thresholds: ThresholdValues) => void;
}

const THRESHOLD_FIELDS: { key: keyof ThresholdValues; label: string; placeholder: string }[] = [
  { key: "lc305_wood", label: "Prod. Leche Wood305 (mín.)", placeholder: "Ej: 5000" },
  { key: "renguera", label: "Renguera (máx. 1–5)", placeholder: "Ej: 3" },
  { key: "mastitis", label: "Mastitis (máx. 1–5)", placeholder: "Ej: 3" },
  { key: "fac_parto", label: "Fac. Parto (máx. 1–5)", placeholder: "Ej: 3" },
  { key: "longevidad", label: "Longevidad (mín. 1–5)", placeholder: "Ej: 3" },
  { key: "fortaleza_patas", label: "Fort. Patas (mín. 1–5)", placeholder: "Ej: 3" },
  { key: "ips", label: "IPS (máx. días)", placeholder: "Ej: 90" },
  { key: "ipc", label: "IPC (máx. días)", placeholder: "Ej: 150" },
  { key: "serv_conc", label: "Serv/Conc (máx.)", placeholder: "Ej: 2" },
  { key: "eep", label: "EEP (máx. meses)", placeholder: "Ej: 30" },
];

const ThresholdFilters = ({ thresholds, onChange }: ThresholdFiltersProps) => {
  const handleChange = (key: keyof ThresholdValues, value: string) => {
    onChange({ ...thresholds, [key]: value });
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-accent/50 pb-2">
        <CardTitle className="text-lg font-bold">Umbrales de Selección</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground mb-4">
          Ingrese los valores umbral. Las vacas que cumplan <strong>todos</strong> los criterios definidos se mostrarán en la tabla inferior.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {THRESHOLD_FIELDS.map((f) => (
            <div key={f.key} className="space-y-1">
              <Label className="text-xs font-medium">{f.label}</Label>
              <Input
                type="number"
                value={thresholds[f.key]}
                onChange={(e) => handleChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="h-8 text-sm"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ThresholdFilters;
