import React, { useEffect, useState } from 'react';
import { getProformas, saveProforma, deleteProforma, updateProformaEstado } from '../../application/proformasService';
import { ProformaPDF } from '../components/ProformaPDF';

const EMPTY_PROFORMA = {
  cliente: '', telefono: '', email: '', fecha: new Date().toISOString().split('T')[0],
  vencimiento: '', items: [{ descripcion: '', cantidad: 1, precioUnitario: 0 }],
  iva: 0.12, notas: '', estado: 'Pendiente',
};

const ESTADOS = ['Pendiente', 'Aprobada', 'Rechazada', 'Pagada'];

export const ProformasPage = () => {
  const [proformas, setProformas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_PROFORMA);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 6;

  const load = async () => {
    setLoading(true);
    try {
      const data = await getProformas();
      setProformas(data);
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
    setForm({ ...p, items: p.items.map(i => ({ ...i })) });
    setFormOpen(true);
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
      const saved = await saveProforma(form);
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
  const safePage = page > totalPages ? 1 : page;
  if (safePage !== page) setPage(safePage);
  const filtered = filteredAll.slice((safePage - 1) * perPage, safePage * perPage);

  const calcularTotal = (items, iva) => {
    const sub = items.reduce((s, i) => s + (i.cantidad || 0) * (i.precioUnitario || 0), 0);
    return sub + sub * iva;
  };

  const formatUSD = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const badgeStyle = (estado) => {
    switch (estado) {
      case 'Aprobada': return { bg: 'rgba(16,185,129,0.1)', color: '#059669', border: 'rgba(16,185,129,0.25)', dot: '#10b981' };
      case 'Rechazada': return { bg: 'rgba(239,68,68,0.1)', color: '#dc2626', border: 'rgba(239,68,68,0.25)', dot: '#ef4444' };
      case 'Pagada': return { bg: 'rgba(99,102,241,0.1)', color: '#6366f1', border: 'rgba(99,102,241,0.25)', dot: '#6366f1' };
      default: return { bg: 'rgba(245,158,11,0.1)', color: '#d97706', border: 'rgba(245,158,11,0.25)', dot: '#f59e0b' };
    }
  };

  if (preview) {
    return <ProformaPDF proforma={preview} onClose={() => setPreview(null)} />;
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', padding: '32px', overflow: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .pf-root * { font-family: 'Inter', sans-serif; box-sizing: border-box; }

        /* ── Orbes de fondo ── */
        .pf-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          animation: orb-float 8s ease-in-out infinite;
        }
        @keyframes orb-float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-18px) scale(1.04); }
        }

        /* ── Tarjeta principal ── */
        .pf-card {
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(24px) saturate(160%);
          -webkit-backdrop-filter: blur(24px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.55);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(37,99,235,0.07), 0 1px 2px rgba(0,0,0,0.04);
          overflow: hidden;
        }

        /* ── Botón primario ── */
        .pf-btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(37,99,235,0.3);
          letter-spacing: 0.01em;
        }
        .pf-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(37,99,235,0.42);
        }
        .pf-btn-primary:active { transform: translateY(0); }

        /* ── Input field ── */
        .pf-input {
          width: 100%;
          border: 1.5px solid rgba(226,232,240,0.8);
          border-radius: 10px;
          padding: 9px 13px;
          font-size: 13px;
          font-weight: 500;
          color: #1e293b;
          outline: none;
          transition: all 0.2s ease;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(4px);
        }
        .pf-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
          background: #fff;
        }
        .pf-input::placeholder { color: #94a3b8; }

        /* ── Tabla ── */
        .pf-tr:hover td { background: rgba(59,130,246,0.03); }
        .pf-tr td { transition: background 0.15s ease; }

        /* ── Modal overlay ── */
        .pf-overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(15,23,42,0.55);
          backdrop-filter: blur(14px) saturate(130%);
          -webkit-backdrop-filter: blur(14px) saturate(130%);
          animation: overlay-in 0.2s ease;
        }
        @keyframes overlay-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ── Modal box ── */
        .pf-modal {
          background: linear-gradient(160deg, rgba(255,255,255,0.98) 0%, rgba(248,250,255,0.98) 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.8);
          border-radius: 24px;
          box-shadow:
            0 0 0 1px rgba(59,130,246,0.08),
            0 24px 64px rgba(15,23,42,0.2),
            0 8px 24px rgba(37,99,235,0.1);
          animation: modal-in 0.28s cubic-bezier(0.16,1,0.3,1) forwards;
          overflow: hidden;
        }
        @keyframes modal-in {
          from { transform: scale(0.94) translateY(14px); opacity: 0; }
          to   { transform: scale(1) translateY(0); opacity: 1; }
        }

        /* ── Modal header ── */
        .pf-modal-header {
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%);
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        .pf-modal-header::before {
          content: '';
          position: absolute;
          top: -40px; right: -40px;
          width: 150px; height: 150px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
        }
        .pf-modal-header::after {
          content: '';
          position: absolute;
          bottom: -30px; left: 60px;
          width: 100px; height: 100px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
        }

        /* ── Sección de items ── */
        .pf-item-row {
          display: flex;
          gap: 10px;
          align-items: center;
          padding: 10px 12px;
          border-radius: 12px;
          background: rgba(248,250,255,0.8);
          border: 1px solid rgba(226,232,240,0.6);
          margin-bottom: 8px;
          transition: all 0.15s ease;
        }
        .pf-item-row:hover {
          border-color: rgba(59,130,246,0.2);
          background: rgba(239,246,255,0.8);
        }

        /* ── Totales ── */
        .pf-totals {
          background: linear-gradient(135deg, rgba(239,246,255,0.9) 0%, rgba(219,234,254,0.9) 100%);
          border: 1px solid rgba(147,197,253,0.4);
          border-radius: 14px;
          padding: 16px 20px;
        }

        /* ── Botón cancel ── */
        .pf-btn-cancel {
          background: rgba(241,245,249,0.9);
          color: #475569;
          border: 1px solid rgba(226,232,240,0.8);
          border-radius: 12px;
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .pf-btn-cancel:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        /* ── Acción icono ── */
        .pf-action-btn {
          width: 32px; height: 32px;
          border-radius: 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          transition: all 0.15s ease;
        }
        .pf-action-btn:hover { background: rgba(59,130,246,0.08); color: #2563eb; }
        .pf-action-btn.danger:hover { background: rgba(239,68,68,0.08); color: #dc2626; }

        /* ── Slide animación ── */
        .pf-slide-up {
          animation: pf-slide 0.4s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes pf-slide {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Label de sección ── */
        .pf-section-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 6px;
          display: block;
        }

        .pf-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(203,213,225,0.6), transparent);
          border: none;
          margin: 2px 0;
        }
      `}</style>

      <div className="pf-root pf-slide-up">

        {/* ── Orbes de fondo ── */}
        <div className="pf-orb" style={{
          width: 420, height: 420,
          background: 'radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%)',
          top: -100, right: -80,
          animationDelay: '0s',
        }} />
        <div className="pf-orb" style={{
          width: 320, height: 320,
          background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
          bottom: 60, left: -60,
          animationDelay: '3s',
        }} />
        <div className="pf-orb" style={{
          width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
          top: '40%', left: '50%',
          animationDelay: '5s',
        }} />

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{
              fontSize: 30, fontWeight: 800, color: '#0f172a',
              letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1,
            }}>
              Proformas
            </h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 5, fontWeight: 500 }}>
              Cotizaciones y proformas para clientes
            </p>
          </div>
          <button onClick={openNew} className="pf-btn-primary">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nueva Proforma
          </button>
        </div>

        {/* ── Tarjeta tabla ── */}
        <div className="pf-card">
          {/* Header de tabla */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid rgba(226,232,240,0.5)',
            background: 'rgba(248,250,255,0.6)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(37,99,235,0.25)',
              }}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Lista de Proformas</span>
              <span style={{
                fontSize: 11, fontWeight: 700, color: '#3b82f6',
                background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                padding: '2px 8px', borderRadius: 20,
              }}>{filteredAll.length}</span>
            </div>
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94a3b8' }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text" value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar proforma..."
                style={{
                  paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                  fontSize: 12, border: '1.5px solid rgba(226,232,240,0.8)',
                  borderRadius: 10, outline: 'none', background: 'rgba(255,255,255,0.8)',
                  width: 200, color: '#1e293b', fontFamily: 'Inter, sans-serif', fontWeight: 500,
                  transition: 'all 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(226,232,240,0.8)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Tabla */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '64px 0' }}>
              <div style={{
                width: 36, height: 36, border: '3px solid rgba(59,130,246,0.15)',
                borderTopColor: '#3b82f6', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(248,250,255,0.8)' }}>
                    {['Proforma', 'Cliente', 'Teléfono', 'Fecha', 'Total', 'Estado', 'Acciones'].map((h, idx) => (
                      <th key={h} style={{
                        padding: '10px 16px',
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                        textTransform: 'uppercase', color: '#94a3b8',
                        textAlign: idx >= 4 ? (idx === 4 ? 'right' : idx === 5 ? 'center' : 'right') : 'left',
                        borderBottom: '1px solid rgba(226,232,240,0.5)',
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => {
                    const bs = badgeStyle(p.estado);
                    return (
                      <tr key={p.id} className="pf-tr" style={{ borderBottom: '1px solid rgba(241,245,249,0.8)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
                            color: '#2563eb', background: 'rgba(59,130,246,0.07)',
                            padding: '3px 8px', borderRadius: 6,
                          }}>{p.id}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', margin: 0 }}>{p.cliente}</p>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>{p.email}</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, fontFamily: 'monospace', color: '#475569' }}>{p.telefono}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b' }}>{p.fecha}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                          {formatUSD(calcularTotal(p.items, p.iva))}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <select
                            value={p.estado}
                            onChange={e => handleEstado(p.id, e.target.value)}
                            style={{
                              fontSize: 11, fontWeight: 700, padding: '4px 10px',
                              borderRadius: 20, border: `1.5px solid ${bs.border}`,
                              background: bs.bg, color: bs.color,
                              cursor: 'pointer', outline: 'none',
                              fontFamily: 'Inter, sans-serif',
                            }}
                          >
                            {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                            <button className="pf-action-btn" onClick={() => setPreview(p)} title="Ver PDF">
                              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                              </svg>
                            </button>
                            <button className="pf-action-btn" onClick={() => openEdit(p)} title="Editar">
                              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                              </svg>
                            </button>
                            <button className="pf-action-btn danger" onClick={() => handleDelete(p.id)} title="Eliminar">
                              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
                      <td colSpan={7} style={{ textAlign: 'center', padding: '56px 0', color: '#94a3b8', fontSize: 13 }}>
                        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.35 }}>
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

          {/* Paginación */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 20px', borderTop: '1px solid rgba(226,232,240,0.5)',
              background: 'rgba(248,250,255,0.5)',
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>
                Página {safePage} de {totalPages}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button disabled={safePage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}
                  style={{
                    padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(226,232,240,0.8)',
                    fontSize: 11, fontWeight: 600, color: '#64748b', background: 'white',
                    cursor: safePage <= 1 ? 'not-allowed' : 'pointer', opacity: safePage <= 1 ? 0.4 : 1,
                    fontFamily: 'Inter, sans-serif',
                  }}>← Anterior</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)} style={{
                    width: 30, height: 30, borderRadius: 8, border: 'none',
                    fontSize: 11, fontWeight: 700,
                    background: n === safePage ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent',
                    color: n === safePage ? 'white' : '#64748b',
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    boxShadow: n === safePage ? '0 4px 10px rgba(37,99,235,0.3)' : 'none',
                  }}>{n}</button>
                ))}
                <button disabled={safePage >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  style={{
                    padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(226,232,240,0.8)',
                    fontSize: 11, fontWeight: 600, color: '#64748b', background: 'white',
                    cursor: safePage >= totalPages ? 'not-allowed' : 'pointer', opacity: safePage >= totalPages ? 0.4 : 1,
                    fontFamily: 'Inter, sans-serif',
                  }}>Siguiente →</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MODAL PREMIUM
      ══════════════════════════════════════════ */}
      {formOpen && (
        <div className="pf-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          {/* Fondo clickeable */}
          <div onClick={() => setFormOpen(false)} style={{ position: 'absolute', inset: 0 }} />

          <div className="pf-modal" style={{
            position: 'relative', width: '100%', maxWidth: 680,
            maxHeight: '92vh', display: 'flex', flexDirection: 'column',
            fontFamily: 'Inter, sans-serif',
          }}>
            {/* Header del modal con gradiente */}
            <div className="pf-modal-header">
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'white', lineHeight: 1.2 }}>
                      {editing ? 'Editar Proforma' : 'Nueva Proforma'}
                    </h2>
                    <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>
                      {editing ? `Modificando proforma ${editing.id}` : 'Complete los datos del cliente y artículos'}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setFormOpen(false)}
                style={{
                  position: 'relative', zIndex: 1,
                  width: 34, height: 34, borderRadius: 10,
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Cuerpo del modal con scroll */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>
              <form onSubmit={handleSave}>

                {/* ── Sección: Datos del cliente ── */}
                <div style={{
                  background: 'rgba(248,250,255,0.7)',
                  border: '1px solid rgba(226,232,240,0.6)',
                  borderRadius: 14, padding: '16px 18px', marginBottom: 16,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 6,
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#1e293b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Datos del cliente
                    </span>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label className="pf-section-label">Cliente *</label>
                    <input name="cliente" value={form.cliente} onChange={handleChange} required
                      placeholder="Nombre completo del cliente" className="pf-input" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label className="pf-section-label">Teléfono *</label>
                      <input name="telefono" value={form.telefono} onChange={handleChange} required
                        placeholder="0991234567" className="pf-input" />
                    </div>
                    <div>
                      <label className="pf-section-label">Email</label>
                      <input name="email" type="email" value={form.email} onChange={handleChange}
                        placeholder="cliente@correo.com" className="pf-input" />
                    </div>
                  </div>
                </div>

                {/* ── Sección: Fechas e IVA ── */}
                <div style={{
                  background: 'rgba(248,250,255,0.7)',
                  border: '1px solid rgba(226,232,240,0.6)',
                  borderRadius: 14, padding: '16px 18px', marginBottom: 16,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 6,
                      background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                      </svg>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#1e293b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Fechas y configuración
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div>
                      <label className="pf-section-label">Fecha de emisión *</label>
                      <input name="fecha" type="date" value={form.fecha} onChange={handleChange} required className="pf-input" />
                    </div>
                    <div>
                      <label className="pf-section-label">Fecha de vencimiento *</label>
                      <input name="vencimiento" type="date" value={form.vencimiento} onChange={handleChange} required className="pf-input" />
                    </div>
                    <div>
                      <label className="pf-section-label">IVA (%)</label>
                      <select name="iva" value={form.iva} onChange={handleChange} className="pf-input">
                        <option value={0}>0% — Sin IVA</option>
                        <option value={0.08}>8%</option>
                        <option value={0.12}>12%</option>
                        <option value={0.15}>15%</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <label className="pf-section-label">Notas / Observaciones</label>
                    <textarea name="notas" value={form.notas} onChange={handleChange}
                      placeholder="Condiciones especiales, descuentos, términos de pago..."
                      rows={2} className="pf-input" style={{ resize: 'none' }} />
                  </div>
                </div>

                {/* ── Sección: Artículos ── */}
                <div style={{
                  background: 'rgba(248,250,255,0.7)',
                  border: '1px solid rgba(226,232,240,0.6)',
                  borderRadius: 14, padding: '16px 18px', marginBottom: 16,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: 6,
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
                        </svg>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#1e293b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Artículos / Servicios
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: '#059669',
                        background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                        padding: '1px 6px', borderRadius: 10,
                      }}>{form.items.length} ítem{form.items.length !== 1 ? 's' : ''}</span>
                    </div>
                    <button type="button" onClick={addItem} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: 11, fontWeight: 700, color: '#2563eb',
                      background: 'rgba(59,130,246,0.08)',
                      border: '1px solid rgba(59,130,246,0.2)',
                      borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.15)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.08)'; }}
                    >
                      <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Agregar ítem
                    </button>
                  </div>

                  {/* Cabecera de columnas */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 70px 100px 85px 28px',
                    gap: 8, paddingBottom: 6, marginBottom: 4,
                  }}>
                    {['Descripción', 'Cant.', 'P. Unitario', 'Subtotal', ''].map(h => (
                      <span key={h} style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8' }}>{h}</span>
                    ))}
                  </div>

                  {form.items.map((item, i) => (
                    <div key={i} className="pf-item-row" style={{
                      display: 'grid', gridTemplateColumns: '1fr 70px 100px 85px 28px',
                      gap: 8, alignItems: 'center',
                    }}>
                      <input
                        value={item.descripcion}
                        onChange={e => handleItemChange(i, 'descripcion', e.target.value)}
                        placeholder="Descripción del ítem"
                        className="pf-input" required
                        style={{ fontSize: 12 }}
                      />
                      <input
                        type="number" value={item.cantidad}
                        onChange={e => handleItemChange(i, 'cantidad', e.target.value)}
                        placeholder="1" className="pf-input"
                        min={1} required style={{ fontSize: 12, textAlign: 'center' }}
                      />
                      <input
                        type="number" step="0.01" value={item.precioUnitario}
                        onChange={e => handleItemChange(i, 'precioUnitario', e.target.value)}
                        placeholder="0.00" className="pf-input"
                        min={0} required style={{ fontSize: 12, textAlign: 'right' }}
                      />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', textAlign: 'right' }}>
                        {formatUSD((item.cantidad || 0) * (item.precioUnitario || 0))}
                      </span>
                      {form.items.length > 1 ? (
                        <button type="button" onClick={() => removeItem(i)} style={{
                          width: 24, height: 24, borderRadius: 6, border: 'none',
                          background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                        >
                          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                          </svg>
                        </button>
                      ) : <div />}
                    </div>
                  ))}

                  {/* Totales */}
                  <div className="pf-totals" style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Subtotal</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>
                        {formatUSD(form.items.reduce((s, i) => s + (i.cantidad || 0) * (i.precioUnitario || 0), 0))}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>IVA ({(form.iva * 100).toFixed(0)}%)</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>
                        {formatUSD(form.items.reduce((s, i) => s + (i.cantidad || 0) * (i.precioUnitario || 0), 0) * form.iva)}
                      </span>
                    </div>
                    <hr className="pf-divider" />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: '#1e293b' }}>Total</span>
                      <span style={{
                        fontSize: 18, fontWeight: 900,
                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      }}>
                        {formatUSD(calcularTotal(form.items, form.iva))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Acciones del modal ── */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
                  paddingTop: 4,
                }}>
                  <button type="button" onClick={() => setFormOpen(false)} className="pf-btn-cancel">
                    Cancelar
                  </button>
                  <button type="submit" disabled={saving} className="pf-btn-primary" style={{ opacity: saving ? 0.7 : 1 }}>
                    {saving && (
                      <div style={{
                        width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white', borderRadius: '50%',
                        animation: 'spin 0.7s linear infinite',
                      }} />
                    )}
                    {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear Proforma'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
