import { useState } from "react";
import FormLayout from "@/components/FormLayout";
import FieldInput from "@/components/FieldInput";
import FieldSelect from "@/components/FieldSelect";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useGanaderia, FactorCorreccion } from "@/context/GanaderiaContext";

const razaOptions = [
  { value: "Holstein", label: "Holstein" },
  { value: "Jersey", label: "Jersey" },
];

const nivelOptions = [
  { value: "Alto", label: "Alto" },
  { value: "Medio", label: "Medio" },
  { value: "Bajo", label: "Bajo" },
];

const emptyFactor = { raza: "", nivel_produccion: "", edad: 0, lactancia: 0, factor: 0 };

const FactoresCorreccionPage = () => {
  const { factores, setFactores } = useGanaderia();
  const [form, setForm] = useState<FactorCorreccion>(emptyFactor);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const updateStr = (key: "raza" | "nivel_produccion") => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const updateNum = (key: "edad" | "lactancia" | "factor") => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: parseFloat(value) || 0 }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.raza || !form.nivel_produccion) {
      toast.error("Raza y nivel de producción son obligatorios");
      return;
    }
    if (editIndex !== null) {
      setFactores((prev) => prev.map((f, i) => (i === editIndex ? form : f)));
      toast.success("Factor actualizado");
    } else {
      setFactores((prev) => [...prev, form]);
      toast.success("Factor agregado");
    }
    setForm(emptyFactor);
    setEditIndex(null);
    setOpen(false);
  };

  const startEdit = (i: number) => { setForm(factores[i]); setEditIndex(i); setOpen(true); };
  const startNew = () => { setForm(emptyFactor); setEditIndex(null); setOpen(true); };
  const deleteFactor = (i: number) => {
    setFactores((prev) => prev.filter((_, idx) => idx !== i));
    toast.success("Factor eliminado");
  };

  return (
    <FormLayout title="Factores de Corrección" variant="result">
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={startNew}><Plus className="h-4 w-4 mr-2" /> Agregar Factor</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editIndex !== null ? "Editar Factor" : "Nuevo Factor"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FieldSelect label="Raza" value={form.raza} onChange={updateStr("raza")} options={razaOptions} placeholder="Seleccionar" />
                <FieldSelect label="Nivel Producción" value={form.nivel_produccion} onChange={updateStr("nivel_produccion")} options={nivelOptions} placeholder="Seleccionar" />
                <FieldInput label="Edad" value={String(form.edad || "")} onChange={updateNum("edad")} type="number" />
                <FieldInput label="Lactancia" value={String(form.lactancia || "")} onChange={updateNum("lactancia")} type="number" />
                <FieldInput label="Factor" value={String(form.factor || "")} onChange={updateNum("factor")} type="number" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit">{editIndex !== null ? "Actualizar" : "Guardar"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Raza</TableHead>
              <TableHead>Nivel</TableHead>
              <TableHead>Edad</TableHead>
              <TableHead>Lactancia</TableHead>
              <TableHead>Factor</TableHead>
              <TableHead className="w-24">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {factores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No hay factores.</TableCell>
              </TableRow>
            ) : factores.map((f, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{f.raza}</TableCell>
                <TableCell>{f.nivel_produccion}</TableCell>
                <TableCell>{f.edad}</TableCell>
                <TableCell>{f.lactancia}</TableCell>
                <TableCell>{f.factor.toFixed(3)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(i)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteFactor(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </FormLayout>
  );
};

export default FactoresCorreccionPage;
