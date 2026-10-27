import React, { useRef, useState } from 'react';
import { CurvePoint, ToneCurveSettings } from '../types/preset';

interface ToneCurveEditorProps {
  curve: ToneCurveSettings;
  onChange: (newCurve: ToneCurveSettings) => void;
}

export const ToneCurveEditor: React.FC<ToneCurveEditorProps> = ({ curve, onChange }) => {
  const [activeChannel, setActiveChannel] = useState<'rgb' | 'red' | 'green' | 'blue'>('rgb');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  const points = curve[activeChannel];

  const handlePreset = (type: 'linear' | 'medium' | 'strong' | 'matte') => {
    let newPts: CurvePoint[] = [];
    if (type === 'linear') {
      newPts = [{ x: 0, y: 0 }, { x: 255, y: 255 }];
    } else if (type === 'medium') {
      newPts = [{ x: 0, y: 0 }, { x: 64, y: 48 }, { x: 192, y: 208 }, { x: 255, y: 255 }];
    } else if (type === 'strong') {
      newPts = [{ x: 0, y: 0 }, { x: 64, y: 38 }, { x: 192, y: 220 }, { x: 255, y: 255 }];
    } else if (type === 'matte') {
      newPts = [{ x: 0, y: 30 }, { x: 64, y: 55 }, { x: 192, y: 200 }, { x: 255, y: 245 }];
    }
    onChange({
      ...curve,
      [activeChannel]: newPts,
    });
  };

  const channelColor = {
    rgb: '#f8fafc',
    red: '#ef4444',
    green: '#22c55e',
    blue: '#3b82f6',
  }[activeChannel];

  // Render curve to canvas
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background Grid
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, w, h);

    // Diagonal reference line
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(w, 0);
    ctx.stroke();

    // 4x4 Grid
    ctx.strokeStyle = '#172033';
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo((i * w) / 4, 0);
      ctx.lineTo((i * w) / 4, h);
      ctx.moveTo(0, (i * h) / 4);
      ctx.lineTo(w, (i * h) / 4);
      ctx.stroke();
    }

    // Draw active curve
    ctx.strokeStyle = channelColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo((points[0].x / 255) * w, h - (points[0].y / 255) * h);

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo((points[i].x / 255) * w, h - (points[i].y / 255) * h);
    }
    ctx.stroke();

    // Draw points
    for (let i = 0; i < points.length; i++) {
      const px = (points[i].x / 255) * w;
      const py = h - (points[i].y / 255) * h;

      ctx.fillStyle = channelColor;
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, [curve, activeChannel, channelColor, points]);

  // Mouse interaction
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 255;
    const y = 255 - ((e.clientY - rect.top) / rect.height) * 255;

    // Check if near existing point
    const foundIdx = points.findIndex((pt) => Math.hypot(pt.x - x, pt.y - y) < 20);
    if (foundIdx !== -1) {
      setDraggingIdx(foundIdx);
    } else {
      // Add new point
      const newPoints = [...points, { x: Math.round(x), y: Math.round(y) }].sort((a, b) => a.x - b.x);
      onChange({
        ...curve,
        [activeChannel]: newPoints,
      });
      const newIdx = newPoints.findIndex((pt) => pt.x === Math.round(x) && pt.y === Math.round(y));
      setDraggingIdx(newIdx);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingIdx === null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(255, Math.round(((e.clientX - rect.left) / rect.width) * 255)));
    const y = Math.max(0, Math.min(255, Math.round(255 - ((e.clientY - rect.top) / rect.height) * 255)));

    const updated = [...points];
    // First and last points stay locked to x=0 and x=255
    if (draggingIdx === 0) {
      updated[0] = { x: 0, y };
    } else if (draggingIdx === points.length - 1) {
      updated[points.length - 1] = { x: 255, y };
    } else {
      updated[draggingIdx] = { x, y };
    }

    onChange({
      ...curve,
      [activeChannel]: updated,
    });
  };

  const handleMouseUp = () => {
    setDraggingIdx(null);
  };

  return (
    <div className="space-y-3">
      {/* Channel Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 text-[11px]">
          {(['rgb', 'red', 'green', 'blue'] as const).map((ch) => (
            <button
              key={ch}
              onClick={() => setActiveChannel(ch)}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                activeChannel === ch
                  ? ch === 'rgb'
                    ? 'bg-slate-700 text-white'
                    : ch === 'red'
                    ? 'bg-red-600 text-white'
                    : ch === 'green'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {ch.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Presets */}
        <div className="flex items-center gap-1 text-[10px]">
          <button
            onClick={() => handlePreset('linear')}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            Linear
          </button>
          <button
            onClick={() => handlePreset('medium')}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            S-Curve
          </button>
          <button
            onClick={() => handlePreset('matte')}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            Matte Film
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-lg overflow-hidden border border-slate-800 cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={280}
          height={190}
          className="w-full h-44 block"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        <div className="absolute top-1 left-2 text-[9px] font-mono-num text-slate-500">Output</div>
        <div className="absolute bottom-1 right-2 text-[9px] font-mono-num text-slate-500">Input</div>
      </div>
      <p className="text-[10px] text-slate-400 text-center">
        Klik untuk tambah titik, geser titik untuk mengatur kurva nada.
      </p>
    </div>
  );
};
