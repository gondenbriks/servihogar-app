import React, { useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FinanceChartProps {
  data: number[];
  labels: string[];
  color?: string;
  height?: number;
  title?: string;
  subtitle?: string;
  showTooltips?: boolean;
}

const FinanceChart: React.FC<FinanceChartProps> = ({
  data,
  labels,
  color = '#00d4ff', // Default neon cyan
  height = 200,
  title,
  subtitle,
  showTooltips = true
}) => {
  const containerRef = useRef<SVGSVGElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; x: number; y: number } | null>(null);

  const padding = 20;
  const width = 400;
  const chartHeight = height;

  const points = useMemo(() => {
    if (data.length === 0) return [];
    const max = Math.max(...data) * 1.15;
    const min = 0;
    const range = max - min || 1;

    return data.map((val, index) => {
      const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
      const y = chartHeight - ((val - min) / range) * (chartHeight - padding * 2) - padding;
      return [x, y];
    });
  }, [data, chartHeight, width]);

  const pathData = useMemo(() => {
    if (points.length === 0) return '';
    let d = `M ${points[0][0]},${points[0][1]}`;

    for (let i = 0; i < points.length - 1; i++) {
      const [x0, y0] = points[i];
      const [x1, y1] = points[i + 1];
      const dx = (x1 - x0) * 0.4;
      d += ` C ${x0 + dx},${y0} ${x1 - dx},${y1} ${x1},${y1}`;
    }
    return d;
  }, [points]);

  const fillPathData = points.length > 0
    ? `${pathData} L ${points[points.length - 1][0]},${chartHeight} L ${points[0][0]},${chartHeight} Z`
    : '';

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !showTooltips) return;
    const svg = containerRef.current;
    const rect = svg.getBoundingClientRect();
    const touchX = ((e.clientX - rect.left) / rect.width) * width;

    let closestIndex = 0;
    let minDistance = Infinity;

    points.forEach((p, i) => {
      const dist = Math.abs(p[0] - touchX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }
    });

    setHoveredPoint({
      index: closestIndex,
      x: points[closestIndex][0],
      y: points[closestIndex][1]
    });
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div className="w-full bg-surface-dark/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-inner overflow-visible p-6 sm:p-8 transition-all hover:bg-surface-dark/60">
      {(title || subtitle) && (
        <div className="flex justify-between items-start mb-10">
          <div>
            {title && <h4 className="font-black text-[10px] text-gray-500 uppercase tracking-[0.3em] mb-1.5">{title}</h4>}
            {subtitle && <p className="text-xl font-black text-white tracking-tight italic">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-2xl border border-white/5 shadow-xl">
            <div className="size-2 rounded-full animate-pulse" style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}` }}></div>
            <span className="text-[9px] font-black text-gray-400 tracking-widest uppercase">Activo</span>
          </div>
        </div>
      )}

      <div className="w-full relative" style={{ height: `${height}px` }}>
        <svg
          ref={containerRef}
          viewBox={`0 0 ${width} ${chartHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={chartHeight - padding} x2={width - padding} y2={chartHeight - padding} stroke="white" strokeOpacity="0.05" strokeWidth="1" />

          {/* Hover Vertical Line */}
          {hoveredPoint && (
            <motion.line
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              x1={hoveredPoint.x} y1={padding} x2={hoveredPoint.x} y2={chartHeight - padding}
              stroke={color} strokeOpacity="0.2" strokeWidth="1" strokeDasharray="4 4"
            />
          )}

          <path d={fillPathData} fill={`url(#grad-${color.replace('#', '')})`} className="transition-all duration-700" />

          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}
          />

          {hoveredPoint && (
            <g>
              <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="8" fill={color} fillOpacity="0.2" />
              <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="4" fill="white" />
              <foreignObject x={hoveredPoint.x - 40} y={hoveredPoint.y - 45} width="80" height="30">
                <div className="flex justify-center">
                  <span className="bg-white text-black text-[10px] font-black px-3 py-1 rounded-full shadow-2xl border border-white/20">
                    ${data[hoveredPoint.index].toLocaleString()}
                  </span>
                </div>
              </foreignObject>
            </g>
          )}

          {!hoveredPoint && points.length > 0 && (
            <g>
              <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="12" fill={color} opacity="0.1" className="animate-ping" />
              <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="4" fill={color} />
            </g>
          )}
        </svg>

        {/* Labels with Responsive Behavior */}
        <div className="absolute -bottom-8 w-full flex justify-between px-[15px]">
          {labels.map((l, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={`h-1.5 w-[2px] mb-2 rounded-full ${hoveredPoint?.index === i ? 'text-white' : 'bg-white/10'}`} />
              <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-tighter transition-all duration-300 ${hoveredPoint?.index === i ? 'text-white scale-110' : 'text-gray-600'}`}>
                {l}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="h-10"></div>
    </div>
  );
};

export default FinanceChart;