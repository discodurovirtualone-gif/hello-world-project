import { useState, useEffect } from "react";
import { Sun, Moon, Type, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const FONT_SIZES = [14, 16, 18, 20, 24];
const BG_MODES = [
  { label: "Normal", bg: "", text: "" },
  { label: "Alto contraste", bg: "hsl(60, 100%, 95%)", text: "hsl(0, 0%, 5%)" },
  { label: "Oscuro", bg: "hsl(0, 0%, 10%)", text: "hsl(0, 0%, 95%)" },
];

const AccessibilityControls = () => {
  const [sizeIdx, setSizeIdx] = useState(1);
  const [bgIdx, setBgIdx] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.documentElement.style.fontSize = `${FONT_SIZES[sizeIdx]}px`;
  }, [sizeIdx]);

  useEffect(() => {
    const mode = BG_MODES[bgIdx];
    if (mode.bg) {
      document.documentElement.style.setProperty("--a11y-bg", mode.bg);
      document.documentElement.style.setProperty("--a11y-text", mode.text);
      document.body.style.backgroundColor = mode.bg;
      document.body.style.color = mode.text;
    } else {
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
      document.documentElement.style.removeProperty("--a11y-bg");
      document.documentElement.style.removeProperty("--a11y-text");
    }
  }, [bgIdx]);

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
    <div className="fixed bottom-4 right-4 z-50 rounded-xl bg-card border-2 border-border shadow-2xl p-4 space-y-3 min-w-[200px]">
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
