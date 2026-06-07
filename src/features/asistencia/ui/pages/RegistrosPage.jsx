import React, { useEffect, useState, useMemo } from 'react';
import { getAsistencias } from '../../application/asistenciaService';
import { RegistroRow } from '../components/RegistroRow';
import { ScannerModal } from '../components/ScannerModal';
import { EmptyState } from '../components/EmptyState';
import { groupAsistencias, contarMarcaciones, QUICK_FILTERS, toDateStr } from '../../helpers/asistenciaHelpers';

export const RegistrosPage = () => {
  const today = new Date();
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechaDesde, setFechaDesde] = useState(toDateStr(today));
  const [fechaHasta, setFechaHasta] = useState(toDateStr(today));
  const [busqueda, setBusqueda] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getAsistencias();
        data.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));
        setAsistencias(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleQuickFilter = (getRange) => {
    const [desde, hasta] = getRange();
    setFechaDesde(toDateStr(desde));
    setFechaHasta(toDateStr(hasta));
  };

  const handleClear = () => {
    localStorage.removeItem('asistencias_mock');
    setAsistencias([]);
  };

  const grouped = useMemo(
    () => groupAsistencias(asistencias, fechaDesde, fechaHasta, busqueda),
    [asistencias, fechaDesde, fechaHasta, busqueda]
  );

  const totalEmpleados = grouped.length;
  const completados = grouped.filter(r => contarMarcaciones(r) === 4).length;
  const parciales = grouped.filter(r => contarMarcaciones(r) > 0 && contarMarcaciones(r) < 4).length;
  const sinRegistro = grouped.filter(r => contarMarcaciones(r) === 0).length;

  return (
    <div className="p-6 xl:p-8 w-full animate-slide-up">

      <style>{`
        .shadow-card { box-shadow: 0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.02); }
        .shadow-card-hover:hover { box-shadow: 0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.03); }
        .kpi-card { position: relative; overflow: hidden; }
        .kpi-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          border-radius: 2px 2px 0 0;
        }
        .kpi-card.total::before { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
        .kpi-card.completados::before { background: linear-gradient(90deg, #10b981, #34d399); }
        .kpi-card.parciales::before { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
        .kpi-card.sin-registro::before { background: linear-gradient(90deg, #94a3b8, #cbd5e1); }
        .btn-primary {
          background: #2563eb;
          transition: all 0.15s ease;
        }
        .btn-primary:hover { background: #1d4ed8; box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
        .btn-ghost { transition: all 0.15s ease; }
        .btn-ghost:hover { background: #f1f5f9; }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-gray-900">Registro de Asistencia</h1>
          <p className="text-sm text-gray-500 mt-0.5">Historial de marcaciones, entradas y salidas por colaborador</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 px-3 py-2 rounded-lg">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Exportar Asistencia
          </button>
          <button
            onClick={() => setScannerOpen(true)}
            className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5Z" />
            </svg>
            Escanear QR
          </button>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total empleados', value: totalEmpleados, cssClass: 'total', color: 'text-blue-600' },
          { label: 'Completados', value: completados, cssClass: 'completados', color: 'text-emerald-600' },
          { label: 'Parciales', value: parciales, cssClass: 'parciales', color: 'text-amber-600' },
          { label: 'Sin registro', value: sinRegistro, cssClass: 'sin-registro', color: 'text-slate-500' },
        ].map(s => (
          <div key={s.label} className={`bg-white shadow-card kpi-card ${s.cssClass} rounded-xl px-4 py-3 border border-gray-100`}>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6 px-4 py-2.5 bg-white rounded-xl border border-gray-100 shadow-card">
        {/* Quick filters — segmented pills */}
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0">
          {QUICK_FILTERS.map((f, idx) => (
            <button
              key={f.label}
              onClick={() => handleQuickFilter(f.getRange)}
              className="px-3 py-1.5 text-xs font-semibold rounded-md transition-all text-gray-500 hover:text-gray-800 hover:bg-white/80"
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-gray-200" />

        {/* Date range */}
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            <input
              type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)}
              className="w-[130px] border border-gray-200 bg-gray-50 rounded-lg pl-7 pr-2 py-1.5 text-xs font-medium text-gray-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            />
          </div>
          <span className="text-[11px] text-gray-300 font-medium">—</span>
          <div className="relative">
            <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            <input
              type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)}
              className="w-[130px] border border-gray-200 bg-gray-50 rounded-lg pl-7 pr-2 py-1.5 text-xs font-medium text-gray-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 min-w-[160px]">
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text" placeholder="Buscar empleado..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)}
              className="w-full border border-gray-200 bg-gray-50 rounded-lg pl-8 pr-3 py-1.5 text-xs font-medium text-gray-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* ── Main Card ──────────────────────────────────────────── */}
      <div className="bg-white shadow-card rounded-xl border border-gray-100 overflow-hidden">

        {/* Card Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Historial de Marcaciones</h2>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-200 border-t-blue-500" />
              <span className="text-xs font-medium text-gray-400">Cargando registros...</span>
            </div>
          </div>
        ) : grouped.length === 0 ? (
          <EmptyState />
        ) : (
          <div>
            {/* Column Headers */}
            <div className="hidden lg:grid grid-cols-12 gap-3 px-5 py-2.5 bg-gray-50 border-b border-gray-100">
              <div className="col-span-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Empleado</div>
              <div className="col-span-5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center">Marcaciones del día</div>
              <div className="col-span-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-right">Estado</div>
            </div>
            {/* Rows */}
            <div className="divide-y divide-gray-50">
              {grouped.map((row, i) => (
                <RegistroRow key={row.id} row={row} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
          <span className="text-xs font-medium text-gray-400">
            {grouped.length} registro{grouped.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <ScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onSuccess={() => {
          const fetch = async () => {
            setLoading(true);
            try {
              const data = await getAsistencias();
              data.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));
              setAsistencias(data);
            } catch (err) {
              console.error(err);
            } finally {
              setLoading(false);
            }
          };
          fetch();
        }}
      />
    </div>
  );
};
