import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PdfReportButtonProps {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  fileName?: string;
}

const PdfReportButton = ({ title, headers, rows, fileName }: PdfReportButtonProps) => {
  const generate = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    doc.setFontSize(14);
    doc.text(title, 14, 15);
    doc.setFontSize(8);
    doc.text(`Generado: ${new Date().toLocaleDateString("es-UY")}`, 14, 21);

    autoTable(doc, {
      startY: 26,
      head: [headers],
      body: rows.map(r => r.map(c => String(c ?? "—"))),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [34, 120, 60], textColor: 255, fontSize: 7 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      theme: "grid",
    });

    doc.save(fileName || `${title.replace(/\s+/g, "_").toLowerCase()}.pdf`);
  };

  return (
    <Button variant="outline" size="sm" onClick={generate} className="gap-2">
      <FileDown className="h-4 w-4" /> PDF
    </Button>
  );
};

export default PdfReportButton;
