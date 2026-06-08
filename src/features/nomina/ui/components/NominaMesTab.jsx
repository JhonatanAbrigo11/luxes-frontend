import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNomina } from '../../application/hooks/useNomina';
import { Nomina } from '../../domain/entities/Nomina';

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

const formatUSD = (val) =>
  new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(val ?? 0);

const GroupHeader = ({ label, span, color }) => (
  <th
    colSpan={span}
    className={`border border-gray-300 text-center text-[9px] font-extrabold uppercase tracking-widest py-2 px-2 ${color}`}
  >
    {label}
  </th>
);

const ColHeader = ({ children, color = 'bg-gray-50' }) => (
  <th className={`border border-gray-300 px-2 py-2 text-center text-[9px] font-bold uppercase tracking-wide text-gray-700 ${color}`}>
    {children}
  </th>
);

const PayModal = ({ emp, payroll, subtotal, onClose, onConfirm }) => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
    onClick={onClose}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
      onClick={(e) => e.stopPropagation()}>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white">
        <h3 className="text-lg font-extrabold tracking-tight uppercase">Confirmar Pago</h3>
        <p className="text-blue-200 text-xs mt-0.5">Rol Quincenal — {payroll?.nombreEmpleado || emp.nombre}</p>
      </div>
      <div className="p-6 space-y-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-600">Empleado</span>
            <span className="text-sm font-bold text-gray-800 uppercase">{emp.nombre}</span>
          </div>
          <div className="border-t border-blue-100" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-600">Banco</span>
            <span className="text-sm font-bold text-gray-800">{emp.banco || '—'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-600">Cuenta</span>
            <span className="text-sm font-bold text-gray-800 font-mono tracking-wider">{emp.cuentaBanco || '—'}</span>
          </div>
          <div className="border-t border-blue-100" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-600">Total a Pagar</span>
            <span className="text-lg font-extrabold text-blue-700">{formatUSD(subtotal)}</span>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all">
            Cancelar
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-sm hover:from-blue-700 hover:to-blue-800 shadow-md transition-all">
            Confirmar Pago
          </button>
        </div>
      </div>
    </div>
  </div>
);

