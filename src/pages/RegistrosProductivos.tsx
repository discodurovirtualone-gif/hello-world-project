import { useState } from "react";
import FormLayout from "@/components/FormLayout";
import FieldInput from "@/components/FieldInput";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Pencil, ArrowUpDown } from "lucide-react";
import { useGanaderia, RegistroProductivo, calcWood } from "@/context/GanaderiaContext";

const DIAS = [30, 120, 210, 270];
const POTENCIALES = [2000, 3000, 4000, 5000, 6000, 7000];

type SortKey = "id_vaca" | "lc305_wood" | "porcentaje_grasa" | "porcentaje_proteina";

const RegistrosProductivos = () => {
  const { registrosBasicos, registrosProductivos, setRegistrosProductivos } = useGanaderia();
  const [editVacaId, setEditVacaId] = useState<string | null>(null);
  const [form, setForm] = useState<RegistroProductivo | null>(null);
  const [open, setOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const update = (key: keyof RegistroProductivo) => (value: string) =>
    setForm((prev) => prev ? { ...prev, [key]: value } : prev);

  const findProd = (id_vaca: string) => registrosProductivos.find((r) => r.id_vaca === id_vaca);

  const calcWood305 = (id_vaca: string, reg1: string, reg2: string, reg3: string, reg4: string): string => {
    const vaca = registrosBasicos.find((v) => v.id_vaca === id_vaca);
    if (!vaca) return "";
    const potencial = parseFloat(vaca.potencial_vaca);
    if (!potencial || potencial <= 0) return "";
    const reales = [parseFloat(reg1), parseFloat(reg2), parseFloat(reg3), parseFloat(reg4)];
    if (reales.some(isNaN)) return "";
    const potAsignados = DIAS.map((dia, i) => {
      let closest = POTENCIALES[0];
      let minDiff = Math.abs(calcWood(POTENCIALES[0], dia) - reales[i]);
      for (const pot of POTENCIALES) {
        const diff = Math.abs(calcWood(pot, dia) - reales[i]);
        if (diff < minDiff) { minDiff = diff; closest = pot; }
      }
      return closest;
    });
    const promedio = potAsignados.reduce((s, v) => s + v, 0) / potAsignados.length;
    return promedio.toFixed(0);
  };

  const calcLactancias = (lc305: string, numLact: number): string[] => {
    const lc = parseFloat(lc305);
    if (isNaN(lc) || lc <= 0) return Array(5).fill("");
    const factors = [0.85, 0.95, 1.0, 1.05, 1.02];
    return factors.slice(0, 5).map((f, i) => i < numLact ? (lc * f).toFixed(0) : "");
  };

  const emptyProd = (id_vaca: string, ejercicio: string): RegistroProductivo => ({
    ejercicio, id_vaca,
    reg_1_dia30: "", reg_2_dia120: "", reg_3_dia210: "", reg_4_dia270: "",
    lc305_wood: "", porcentaje_grasa: "", porcentaje_proteina: "",
    lact1: "", lact2: "", lact3: "", lact4: "", lact5: "",
  });

  const startEdit = (id_vaca: string, ejercicio: string) => {
    const existing = findProd(id_vaca);
    setForm(existing || emptyProd(id_vaca, ejercicio));
    setEditVacaId(id_vaca);
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const lc305 = calcWood305(form.id_vaca, form.reg_1_dia30, form.reg_2_dia120, form.reg_3_dia210, form.reg_4_dia270);
    const vaca = registrosBasicos.find((v) => v.id_vaca === form.id_vaca);
    const numLact = vaca ? parseInt(vaca.lactancia) || 1 : 1;
    const lacts = calcLactancias(lc305, numLact);
    const updatedForm: RegistroProductivo = {
      ...form, lc305_wood: lc305,
      lact1: lacts[0] || "", lact2: lacts[1] || "", lact3: lacts[2] || "",
      lact4: lacts[3] || "", lact5: lacts[4] || "",
    };
    const existingIdx = registrosProductivos.findIndex((r) => r.id_vaca === editVacaId);
    if (existingIdx >= 0) {
      setRegistrosProductivos((prev) => prev.map((r, i) => (i === existingIdx ? updatedForm : r)));
      toast.success("Registro actualizado");
    } else {
      setRegistrosProductivos((prev) => [...prev, updatedForm]);
      toast.success("Registro agregado");
    }
    setForm(null); setEditVacaId(null); setOpen(false);
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const vacasFiltradas = registrosBasicos.filter((v) => filterText === "" || v.id_vaca.includes(filterText));
  const rows = vacasFiltradas.map((vaca) => ({ vaca, prod: findProd(vaca.id_vaca) }));

  const sorted = sortKey
    ? [...rows].sort((a, b) => {
        const va = a.prod ? parseFloat(a.prod[sortKey]) || 0 : 0;
        const vb = b.prod ? parseFloat(b.prod[sortKey]) || 0 : 0;
        return sortAsc ? va - vb : vb - va;
      })
    : rows;

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort(field)}>
      <span className="inline-flex items-center gap-1">{label} <ArrowUpDown className="h-3 w-3" /></span>
    </TableHead>
  );

  return (
    <FormLayout title="Registros Productivos">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <Input placeholder="Filtrar por Id Vaca..." value={filterText} onChange={(e) => setFilterText(e.target.value)} className="max-w-xs" />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Datos Productivos - Vaca #{form?.id_vaca}</DialogTitle>
          </DialogHeader>
          {form && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FieldInput label="Ejercicio" value={form.ejercicio} onChange={() => {}} />
                <FieldInput label="Id Vaca" value={form.id_vaca} onChange={() => {}} />
              </div>
              <p className="text-sm font-semibold text-muted-foreground pt-2">Registros de Control (ingrese producción real)</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FieldInput label="Reg 1 Día 30" value={form.reg_1_dia30} onChange={update("reg_1_dia30")} type="number" highlighted />
                <FieldInput label="Reg 2 Día 120" value={form.reg_2_dia120} onChange={update("reg_2_dia120")} type="number" highlighted />
                <FieldInput label="Reg 3 Día 210" value={form.reg_3_dia210} onChange={update("reg_3_dia210")} type="number" highlighted />
                <FieldInput label="Reg 4 Día 270" value={form.reg_4_dia270} onChange={update("reg_4_dia270")} type="number" highlighted />
              </div>
              <p className="text-sm font-semibold text-muted-foreground pt-2">Composición</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FieldInput label="% Grasa" value={form.porcentaje_grasa} onChange={update("porcentaje_grasa")} type="number" highlighted />
                <FieldInput label="% Proteína" value={form.porcentaje_proteina} onChange={update("porcentaje_proteina")} type="number" highlighted />
              </div>
              <p className="text-xs text-muted-foreground">LC305 Wood y Lactancias se calculan automáticamente al guardar.</p>
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
              <SortHeader label="Id Vaca" field="id_vaca" />
              <TableHead>R1 D30</TableHead>
              <TableHead>R2 D120</TableHead>
              <TableHead>R3 D210</TableHead>
              <TableHead>R4 D270</TableHead>
              <SortHeader label="LC305" field="lc305_wood" />
              <SortHeader label="% Grasa" field="porcentaje_grasa" />
              <SortHeader label="% Prot" field="porcentaje_proteina" />
              <TableHead className="w-16">Acc.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                  No hay vacas registradas. Ingrese vacas en Registros Básicos primero.
                </TableCell>
              </TableRow>
            ) : sorted.map(({ vaca, prod }, i) => (
              <TableRow key={i}>
                <TableCell>{vaca.ejercicio}</TableCell>
                <TableCell className="font-medium">{vaca.id_vaca}</TableCell>
                <TableCell>{prod?.reg_1_dia30 || "—"}</TableCell>
                <TableCell>{prod?.reg_2_dia120 || "—"}</TableCell>
                <TableCell>{prod?.reg_3_dia210 || "—"}</TableCell>
                <TableCell>{prod?.reg_4_dia270 || "—"}</TableCell>
                <TableCell className="font-bold">{prod?.lc305_wood || "—"}</TableCell>
                <TableCell>{prod?.porcentaje_grasa || "—"}</TableCell>
                <TableCell>{prod?.porcentaje_proteina || "—"}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => startEdit(vaca.id_vaca, vaca.ejercicio)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </FormLayout>
  );
};

export default RegistrosProductivos;
