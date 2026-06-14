import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { getOrdenes, updateOrden } from '../../application/comprasService';
import { toast } from '../../../../shared/ui/components/Toast';
import { PDFPreviewModal } from '../../../../shared/ui/components/PDFPreviewModal.jsx';
import './ComprasPage.css';

const ESTADO_BADGES = {
  pendiente_aprobacion: { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b', label: 'Pendiente Aprobación' },
  aprobada:             { bg: 'rgba(59,130,246,0.1)',   color: '#3b82f6', label: 'Aprobada' },
  recibida:             { bg: 'rgba(16,185,129,0.1)',   color: '#10b981', label: 'Recibida' },
  cancelada:            { bg: 'rgba(239,68,68,0.08)',   color: '#ef4444', label: 'Rechazada' },
};

const fmt = (n) => '$' + Number(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-EC', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

// Helper function to map our database OrdenCompra object to the expected format for PDFPreviewModal
const mapOrdenToPDFFormat = (orden) => {
  if (!orden) return null;
  return {
    id: orden.numero,
    fechaCreacion: orden.fecha ? new Date(orden.fecha).toISOString().split('T')[0] : '',
    estado: (orden.estado || 'PENDIENTE').toUpperCase(),
    proyectoNombre: orden.concepto || 'Compra de Materiales',
    comentarios: orden.notas || 'Sin observaciones.',
    items: (orden.detalles || []).map(d => ({
      sku: d.materialId ? d.materialId.slice(-8).toUpperCase() : 'ESP-LIBRE',
      nombre: d.descripcion,
      cantidad: d.cantidad,
      precioUnitario: d.precioUnitario,
      unidad: 'unidad'
    }))
  };
};

export const AprobacionOrdenesPage = () => {
  const navigate = useNavigate();
  const [currentUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const userRole = (currentUser?.rol || '').toLowerCase();
  const isAdmin = userRole === 'admin' || userRole === 'administrador';
  const hasAprobacionPermission = currentUser?.permissions?.includes('aprobacion_ordenes_compra') || isAdmin;

  // Redirect if not authorized
  useEffect(() => {
    if (!hasAprobacionPermission) {
      toast.error('No tienes permisos para acceder a esta página');
      navigate('/compras');
    }
  }, [hasAprobacionPermission, navigate]);

  // ── States ──
  const [ordenes, setOrdenes] = useState([]);
  const [ordenPage, setOrdenPage] = useState(1);
  const [ordenTotal, setOrdenTotal] = useState(0);
  const [ordenSearch, setOrdenSearch] = useState('');
  const [ordenLoading, setOrdenLoading] = useState(true);
  const [estadoFilter, setEstadoFilter] = useState('pendiente_aprobacion'); // 'pendiente_aprobacion' or 'todas'
  const perPage = 8;

  // Custom Confirmations
  const [confirmAprobarOpen, setConfirmAprobarOpen] = useState(false);
  const [confirmAprobarOrden, setConfirmAprobarOrden] = useState(null);
  const [confirmSaving, setConfirmSaving] = useState(false);

  // Custom Rejections
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectOrden, setRejectOrden] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectSaving, setRejectSaving] = useState(false);

  // PDF Preview
  const [isPDFOpen, setIsPDFOpen] = useState(false);
  const [previewOC, setPreviewOC] = useState(null);

  // View Rejection Reason Modal
  const [viewReasonOpen, setViewReasonOpen] = useState(false);
  const [viewReasonText, setViewReasonText] = useState('');
  const [viewReasonNumero, setViewReasonNumero] = useState('');

  const openViewReasonModal = (notas, numero) => {
    setViewReasonText(notas);
    setViewReasonNumero(numero);
    setViewReasonOpen(true);
  };

  const searchTimer = useRef(null);

  const loadOrdenes = useCallback(async () => {
    setOrdenLoading(true);
    try {
      const data = await getOrdenes({
        page: ordenPage,
        limit: perPage,
        search: ordenSearch || undefined,
        estado: estadoFilter === 'todas' ? undefined : estadoFilter
      });
      setOrdenes(data.items || []);
      setOrdenTotal(data.total || 0);
    } catch (err) {
      setOrdenes([]);
      setOrdenTotal(0);
      toast.error('Error al cargar las órdenes para aprobación');
    } finally {
      setOrdenLoading(false);
    }
  }, [ordenPage, ordenSearch, estadoFilter]);

  useEffect(() => {
    if (hasAprobacionPermission) {
      loadOrdenes();
    }
  }, [hasAprobacionPermission, loadOrdenes]);

  // ── Search debounce ──
  const handleOrdenSearchChange = (e) => {
    const val = e.target.value;
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setOrdenSearch(val); setOrdenPage(1); }, 350);
  };

  // Approval Process
  const openConfirmAprobar = (orden) => {
    setConfirmAprobarOrden(orden);
    setConfirmAprobarOpen(true);
  };

  const handleAprobarSubmit = async (e) => {
    e.preventDefault();
    setConfirmSaving(true);
    try {
      await updateOrden(confirmAprobarOrden.id, { estado: 'aprobada' });
      toast.success('Orden de compra aprobada con éxito');
      setConfirmAprobarOpen(false);
      loadOrdenes();
    } catch (err) {
      toast.error('Error al aprobar orden: ' + err.message);
    } finally {
      setConfirmSaving(false);
    }
  };

  // Rejection Process
  const openRejectModal = (orden) => {
    setRejectOrden(orden);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleRechazarSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.error('Por favor, ingresa el motivo del rechazo.');
      return;
    }
    setRejectSaving(true);
    try {
      // Guardar el motivo en las notas/observaciones de la orden
      await updateOrden(rejectOrden.id, {
        estado: 'cancelada',
        notas: rejectReason.trim()
      });
      toast.success('Orden de compra rechazada con éxito');
      setRejectModalOpen(false);
      loadOrdenes();
    } catch (err) {
      toast.error('Error al rechazar orden: ' + err.message);
    } finally {
      setRejectSaving(false);
    }
  };

  const openPDFPreview = (orden) => {
    setPreviewOC(mapOrdenToPDFFormat(orden));
    setIsPDFOpen(true);
  };

  const ordenTotalPages = Math.max(1, Math.ceil(ordenTotal / perPage));

  if (!hasAprobacionPermission) return null;

  return (
    <div className="co-page animate-slide-up">
      {/* Header */}
      <div className="co-card co-header" style={{ border: '1.5px solid #e2e8f0' }}>
        <div>
          <h1 className="co-title">Panel de Aprobaciones</h1>
          <p className="co-subtitle">Revisa, aprueba o rechaza solicitudes de órdenes de compra entrantes</p>
        </div>
        <button onClick={() => navigate('/compras')} className="co-btn-ghost" style={{ color: '#2563eb', fontWeight: 700 }}>
          ← Volver a Compras
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setEstadoFilter('pendiente_aprobacion'); setOrdenPage(1); }}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            estadoFilter === 'pendiente_aprobacion'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Pendientes de Aprobación
        </button>
        <button
          onClick={() => { setEstadoFilter('todas'); setOrdenPage(1); }}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            estadoFilter === 'todas'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Todas las Órdenes (Historial)
        </button>
      </div>

      {/* Table Card */}
      <div className="co-card co-table-card" style={{ border: '1.5px solid #e2e8f0' }}>
        <div className="co-table-header">
          <svg className="w-4 h-4 shrink-0" style={{ color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input className="co-search-inline" placeholder="Buscar por número, proveedor o concepto…" onChange={handleOrdenSearchChange} />
        </div>

        {ordenLoading ? (
          <div className="co-loader-box"><div className="co-spinner" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="co-table">
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Proveedor</th>
                  <th>Emisor</th>
                  <th>Fecha</th>
                  <th>Concepto</th>
                  <th>Observación / Notas</th>
                  <th className="text-right">Total</th>
                  <th className="text-center">Estado</th>
                  <th className="text-center w-48">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map(o => (
                  <tr key={o.id} className="co-tr">
                    <td className="font-mono text-xs font-semibold text-slate-700">{o.numero}</td>
                    <td className="font-semibold text-slate-800">{o.proveedor?.nombre || '—'}</td>
                    <td className="text-slate-600 text-xs font-medium">{o.usuario?.nombre || '—'}</td>
                    <td className="text-slate-500 text-xs">{fmtDate(o.fecha)}</td>
                    <td className="text-slate-700 text-xs font-semibold max-w-[200px] truncate" title={o.concepto}>{o.concepto || '—'}</td>
                    <td className="text-slate-400 text-xs max-w-[150px] truncate" title={o.notas}>{o.notas || '—'}</td>
                    <td className="text-right font-semibold text-slate-800">{fmt(o.total)}</td>
                    <td className="text-center">
                      <span className="co-badge" style={{ background: ESTADO_BADGES[o.estado]?.bg, color: ESTADO_BADGES[o.estado]?.color }}>
                        {ESTADO_BADGES[o.estado]?.label || o.estado}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openPDFPreview(o)}
                          className="co-action-btn co-action-blue"
                          title="Ver Previsualización PDF"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        </button>
                        {o.estado === 'pendiente_aprobacion' ? (
                          <>
                            <button
                              onClick={() => openConfirmAprobar(o)}
                              className="px-2.5 py-1 text-xs font-bold text-white rounded-lg bg-emerald-500 hover:bg-emerald-600 transition-colors flex items-center gap-1 shadow-sm shrink-0"
                              title="Aprobar Orden"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                              Aprobar
                            </button>
                            <button
                              onClick={() => openRejectModal(o)}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white transition-colors flex items-center gap-1 border border-rose-200 text-rose-600 shadow-sm shrink-0"
                              title="Rechazar Orden"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Rechazar
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-400 italic px-2">Procesada</span>
                            {o.estado === 'cancelada' && o.notas && (
                              <button
                                onClick={() => openViewReasonModal(o.notas, o.numero)}
                                className="px-2 py-1 text-[11px] font-bold text-rose-600 rounded-lg bg-rose-50 hover:bg-rose-100 transition-colors flex items-center gap-1 shrink-0 border border-rose-100"
                                title="Ver Motivo de Rechazo"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Motivo
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {ordenes.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-slate-400 text-sm font-medium">
                      No hay órdenes de compra {estadoFilter === 'pendiente_aprobacion' ? 'pendientes de aprobación' : 'registradas'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {ordenTotalPages > 1 && (
          <div className="co-pagination">
            <span className="text-xs font-medium text-slate-400">{ordenTotal} orden{ordenTotal !== 1 ? 'es' : ''}</span>
            <div className="flex items-center gap-1">
              <button disabled={ordenPage <= 1} onClick={() => setOrdenPage(p => p - 1)} className="co-page-btn">‹</button>
              <span className="text-xs font-semibold text-slate-500 px-2">{ordenPage} / {ordenTotalPages}</span>
              <button disabled={ordenPage >= ordenTotalPages} onClick={() => setOrdenPage(p => p + 1)} className="co-page-btn">›</button>
            </div>
          </div>
        )}
      </div>

      {/* Visor Reutilizable de PDF */}
      <PDFPreviewModal
        isOpen={isPDFOpen}
        onClose={() => setIsPDFOpen(false)}
        oc={previewOC}
        title="Orden de Compra"
      />

      {/* Modal Premium Confirmar Aprobación */}
      {confirmAprobarOpen && confirmAprobarOrden && createPortal(
        <>
          <div className="co-overlay" onClick={() => setConfirmAprobarOpen(false)} />
          <div className="co-modal-wrap">
            <div className="co-modal animate-co-modal-in" style={{ maxWidth: '480px' }}>
              <div className="co-modal-header">
                <h2 className="text-lg font-bold text-slate-800">Aprobar Orden de Compra</h2>
                <button type="button" onClick={() => setConfirmAprobarOpen(false)} className="co-modal-close">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="co-modal-body">
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs leading-relaxed">
                    ¿Estás seguro de que deseas <strong>aprobar</strong> la orden de compra <strong className="font-mono">{confirmAprobarOrden.numero}</strong> por un total de <strong>{fmt(confirmAprobarOrden.total)}</strong>? Esta acción habilitará el registro de inventario y registrará la cuenta por pagar.
                  </div>
                  <form onSubmit={handleAprobarSubmit} className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button type="button" onClick={() => setConfirmAprobarOpen(false)} className="co-btn-ghost">Cancelar</button>
                    <button type="submit" disabled={confirmSaving} className="co-btn-primary" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}>
                      {confirmSaving && <div className="co-spinner-sm" />}
                      Aprobar Orden
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Modal Premium Rechazar con Motivo */}
      {rejectModalOpen && rejectOrden && createPortal(
        <>
          <div className="co-overlay" onClick={() => setRejectModalOpen(false)} />
          <div className="co-modal-wrap">
            <div className="co-modal animate-co-modal-in" style={{ maxWidth: '480px' }}>
              <div className="co-modal-header">
                <h2 className="text-lg font-bold text-slate-800">Rechazar Orden de Compra</h2>
                <button type="button" onClick={() => setRejectModalOpen(false)} className="co-modal-close">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="co-modal-body">
                <form onSubmit={handleRechazarSubmit} className="space-y-4">
                  <div className="p-3 bg-red-50 text-red-800 rounded-lg text-xs leading-relaxed">
                    Indica el motivo del rechazo para la orden de compra <strong className="font-mono">{rejectOrden.numero}</strong>. La orden cambiará a estado Rechazada/Cancelada de forma permanente.
                  </div>
                  <div>
                    <label className="co-label">Motivo del Rechazo / Comentarios</label>
                    <textarea
                      className="co-input co-textarea"
                      rows={3}
                      value={rejectReason}
                      placeholder="Escribe el motivo del rechazo aquí..."
                      onChange={e => setRejectReason(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button type="button" onClick={() => setRejectModalOpen(false)} className="co-btn-ghost">Cancelar</button>
                    <button type="submit" disabled={rejectSaving} className="co-btn-primary" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
                      {rejectSaving && <div className="co-spinner-sm" />}
                      Rechazar Orden
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Modal Premium Ver Motivo de Rechazo */}
      {viewReasonOpen && createPortal(
        <>
          <div className="co-overlay" onClick={() => setViewReasonOpen(false)} />
          <div className="co-modal-wrap">
            <div className="co-modal animate-co-modal-in" style={{ maxWidth: '480px' }}>
              <div className="co-modal-header">
                <h2 className="text-lg font-bold text-slate-800">Motivo del Rechazo</h2>
                <button type="button" onClick={() => setViewReasonOpen(false)} className="co-modal-close">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="co-modal-body">
                <div className="space-y-4">
                  <div className="text-xs text-slate-500">
                    Motivo ingresado para el rechazo de la orden de compra <strong className="font-mono">{viewReasonNumero}</strong>:
                  </div>
                  <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl text-slate-700 text-sm font-semibold whitespace-pre-wrap leading-relaxed">
                    {viewReasonText || 'No se ingresó un motivo específico.'}
                  </div>
                  <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                    <button type="button" onClick={() => setViewReasonOpen(false)} className="co-btn-primary" style={{ background: '#475569' }}>
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};
