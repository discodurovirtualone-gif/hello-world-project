import { useMemo } from "react";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGanaderia } from "@/context/GanaderiaContext";

const TORO_FIELDS: { label: string; key: string }[] = [
  { label: "DEP Leche", key: "dep_leche" },
  { label: "DEP Grasa", key: "dep_grasa" },
  { label: "DEP Proteína", key: "dep_prot" },
  { label: "DEP TPH", key: "dep_tph" },
  { label: "Índice INIA", key: "indice_inia" },
  { label: "Índice Rovere", key: "indice_rovere" },
];

const TorosSummaryCard = () => {
  const { toros } = useGanaderia();

  const stats = useMemo(() => {
    if (toros.length === 0) return [];

    return TORO_FIELDS.map((field) => {
      const values = toros.map((t) => (t as any)[field.key] as number).filter((v) => v != null && !isNaN(v));
      if (values.length === 0) return { label: field.label, avg: "—", min: "—", max: "—" };
      const min = Math.min(...values);
      const max = Math.max(...values);
      const avg = values.reduce((s, v) => s + v, 0) / values.length;
      return {
        label: field.label,
        avg: avg.toFixed(1),
        min: min.toFixed(1),
        max: max.toFixed(1),
      };
    });
  }, [toros]);

  if (toros.length === 0) return null;

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-accent/50 pb-2">
        <CardTitle className="text-lg font-bold">Resumen de Toros ({toros.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/10">
              <TableHead className="font-semibold text-foreground">Concepto</TableHead>
              <TableHead className="font-semibold text-foreground">Promedio</TableHead>
              <TableHead className="font-semibold text-foreground">Mín</TableHead>
              <TableHead className="font-semibold text-foreground">Máx</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map((row) => (
              <TableRow key={row.label}>
                <TableCell className="font-medium">{row.label}</TableCell>
                <TableCell>{row.avg}</TableCell>
                <TableCell>{row.min}</TableCell>
                <TableCell>{row.max}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TorosSummaryCard;
