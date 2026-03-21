import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ejercicioOptions = Array.from({ length: 10 }, (_, i) => {
  const y = 2020 + i;
  return `${y % 100}/${(y + 1) % 100}`;
});

// All INPUT variables (not calculated ones)
const variables = [
  // Básicos
  { col: "id_vaca", label: "ID Vaca" },
  { col: "partos", label: "Partos (Prim/Mult)" },
  { col: "fecha_nacimiento", label: "Fecha Nac." },
  { col: "raza", label: "Raza" },
  { col: "lactancia", label: "Lactancia (1-6)" },
  { col: "edad", label: "Edad (años)" },
  { col: "potencial_vaca", label: "Potencial (lt)" },
  // Productivos
  { col: "reg_1_dia30", label: "Reg1 Día30" },
  { col: "reg_2_dia120", label: "Reg2 Día120" },
  { col: "reg_3_dia210", label: "Reg3 Día210" },
  { col: "reg_4_dia270", label: "Reg4 Día270" },
  { col: "porcentaje_grasa", label: "% Grasa" },
  { col: "porcentaje_proteina", label: "% Proteína" },
  // Reproductivos
  { col: "parto", label: "Fecha Parto" },
  { col: "servicio1", label: "Servicio 1" },
  { col: "servicio2", label: "Servicio 2" },
  { col: "servicio3", label: "Servicio 3" },
  { col: "concepcion1", label: "Concepción 1" },
  { col: "toroUsado", label: "Toro Usado" },
  { col: "aborto1", label: "Aborto 1" },
  { col: "aborto2", label: "Aborto 2" },
  { col: "parto1", label: "Parto Sig." },
  // Otros
  { col: "renguera", label: "Renguera (1-5)" },
  { col: "mastitis", label: "Mastitis (1-5)" },
  { col: "facParto", label: "Fac. Parto (1-5)" },
  { col: "longevidad", label: "Longevidad (1-5)" },
  { col: "fortalezaPatas", label: "Fort. Patas (1-5)" },
];

const PdfDownload = () => {
  const [ejercicio, setEjercicio] = useState("");

  const generatePdf = () => {
    if (!ejercicio) return;

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    doc.setFontSize(16);
    doc.text(`Planilla de Registro - Ejercicio ${ejercicio}`, 14, 15);
    doc.setFontSize(9);
    doc.text("Sistema de Mejora Genética Animal — Complete los campos y suba el archivo al sistema", 14, 22);

    // Split variables into chunks to fit pages
    const varsPerPage = 12;
    const numRows = 20;

    for (let chunk = 0; chunk < Math.ceil(variables.length / varsPerPage); chunk++) {
      if (chunk > 0) doc.addPage();

      const pageVars = variables.slice(chunk * varsPerPage, (chunk + 1) * varsPerPage);
      const headers = ["#", "Ejercicio", ...pageVars.map((v) => v.label)];
      const body = Array.from({ length: numRows }, (_, i) => [
        String(i + 1),
        ejercicio,
        ...pageVars.map(() => ""),
      ]);

      autoTable(doc, {
        startY: chunk === 0 ? 28 : 15,
        head: [headers],
        body,
        styles: { fontSize: 7, cellPadding: 2, minCellHeight: 8 },
        headStyles: { fillColor: [34, 120, 60], textColor: 255, fontSize: 7 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        theme: "grid",
      });
    }

    doc.save(`planilla_registro_${ejercicio.replace("/", "-")}.pdf`);
  };

  return (
    <div className="rounded-xl border-2 border-dashed border-muted-foreground/30 bg-card p-4 w-full">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Download className="h-6 w-6 text-muted-foreground shrink-0" />
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm font-semibold text-card-foreground">Planilla para completar</p>
          <p className="text-xs text-muted-foreground">Descargue un PDF con todas las variables para llenar a mano o digital</p>
        </div>
        <Select value={ejercicio} onValueChange={setEjercicio}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Ejercicio" />
          </SelectTrigger>
          <SelectContent>
            {ejercicioOptions.map((e) => (
              <SelectItem key={e} value={e}>{e}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" onClick={generatePdf} disabled={!ejercicio} className="gap-2">
          <Download className="h-4 w-4" /> Descargar PDF
        </Button>
      </div>
    </div>
  );
};

export default PdfDownload;
