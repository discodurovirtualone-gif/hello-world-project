import { useState, useEffect } from "react";
import { Sun, Moon, Type, ZoomIn, ZoomOut, Bold } from "lucide-react";
import { Button } from "@/components/ui/button";

const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24];
const BG_MODES = [
  { label: "Normal", className: "" },
  { label: "Alto contraste", className: "a11y-high-contrast" },
  { label: "Oscuro", className: "a11y-dark" },
];

const AccessibilityControls = () => {
  const [sizeIdx, setSizeIdx] = useState(3);
  const [bgIdx, setBgIdx] = useState(0);
  const [bold, setBold] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.documentElement.style.fontSize = `${FONT_SIZES[sizeIdx]}px`;
  }, [sizeIdx]);

  useEffect(() => {
    // Remove all a11y classes first
    document.documentElement.classList.remove("a11y-high-contrast", "a11y-dark");
    const cls = BG_MODES[bgIdx].className;
    if (cls) {
      document.documentElement.classList.add(cls);
    }
  }, [bgIdx]);

  useEffect(() => {
    if (bold) {
      document.documentElement.classList.add("a11y-bold");
    } else {
      document.documentElement.classList.remove("a11y-bold");
    }
  }, [bold]);

  const incSize = () => setSizeIdx(i => Math.min(i + 1, FONT_SIZES.length - 1));
  const decSize = () => setSizeIdx(i => Math.max(i - 1, 0));
  const cycleBg = () => setBgIdx(i => (i + 1) % BG_MODES.length);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-primary p-3 text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
        title="Accesibilidad"
      >
        <Type className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-xl bg-card border-2 border-border shadow-2xl p-4 space-y-3 min-w-[220px]">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold">Accesibilidad</span>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground text-lg leading-none">&times;</button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs flex-1">Tamaño letra</span>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={decSize} disabled={sizeIdx === 0}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-xs font-mono w-8 text-center">{FONT_SIZES[sizeIdx]}</span>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={incSize} disabled={sizeIdx === FONT_SIZES.length - 1}>
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs flex-1">Texto grueso</span>
        <Button variant={bold ? "default" : "outline"} size="sm" className="h-8 gap-1" onClick={() => setBold(!bold)}>
          <Bold className="h-4 w-4" />
          <span className="text-xs">{bold ? "Sí" : "No"}</span>
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs flex-1">Fondo</span>
        <Button variant="outline" size="sm" className="h-8 gap-1" onClick={cycleBg}>
          {bgIdx === 2 ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          <span className="text-xs">{BG_MODES[bgIdx].label}</span>
        </Button>
      </div>
    </div>
  );
};

export default AccessibilityControls;
