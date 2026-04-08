import { useState, useMemo } from "react";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGanaderia } from "@/context/GanaderiaContext";

const TORO_FIELDS: { label: string; key: string; placeholder: string }[] = [
  { label: "DEP Leche", key: "dep_leche", placeholder: "Ej: 200" },
  { label: "DEP Grasa", key: "dep_grasa", placeholder: "Ej: 100" },
  { label: "DEP Proteína", key: "dep_prot", placeholder: "Ej: 80" },
  { label: "DEP TPH", key: "dep_tph", placeholder: "Ej: 50" },
  { label: "Índice INIA", key: "indice_inia", placeholder: "Ej: 100" },
  { label: "Índice Rovere", key: "indice_rovere", placeholder: "Ej: 100" },
];

export interface ToroThresholdValues {
  dep_leche: string;
  dep_grasa: string;
  dep_prot: string;
  dep_tph: string;
  indice_inia: string;
  indice_rovere: string;
}

export const defaultToroThresholds: ToroThresholdValues = {
  dep_leche: "",
  dep_grasa: "",
  dep_prot: "",
  dep_tph: "",
  indice_inia: "",
  indice_rovere: "",
};

const TorosSummaryCard = () => {
  const { toros } = useGanaderia();
  const [thresholds, setThresholds] = useState<ToroThresholdValues>(defaultToroThresholds);

  const handleChange = (key: keyof ToroThresholdValues, value: string) => {
    setThresholds((prev) => ({ ...prev, [key]: value }));
  };

  const ranges = useMemo(() => {
    const result: Record<string, { min: string; max: string }> = {};
    TORO_FIELDS.forEach((field) => {
      const values = toros.map((t) => (t as any)[field.key] as number).filter((v) => v != null && !isNaN(v));
      if (values.length === 0) {
        result[field.key] = { min: "—", max: "—" };
      } else {
        result[field.key] = { min: Math.min(...values).toFixed(1), max: Math.max(...values).toFixed(1) };
      }
    });
    return result;
  }, [toros]);

  const hasAnyThreshold = Object.values(thresholds).some((v) => v !== "");

  const filtered = useMemo(() => {
    if (!hasAnyThreshold) return [];
    return toros.filter((t) => {
      for (const field of TORO_FIELDS) {
        const thresholdVal = thresholds[field.key as keyof ToroThresholdValues];
        if (!thresholdVal) continue;
        const val = (t as any)[field.key] as number;
        if (val == null || isNaN(val)) return false;
        if (val < parseFloat(thresholdVal)) return false;
      }
      return true;
    });
  }, [toros, thresholds, hasAnyThreshold]);

  if (toros.length === 0) return null;

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-accent/50 pb-2">
        <CardTitle className="text-lg font-bold">Umbrales de Selección de Toros</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground mb-4">
          Ingrese umbrales mínimos. Los toros que cumplan <strong>todos</strong> los criterios se mostrarán abajo.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          {TORO_FIELDS.map((f) => (
            <div key={f.key} className="space-y-1">
              <Label className="text-xs font-medium">{f.label}</Label>
              <Input
                type="number"
                value={thresholds[f.key as keyof ToroThresholdValues]}
                onChange={(e) => handleChange(f.key as keyof ToroThresholdValues, e.target.value)}
                placeholder={f.placeholder}
                className="h-8 text-sm bg-field-highlight border-accent"
              />
              <span className="text-[10px] text-muted-foreground">
                Mín: {ranges[f.key]?.min} | Máx: {ranges[f.key]?.max}
              </span>
            </div>
          ))}
        </div>

        {hasAnyThreshold && (
          <>
            <p className="text-sm font-semibold mb-2">
              Toros que cumplen ({filtered.length} de {toros.length})
            </p>
            {filtered.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                Ningún toro cumple todos los criterios definidos.
              </p>
            ) : (
              <div className="overflow-auto max-h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/10">
                      <TableHead className="font-semibold text-foreground">ID Toro</TableHead>
                      <TableHead className="font-semibold text-foreground">Nombre</TableHead>
                      {TORO_FIELDS.map((f) => (
                        <TableHead key={f.key} className="font-semibold text-foreground">{f.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((t) => (
                      <TableRow key={t.id_toro}>
                        <TableCell className="font-medium">{t.id_toro}</TableCell>
                        <TableCell>{t.nombre || "—"}</TableCell>
                        {TORO_FIELDS.map((f) => {
                          const val = (t as any)[f.key];
                          return <TableCell key={f.key}>{val != null ? Number(val).toFixed(1) : "—"}</TableCell>;
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TorosSummaryCard;
