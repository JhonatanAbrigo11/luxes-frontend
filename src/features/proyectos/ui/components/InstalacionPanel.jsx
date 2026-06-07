// src/features/proyectos/ui/components/InstalacionPanel.jsx

import React, { useState } from 'react';
import { 
  MapPin, Calendar, Users, Package, StickyNote, CheckCircle, 
  PlayCircle, AlertTriangle, FileText, CheckCircle2, X, Printer,
  HelpCircle, Eye, Wrench
} from 'lucide-react';
import { PersonalSelector } from './PersonalSelector.jsx';
import { MaterialesForm } from './MaterialesForm.jsx';
import { useInstalacion } from '../../application/hooks/useInstalacion.js';
import { useProyectosContext } from '../../application/context/ProyectosContext.jsx';
import { ACTIONS } from '../../application/store/proyectosStore.js';
import { PDFPreviewModal } from '../../../../shared/ui/components/PDFPreviewModal.jsx';

const SECCIONES = ['datos', 'personal', 'materiales', 'compras', 'estado'];

/**
 * Panel completo de la fase de Instalación.
 * Divide la gestión en 4 secciones: datos, personal, materiales y estado.
 *
 * @param {{ proyectoId: string }} props
 */
export function InstalacionPanel({ proyectoId }) {
  const {
    proyecto,
    datosInstalacion,
    empleados,
    personalAsignado,
    materiales,
    setPersonal,
    setMateriales,
    actualizarDatos,
  } = useInstalacion(proyectoId);

  const [seccionActiva, setSeccionActiva] = useState('datos');
  const { state, dispatch } = useProyectosContext();
  const [aprobaciones, setAprobaciones] = useState({}); // { [sku]: cantidad }
  const [comentarioOC, setComentarioOC] = useState('');
  const [printableOC, setPrintableOC] = useState(null); // OC a imprimir
  const ordenesProyecto = (state.ordenesCompra || []).filter(oc => oc.proyectoId === proyectoId);

  // Custom Modal dialog state
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success', // 'success' | 'error' | 'confirm'
    onConfirm: null
  });

  const showModal = (title, message, type = 'success', onConfirm = null) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type,
      onConfirm
    });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  function handleRechazarOC(oc) {
    showModal(
      'Confirmar Rechazo',
      `¿Estás seguro de que deseas rechazar la solicitud de orden de compra ${oc.id}?`,
      'confirm',
      () => {
        dispatch({
          type: ACTIONS.RECHAZAR_ORDEN_COMPRA,
          payload: { id: oc.id }
        });

        // Guardar en localStorage
        const stored = localStorage.getItem('luxes_ordenes_compra');
        if (stored) {
          try {
            const list = JSON.parse(stored);
            const updated = list.map(o => o.id === oc.id ? { ...o, estado: 'RECHAZADA', comentarios: comentarioOC } : o);
            localStorage.setItem('luxes_ordenes_compra', JSON.stringify(updated));
          } catch (e) {
            console.error(e);
          }
        }

        setComentarioOC('');
        setAprobaciones({});
        showModal('Rechazo Exitoso', `La orden de compra ${oc.id} ha sido rechazada.`, 'success');
      }
    );
  }

  function handleAprobarOC(oc) {
    let costoTotal = 0;
    const itemsActualizados = oc.items.map(item => {
      const qtyAprobada = aprobaciones[item.sku] !== undefined ? aprobaciones[item.sku] : item.cantidadSolicitada;
      costoTotal += qtyAprobada * item.precioUnitario;
      return {
        ...item,
        cantidadAprobada: qtyAprobada
      };
    });

    const materialesAprobados = itemsActualizados
      .filter(item => item.cantidadAprobada > 0)
      .map(item => ({
        nombre: item.nombre,
        sku: item.sku,
        cantidad: item.cantidadAprobada,
        unidad: item.unidad,
        observacion: `Aprobado Compra (${oc.id})`,
        origen: 'compra'
      }));

    const nuevosMateriales = [...(proyecto?.fases?.INSTALACION?.datos?.materiales || []), ...materialesAprobados];

    const gastosExistentes = proyecto?.gastos || [];
    const nuevoGasto = {
      id: `G-${Date.now()}`,
      concepto: `Materiales de Instalación - ${oc.id}`,
      monto: costoTotal,
      fecha: new Date().toISOString().split('T')[0]
    };
    const nuevosGastos = [...gastosExistentes, nuevoGasto];

    // Actualizar proyecto en el store
    dispatch({
      type: ACTIONS.UPDATE_PROYECTO,
      payload: {
        id: proyecto.id,
        cambios: {
          gastos: nuevosGastos,
          fases: {
            ...proyecto.fases,
            INSTALACION: {
              ...proyecto.fases?.INSTALACION,
              datos: {
                ...proyecto.fases?.INSTALACION?.datos,
                materiales: nuevosMateriales
              }
            }
          }
        }
      }
    });

    // Actualizar orden de compra en el store
    dispatch({
      type: ACTIONS.APROBAR_ORDEN_COMPRA,
      payload: {
        id: oc.id,
        items: itemsActualizados
      }
    });

    // Guardar en localStorage con los comentarios actualizados
    const stored = localStorage.getItem('luxes_ordenes_compra');
    if (stored) {
      try {
        const list = JSON.parse(stored);
        const updated = list.map(o => o.id === oc.id ? { ...o, estado: 'APROBADA', items: itemsActualizados, comentarios: comentarioOC } : o);
        localStorage.setItem('luxes_ordenes_compra', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    }

    setComentarioOC('');
    setAprobaciones({});
    showModal(
      'Compra Aprobada', 
      `Orden de compra ${oc.id} aprobada con éxito. Se registró un gasto de $${costoTotal.toFixed(2)} en el proyecto.`, 
      'success'
    );
  }

  function handleDatos(e) {
    const { name, value } = e.target;
    actualizarDatos({ [name]: value });
  }

  const tabs = [
    { id: 'datos', label: 'Datos', Icon: MapPin },
    { id: 'personal', label: 'Personal', Icon: Users },
    { id: 'materiales', label: 'Materiales', Icon: Package },
    { id: 'compras', label: 'Ordenes de Compra', Icon: FileText },
    { id: 'estado', label: 'Estado', Icon: CheckCircle },
  ];

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl">
      {/* Tabs internas */}
      <div className="flex border-b border-indigo-200 bg-white">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setSeccionActiva(id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors border-b-2
              ${seccionActiva === id
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {/* ── Sección 1: Datos ── */}
        {seccionActiva === 'datos' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                <PlayCircle size={18} className="text-indigo-500" />
                Arranque de Instalación
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Registra la hora y fecha exacta en la que el equipo inicia las labores de instalación en el sitio.
              </p>
              
              {datosInstalacion.fechaInstalacion && datosInstalacion.horaInstalacion ? (
                <div className="flex items-center gap-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <CheckCircle size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Instalación en marcha</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Inició el {datosInstalacion.fechaInstalacion} a las {datosInstalacion.horaInstalacion}
                    </p>
                  </div>
                  <button 
                    onClick={() => actualizarDatos({ fechaInstalacion: '', horaInstalacion: '' })}
                    className="ml-auto px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm"
                  >
                    Deshacer
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    const now = new Date();
                    actualizarDatos({ 
                      fechaInstalacion: now.toISOString().split('T')[0],
                      horaInstalacion: now.toTimeString().slice(0, 5),
                      direccionInstalacion: datosInstalacion.direccionInstalacion || proyecto?.cliente?.direccion || ''
                    });
                  }}
                  className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <PlayCircle size={18} />
                  Iniciar Instalación Ahora
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                Dirección Completa
              </label>
              <input
                type="text"
                name="direccionInstalacion"
                defaultValue={datosInstalacion.direccionInstalacion || proyecto?.cliente?.direccion || ''}
                onBlur={handleDatos}
                placeholder="Ej: Av. Libertad 123, sector norte, Guayaquil"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                Notas de la Instalación
              </label>
              <textarea
                name="notas"
                rows={3}
                defaultValue={datosInstalacion.notas || ''}
                onBlur={handleDatos}
                placeholder="Instrucciones especiales, acceso, contacto en sitio..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
            </div>
          </div>
        )}

        {/* ── Sección 2: Personal ── */}
        {seccionActiva === 'personal' && (
          <div>
            <p className="text-xs text-slate-500 mb-3">
              Selecciona el equipo y asigna el rol de cada persona en la instalación.
            </p>
            <PersonalSelector
              empleados={empleados}
              personalAsignado={personalAsignado}
              onChange={setPersonal}
            />
          </div>
        )}

        {/* ── Sección 3: Materiales ── */}
        {seccionActiva === 'materiales' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-2">
                <Package size={16} className="text-indigo-500" />
                Materiales Registrados por el Instalador
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Materiales consumidos del stock de inventario o adquiridos mediante compras externas aprobadas.
              </p>

              {materiales.filter(m => m.origen === 'compra' || m.origen === 'inventario').length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Ningún material de consumo registrado aún por el instalador.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <th className="p-2.5 font-bold uppercase tracking-wider">SKU</th>
                        <th className="p-2.5 font-bold uppercase tracking-wider">Descripción</th>
                        <th className="p-2.5 font-bold uppercase tracking-wider text-center">Cantidad</th>
                        <th className="p-2.5 font-bold uppercase tracking-wider text-center">Origen</th>
                        <th className="p-2.5 font-bold uppercase tracking-wider">Observaciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materiales
                        .filter(m => m.origen === 'compra' || m.origen === 'inventario')
                        .map((m, idx) => (
                          <tr key={idx} className="border-b border-slate-100 text-slate-600">
                            <td className="p-2.5 font-mono text-[10px]">{m.sku || 'ESPECIAL'}</td>
                            <td className="p-2.5 font-semibold text-slate-700">{m.nombre}</td>
                            <td className="p-2.5 text-center font-bold">{m.cantidad} {m.unidad}s</td>
                            <td className="p-2.5 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                m.origen === 'compra' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-sky-50 text-sky-700 border border-sky-100'
                              }`}>
                                {m.origen === 'compra' ? 'Compra' : 'Stock'}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-500 italic">{m.observacion}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-2">
                <Wrench size={16} className="text-indigo-500" />
                Herramientas y Consumibles de Taller Asignados
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Asigna herramientas del inventario central para el equipo de montaje asignado al proyecto.
              </p>
              <MaterialesForm 
                materiales={materiales.filter(m => m.inventarioId)} 
                onChange={(nuevasHerramientas) => {
                  const otrosMateriales = materiales.filter(m => !m.inventarioId);
                  setMateriales([...otrosMateriales, ...nuevasHerramientas]);
                }} 
              />
            </div>
          </div>
        )}

        {/* ── Sección 4: Ordenes de Compra ── */}
        {seccionActiva === 'compras' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FileText size={18} className="text-indigo-500" />
                Gestión de Órdenes de Compra
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Revisa, aprueba, rechaza e imprime las solicitudes de compra generadas por el equipo en sitio.
              </p>
            </div>

            {ordenesProyecto.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
                <FileText size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-semibold text-slate-700">No hay órdenes de compra registradas</p>
                <p className="text-xs text-slate-400 mt-1">El personal de taller aún no ha solicitado materiales externos para este proyecto.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {ordenesProyecto.map((oc) => {
                  const isPendiente = oc.estado === 'PENDIENTE';
                  const isAprobada = oc.estado === 'APROBADA';
                  const totalOC = oc.items?.reduce(
                    (sum, item) => sum + ((isPendiente ? item.cantidadSolicitada : (item.cantidadAprobada || 0)) * item.precioUnitario),
                    0
                  ) || 0;

                  return (
                    <div key={oc.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                      {/* Header de la OC */}
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-slate-800">{oc.id}</span>
                          <span className="text-xs text-slate-400">• Solicitado: {oc.fechaCreacion}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            isPendiente ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            isAprobada ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {oc.estado}
                          </span>
                          <button
                            type="button"
                            onClick={() => setPrintableOC(oc)}
                            className="px-2.5 py-1.5 hover:bg-slate-50 rounded-lg text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1.5 text-xs font-bold border border-slate-200 shadow-sm bg-white cursor-pointer"
                            title="Vista Previa / Imprimir PDF"
                          >
                            <Eye size={14} />
                            Ver / Imprimir OC
                          </button>
                        </div>
                      </div>

                      {/* Lista de Items */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                              <th className="p-2 font-bold uppercase tracking-wider">SKU</th>
                              <th className="p-2 font-bold uppercase tracking-wider">Material</th>
                              <th className="p-2 font-bold uppercase tracking-wider text-center">Cant. Solicitada</th>
                              <th className="p-2 font-bold uppercase tracking-wider text-center">Cant. Aprobar</th>
                              <th className="p-2 font-bold uppercase tracking-wider text-right">Precio Unit.</th>
                              <th className="p-2 font-bold uppercase tracking-wider text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {oc.items.map((item, idx) => {
                              const qtyAprob = aprobaciones[item.sku] !== undefined ? aprobaciones[item.sku] : item.cantidadSolicitada;
                              const currentQty = isPendiente ? qtyAprob : (item.cantidadAprobada || 0);
                              const subtotal = currentQty * item.precioUnitario;

                              return (
                                <tr key={idx} className="border-b border-slate-100 text-slate-600">
                                  <td className="p-2 font-mono text-[10px]">{item.sku}</td>
                                  <td className="p-2 font-semibold text-slate-700">{item.nombre}</td>
                                  <td className="p-2 text-center font-medium">{item.cantidadSolicitada} {item.unidad}s</td>
                                  <td className="p-2 text-center">
                                    {isPendiente ? (
                                      <input
                                        type="number"
                                        min="0"
                                        max={item.cantidadSolicitada}
                                        value={qtyAprob}
                                        onChange={(e) => {
                                          const val = Math.max(0, parseInt(e.target.value) || 0);
                                          setAprobaciones(prev => ({ ...prev, [item.sku]: val }));
                                        }}
                                        className="w-16 border border-slate-200 rounded-lg px-2 py-1 text-xs text-center font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                                      />
                                    ) : (
                                      <span className="font-bold text-slate-800">
                                        {oc.estado === 'APROBADA' ? `${item.cantidadAprobada} ${item.unidad}s` : '-'}
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-2 text-right">${item.precioUnitario.toFixed(2)}</td>
                                  <td className="p-2 text-right font-bold text-slate-700">${subtotal.toFixed(2)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr className="font-bold text-slate-800 bg-slate-50/50">
                              <td colSpan="5" className="p-2 text-right uppercase tracking-wider text-[10px]">Costo Total:</td>
                              <td className="p-2 text-right text-sm font-extrabold text-indigo-900">
                                ${totalOC.toFixed(2)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {/* Sección de Aprobación / Comentarios */}
                      {isPendiente ? (
                        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 space-y-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                              Comentarios / Observaciones de la Aprobación
                            </label>
                            <textarea
                              value={comentarioOC}
                              onChange={(e) => setComentarioOC(e.target.value)}
                              placeholder="Escribe el motivo de la aprobación, modificaciones en cantidades o comentarios para compras..."
                              className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                              rows={2}
                            />
                          </div>

                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => handleRechazarOC(oc)}
                              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-lg border border-red-200 shadow-sm transition-colors cursor-pointer"
                            >
                              Rechazar Solicitud
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAprobarOC(oc)}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
                            >
                              Aprobar y Registrar Gasto
                            </button>
                          </div>
                        </div>
                      ) : (
                        oc.comentarios && (
                          <div className="bg-slate-50 border-l-4 border-slate-300 p-3 rounded-r-lg text-xs text-slate-600">
                            <strong>Comentario de Administración:</strong> {oc.comentarios}
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Sección 5: Estado ── */}
        {seccionActiva === 'estado' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-slate-200">
              <input
                type="checkbox"
                id="instalacion-completada"
                checked={datosInstalacion.instalacionCompletada || false}
                onChange={(e) => actualizarDatos({ instalacionCompletada: e.target.checked })}
                className="accent-indigo-500 w-5 h-5"
              />
              <label htmlFor="instalacion-completada" className="text-sm font-semibold text-slate-700 cursor-pointer">
                Instalación completada en sitio
              </label>
            </div>

            {datosInstalacion.instalacionCompletada && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  Notas de cierre
                </label>
                <textarea
                  name="notasCierre"
                  rows={3}
                  defaultValue={datosInstalacion.notasCierre || ''}
                  onBlur={handleDatos}
                  placeholder="Observaciones al finalizar, problemas encontrados, etc."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visor Reutilizable de PDF */}
      <PDFPreviewModal
        isOpen={!!printableOC}
        onClose={() => setPrintableOC(null)}
        oc={printableOC}
        proyecto={proyecto}
        title="Orden de Compra"
      />

      {/* Modal Dialog de Alertas (Reemplazo de alert nativo) */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden flex flex-col p-6 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2.5 rounded-full ${
                modalConfig.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                modalConfig.type === 'error' ? 'bg-red-50 text-red-600' :
                'bg-amber-50 text-amber-600'
              }`}>
                {modalConfig.type === 'success' && <CheckCircle2 size={22} />}
                {modalConfig.type === 'error' && <AlertTriangle size={22} />}
                {modalConfig.type === 'confirm' && <HelpCircle size={22} />}
              </div>
              <h3 className="font-extrabold text-slate-800 text-lg">{modalConfig.title}</h3>
            </div>
            
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">{modalConfig.message}</p>
            
            <div className="flex gap-2 justify-end">
              {modalConfig.type === 'confirm' && (
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  closeModal();
                  if (modalConfig.onConfirm) {
                    modalConfig.onConfirm();
                  }
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
