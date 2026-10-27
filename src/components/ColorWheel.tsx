import React from 'react';
import { ColorWheelGrade } from '../types/preset';

interface ColorWheelProps {
  label: string;
  grade: ColorWheelGrade;
  onChange: (grade: ColorWheelGrade) => void;
}

export const ColorWheel: React.FC<ColorWheelProps> = ({ label, grade, onChange }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  // Render color wheel
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 4;

    ctx.clearRect(0, 0, size, size);

    // Draw chromatic circle
    for (let angle = 0; angle < 360; angle += 2) {
      const startAngle = ((angle - 1) * Math.PI) / 180;
      const endAngle = ((angle + 2) * Math.PI) / 180;

      const grad = ctx.createRadialGradient(center, center, 0, center, center, radius);
      grad.addColorStop(0, '#334155');
      grad.addColorStop(1, `hsl(${angle}, 100%, 50%)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();
    }

    // Outer ring
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw indicator point
    const r = (grade.saturation / 100) * radius;
    const radAngle = (grade.hue * Math.PI) / 180;
    const px = center + r * Math.cos(radAngle);
    const py = center + r * Math.sin(radAngle);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [grade]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const size = rect.width;
    const center = size / 2;
    const radius = center - 4;

    const x = e.clientX - rect.left - center;
    const y = e.clientY - rect.top - center;

    const dist = Math.hypot(x, y);
    const sat = Math.min(100, Math.round((dist / radius) * 100));

    let angle = (Math.atan2(y, x) * 180) / Math.PI;
    if (angle < 0) angle += 360;

    onChange({
      ...grade,
      hue: Math.round(angle),
      saturation: sat,
    });
  };

  const handleReset = () => {
    onChange({ hue: 0, saturation: 0, luminance: 0 });
  };

  return (
    <div className="flex flex-col items-center p-2 rounded-lg bg-slate-900/60 border border-slate-800">
      <div className="flex items-center justify-between w-full mb-1">
        <span className="text-[11px] font-semibold text-slate-300">{label}</span>
        <button
          onClick={handleReset}
          className="text-[9px] text-slate-500 hover:text-amber-400 transition-colors"
          title="Reset"
        >
          Reset
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={80}
        height={80}
        onClick={handleCanvasClick}
        className="w-20 h-20 rounded-full cursor-pointer shadow-inner my-1"
      />

      <div className="w-full mt-2 space-y-1.5 text-[10px]">
        <div className="flex items-center justify-between text-slate-400">
          <span>Saturasi:</span>
          <span className="font-mono-num text-amber-400">{grade.saturation}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={grade.saturation}
          onChange={(e) => onChange({ ...grade, saturation: Number(e.target.value) })}
          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
        />

        <div className="flex items-center justify-between text-slate-400">
          <span>Luminans:</span>
          <span className="font-mono-num text-slate-300">{grade.luminance}</span>
        </div>
        <input
          type="range"
          min="-100"
          max="100"
          value={grade.luminance}
          onChange={(e) => onChange({ ...grade, luminance: Number(e.target.value) })}
          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
};
