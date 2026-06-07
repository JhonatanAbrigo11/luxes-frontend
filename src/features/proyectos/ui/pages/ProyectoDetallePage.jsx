// src/features/proyectos/ui/pages/ProyectoDetallePage.jsx

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ChevronRight, ChevronLeft, AlertTriangle,
  DollarSign, Calendar, Tag, User, Eye, X
} from 'lucide-react';
import { useProyecto } from '../../application/hooks/useProyecto.js';
import { FaseTimeline } from '../components/FaseTimeline.jsx';
import { FaseBadge } from '../components/FaseBadge.jsx';
import { ProgressBar } from '../components/ProgressBar.jsx';
import { InstalacionPanel } from '../components/InstalacionPanel.jsx';
import { CotizacionPanel } from '../components/CotizacionPanel.jsx';
import { DisenoPanel } from '../components/DisenoPanel.jsx';
import { ProduccionPanel } from '../components/ProduccionPanel.jsx';
import { EntregaPanel } from '../components/EntregaPanel.jsx';
import { CompletadoPanel } from '../components/CompletadoPanel.jsx';
import { SendSurveyModal } from '../components/SendSurveyModal.jsx';
import { PRIORIDADES_CONFIG, ESTADOS_CONFIG } from '../../domain/value-objects/EstadoProyecto.js';
import { getFaseConfig, FASES } from '../../domain/value-objects/FaseConfig.js';

