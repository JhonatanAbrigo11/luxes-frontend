// src/features/proyectos/ui/components/ProgressBar.jsx

import React, { useEffect, useState } from 'react';
import { getFaseConfig } from '../../domain/value-objects/FaseConfig.js';

/**
 * Barra de progreso animada. El color se toma de la fase actual.
 *
 * @param {{ progreso: number, faseActual: string, showLabel?: boolean, height?: string }} props
 */
export function ProgressBar({ progreso = 0, faseActual, showLabel = false, height = 'h-2.5' }) {
  const [width, setWidth] = useState(0);
  const faseConfig = getFaseConfig(faseActual);
  const color = faseConfig?.color || '#1e40af';

  useEffect(() => {
    const t = requestAnimationFrame(() => setWidth(progreso));
    return () => cancelAnimationFrame(t);
  }, [progreso]);

  return (
    <div className="flex items-center gap-2 w-full">
      <div className={`flex-1 bg-slate-200 rounded-full overflow-hidden ${height}`}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-slate-600 min-w-[36px] text-right">
          {progreso}%
        </span>
      )}
    </div>
  );
}
