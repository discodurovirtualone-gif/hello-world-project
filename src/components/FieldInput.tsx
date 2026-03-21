import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FieldInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  highlighted?: boolean;
}

const FieldInput = ({ label, value, onChange, type = "text", placeholder, highlighted = false }: FieldInputProps) => {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
        className={highlighted ? "bg-field-highlight border-accent font-medium" : ""}
      />
    </div>
  );
};

export default FieldInput;