export default function ProyectoDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { proyecto, avanzar, retroceder, validacionFaseActual } = useProyecto(id);
  const [faseVista, setFaseVista] = useState(null);
  const [confirmAvanzar, setConfirmAvanzar] = useState(false);
  const [confirmRetroceder, setConfirmRetroceder] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);

  if (!proyecto) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-slate-500">Proyecto no encontrado</p>
        <button onClick={() => navigate('/proyectos')} className="text-blue-600 underline text-sm">
          Volver a proyectos
        </button>
      </div>
    );
  }

  const faseActiva = faseVista || proyecto.faseActual;
  const esVistaSoloLectura = faseActiva !== proyecto.faseActual;

  const faseConfig = getFaseConfig(faseActiva);
  const faseActualConfig = getFaseConfig(proyecto.faseActual);
  const prioridadConfig = PRIORIDADES_CONFIG[proyecto.prioridad] || PRIORIDADES_CONFIG.MEDIA;
  const estadoConfig = ESTADOS_CONFIG[proyecto.estado] || ESTADOS_CONFIG.ACTIVO;
  const esUltimaFase = proyecto.faseActual === 'COMPLETADO';
  const esPrimeraFase = proyecto.faseActual === 'COTIZACION';

  const estaVencido =
    proyecto.fechaEntregaEstimada &&
    proyecto.estado !== 'COMPLETADO' &&
    new Date(proyecto.fechaEntregaEstimada) < new Date();

  const fasesCompletadas = FASES.filter(
    (f) => proyecto.fases?.[f.id]?.completada
  );

  const handleAvanzar = () => {
    if (proyecto.faseActual === 'ENTREGA') {
      setIsSurveyModalOpen(true);
    } else {
      avanzar();
    }
    setConfirmAvanzar(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20 shadow-sm">
        <div className="w-full mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/proyectos')}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-800">{proyecto.nombre}</h1>
                <button
                  onClick={() => setIsDetailsModalOpen(true)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Ver más detalles"
                >
                  <Eye size={16} />
                </button>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1" title="Cliente">
                  <User size={12} /> {proyecto.cliente.empresa} • {proyecto.cliente.nombre}
                </span>
                <span className="flex items-center gap-1" title="Entrega estimada">
                  <Calendar size={12} className={estaVencido ? 'text-red-500' : ''} /> 
                  <span className={estaVencido ? 'text-red-500 font-semibold' : 'font-medium'}>
                    {proyecto.fechaEntregaEstimada ? `Entrega: ${proyecto.fechaEntregaEstimada}` : 'Sin fecha'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: prioridadConfig.bgColor, color: prioridadConfig.textColor }}
            >
              {prioridadConfig.label}
            </span>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: estadoConfig.bgColor, color: estadoConfig.textColor }}
            >
              {estadoConfig.label}
            </span>
            <FaseBadge faseId={proyecto.faseActual} size="md" />
          </div>
        </div>
      </div>

      <div className="w-full mx-auto px-6 py-6 space-y-6">

        {/* Timeline + Progreso */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 overflow-x-auto">
              <FaseTimeline 
                faseActual={proyecto.faseActual} 
                fases={proyecto.fases} 
                faseVista={faseActiva}
                onFaseClick={(fId) => setFaseVista(fId)}
                requiereInstalacion={proyecto.requiereInstalacion}
              />
            </div>
          </div>
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">Progreso del proyecto</span>
              <span className="text-sm font-bold" style={{ color: faseConfig?.color }}>
                {proyecto.progreso}% — {faseConfig?.label}
              </span>
            </div>
            <ProgressBar progreso={proyecto.progreso} faseActual={proyecto.faseActual} height="h-4" />
          </div>
        </div>

        {/* Panel de fase actual / vista */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm relative">
          <div
            className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl"
            style={{ borderLeftColor: faseConfig?.color, borderLeftWidth: 4 }}
          >
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-bold text-slate-800">
                  {esVistaSoloLectura ? `Historial: ${faseConfig?.label}` : `Fase actual: ${faseConfig?.label}`}
                </h2>
                {esVistaSoloLectura && (
                  <button 
                    onClick={() => setFaseVista(proyecto.faseActual)}
                    className="text-[10px] font-bold bg-white text-slate-500 px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-100 transition-colors uppercase tracking-wider"
                  >
                    Ver actual
                  </button>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-0.5">{faseConfig?.descripcion}</p>
            </div>
            <FaseBadge faseId={faseActiva} />
          </div>

          <div className="p-6">
            {faseActiva === 'INSTALACION' ? (
              <InstalacionPanel proyectoId={proyecto.id} soloLectura={esVistaSoloLectura} />
            ) : faseActiva === 'COTIZACION' ? (
              <CotizacionPanel proyectoId={proyecto.id} soloLectura={esVistaSoloLectura} />
            ) : faseActiva === 'DISEÑO' ? (
              <DisenoPanel proyectoId={proyecto.id} soloLectura={esVistaSoloLectura} />
            ) : faseActiva === 'PRODUCCION' ? (
              <ProduccionPanel proyectoId={proyecto.id} soloLectura={esVistaSoloLectura} />
            ) : faseActiva === 'ENTREGA' ? (
              <EntregaPanel proyectoId={proyecto.id} soloLectura={esVistaSoloLectura} />
            ) : faseActiva === 'COMPLETADO' ? (
              <CompletadoPanel proyectoId={proyecto.id} soloLectura={esVistaSoloLectura} />
            ) : (
              <div
                className="rounded-xl p-4 text-sm"
                style={{ backgroundColor: faseConfig?.bgColor, color: faseConfig?.color }}
              >
                {faseConfig?.descripcion}
                {faseConfig?.camposRequeridos?.length > 0 && (
                  <ul className="mt-3 space-y-1 text-slate-600">
                    {faseConfig.camposRequeridos.map((campo) => (
                      <li key={campo} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full border-2 border-current inline-block" />
                        {campo}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Acciones de fase (Footer como en EditarFasePage) */}
          {!esVistaSoloLectura && (
            <div className="px-6 py-5 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-4 rounded-b-2xl">
              
              {/* Botón Retroceder (Izquierda) */}
              <div className="flex items-center">
              {!esPrimeraFase && (
                confirmRetroceder ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">¿Retroceder fase?</span>
                    <div className="flex gap-2">
                      <button onClick={() => setConfirmRetroceder(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-white transition-colors font-semibold">No</button>
                      <button onClick={() => { retroceder(); setConfirmRetroceder(false); }} className="px-4 py-2 bg-slate-700 text-white rounded-xl text-sm hover:bg-slate-800 transition-colors shadow-sm font-bold">Sí, retroceder</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmRetroceder(true)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors px-4 py-2 hover:bg-slate-200/50 rounded-xl"
                  >
                    <ChevronLeft size={16} />
                    Retroceder a la fase anterior
                  </button>
                )
              )}
            </div>

            {/* Botón Avanzar (Derecha) */}
            {!esUltimaFase && (
              <div className="flex flex-col items-end gap-2 relative group">
                {confirmAvanzar ? (
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-slate-600 font-medium hidden sm:block">¿Confirmas avanzar?</p>
                    <div className="flex gap-2">
                      <button onClick={() => setConfirmAvanzar(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-white transition-colors font-semibold">No</button>
                      <button
                        onClick={handleAvanzar}
                        className="px-6 py-2.5 rounded-xl text-sm text-white font-bold transition-colors shadow-sm"
                        style={{ backgroundColor: faseConfig?.color }}
                      >
                        Sí, confirmar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setConfirmAvanzar(true)}
                      disabled={!validacionFaseActual.valido}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: faseConfig?.color }}
                    >
                      Avanzar a siguiente fase
                      <ChevronRight size={16} />
                    </button>
                    
                    {/* Tooltip con campos faltantes */}
                    {!validacionFaseActual.valido && validacionFaseActual.faltantes.length > 0 && (
                      <div className="absolute bottom-full right-0 mb-3 hidden group-hover:block z-20">
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 shadow-lg min-w-[200px]">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <AlertTriangle size={14} className="text-amber-500" />
                            <p className="text-xs font-bold text-amber-700">Faltan campos para avanzar:</p>
                          </div>
                          <ul className="text-[10px] text-amber-600 space-y-0.5 ml-1">
                            {validacionFaseActual.faltantes.map((f) => (
                              <li key={f} className="flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-amber-500"></span> {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          )}
        </div>
      </div>

      {/* Modal de Detalles del Proyecto */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Eye size={18} className="text-blue-600" />
                Detalles del Proyecto
              </h2>
              <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Datos generales */}
              <div>
                <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Información General</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User size={16} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Cliente</p>
                      <p className="text-sm font-semibold text-slate-700">{proyecto.cliente.nombre}</p>
                      <p className="text-xs text-slate-500">{proyecto.cliente.empresa}</p>
                      {proyecto.cliente.telefono && <p className="text-xs text-slate-500">{proyecto.cliente.telefono}</p>}
                      {proyecto.cliente.email && <p className="text-xs text-blue-600">{proyecto.cliente.email}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign size={16} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Monto estimado</p>
                      <p className="text-sm font-bold text-slate-700">${proyecto.montoEstimado.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Entrega estimada</p>
                      <p className={`text-sm font-medium ${estaVencido ? 'text-red-500' : 'text-slate-700'}`}>
                        {estaVencido && <AlertTriangle size={12} className="inline mr-1" />}
                        {proyecto.fechaEntregaEstimada || 'Sin fecha'}
                      </p>
                    </div>
                  </div>
                  {proyecto.etiquetas?.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Tag size={16} className="text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">Etiquetas</p>
                        <div className="flex flex-wrap gap-1.5">
                          {proyecto.etiquetas.map((tag) => (
                            <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {proyecto.descripcion && (
                    <div className="pt-3 border-t border-slate-100 text-sm text-slate-600">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">Descripción del trabajo</p>
                      {proyecto.descripcion}
                    </div>
                  )}

                  {/* Gastos del Proyecto */}
                  <div className="pt-3 border-t border-slate-100 text-sm">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">Gastos Registrados</p>
                    {proyecto.gastos && proyecto.gastos.length > 0 ? (
                      <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                        {proyecto.gastos.map((gasto) => (
                          <div key={gasto.id} className="flex justify-between items-center text-xs p-2 bg-slate-50 border border-slate-100 rounded-lg">
                            <div>
                              <p className="font-semibold text-slate-700">{gasto.concepto}</p>
                              <p className="text-[10px] text-slate-400">{gasto.fecha}</p>
                            </div>
                            <span className="font-bold text-red-600">-${gasto.monto.toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center pt-1.5 border-t border-slate-200 text-xs font-bold text-slate-700">
                          <span>Total Gastos:</span>
                          <span className="text-red-700">
                            -${proyecto.gastos.reduce((sum, g) => sum + g.monto, 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No hay gastos registrados aún en este proyecto.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Historial de fases */}
              <div>
                <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Historial de Fases</h3>
                {fasesCompletadas.length === 0 ? (
                  <p className="text-sm text-slate-400 bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">Sin fases completadas aún.</p>
                ) : (
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {fasesCompletadas.map((fase) => {
                      const config = getFaseConfig(fase.id);
                      const datos = proyecto.fases[fase.id];
                      return (
                        <div key={fase.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div
                            className="w-4 h-4 rounded-full shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow flex items-center justify-center z-10"
                            style={{ backgroundColor: config?.color }}
                          >
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          </div>
                          
                          <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                            <p className="text-sm font-bold text-slate-700">{config?.label}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{datos.fechaCompletada}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Encuesta */}
      <SendSurveyModal
        isOpen={isSurveyModalOpen}
        onClose={() => setIsSurveyModalOpen(false)}
        proyecto={proyecto}
        onConfirm={() => {
          setIsSurveyModalOpen(false);
          avanzar();
        }}
      />
    </div>
  );
}
