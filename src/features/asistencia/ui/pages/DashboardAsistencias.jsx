import React, { useEffect, useState } from 'react';
import { getAsistencias } from '../../application/asistenciaService';
import { CredencialCard } from '../components/CredencialCard';
import { RegistroRow } from '../components/RegistroRow';
import { ScannerModal } from '../components/ScannerModal';

// ─── Datos de ejemplo (quemados) ─────────────────────────────────────────────
const MOCK_EMPLEADOS = [
  { id: 'EMP-001', nombre: 'Carlos Mendoza',  cargo: 'Desarrollador Senior',  departamento: 'Tecnología', foto: 'https://i.pravatar.cc/150?img=11' },
  { id: 'EMP-002', nombre: 'Laura Solís',      cargo: 'Diseñadora UX/UI',      departamento: 'Diseño',      foto: 'https://i.pravatar.cc/150?img=5'  },
  { id: 'EMP-003', nombre: 'Andrés López',     cargo: 'Gerente de Proyectos',  departamento: 'Operaciones', foto: 'https://i.pravatar.cc/150?img=8'  },
  { id: 'EMP-004', nombre: 'Sofía Castro',     cargo: 'Analista QA',           departamento: 'Tecnología', foto: 'https://i.pravatar.cc/150?img=9'  },
];

// ─── Helper: agrupar asistencias por empleado + fecha ────────────────────────
const groupAsistencias = (asistencias, desde, hasta) => {
  const filtered = asistencias.filter(a => {
    const d = new Date(a.fechaHora).toISOString().split('T')[0];
    return d >= desde && d <= hasta;
  });

  const map = {};
  filtered.forEach(a => {
    const fecha = new Date(a.fechaHora).toLocaleDateString();
    const key   = `${a.empleadoId}-${fecha}`;
    if (!map[key]) {
      map[key] = {
        id: key,
        empleadoId: a.empleadoId,
        nombreEmpleado: a.nombreEmpleado,
        fechaTexto: fecha,
        entrada:        null,
        inicioAlmuerzo: null,
        finAlmuerzo:    null,
        salida:         null,
      };
    }
    if ((a.tipo === 'ENTRADA' || a.tipo === 'MARCACION') && !map[key].entrada) map[key].entrada = a;
    if (a.tipo === 'INICIO_ALMUERZO' && !map[key].inicioAlmuerzo) map[key].inicioAlmuerzo = a;
    if (a.tipo === 'FIN_ALMUERZO'    && !map[key].finAlmuerzo)    map[key].finAlmuerzo    = a;
    if (a.tipo === 'SALIDA'          && !map[key].salida)          map[key].salida         = a;
  });

  return Object.values(map);
};

// ─── Sub-componentes de UI ────────────────────────────────────────────────────
const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${
      active ? 'bg-white text-[#02188E] shadow-md' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
    }`}
  >
    {children}
  </button>
);

const SectionHeader = ({ title, action }) => (
  <div className="flex justify-between items-center pb-4 mb-5 border-b border-gray-100">
    <h2 className="text-lg font-bold text-gray-800">{title}</h2>
    {action}
  </div>
);

const TableHeaderCell = ({ children, className = '' }) => (
  <div className={`text-[11px] font-bold text-gray-400 uppercase tracking-widest ${className}`}>
    {children}
  </div>
);

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-5xl mb-4">📭</div>
    <p className="text-gray-500 font-medium text-sm max-w-xs">{message}</p>
  </div>
);

// ─── Componente Principal ─────────────────────────────────────────────────────
export const DashboardAsistencias = () => {
  const today = new Date().toISOString().split('T')[0];

  const [asistencias,   setAsistencias]   = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [activeTab,     setActiveTab]     = useState('credenciales'); // kept for compatibility
  const [fechaDesde,    setFechaDesde]    = useState(today);
  const [fechaHasta,    setFechaHasta]    = useState(today);
  const [printingId,    setPrintingId]    = useState(null);
  const [scannerOpen,   setScannerOpen]   = useState(false);

  // Fetch
  const fetchAsistencias = async () => {
    setLoading(true);
    try {
      const data = await getAsistencias();
      data.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));
      setAsistencias(data);
    } catch (err) {
      console.error('Error fetching asistencias', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAsistencias(); }, []);

  const handleClearMock = () => {
    localStorage.removeItem('asistencias_mock');
    setAsistencias([]);
  };

  const handlePrint = (id) => {
    setPrintingId(id);
    setTimeout(() => { window.print(); setPrintingId(null); }, 150);
  };

  const grouped = groupAsistencias(asistencias, fechaDesde, fechaHasta);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8 w-full animate-slide-up">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#02188E] via-blue-700 to-indigo-500 bg-clip-text text-transparent">
            Control de Asistencia
          </h1>
          <p className="text-gray-400 mt-1.5 text-sm">
            Gestiona credenciales y el registro de entradas y salidas.
          </p>
        </div>
        <button
          onClick={() => setScannerOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-bold rounded-full shadow-lg hover:shadow-xl hover:from-emerald-400 hover:to-green-500 transition-all active:scale-95"
        >
          Escanear QR
        </button>
      </div>



      {/* ── Sección: Credenciales ─────────────────────────────────────── */}
      <div className="mb-12">
        <div className="flex flex-wrap gap-7 justify-center">
          {MOCK_EMPLEADOS.map(emp => (
            <CredencialCard
              key={emp.id}
              emp={emp}
              isPrinting={printingId === emp.id}
              onPrint={handlePrint}
            />
          ))}
        </div>
      </div>

      {/* ── Print Styles ────────────────────────────────────────────────── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 1cm; }
          body { visibility: hidden !important; background: white !important; }
          .print-target {
            visibility: visible !important;
            position: absolute !important;
            left: 50% !important; top: 0 !important;
            transform: translateX(-50%) !important;
            width: 300px !important; height: auto !important;
            page-break-inside: avoid !important; break-inside: avoid !important;
            margin: 0 !important; box-shadow: none !important;
            border: 1px solid #ddd !important; background: white !important;
          }
          .print-target * { visibility: visible !important; }
          .print-hidden { display: none !important; }
        }
      `}} />

      <ScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onSuccess={() => {
          fetchAsistencias();
        }}
      />
    </div>
  );
};

