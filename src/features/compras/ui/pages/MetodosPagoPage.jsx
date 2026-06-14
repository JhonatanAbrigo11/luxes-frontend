import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  getMetodosPago, createMetodoPago, updateMetodoPago, deleteMetodoPago
} from '../../application/comprasService';
import './ComprasPage.css';

export const MetodosPagoPage = () => {
  const [metodos, setMetodos] = useState([]);
  const [metodosLoading, setMetodosLoading] = useState(true);
  const [metodoFormOpen, setMetodoFormOpen] = useState(false);
  const [editingMetodo, setEditingMetodo] = useState(null);
  const [metodoForm, setMetodoForm] = useState({ nombre: '', descripcion: '' });
  const [metodoSaving, setMetodoSaving] = useState(false);

  const loadMetodos = useCallback(async () => {
    setMetodosLoading(true);
    try { const m = await getMetodosPago(); setMetodos(m); }
    catch { setMetodos([]); }
    finally { setMetodosLoading(false); }
  }, []);

  useEffect(() => { loadMetodos(); }, [loadMetodos]);

  const openNewMetodo = () => {
    setEditingMetodo(null);
    setMetodoForm({ nombre: '', descripcion: '' });
    setMetodoFormOpen(true);
  };

  const openEditMetodo = (m) => {
    setEditingMetodo(m);
    setMetodoForm({ nombre: m.nombre, descripcion: m.descripcion || '' });
    setMetodoFormOpen(true);
  };

  const handleMetodoSave = async (e) => {
    e.preventDefault();
    setMetodoSaving(true);
    try {
      if (editingMetodo) { await updateMetodoPago(editingMetodo.id, metodoForm); }
      else { await createMetodoPago(metodoForm); }
      setMetodoFormOpen(false);
      loadMetodos();
    } catch (err) { alert(err.message); }
    finally { setMetodoSaving(false); }
  };

  const handleMetodoDelete = async (id) => {
    if (!window.confirm('¿Eliminar este método de pago?')) return;
    try { await deleteMetodoPago(id); loadMetodos(); }
    catch (err) { alert(err.message); }
  };

  const handleMetodoToggle = async (m) => {
    try { await updateMetodoPago(m.id, { activo: !m.activo }); loadMetodos(); }
    catch (err) { alert(err.message); }
  };

  return (
    <div className="co-page animate-slide-up">
      {/* Header */}
      <div className="co-card co-header">
        <div>
          <h1 className="co-title">Métodos de Pago</h1>
          <p className="co-subtitle">Administración de canales de cobro y pago (Caja Chica, Banco, etc.)</p>
        </div>
        <button onClick={openNewMetodo} className="co-btn-primary" id="btn-nuevo-metodo">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Nuevo Método
        </button>
      </div>

      {/* Table */}
      <div className="co-card co-table-card">
        {metodosLoading ? (
          <div className="co-loader-box"><div className="co-spinner" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="co-table">
              <thead>
                <tr>
                  <th>Nombre</th><th>Descripción</th><th className="text-center">Estado</th><th className="text-center w-28">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {metodos.map(m => (
                  <tr key={m.id} className="co-tr">
                    <td className="font-semibold text-slate-800">{m.nombre}</td>
                    <td className="text-slate-500">{m.descripcion || '—'}</td>
                    <td className="text-center">
                      <button
                        onClick={() => handleMetodoToggle(m)}
                        className={`co-toggle ${m.activo ? 'co-toggle-active' : ''}`}
                        title={m.activo ? 'Desactivar' : 'Activar'}
                      >
                        <span className="co-toggle-dot" />
                      </button>
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEditMetodo(m)} className="co-action-btn co-action-blue" title="Editar">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                        <button onClick={() => handleMetodoDelete(m.id)} className="co-action-btn co-action-red" title="Eliminar">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {metodos.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-16 text-slate-400 text-sm font-medium">No hay métodos de pago registrados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New/Edit Modal */}
      {metodoFormOpen && createPortal(
        <>
          <div className="co-overlay" onClick={() => setMetodoFormOpen(false)} />
          <div className="co-modal-wrap">
            <div className="co-modal animate-co-modal-in" style={{ maxWidth: '420px' }}>
              <div className="co-modal-header">
                <h2 className="text-lg font-bold text-slate-800">{editingMetodo ? 'Editar Método' : 'Nuevo Método de Pago'}</h2>
                <button type="button" onClick={() => setMetodoFormOpen(false)} className="co-modal-close">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="co-modal-body">
                <form onSubmit={handleMetodoSave} className="space-y-4">
                  <div>
                    <label className="co-label">Nombre</label>
                    <input className="co-input" value={metodoForm.nombre} placeholder="Ej: Caja Chica, Banco, Transferencia…"
                      onChange={e => setMetodoForm(p => ({ ...p, nombre: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="co-label">Descripción</label>
                    <input className="co-input" value={metodoForm.descripcion} placeholder="Opcional"
                      onChange={e => setMetodoForm(p => ({ ...p, descripcion: e.target.value }))} />
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                    <button type="button" onClick={() => setMetodoFormOpen(false)} className="co-btn-ghost">Cancelar</button>
                    <button type="submit" disabled={metodoSaving} className="co-btn-primary">
                      {metodoSaving && <div className="co-spinner-sm" />}
                      {editingMetodo ? 'Guardar' : 'Crear Método'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};
