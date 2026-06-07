import React, { useEffect, useState } from 'react';
import { getClientes } from '../../../clientes/application/clientesService';
import { getProformas, saveProforma, deleteProforma, updateProformaEstado } from '../../application/proformasService';
import { ProformaPDF } from '../components/ProformaPDF';

const EMPTY_PROFORMA = {
  clienteId: '', cliente: '', telefono: '', email: '', fecha: new Date().toISOString().split('T')[0],
  vencimiento: '', items: [{ descripcion: '', cantidad: 1, precioUnitario: 0 }],
  iva: 0.12, notas: '', estado: 'Pendiente',
};

const ESTADOS = ['Pendiente', 'Aprobada', 'Rechazada', 'Pagada'];

export const ProformasPage = () => {
  const [proformas, setProformas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_PROFORMA);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 6;
  const [clienteSelOpen, setClienteSelOpen] = useState(false);
  const [clienteSelSearch, setClienteSelSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [pData, cData] = await Promise.all([getProformas(), getClientes()]);
      setProformas(pData);
      setClientes(cData);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_PROFORMA, fecha: new Date().toISOString().split('T')[0] });
    setFormOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    const related = clientes.find(c => c.nombre === p.cliente);
    setForm({
      ...p,
      clienteId: related?.id || '',
      items: p.items.map(i => ({ ...i })),
    });
    setFormOpen(true);
  };

  const selectCliente = (c) => {
    setForm(prev => ({
      ...prev,
      clienteId: c.id,
      cliente: c.nombre,
      telefono: c.telefono || prev.telefono,
      email: c.email || prev.email,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setForm(prev => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: field === 'descripcion' ? value : Number(value) };
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setForm(prev => ({ ...prev, items: [...prev.items, { descripcion: '', cantidad: 1, precioUnitario: 0 }] }));
  };

  const removeItem = (index) => {
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await saveProforma(editing ? form : { ...form, clienteId: undefined });
      if (editing) {
        setProformas(prev => prev.map(p => p.id === saved.id ? saved : p));
      } else {
        setProformas(prev => [...prev, saved]);
      }
      setFormOpen(false);
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta proforma?')) return;
    await deleteProforma(id);
    setProformas(prev => prev.filter(p => p.id !== id));
  };

  const handleEstado = async (id, estado) => {
    const updated = await updateProformaEstado(id, estado);
    if (updated) setProformas(prev => prev.map(p => p.id === id ? updated : p));
  };

  const q = search.toLowerCase();
  const filteredAll = proformas.filter(p =>
    p.cliente.toLowerCase().includes(q) ||
    p.id.toLowerCase().includes(q) ||
    p.telefono.includes(q) ||
    p.email?.toLowerCase().includes(q)
  );
  const totalPages = Math.max(1, Math.ceil(filteredAll.length / perPage));
  const safePage = Math.min(page, totalPages);
  if (safePage !== page && page > totalPages) setPage(totalPages);
  const filtered = filteredAll.slice((safePage - 1) * perPage, safePage * perPage);

  const calcularTotal = (items, iva) => {
    const sub = items.reduce((s, i) => s + (i.cantidad || 0) * (i.precioUnitario || 0), 0);
    return sub + sub * iva;
  };

  const formatUSD = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const badgeStyle = (estado) => {
    switch (estado) {
      case 'Aprobada': return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'Rechazada': return { bg: 'bg-red-50 text-red-700 border-red-200' };
      case 'Pagada': return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      default: return { bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
  };

  const totales = {
    total: proformas.length,
    pendientes: proformas.filter(p => p.estado === 'Pendiente').length,
    aprobadas: proformas.filter(p => p.estado === 'Aprobada').length,
    pagadas: proformas.filter(p => p.estado === 'Pagada').length,
    montoTotal: proformas.reduce((s, p) => s + calcularTotal(p.items, p.iva), 0),
  };

  if (preview) {
    return <ProformaPDF proforma={preview} onClose={() => setPreview(null)} />;
  }

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Proformas</h1>
          <p className="text-sm text-slate-500">Cotizaciones y proformas para clientes</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 text-white rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 shadow-sm shrink-0"
          style={{ backgroundColor: '#1d4ed8' }}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva Proforma
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total', value: totales.total, color: '#1e40af', bg: '#eff6ff' },
          { label: 'Pendientes', value: totales.pendientes, color: '#d97706', bg: '#fffbeb' },
          { label: 'Aprobadas', value: totales.aprobadas, color: '#059669', bg: '#ecfdf5' },
          { label: 'Pagadas', value: totales.pagadas, color: '#6366f1', bg: '#eef2ff' },
          { label: 'Monto Total', value: formatUSD(totales.montoTotal), color: '#0f172a', bg: '#f8fafc' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: k.bg }}>
              <span className="text-base font-extrabold" style={{ color: k.color }}>{k.label === 'Monto Total' ? '$' : ''}</span>
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-slate-800 truncate">{k.value}</p>
              <p className="text-xs text-slate-500">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-600">{filteredAll.length} proforma{filteredAll.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar proforma…"
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-52" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50">
                  <th className="text-left px-5 py-3">Proforma</th>
                  <th className="text-left px-5 py-3">Cliente</th>
                  <th className="text-left px-5 py-3">Teléfono</th>
                  <th className="text-left px-5 py-3">Fecha</th>
                  <th className="text-right px-5 py-3">Total</th>
                  <th className="text-center px-5 py-3">Estado</th>
                  <th className="text-right px-5 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const bs = badgeStyle(p.estado);
                  return (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">{p.id}</span>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-slate-800">{p.cliente}</p>
                        <span className="text-xs text-slate-400">{p.email}</span>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-slate-500">{p.telefono}</td>
                      <td className="px-5 py-3 text-slate-500 text-sm">{p.fecha}</td>
                      <td className="px-5 py-3 text-right font-bold text-slate-800">{formatUSD(calcularTotal(p.items, p.iva))}</td>
                      <td className="px-5 py-3 text-center">
                        <select value={p.estado} onChange={e => handleEstado(p.id, e.target.value)}
                          className={`text-xs font-semibold px-3 py-1 rounded-full border cursor-pointer outline-none ${bs.bg}`}>
                          {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setPreview(p)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors" title="Ver PDF">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                          </button>
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors" title="Editar">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Eliminar">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-slate-400 text-sm font-medium">
                      <svg className="w-10 h-10 mx-auto mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {search ? 'No se encontraron proformas' : 'No hay proformas registradas'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs font-medium text-slate-400">{filteredAll.length} proforma{filteredAll.length !== 1 ? 's' : ''}</span>
            <div className="flex items-center gap-1">
              <button disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30 hover:bg-white transition-all text-xs font-bold">‹</button>
              <span className="text-xs font-semibold text-slate-500 px-2">{safePage} / {totalPages}</span>
              <button disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30 hover:bg-white transition-all text-xs font-bold">›</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {formOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setFormOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-[modal-in_0.25s_cubic-bezier(0.16,1,0.3,1)_forwards]"
              onClick={e => e.stopPropagation()}>
              <style>{`@keyframes modal-in { from { transform: scale(0.95) translateY(10px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }`}</style>

              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{editing ? 'Editar Proforma' : 'Nueva Proforma'}</h2>
                  <p className="text-xs text-slate-400">{editing ? `Modificando proforma ${editing.id}` : 'Complete los datos del cliente y artículos'}</p>
                </div>
                <button onClick={() => setFormOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-6">
                <form onSubmit={handleSave} className="space-y-5">
                  {/* Cliente */}
                  <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-5 space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Datos del cliente</p>
                    <div className="relative">
                      <label className="text-xs font-semibold text-slate-600 mb-1 block">Cliente *</label>
                      <div className="flex gap-2">
                        <input name="cliente" value={form.cliente} onChange={handleChange} required
                          placeholder="Seleccionar o escribir nombre…"
                          className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                          onFocus={() => setClienteSelOpen(true)} />
                        <button type="button" onClick={() => setClienteSelOpen(o => !o)}
                          className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>
                      </div>
                      {clienteSelOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setClienteSelOpen(false)} />
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-56 flex flex-col overflow-hidden">
                            <div className="p-2 border-b border-slate-100">
                              <input autoFocus value={clienteSelSearch} onChange={e => setClienteSelSearch(e.target.value)}
                                placeholder="Filtrar clientes…"
                                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div className="overflow-y-auto flex-1">
                              {clientes.filter(c => c.nombre.toLowerCase().includes(clienteSelSearch.toLowerCase())).map(c => (
                                <div key={c.id} onClick={() => { selectCliente(c); setClienteSelOpen(false); setClienteSelSearch(''); }}
                                  className="px-4 py-2.5 cursor-pointer hover:bg-blue-50 border-b border-slate-50 last:border-0 transition-colors">
                                  <p className="text-sm font-semibold text-slate-800">{c.nombre}</p>
                                  <p className="text-xs text-slate-400">{c.cedulaRuc} · {c.telefono}</p>
                                </div>
                              ))}
                              {clientes.filter(c => c.nombre.toLowerCase().includes(clienteSelSearch.toLowerCase())).length === 0 && (
                                <p className="text-center py-6 text-sm text-slate-400">Sin resultados</p>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1 block">Teléfono *</label>
                        <input name="telefono" value={form.telefono} onChange={handleChange} required
                          placeholder="0991234567"
                          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1 block">Email</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange}
                          placeholder="cliente@correo.com"
                          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
                      </div>
                    </div>
                  </div>

                  {/* Fechas e IVA */}
                  <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-5 space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fechas y configuración</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1 block">Fecha de emisión *</label>
                        <input name="fecha" type="date" value={form.fecha} onChange={handleChange} required
                          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1 block">Fecha de vencimiento *</label>
                        <input name="vencimiento" type="date" value={form.vencimiento} onChange={handleChange} required
                          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1 block">IVA (%)</label>
                        <select name="iva" value={form.iva} onChange={handleChange}
                          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                          <option value={0}>0% — Sin IVA</option>
                          <option value={0.08}>8%</option>
                          <option value={0.12}>12%</option>
                          <option value={0.15}>15%</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-1 block">Notas / Observaciones</label>
                      <textarea name="notas" value={form.notas} onChange={handleChange}
                        placeholder="Condiciones especiales, descuentos, términos de pago…" rows={2}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white resize-none" />
                    </div>
                  </div>

                  {/* Artículos */}
                  <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Artículos / Servicios</p>
                      <button type="button" onClick={addItem}
                        className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg px-3 py-1.5 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Agregar ítem
                      </button>
                    </div>

                    <div className="grid grid-cols-[1fr_70px_100px_85px_28px] gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1">
                      <span>Descripción</span>
                      <span className="text-center">Cant.</span>
                      <span className="text-right">P. Unitario</span>
                      <span className="text-right">Subtotal</span>
                      <span />
                    </div>

                    {form.items.map((item, i) => (
                      <div key={i} className="grid grid-cols-[1fr_70px_100px_85px_28px] gap-2 items-center bg-white border border-slate-200 rounded-lg p-2.5">
                        <input value={item.descripcion} onChange={e => handleItemChange(i, 'descripcion', e.target.value)}
                          placeholder="Descripción" required
                          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        <input type="number" value={item.cantidad} onChange={e => handleItemChange(i, 'cantidad', e.target.value)}
                          min={1} required className="border border-slate-200 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        <input type="number" step="0.01" value={item.precioUnitario} onChange={e => handleItemChange(i, 'precioUnitario', e.target.value)}
                          min={0} required className="border border-slate-200 rounded-lg px-2 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        <span className="text-sm font-bold text-slate-700 text-right">{formatUSD((item.cantidad || 0) * (item.precioUnitario || 0))}</span>
                        {form.items.length > 1 ? (
                          <button type="button" onClick={() => removeItem(i)}
                            className="w-6 h-6 flex items-center justify-center rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                          </button>
                        ) : <div />}
                      </div>
                    ))}

                    <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="font-semibold text-slate-700">{formatUSD(form.items.reduce((s, i) => s + (i.cantidad || 0) * (i.precioUnitario || 0), 0))}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">IVA ({(form.iva * 100).toFixed(0)}%)</span>
                        <span className="font-semibold text-slate-700">{formatUSD(form.items.reduce((s, i) => s + (i.cantidad || 0) * (i.precioUnitario || 0), 0) * form.iva)}</span>
                      </div>
                      <hr className="border-slate-200" />
                      <div className="flex justify-between text-base">
                        <span className="font-bold text-slate-800">Total</span>
                        <span className="font-extrabold text-blue-700 text-lg">{formatUSD(calcularTotal(form.items, form.iva))}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                    <button type="button" onClick={() => setFormOpen(false)}
                      className="px-5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium transition-colors text-sm">Cancelar</button>
                    <button type="submit" disabled={saving}
                      className="flex items-center gap-2 px-6 py-2 rounded-xl text-white font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 shadow-sm text-sm"
                      style={{ backgroundColor: '#1d4ed8' }}>
                      {saving && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />}
                      {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear Proforma'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