export const NominaMesTab = () => {
  const {
    employees,
    rawPayrolls,
    calculatedPayrolls,
    activePeriod,
    loadData,
    changePeriod,
    savePayrollRecord,
    addAbono,
    fechasActuales,
  } = useNomina();

  const [payTarget, setPayTarget] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const periodoLabel = useMemo(() => {
    if (!activePeriod) return '';
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

  const handlePagarClick = (emp, calculated) => {
    setPayTarget({ emp, calculated });
  };

  const handleConfirmPago = async () => {
    if (!payTarget) return;
    setConfirming(true);
    try {
      const { fechaInicio, fechaFin } = fechasActuales;
      const nomina = rawPayrolls.find(p => p.empleadoId === payTarget.emp.id);
      if (nomina) {
        const updated = new Nomina({ ...nomina, estado: 'PAGADO' });
        await savePayrollRecord(updated);
      }
      setPayTarget(null);
      loadData();
    } catch (err) {
      alert('Error al procesar el pago');
    } finally {
      setConfirming(false);
    }
  };

  const rows = employees.map(emp => {
    const payroll = calculatedPayrolls.find(p => p.empleadoId === emp.id);
    const raw     = rawPayrolls.find(p => p.empleadoId === emp.id);
    return { emp, payroll, raw };
  });

  return (
    <div className="animate-slide-up space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-blue-900 tracking-tight uppercase">
            Rol Quincenal — {periodoLabel}
          </h2>
          <p className="text-gray-400 text-xs mt-0.5">
            Nómina mensual con ingresos, egresos y subtotales por colaborador.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleMesAnterior}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 font-bold shadow-sm transition-all">&#8249;</button>
          <span className="text-sm font-bold text-gray-700 min-w-[140px] text-center">{periodoLabel}</span>
          <button onClick={handleMesSiguiente}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 font-bold shadow-sm transition-all">&#8250;</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-blue-900 text-white text-center py-2.5 font-extrabold text-sm tracking-widest uppercase">
          ROL QUINCENAL DE {periodoLabel}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-[10px] border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-50 px-2 py-2 text-center text-[9px] font-bold text-gray-600 w-6">#</th>
                <ColHeader>NOMBRES</ColHeader>
                <ColHeader color="bg-orange-50">SUELDO</ColHeader>
                <ColHeader color="bg-orange-50">DÍAS LABORABLES</ColHeader>
                <ColHeader color="bg-yellow-100">TOTAL</ColHeader>
                <ColHeader color="bg-orange-50">DÍAS LABORADOS</ColHeader>
                <ColHeader color="bg-orange-50">PERMISOS / HORAS</ColHeader>
                <ColHeader color="bg-yellow-200">SUBTOTAL D</ColHeader>
                <GroupHeader label="INGRESO" span={2} color="bg-green-100 text-green-800" />
                <GroupHeader label="EGRESO" span={1} color="bg-red-100 text-red-800" />
                <ColHeader color="bg-yellow-200">SUBTOTAL</ColHeader>
                <ColHeader>ACCIÓN</ColHeader>
              </tr>
              <tr>
                <th className="border border-gray-300 bg-gray-50 w-6" />
                <th className="border border-gray-300 bg-gray-50 min-w-[160px]" />
                <th className="border border-gray-300 bg-orange-50 min-w-[70px]" />
                <th className="border border-gray-300 bg-orange-50 min-w-[80px]" />
                <th className="border border-gray-300 bg-yellow-100 min-w-[80px]" />
                <th className="border border-gray-300 bg-orange-50 min-w-[80px]" />
                <th className="border border-gray-300 bg-orange-50 min-w-[80px]" />
                <th className="border border-gray-300 bg-yellow-200 min-w-[80px]" />
                <ColHeader color="bg-green-100">DÉCIMO<br/>4TO</ColHeader>
                <ColHeader color="bg-green-100">DÉCIMO<br/>3ERO</ColHeader>
                <ColHeader color="bg-red-100">IESS</ColHeader>
                <th className="border border-gray-300 bg-yellow-200 min-w-[80px]" />
                <th className="border border-gray-300 bg-gray-50 min-w-[72px]" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(({ emp, payroll, raw }, idx) => {
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
                const pagado     = raw?.estado === 'PAGADO';

                return (
                  <tr key={emp.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} hover:bg-blue-50/20 transition-colors`}>
                    <td className="border border-gray-200 text-center font-bold text-gray-400 px-2 py-2.5">{idx + 1}</td>
                    <td className="border border-gray-200 px-3 py-2.5 font-semibold text-gray-800 uppercase text-[10px] min-w-[160px]">
                      {emp.nombre}
                    </td>
                    <td className="border border-gray-200 text-center px-2 py-2.5 bg-orange-50/40 text-gray-700">
                      {formatUSD(sueldo)}
                    </td>
                    <td className="border border-gray-200 text-center px-2 py-2.5 bg-orange-50/40 font-bold text-gray-700">
                      {diasLab}
                    </td>
                    <td className="border border-gray-200 text-center px-2 py-2.5 bg-yellow-50 font-bold text-gray-800">
                      {formatUSD(totalBruto)}
                    </td>
                    <td className="border border-gray-200 text-center px-2 py-2.5 bg-orange-50/40 font-bold text-gray-700">
                      {diasTrab}
                    </td>
                    <td className="border border-gray-200 text-center px-2 py-2.5 bg-orange-50/40 text-gray-500">
                      {permisos > 0 ? permisos : '—'}
                    </td>
                    <td className="border border-gray-200 text-center px-2 py-2.5 bg-yellow-100/60 font-bold text-gray-800">
                      {formatUSD(subtotalD)}
                    </td>
                    <td className="border border-gray-200 text-center px-2 py-2.5 bg-green-50/60 text-green-800 font-semibold">
                      {dec4to > 0 ? formatUSD(dec4to) : '—'}
                    </td>
                    <td className="border border-gray-200 text-center px-2 py-2.5 bg-green-50/60 text-green-800 font-semibold">
                      {dec3ro > 0 ? formatUSD(dec3ro) : '—'}
                    </td>
                    <td className="border border-gray-200 text-center px-2 py-2.5 bg-red-50/60 text-red-700 font-semibold">
                      {iess > 0 ? `- ${formatUSD(iess)}` : '—'}
                    </td>
                    <td className="border border-gray-200 text-center px-2 py-2.5 bg-yellow-100/60 font-extrabold text-blue-900">
                      {formatUSD(subtotal)}
                    </td>
                    <td className="border border-gray-200 text-center px-2 py-2.5">
                      {pagado ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 font-bold text-[9px] uppercase tracking-wider">
                          Pagado
                        </span>
                      ) : (
                        <button onClick={() => handlePagarClick(emp, payroll)}
                          className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-[9px] uppercase tracking-wider hover:from-blue-700 hover:to-blue-800 shadow-sm transition-all">
                          Pagar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
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
                <td className="border border-gray-300 text-center px-2 py-2.5 text-gray-500">—</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {payTarget && createPortal(
        <PayModal
          emp={payTarget.emp}
          payroll={payTarget.calculated}
          subtotal={
            payTarget.calculated
              ? payTarget.emp.sueldoDiario * (payTarget.calculated.diasLaborados ?? 30)
                + (payTarget.calculated.ingresos?.decimoCuarto ?? 0)
                + (payTarget.calculated.ingresos?.decimoTercero ?? 0)
                - (payTarget.calculated.egresos?.iess ?? 0)
              : 0
          }
          onClose={() => setPayTarget(null)}
          onConfirm={handleConfirmPago}
        />,
        document.body
      )}
    </div>
  );
};
