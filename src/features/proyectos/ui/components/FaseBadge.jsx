// src/features/proyectos/ui/components/FaseBadge.jsx

import React from 'react';
import {
  FileText, Pen, Printer, Wrench, CheckCircle, Star
} from 'lucide-react';
import { getFaseConfig } from '../../domain/value-objects/FaseConfig.js';

const ICON_MAP = {
  FileText, Pen, Printer, Wrench, CheckCircle, Star,
};

/**
 * Badge visual para mostrar la fase actual de un proyecto.
 * Colores y etiquetas se toman de FaseConfig.
 *
 * @param {{ faseId: string, size?: 'sm' | 'md' }} props
 */
export function FaseBadge({ faseId, size = 'sm' }) {
  const config = getFaseConfig(faseId);
  if (!config) return null;

  const Icon = ICON_MAP[config.icon] || FileText;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold border
        ${isSm ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'}`}
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
        borderColor: config.color + '40',
      }}
    >
      <Icon size={isSm ? 11 : 13} strokeWidth={2.5} />
      {config.label}
    </span>
  );
}
