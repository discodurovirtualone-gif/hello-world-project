import { useState } from "react";
import FormLayout from "@/components/FormLayout";
import FieldInput from "@/components/FieldInput";
import FieldSelect from "@/components/FieldSelect";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Plus } from "lucide-react";
import { useGanaderia, RegistroReproductivo } from "@/context/GanaderiaContext";
import { supabase } from "@/integrations/supabase/client";

const razaOptions = [
  { value: "holando", label: "Holando" },
  { value: "jersey", label: "Jersey" },
  { value: "otra", label: "Otra" },
];

const emptyRepro = (id_vaca: string, ejercicio: string): RegistroReproductivo => ({
  id_vaca, ejercicio, parto: "", raza: "",
  servicio1: "", servicio2: "", servicio3: "",
  concepcion1: "", toroUsado: "", aborto1: "", aborto2: "", parto1: "",
  iip: "", ipc: "", serv_conc: "",
});

const RegistrosReproductivos = () => {
  const { registrosBasicos, registrosReproductivos, setRegistrosReproductivos } = useGanaderia();
  const [form, setForm] = useState<RegistroReproductivo | null>(null);
  const [editVacaId, setEditVacaId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const update = (key: keyof RegistroReproductivo) => (value: string) =>
    setForm((prev) => prev ? { ...prev, [key]: value } : prev);

  const findRepro = (id_vaca: string) => registrosReproductivos.find((r) => r.id_vaca === id_vaca);

  const startEdit = (id_vaca: string, ejercicio: string) => {
    const existing = findRepro(id_vaca);
    setForm(existing || emptyRepro(id_vaca, ejercicio));
    setEditVacaId(id_vaca);
    setOpen(true);
  };

  // Calculate IIP from parto and parto1 dates
  const calcIIP = (parto: string, parto1: string): string => {
    if (!parto || !parto1) return "";
    const d1 = new Date(parto);
    const d2 = new Date(parto1);
    const diff = Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 ? Math.round(diff).toString() : "";
  };

  // Calculate IPC from parto and concepcion1 dates
  const calcIPC = (parto: string, concepcion1: string): string => {
    if (!parto || !concepcion1) return "";
    const d1 = new Date(parto);
    const d2 = new Date(concepcion1);
    const diff = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 ? Math.round(diff).toString() : "";
  };

  // Calculate services per conception
  const calcServConc = (s1: string, s2: string, s3: string): string => {
    let count = 0;
    if (s1) count++;
    if (s2) count++;
    if (s3) count++;
    return count > 0 ? count.toString() : "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    // Auto-calculate indicators
    const updatedForm = {
      ...form,
      iip: calcIIP(form.parto, form.parto1),
      ipc: calcIPC(form.parto, form.concepcion1),
      serv_conc: calcServConc(form.servicio1, form.servicio2, form.servicio3),
    };

    const existingIdx = registrosReproductivos.findIndex((r) => r.id_vaca === editVacaId);
    if (existingIdx >= 0) {
      setRegistrosReproductivos((prev) => prev.map((r, i) => (i === existingIdx ? updatedForm : r)));
      toast.success("Registro reproductivo actualizado");
    } else {
      setRegistrosReproductivos((prev) => [...prev, updatedForm]);
      toast.success("Registro reproductivo guardado");
    }
    setForm(null);
    setEditVacaId(null);
    setOpen(false);
  };

  return (
    <FormLayout title="Registros Reproductivos">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Datos Reproductivos - Vaca #{form?.id_vaca}</DialogTitle>
          </DialogHeader>
          {form && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FieldInput label="Id Vaca" value={form.id_vaca} onChange={() => {}} />
                <FieldInput label="Ejercicio" value={form.ejercicio} onChange={() => {}} />
                <FieldInput label="Parto" value={form.parto} onChange={update("parto")} type="date" highlighted />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FieldInput label="Servicio 1" value={form.servicio1} onChange={update("servicio1")} type="date" highlighted />
                <FieldInput label="Servicio 2" value={form.servicio2} onChange={update("servicio2")} type="date" highlighted />
                <FieldInput label="Servicio 3" value={form.servicio3} onChange={update("servicio3")} type="date" highlighted />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FieldInput label="Concepción 1" value={form.concepcion1} onChange={update("concepcion1")} type="date" highlighted />
                <FieldInput label="Toro Usado" value={form.toroUsado} onChange={update("toroUsado")} highlighted />
                <FieldInput label="Aborto 1" value={form.aborto1} onChange={update("aborto1")} type="date" highlighted />
                <FieldInput label="Aborto 2" value={form.aborto2} onChange={update("aborto2")} type="date" highlighted />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FieldInput label="Parto 1 (siguiente)" value={form.parto1} onChange={update("parto1")} type="date" highlighted />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Ejercicio</TableHead>
              <TableHead>Id Vaca</TableHead>
              <TableHead>Parto</TableHead>
              <TableHead>Serv 1</TableHead>
              <TableHead>Serv 2</TableHead>
              <TableHead>Serv 3</TableHead>
              <TableHead>Concepción</TableHead>
              <TableHead>Parto 1</TableHead>
              <TableHead>IIP (días)</TableHead>
              <TableHead>IPC (días)</TableHead>
              <TableHead>Serv/Conc</TableHead>
              <TableHead className="w-16">Acc.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrosBasicos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center text-muted-foreground py-8">
                  No hay vacas registradas. Ingrese vacas en Registros Básicos primero.
                </TableCell>
              </TableRow>
            ) : registrosBasicos.map((vaca, i) => {
              const repro = findRepro(vaca.id_vaca);
              return (
                <TableRow key={i}>
                  <TableCell>{vaca.ejercicio}</TableCell>
                  <TableCell className="font-medium">{vaca.id_vaca}</TableCell>
                  <TableCell>{repro?.parto || "—"}</TableCell>
                  <TableCell>{repro?.servicio1 || "—"}</TableCell>
                  <TableCell>{repro?.servicio2 || "—"}</TableCell>
                  <TableCell>{repro?.servicio3 || "—"}</TableCell>
                  <TableCell>{repro?.concepcion1 || "—"}</TableCell>
                  <TableCell>{repro?.parto1 || "—"}</TableCell>
                  <TableCell>{repro?.iip || "—"}</TableCell>
                  <TableCell>{repro?.ipc || "—"}</TableCell>
                  <TableCell>{repro?.serv_conc || "—"}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => startEdit(vaca.id_vaca, vaca.ejercicio)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </FormLayout>
  );
};

export default RegistrosReproductivos;
