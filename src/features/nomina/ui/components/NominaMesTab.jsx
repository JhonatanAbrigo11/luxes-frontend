import React, { useEffect, useMemo } from 'react';
import { useNomina } from '../../application/hooks/useNomina';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

const formatUSD = (val) =>
  new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(val ?? 0);

// Cabecera de grupo de columnas coloreada
const GroupHeader = ({ label, span, color }) => (
  <th
    colSpan={span}
    className={`border border-gray-300 text-center text-[9px] font-extrabold uppercase tracking-widest py-2 px-2 ${color}`}
  >
    {label}
  </th>
);

// Celda de encabezado normal
const ColHeader = ({ children, color = 'bg-gray-50' }) => (
  <th className={`border border-gray-300 px-2 py-2 text-center text-[9px] font-bold uppercase tracking-wide text-gray-700 ${color}`}>
    {children}
  </th>
);

// ─── Componente Principal ─────────────────────────────────────────────────────
export const NominaMesTab = () => {
  const {
    employees,
    calculatedPayrolls,
    activePeriod,
    loadData,
    changePeriod,
  } = useNomina();

  // activePeriod = { year, month, type } (month es 1-based en el store)
  const periodoLabel = useMemo(() => {
    if (!activePeriod) return '';
    // month en el store es 1-based
    const mesIdx = (activePeriod.month ?? 1) - 1;
    return `${MESES[mesIdx]?.toUpperCase() ?? ''} ${activePeriod.year ?? ''}`;
  }, [activePeriod]);

  useEffect(() => {
    loadData();
  }, [loadData, activePeriod]);

  const handleMesAnterior = () => {
    if (!activePeriod) return;
    let { year, month, type } = activePeriod;
    month -= 1;
    if (month < 1) { month = 12; year -= 1; }
    changePeriod(year, month, type ?? 'mensual');
  };

  const handleMesSiguiente = () => {
    if (!activePeriod) return;
    let { year, month, type } = activePeriod;
    month += 1;
    if (month > 12) { month = 1; year += 1; }
    changePeriod(year, month, type ?? 'mensual');
  };

  // Merge employees + calculatedPayrolls
  const rows = employees.map(emp => {
    const payroll = calculatedPayrolls.find(p => p.empleadoId === emp.id);
    return { emp, payroll };
  });

  return (
    <div className="animate-slide-up space-y-5">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-blue-900 tracking-tight uppercase">
            Rol Quincenal — {periodoLabel}
          </h2>
          <p className="text-gray-400 text-xs mt-0.5">
            Nómina mensual con ingresos, egresos y subtotales por colaborador.
          </p>
        </div>
        {/* Selector de período */}
        <div className="flex items-center gap-2">
          <button onClick={handleMesAnterior}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 font-bold shadow-sm transition-all">‹</button>
          <span className="text-sm font-bold text-gray-700 min-w-[140px] text-center">{periodoLabel}</span>
          <button onClick={handleMesSiguiente}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 font-bold shadow-sm transition-all">›</button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Título tabla */}
        <div className="bg-blue-900 text-white text-center py-2.5 font-extrabold text-sm tracking-widest uppercase">
          ROL QUINCENAL DE {periodoLabel}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-[10px] border-collapse">
            <thead>
              {/* Fila 1: grupos de columnas */}
              <tr>
                <th className="border border-gray-300 bg-gray-50 px-2 py-2 text-center text-[9px] font-bold text-gray-600 w-6">#</th>
                <ColHeader>NOMBRES</ColHeader>
                <ColHeader color="bg-orange-50">SUELDO</ColHeader>
                <ColHeader color="bg-orange-50">DÍAS LABORABLES</ColHeader>
                <ColHeader color="bg-yellow-100">TOTAL</ColHeader>
                <ColHeader color="bg-orange-50">DÍAS LABORADOS</ColHeader>
                <ColHeader color="bg-orange-50">PERMISOS / HORAS</ColHeader>
                <ColHeader color="bg-yellow-200">SUBTOTAL D</ColHeader>
                {/* Ingresos */}
                <GroupHeader label="INGRESO" span={2} color="bg-green-100 text-green-800" />
                {/* Egresos */}
                <GroupHeader label="EGRESO" span={1} color="bg-red-100 text-red-800" />
                <ColHeader color="bg-yellow-200">SUBTOTAL</ColHeader>
              </tr>
              {/* Fila 2: sub-columnas */}
              <tr>
                <th className="border border-gray-300 bg-gray-50 w-6" />
                <th className="border border-gray-300 bg-gray-50 min-w-[160px]" />
                <th className="border border-gray-300 bg-orange-50 min-w-[70px]" />
                <th className="border border-gray-300 bg-orange-50 min-w-[80px]" />
                <th className="border border-gray-300 bg-yellow-100 min-w-[80px]" />
                <th className="border border-gray-300 bg-orange-50 min-w-[80px]" />
                <th className="border border-gray-300 bg-orange-50 min-w-[80px]" />
                <th className="border border-gray-300 bg-yellow-200 min-w-[80px]" />
                {/* Ingresos sub-cols */}
                <ColHeader color="bg-green-100">
                  DÉCIMO<br/>4TO
                </ColHeader>
                <ColHeader color="bg-green-100">
                  DÉCIMO<br/>3ERO
                </ColHeader>
                {/* Egresos sub-cols */}
                <ColHeader color="bg-red-100">IESS</ColHeader>
                <th className="border border-gray-300 bg-yellow-200 min-w-[80px]" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(({ emp, payroll }, idx) => {
                const sueldo     = emp.sueldoDiario;
                const diasLab    = payroll?.diasLaborables ?? 30;
                const totalBruto = payroll?.totalBruto ?? (sueldo * diasLab);
                const diasTrab   = payroll?.diasLaborados ?? diasLab;
                const permisos   = payroll?.permisoHoras ?? 0;
                const subtotalD  = sueldo * diasTrab;
                const dec4to     = payroll?.ingresos?.decimoCuarto ?? 0;
                const dec3ro     = payroll?.ingresos?.decimoTercero ?? 0;
                const iess       = payroll?.egresos?.iess ?? 0;
                const subtotal   = subtotalD + dec4to + dec3ro - iess;

                return (
                  <tr key={emp.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} hover:bg-blue-50/20 transition-colors`}>
                    <td className="border border-gray-200 text-center font-bold text-gray-400 px-2 py-2.5">{idx + 1}</td>
                    <td className="border border-gray-200 px-3 py-2.5 font-semibold text-gray-800 uppercase text-[10px] min-w-[160px]">
                      {emp.nombre}
                    </td>
                    {/* Sueldo diario */}
                    <td className="border border-gray-200 text-center px-2 py-2.5 bg-orange-50/40 text-gray-700">
                      {formatUSD(sueldo)}
                    </td>
                    {/* Días laborables */}
                    <td className="border border-gray-200 text-center px-2 py-2.5 bg-orange-50/40 font-bold text-gray-700">
                      {diasLab}
                    </td>
                    {/* Total bruto */}
                    <td className="border border-gray-200 text-center px-2 py-2.5 bg-yellow-50 font-bold text-gray-800">
                      {formatUSD(totalBruto)}
                    </td>
                    {/* Días laborados */}
                    <td className="border border-gray-200 text-center px-2 py-2.5 bg-orange-50/40 font-bold text-gray-700">
                      {diasTrab}
                    </td>
                    {/* Permisos/horas */}
                    <td className="border border-gray-200 text-center px-2 py-2.5 bg-orange-50/40 text-gray-500">
                      {permisos > 0 ? permisos : '—'}
                    </td>
                    {/* Subtotal D */}
                    <td className="border border-gray-200 text-center px-2 py-2.5 bg-yellow-100/60 font-bold text-gray-800">
                      {formatUSD(subtotalD)}
                    </td>
                    {/* Décimo 4to */}
                    <td className="border border-gray-200 text-center px-2 py-2.5 bg-green-50/60 text-green-800 font-semibold">
                      {dec4to > 0 ? formatUSD(dec4to) : '—'}
                    </td>
                    {/* Décimo 3ro */}
                    <td className="border border-gray-200 text-center px-2 py-2.5 bg-green-50/60 text-green-800 font-semibold">
                      {dec3ro > 0 ? formatUSD(dec3ro) : '—'}
                    </td>
                    {/* IESS */}
                    <td className="border border-gray-200 text-center px-2 py-2.5 bg-red-50/60 text-red-700 font-semibold">
                      {iess > 0 ? `- ${formatUSD(iess)}` : '—'}
                    </td>
                    {/* Subtotal final */}
                    <td className="border border-gray-200 text-center px-2 py-2.5 bg-yellow-100/60 font-extrabold text-blue-900">
                      {formatUSD(subtotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Totales */}
            <tfoot>
              <tr className="bg-gray-100 font-black border-t-2 border-gray-300">
                <td colSpan={2} className="border border-gray-300 px-4 py-2.5 text-[10px] text-gray-700 uppercase tracking-widest font-black">
                  TOTALES
                </td>
                <td className="border border-gray-300 text-center px-2 py-2.5 text-gray-500">—</td>
                <td className="border border-gray-300 text-center px-2 py-2.5 text-gray-500">—</td>
                <td className="border border-gray-300 text-center px-2 py-2.5 text-gray-900 font-black">
                  {formatUSD(rows.reduce((s, { payroll, emp }) => s + (payroll?.totalBruto ?? emp.sueldoDiario * 30), 0))}
                </td>
                <td className="border border-gray-300 text-center px-2 py-2.5 text-gray-500">—</td>
                <td className="border border-gray-300 text-center px-2 py-2.5 text-gray-500">—</td>
                <td className="border border-gray-300 text-center px-2 py-2.5 text-gray-900 font-black">
                  {formatUSD(rows.reduce((s, { payroll, emp }) => s + (emp.sueldoDiario * (payroll?.diasLaborados ?? 30)), 0))}
                </td>
                <td className="border border-gray-300 text-center px-2 py-2.5 text-green-800 font-black">
                  {formatUSD(rows.reduce((s, { payroll }) => s + (payroll?.ingresos?.decimoCuarto ?? 0), 0))}
                </td>
                <td className="border border-gray-300 text-center px-2 py-2.5 text-green-800 font-black">
                  {formatUSD(rows.reduce((s, { payroll }) => s + (payroll?.ingresos?.decimoTercero ?? 0), 0))}
                </td>
                <td className="border border-gray-300 text-center px-2 py-2.5 text-red-700 font-black">
                  {formatUSD(rows.reduce((s, { payroll }) => s + (payroll?.egresos?.iess ?? 0), 0))}
                </td>
                <td className="border border-gray-300 text-center px-2 py-2.5 text-blue-900 font-black">
                  {formatUSD(rows.reduce((s, { emp, payroll }) => {
                    const sub = emp.sueldoDiario * (payroll?.diasLaborados ?? 30);
                    const d4  = payroll?.ingresos?.decimoCuarto ?? 0;
                    const d3  = payroll?.ingresos?.decimoTercero ?? 0;
                    const ie  = payroll?.egresos?.iess ?? 0;
                    return s + sub + d4 + d3 - ie;
                  }, 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
