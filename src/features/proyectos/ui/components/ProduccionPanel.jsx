import React, { useState } from 'react';
import { Printer, PlayCircle, CheckCircle, Clock, AlertTriangle, Layers, Tag, Send, XCircle, User } from 'lucide-react';
import { useProyecto } from '../../application/hooks/useProyecto.js';
import { usePrintQueue } from '../../../colas-impresion/context/PrintQueueContext.jsx';

export function ProduccionPanel({ proyectoId }) {
  const { proyecto } = useProyecto(proyectoId);
  const { getJobsByProyectoId } = usePrintQueue();
  const [fechaInicio, setFechaInicio] = useState(proyecto?.fases?.PRODUCCION?.fechaInicioProduccion || '');
  const [nuevoMaterial, setNuevoMaterial] = useState('');
  const [materiales, setMateriales] = useState(proyecto?.fases?.PRODUCCION?.materialesProduccion || ['Estructura Metálica', 'Luces LED']);

  // Get real print jobs linked to this project
  const linkedJobs = getJobsByProyectoId(proyectoId);

  const handleStartProduccion = () => {
    const hoy = new Date().toISOString().split('T')[0];
    setFechaInicio(hoy);
  };

  const handleAddMaterial = (e) => {
    if (e.key === 'Enter' && nuevoMaterial.trim() !== '') {
      e.preventDefault();
      setMateriales([...materiales, nuevoMaterial.trim()]);
      setNuevoMaterial('');
    }
  };

  const handleRemoveMaterial = (index) => {
    setMateriales(materiales.filter((_, i) => i !== index));
  };

  const getStatusConfig = (estado) => {
    switch(estado) {
      case 'Completado': return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle, bar: 'bg-emerald-500', dotColor: '#10b981' };
      case 'Imprimiendo': return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: PlayCircle, bar: 'bg-blue-500', dotColor: '#3b82f6' };
      case 'En espera': return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock, bar: 'bg-slate-200', dotColor: '#f59e0b' };
      case 'Pausado': return { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', icon: Clock, bar: 'bg-slate-200', dotColor: '#64748b' };
      case 'Cancelado': return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: XCircle, bar: 'bg-red-400', dotColor: '#ef4444' };
      default: return { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', icon: AlertTriangle, bar: 'bg-slate-200', dotColor: '#94a3b8' };
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-8">
      {/* 1. Control de Producción y Materiales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Iniciar Producción */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
            <PlayCircle size={18} className="text-blue-500" />
            Inicio de Producción
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Registra el inicio oficial de la producción para medir tiempos de entrega.
          </p>
          
          {fechaInicio ? (
            <div className="flex items-center gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <CheckCircle size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Producción en marcha</p>
                <p className="text-xs text-slate-500 mt-0.5">Iniciada el {fechaInicio}</p>
              </div>
            </div>
          ) : (
            <button 
              onClick={handleStartProduccion}
              className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <PlayCircle size={18} />
              Iniciar Producción Hoy
            </button>
          )}
        </div>

        {/* Materiales Extra (Estructuras, etc) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Layers size={18} className="text-orange-500" />
            Materiales y Requerimientos
          </h3>
          <div className="mb-3">
            <input
              type="text"
              value={nuevoMaterial}
              onChange={(e) => setNuevoMaterial(e.target.value)}
              onKeyDown={handleAddMaterial}
              placeholder="Ej. Pintura acrílica, tubos cuadrados (Presiona Enter)"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {materiales.map((mat, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-xs font-semibold">
                <Tag size={12} />
                {mat}
                <button onClick={() => handleRemoveMaterial(i)} className="ml-1 text-orange-400 hover:text-orange-600">
                  &times;
                </button>
              </span>
            ))}
            {materiales.length === 0 && <p className="text-xs text-slate-400 italic">No hay materiales extra registrados.</p>}
          </div>
        </div>
      </div>

      {/* 2. Timeline de Impresiones Vinculadas */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Printer size={18} className="text-purple-500" />
            Timeline de Impresiones
          </h3>
          <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">
            {linkedJobs.length} {linkedJobs.length === 1 ? 'trabajo' : 'trabajos'} vinculados
          </span>
        </div>

        {linkedJobs.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 bg-white border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Printer size={24} className="text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Sin impresiones vinculadas</p>
            <p className="text-xs text-slate-400">
              Envía un trabajo desde el módulo de <strong>Impresiones</strong> seleccionando este proyecto para ver el timeline aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {linkedJobs.map((job) => {
              const config = getStatusConfig(job.trackingStatus);
              const StatusIcon = config.icon;

              return (
                <div key={job.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  {/* Job Header */}
                  <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${config.bg} ${config.color}`}>
                        <StatusIcon size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{job.name}</h4>
                        <p className="text-xs text-slate-500">{job.copies} cop. • {job.format} • {job.size}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md ${config.bg} ${config.color} border ${config.border}`}>
                      {job.trackingStatus}
                    </span>
                  </div>

                  {/* Timeline Events */}
                  <div className="px-5 py-4">
                    <div className="relative pl-6 space-y-4">
                      {/* Vertical line */}
                      <div className="absolute left-[9px] top-1 bottom-1 w-0.5 bg-slate-200 rounded-full" />

                      {/* Event: Enviado a Cola */}
                      {job.sentToQueueAt && (
                        <div className="relative flex items-start gap-3">
                          <div className="absolute left-[-15px] top-0.5 w-3 h-3 rounded-full bg-amber-400 border-2 border-white shadow-sm z-10" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Send size={12} className="text-amber-500 shrink-0" />
                              <span className="text-xs font-bold text-slate-700">Enviado a taller</span>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-[11px] text-slate-500">{job.sentToQueueAt}</span>
                              {job.sentBy && (
                                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                  <User size={10} /> {job.sentBy}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Event: Impresión Iniciada */}
                      {job.startedPrintingAt && (
                        <div className="relative flex items-start gap-3">
                          <div className="absolute left-[-15px] top-0.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm z-10" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <PlayCircle size={12} className="text-blue-500 shrink-0" />
                              <span className="text-xs font-bold text-slate-700">Impresión iniciada</span>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-[11px] text-slate-500">{job.startedPrintingAt}</span>
                              {job.responsible && (
                                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                  <User size={10} /> {job.responsible}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Event: Completado / Cancelado */}
                      {job.completedAt && (
                        <div className="relative flex items-start gap-3">
                          <div 
                            className="absolute left-[-15px] top-0.5 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10"
                            style={{ backgroundColor: config.dotColor }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {job.trackingStatus === 'Cancelado' ? (
                                <XCircle size={12} className="text-red-500 shrink-0" />
                              ) : (
                                <CheckCircle size={12} className="text-emerald-500 shrink-0" />
                              )}
                              <span className="text-xs font-bold text-slate-700">
                                {job.trackingStatus === 'Cancelado' ? 'Cancelado' : 'Impresión finalizada'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-[11px] text-slate-500">{job.completedAt}</span>
                              {job.elapsedSeconds > 0 && (
                                <span className="text-[11px] text-slate-400">
                                  Duración: {formatDuration(job.elapsedSeconds)}
                                </span>
                              )}
                            </div>
                            {job.trackingStatus === 'Cancelado' && job.cancelReason && (
                              <div className="mt-1.5 px-2.5 py-1.5 bg-red-50 border-l-3 border-red-400 rounded text-[11px] text-red-600" style={{ borderLeft: '3px solid #f87171' }}>
                                <strong>Motivo:</strong> {job.cancelReason}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Pending state for jobs still in queue or printing */}
                      {!job.completedAt && job.trackingStatus !== 'Cancelado' && (
                        <div className="relative flex items-start gap-3">
                          <div className="absolute left-[-15px] top-0.5 w-3 h-3 rounded-full bg-slate-300 border-2 border-white shadow-sm z-10 animate-pulse" />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-medium text-slate-400 italic">
                              {job.trackingStatus === 'Imprimiendo' ? 'Imprimiendo ahora...' : 'En espera de impresión...'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
