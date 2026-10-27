import React, { useEffect, useRef } from 'react';
import { computeHistogram } from '../utils/imageProcessor';
import { AlertTriangle } from 'lucide-react';

interface HistogramViewProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  revision: number;
}

export const HistogramView: React.FC<HistogramViewProps> = ({ canvasRef, revision }) => {
  const histoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stats, setStats] = React.useState<{
    shadowClipping: boolean;
    highlightClipping: boolean;
  }>({ shadowClipping: false, highlightClipping: false });

  useEffect(() => {
    if (!canvasRef.current || !histoCanvasRef.current) return;
    const histData = computeHistogram(canvasRef.current);
    setStats({
      shadowClipping: histData.shadowClipping,
      highlightClipping: histData.highlightClipping,
    });

    const ctx = histoCanvasRef.current.getContext('2d');
    if (!ctx) return;
    const w = histoCanvasRef.current.width;
    const h = histoCanvasRef.current.height;

    ctx.clearRect(0, 0, w, h);

    // Background grid
    ctx.fillStyle = '#0f141c';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = w / 4; x < w; x += w / 4) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    const max = histData.maxVal || 1;

    // Draw Luminance / RGB Curves
    const drawChannel = (arr: number[], color: string, alpha: number) => {
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let i = 0; i < 256; i++) {
        const x = (i / 255) * w;
        const val = (arr[i] / max) * h * 0.92;
        ctx.lineTo(x, h - val);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
    };

    drawChannel(histData.r, '#ef4444', 0.35);
    drawChannel(histData.g, '#22c55e', 0.35);
    drawChannel(histData.b, '#3b82f6', 0.35);
    drawChannel(histData.l, '#e2e8f0', 0.25);
    ctx.globalAlpha = 1.0;
  }, [revision, canvasRef]);

  return (
    <div className="bg-[#12161f] border border-slate-800 rounded-lg p-2.5 mb-3">
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>Histogram Nikon EXPEED 4</span>
        </div>
        <div className="flex items-center gap-2">
          {stats.shadowClipping && (
            <span className="flex items-center gap-0.5 text-blue-400 font-mono-num text-[10px]" title="Shadow Under-exposure Clipping">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              Crushed
            </span>
          )}
          {stats.highlightClipping && (
            <span className="flex items-center gap-0.5 text-red-400 font-mono-num text-[10px]" title="Highlight Over-exposure Clipping">
              <AlertTriangle className="w-3 h-3 text-red-500 inline" />
              Blown
            </span>
          )}
          <span className="text-[10px] text-slate-500 font-mono-num">RGBL 8-bit</span>
        </div>
      </div>
      <div className="relative rounded overflow-hidden border border-slate-800">
        <canvas ref={histoCanvasRef} width={260} height={64} className="w-full h-16 block" />
        <div className="absolute bottom-1 left-2 text-[9px] font-mono-num text-slate-500">Bayangan</div>
        <div className="absolute bottom-1 right-2 text-[9px] font-mono-num text-slate-500">Sorotan</div>
      </div>
    </div>
  );
};
