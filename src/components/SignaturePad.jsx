import { useRef, useState, useCallback } from "react";
import { Icon } from "./Icon";

export default function SignaturePad({ onSave, onCancel }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [hasStrokes, setHasStrokes] = useState(false);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const point = "touches" in e ? e.touches[0] : e;
    return { x: (point.clientX - rect.left) * scaleX, y: (point.clientY - rect.top) * scaleY };
  };

  const start = useCallback((e) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    drawing.current = true;
    const pos = getPos(e, canvas);
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
    e.preventDefault();
  }, []);

  const draw = useCallback((e) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#3d7a52"; ctx.lineWidth = 2; ctx.lineCap = "round";
    ctx.stroke();
    setHasStrokes(true);
    e.preventDefault();
  }, []);

  const end = useCallback(() => { drawing.current = false; }, []);

  const clear = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
  };

  const save = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    onSave(canvas.toDataURL());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-white border border-[#ccdacc] rounded-lg p-5 sm:p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[#3d7a52]">
            <Icon.pen />
            <span className="text-sm font-medium mono">ASSINATURA DE RECEBIMENTO</span>
          </div>
          <button onClick={onCancel} className="text-[#7a9480] hover:text-[#1a2e1c] transition-colors"><Icon.x /></button>
        </div>
        <p className="text-xs text-[#7a9480] mb-3">Assine abaixo para confirmar o recebimento do equipamento</p>
        <div className="border border-[#ccdacc] rounded-md overflow-hidden bg-[#f2f7f2]">
          <canvas
            ref={canvasRef} width={420} height={180}
            className="w-full aspect-[420/180] touch-none cursor-crosshair block"
            onMouseDown={start} onMouseMove={draw} onMouseUp={end} onMouseLeave={end}
            onTouchStart={start} onTouchMove={draw} onTouchEnd={end}
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={clear} className="flex-1 px-4 py-2 text-xs mono text-[#7a9480] border border-[#ccdacc] rounded hover:border-[#b4c8b4] hover:text-[#4d6b52] transition-colors">
            LIMPAR
          </button>
          <button
            onClick={save} disabled={!hasStrokes}
            className="flex-1 px-4 py-2 text-xs mono bg-[#3d7a52] text-white font-semibold rounded hover:bg-[#2e6342] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            CONFIRMAR
          </button>
        </div>
      </div>
    </div>
  );
}
