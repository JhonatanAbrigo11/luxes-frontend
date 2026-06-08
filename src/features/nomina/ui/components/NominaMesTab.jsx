import React, { useEffect, useMemo, useState, useContext, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { NominaContext } from '../../application/context/NominaContext';
import { calcularNomina } from '../../domain/use-cases/calcularNomina';
import { registrarAbono } from '../../domain/use-cases/registrarAbono';
import { obtenerFechasPeriodo } from '../../application/hooks/useNomina';

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

const formatUSD = (val) =>
  new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(val ?? 0);

const ColHeader = ({ children, color = 'bg-gray-50' }) => (
  <th className={`border border-gray-300 px-2 py-2 text-center text-[9px] font-bold uppercase tracking-wide text-gray-700 ${color}`}>
    {children}
  </th>
);

const ESTADO_BADGE = {
  PENDIENTE:     { label: 'Pendiente',   cls: 'bg-gray-100 text-gray-600' },
  ABONO_PARCIAL: { label: 'Abono Parcial', cls: 'bg-yellow-100 text-yellow-700' },
  PAGADO:        { label: 'Pagado',      cls: 'bg-green-100 text-green-700' },
};

const PayModal = ({ emp, monto, maxMonto, restante, quincenaLabel, isCross, onClose, onConfirm, onMontoChange }) => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
    onClick={onClose}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
      onClick={(e) => e.stopPropagation()}>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white">
        <h3 className="text-lg font-extrabold tracking-tight uppercase">Confirmar Pago</h3>
        <p className="text-blue-200 text-xs mt-0.5">{quincenaLabel} — {emp.nombre}</p>
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
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {isCross ? 'Pago pendiente de otra quincena' : 'Monto a Pagar'}
            </label>
            <input type="number" step="0.01" min="0.01" max={maxMonto}
              value={monto}
              onChange={(e) => onMontoChange(Math.min(parseFloat(e.target.value) || 0, maxMonto))}
              className="w-full px-3 py-2 text-lg font-extrabold text-blue-700 border border-blue-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          {restante > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-500">Saldo pendiente después</span>
              <span className="text-xs font-bold text-orange-600">{formatUSD(restante)}</span>
            </div>
          )}
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all">
            Cancelar
          </button>
          <button onClick={onConfirm}
            disabled={!monto || monto <= 0}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-sm hover:from-blue-700 hover:to-blue-800 shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {monto > 0 ? `Pagar ${formatUSD(monto)}` : 'Ingrese un monto'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

const computeSubtotal = (emp, cp, includeIess = true) => {
  if (!cp) return 0;
  const d = emp.sueldoDiario * (cp.diasLaborados ?? 30);
  return includeIess ? d - (cp.egresos?.iess ?? 0) : d;
};

const QuincenaTable = ({ label, rows, crossPendientes, showIess = true, onPagar, onPagarCross }) => (
  <div className="overflow-x-auto">
    <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white text-center py-2 font-extrabold text-xs tracking-widest uppercase">
      {label}
    </div>
    <table className="min-w-full text-[10px] border-collapse">
      <thead>
        <tr>
          <th className="border border-gray-300 bg-gray-50 px-2 py-2 text-center text-[9px] font-bold text-gray-600 w-6">#</th>
          <ColHeader>NOMBRES</ColHeader>
          <ColHeader color="bg-orange-50">SUELDO</ColHeader>
          <ColHeader color="bg-orange-50">DÍAS LAB.</ColHeader>
          <ColHeader color="bg-yellow-100">TOTAL</ColHeader>
          <ColHeader color="bg-orange-50">DÍAS TRAB.</ColHeader>
          <ColHeader color="bg-orange-50">PERM./HRS</ColHeader>
          <ColHeader color="bg-yellow-200">SUBTOTAL D</ColHeader>
          {showIess && <ColHeader color="bg-red-100">IESS</ColHeader>}
          <ColHeader color="bg-yellow-200">SUBTOTAL</ColHeader>
          <ColHeader color="bg-green-100">PAGADO</ColHeader>
          <ColHeader color="bg-orange-100">PENDIENTE</ColHeader>
          <ColHeader>ACCIÓN</ColHeader>
        </tr>
        <tr>
          <th className="border border-gray-300 bg-gray-50 w-6" />
          <th className="border border-gray-300 bg-gray-50 min-w-[160px]" />
          <th className="border border-gray-300 bg-orange-50 min-w-[70px]" />
          <th className="border border-gray-300 bg-orange-50 min-w-[65px]" />
          <th className="border border-gray-300 bg-yellow-100 min-w-[80px]" />
          <th className="border border-gray-300 bg-orange-50 min-w-[65px]" />
          <th className="border border-gray-300 bg-orange-50 min-w-[65px]" />
          <th className="border border-gray-300 bg-yellow-200 min-w-[80px]" />
          {showIess && <th className="border border-gray-300 bg-red-100 min-w-[70px]" />}
          <th className="border border-gray-300 bg-yellow-200 min-w-[80px]" />
          <th className="border border-gray-300 bg-green-100 min-w-[80px]" />
          <th className="border border-gray-300 bg-orange-100 min-w-[80px]" />
          <th className="border border-gray-300 bg-gray-50 min-w-[100px]" />
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {rows.map(({ emp, cp, raw }, idx) => {
          const sueldo    = emp.sueldoDiario;
          const diasLab   = cp?.diasLaborables ?? 30;
          const totalB    = cp?.totalBruto ?? (sueldo * diasLab);
          const diasT     = cp?.diasLaborados ?? diasLab;
          const hrsExtras = cp?.ingresos?.horasExtras ?? 0;
          const subD      = sueldo * diasT;
          const ie        = cp?.egresos?.iess ?? 0;
          const sub       = showIess ? subD - ie : subD;
          const ep        = cp?.estadoPago ?? 'PENDIENTE';
          const badge     = ESTADO_BADGE[ep] ?? ESTADO_BADGE.PENDIENTE;
          const abonos    = raw?.abonos ?? [];
          const totalAb   = abonos.reduce((s, a) => s + a.monto, 0);
          const cross     = crossPendientes?.find(p => p.empId === emp.id);

          return (
            <tr key={emp.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} hover:bg-blue-50/20 transition-colors`}>
              <td className="border border-gray-200 text-center font-bold text-gray-400 px-2 py-2.5">{idx + 1}</td>
              <td className="border border-gray-200 px-3 py-2.5 font-semibold text-gray-800 uppercase text-[10px] min-w-[160px]">{emp.nombre}</td>
              <td className="border border-gray-200 text-center px-2 py-2.5 bg-orange-50/40 text-gray-700">{formatUSD(sueldo)}</td>
              <td className="border border-gray-200 text-center px-2 py-2.5 bg-orange-50/40 font-bold text-gray-700">{diasLab}</td>
              <td className="border border-gray-200 text-center px-2 py-2.5 bg-yellow-50 font-bold text-gray-800">{formatUSD(totalB)}</td>
              <td className="border border-gray-200 text-center px-2 py-2.5 bg-orange-50/40 font-bold text-gray-700">{diasT}</td>
              <td className="border border-gray-200 text-center px-2 py-2.5 bg-orange-50/40 text-gray-500">{hrsExtras > 0 ? hrsExtras : '—'}</td>
              <td className="border border-gray-200 text-center px-2 py-2.5 bg-yellow-100/60 font-bold text-gray-800">{formatUSD(subD)}</td>
              {showIess && (
                <td className="border border-gray-200 text-center px-2 py-2.5 bg-red-50/60 text-red-700 font-semibold">{ie > 0 ? `- ${formatUSD(ie)}` : '—'}</td>
              )}
              <td className="border border-gray-200 text-center px-2 py-2.5 bg-yellow-100/60 font-extrabold text-blue-900">{formatUSD(sub)}</td>
              <td className="border border-gray-200 text-center px-2 py-2.5 bg-green-50/60 font-bold text-green-700">{totalAb > 0 ? formatUSD(totalAb) : '—'}</td>
              <td className="border border-gray-200 text-center px-2 py-2.5 bg-orange-50/60 font-bold text-orange-700">{totalAb > 0 && totalAb < sub ? formatUSD(sub - totalAb) : totalAb >= sub ? '—' : formatUSD(sub)}</td>
              <td className="border border-gray-200 text-center px-2 py-2.5 space-y-1">
                {ep === 'PAGADO' ? (
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider ${badge.cls}`}>
                    {badge.label}
                  </span>
                ) : (
                  <button onClick={() => onPagar(emp, cp, sub, sub - totalAb)}
                    className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-[9px] uppercase tracking-wider hover:from-blue-700 hover:to-blue-800 shadow-sm transition-all w-full">
                    {ep === 'ABONO_PARCIAL' ? 'Abonar' : 'Pagar'}
                  </button>
                )}
                {cross && cross.pendiente > 0 && (
                  <button onClick={() => onPagarCross(emp, cross)}
                    className="px-2.5 py-1 rounded-lg bg-orange-500 text-white font-bold text-[9px] uppercase tracking-wider hover:bg-orange-600 shadow-sm transition-all w-full">
                    Pagar Pendiente ({formatUSD(cross.pendiente)})
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr className="bg-gray-100 font-black border-t-2 border-gray-300">
          <td colSpan={2} className="border border-gray-300 px-3 py-2 text-[10px] text-gray-700 uppercase tracking-widest">TOTALES</td>
          <td className="border border-gray-300 text-center px-2 py-2 text-gray-500">—</td>
          <td className="border border-gray-300 text-center px-2 py-2 text-gray-500">—</td>
          <td className="border border-gray-300 text-center px-2 py-2 text-gray-900">{formatUSD(rows.reduce((s, r) => s + (r.cp?.totalBruto ?? r.emp.sueldoDiario * 30), 0))}</td>
          <td className="border border-gray-300 text-center px-2 py-2 text-gray-500">—</td>
          <td className="border border-gray-300 text-center px-2 py-2 text-gray-500">—</td>
          <td className="border border-gray-300 text-center px-2 py-2 text-gray-900">{formatUSD(rows.reduce((s, r) => s + r.emp.sueldoDiario * (r.cp?.diasLaborados ?? 30), 0))}</td>
          {showIess && (
            <td className="border border-gray-300 text-center px-2 py-2 text-red-700">{formatUSD(rows.reduce((s, r) => s + (r.cp?.egresos?.iess ?? 0), 0))}</td>
          )}
          <td className="border border-gray-300 text-center px-2 py-2 text-blue-900">{formatUSD(rows.reduce((s, r) => s + computeSubtotal(r.emp, r.cp, showIess), 0))}</td>
          <td className="border border-gray-300 text-center px-2 py-2 text-green-700">{formatUSD(rows.reduce((s, r) => s + (r.raw?.abonos ?? []).reduce((a, b) => a + b.monto, 0), 0))}</td>
          <td className="border border-gray-300 text-center px-2 py-2 text-orange-700">{formatUSD(rows.reduce((s, r) => {
            const sub = computeSubtotal(r.emp, r.cp, showIess);
            const pag = (r.raw?.abonos ?? []).reduce((a, b) => a + b.monto, 0);
            return s + Math.max(0, sub - pag);
          }, 0))}</td>
          <td className="border border-gray-300 text-center px-2 py-2 text-gray-500">—</td>
        </tr>
      </tfoot>
    </table>
  </div>
);

export const NominaMesTab = () => {
  const { adapter } = useContext(NominaContext);

  const [month, setMonth]   = useState(() => new Date().getMonth() + 1);
  const [year, setYear]     = useState(() => new Date().getFullYear());

  const [employees, setEmployees] = useState([]);
  const [q1Raw, setQ1Raw] = useState([]);
  const [q2Raw, setQ2Raw] = useState([]);
  const [loading, setLoading] = useState(false);
  const [payTarget, setPayTarget] = useState(null);

  const mesLabel = MESES[month - 1]?.toUpperCase() ?? '';

  const fechas1 = useMemo(() => obtenerFechasPeriodo(year, month, '1ra_quincena'), [year, month]);
  const fechas2 = useMemo(() => obtenerFechasPeriodo(year, month, '2da_quincena'), [year, month]);

  const loadAll = useCallback(async () => {
    if (!adapter) return;
    setLoading(true);
    try {
      const emps = await adapter.getEmployees();
      setEmployees(emps);

      const [p1, p2] = await Promise.all([
        adapter.getPayrolls(fechas1.fechaInicio, fechas1.fechaFin),
        adapter.getPayrolls(fechas2.fechaInicio, fechas2.fechaFin),
      ]);
      setQ1Raw(p1);
      setQ2Raw(p2);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [adapter, fechas1, fechas2]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const q1Calculated = useMemo(() =>
    employees.map(emp => {
      const n = q1Raw.find(p => p.empleadoId === emp.id);
      return n ? calcularNomina(emp, n) : null;
    }).filter(Boolean),
  [employees, q1Raw]);

  const q2Calculated = useMemo(() =>
    employees.map(emp => {
      const n = q2Raw.find(p => p.empleadoId === emp.id);
      return n ? calcularNomina(emp, n) : null;
    }).filter(Boolean),
  [employees, q2Raw]);

  const q1Rows = employees.map(emp => ({
    emp,
    cp: q1Calculated.find(p => p.empleadoId === emp.id) || null,
    raw: q1Raw.find(p => p.empleadoId === emp.id) || null,
  }));

  const q2Rows = employees.map(emp => ({
    emp,
    cp: q2Calculated.find(p => p.empleadoId === emp.id) || null,
    raw: q2Raw.find(p => p.empleadoId === emp.id) || null,
  }));

  const crossPendientes = useMemo(() => {
    const map = {};
    const addPending = (empId, rawRows, subtotalMap, quincenaNum) => {
      const raw = rawRows.find(p => p.empleadoId === empId);
      const totalAb = (raw?.abonos ?? []).reduce((s, a) => s + a.monto, 0);
      const sub = subtotalMap[empId] || 0;
      const restante = sub - totalAb;
      if (restante > 0.01) {
        map[empId] = { empId, pendiente: restante, quincenaOrigen: quincenaNum };
      }
    };
    const q1Subtotals = {};
    const q2Subtotals = {};
    q1Rows.forEach(r => { q1Subtotals[r.emp.id] = computeSubtotal(r.emp, r.cp, false); });
    q2Rows.forEach(r => { q2Subtotals[r.emp.id] = computeSubtotal(r.emp, r.cp, true); });
    Object.keys(q1Subtotals).forEach(id => addPending(id, q1Raw, q1Subtotals, 1));
    Object.keys(q2Subtotals).forEach(id => addPending(id, q2Raw, q2Subtotals, 2));
    return map;
  }, [q1Rows, q2Rows, q1Raw, q2Raw]);

  const handleMesAnterior = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const handleMesSiguiente = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const handlePagar = (emp, cp, sub, restantePagar, quincena) => {
    const maxMonto = Math.max(0, Math.round(restantePagar * 100) / 100);
    setPayTarget({
      emp, cp, subtotal: sub,
      monto: maxMonto,
      maxMonto,
      restante: 0,
      quincenaOrigen: quincena,
      quincenaDestino: 0,
    });
  };

  const handlePagarCross = (emp, cross) => {
    const monto = Math.round(cross.pendiente * 100) / 100;
    setPayTarget({
      emp, cp: null, subtotal: cross.pendiente,
      monto,
      maxMonto: monto,
      restante: 0,
      quincenaOrigen: cross.quincenaOrigen,
      quincenaDestino: cross.quincenaOrigen,
      isCross: true,
    });
  };

  const handleMontoChange = (val) => {
    if (!payTarget) return;
    const newMonto = Math.round(val * 100) / 100;
    const nuevoRestante = Math.max(0, Math.round((payTarget.maxMonto - newMonto) * 100) / 100);
    setPayTarget(prev => ({ ...prev, monto: newMonto, restante: nuevoRestante }));
  };

  const pagarQuincena = async (rawArr, setter, fechas, empId, monto, fecha, subtotal) => {
    let nomina = rawArr.find(p => p.empleadoId === empId);
    if (!nomina) {
      const created = await adapter.getPayrolls(fechas.fechaInicio, fechas.fechaFin);
      nomina = created.find(p => p.empleadoId === empId);
    }
    if (nomina) {
      const actualizada = registrarAbono(nomina, { monto, fecha });
      const totalAb = actualizada.abonos.reduce((s, a) => s + a.monto, 0);
      if (subtotal > 0 && totalAb >= subtotal) {
        actualizada.estado = 'PAGADO';
      } else if (totalAb > 0) {
        actualizada.estado = 'ABONO_PARCIAL';
      }
      const saved = await adapter.savePayroll(actualizada);
      setter(prev => prev.map(p => p.empleadoId === saved.empleadoId ? saved : p));
    }
  };

  const handleConfirmPago = async () => {
    if (!payTarget || !payTarget.monto || payTarget.monto <= 0) return;
    try {
      const hoy = new Date().toISOString().slice(0, 10);
      const empId = payTarget.emp.id;
      const emp   = payTarget.emp;
      const cp1   = q1Calculated.find(p => p.empleadoId === empId);
      const cp2   = q2Calculated.find(p => p.empleadoId === empId);
      const subQ1 = computeSubtotal(emp, cp1, false);
      const subQ2 = computeSubtotal(emp, cp2, true);

      if (payTarget.isCross) {
        const qDest = payTarget.quincenaDestino || payTarget.quincenaOrigen;
        const sub   = qDest === 1 ? subQ1 : subQ2;
        const arr   = qDest === 1 ? q1Raw : q2Raw;
        const set   = qDest === 1 ? setQ1Raw : setQ2Raw;
        const fec   = qDest === 1 ? fechas1 : fechas2;
        await pagarQuincena(arr, set, fec, empId, payTarget.monto, hoy, sub);
      } else {
        if (payTarget.quincenaOrigen === 2) {
          await pagarQuincena(q2Raw, setQ2Raw, fechas2, empId, payTarget.monto, hoy, subQ2);
        } else {
          await Promise.all([
            pagarQuincena(q1Raw, setQ1Raw, fechas1, empId, payTarget.monto, hoy, subQ1),
            pagarQuincena(q2Raw, setQ2Raw, fechas2, empId, payTarget.monto, hoy, subQ2),
          ]);
        }
      }
      setPayTarget(null);
    } catch (err) {
      alert('Error al procesar el pago');
    }
  };

  const totalPagadoQ1 = q1Rows.reduce((s, r) => s + ((r.raw?.abonos ?? []).reduce((a, b) => a + b.monto, 0)), 0);
  const totalPagadoQ2 = q2Rows.reduce((s, r) => s + ((r.raw?.abonos ?? []).reduce((a, b) => a + b.monto, 0)), 0);
  const totalQ1 = q1Rows.reduce((s, r) => s + computeSubtotal(r.emp, r.cp, false), 0);
  const totalQ2 = q2Rows.reduce((s, r) => s + computeSubtotal(r.emp, r.cp, true), 0);

  const totalPagado = totalPagadoQ1 + totalPagadoQ2;
  const totalPendiente = (totalQ1 + totalQ2) - totalPagado;

  if (loading && !employees.length) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm font-semibold">
        Cargando nómina...
      </div>
    );
  }

  return (
    <div className="animate-slide-up space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-blue-900 tracking-tight uppercase">
            Rol Quincenal — {mesLabel} {year}
          </h2>
          <p className="text-gray-400 text-xs mt-0.5">
            Nómina dividida en primera y segunda quincena. Los pagos pendientes de una quincena aparecen en la otra.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleMesAnterior}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 font-bold shadow-sm transition-all">&#8249;</button>
          <span className="text-sm font-bold text-gray-700 min-w-[140px] text-center">{mesLabel} {year}</span>
          <button onClick={handleMesSiguiente}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 font-bold shadow-sm transition-all">&#8250;</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden space-y-px">
        <QuincenaTable label={`PRIMERA QUINCENA — ${mesLabel} ${year} (01 AL 15)`}
          rows={q1Rows}
          showIess={false}
          crossPendientes={Object.values(crossPendientes).filter(p => p.quincenaOrigen === 2)}
          onPagar={(emp, cp, sub, restante) => handlePagar(emp, cp, sub, restante, 1)}
          onPagarCross={(emp, cross) => handlePagarCross(emp, cross)} />

        <div className="border-t border-gray-200" />

        <QuincenaTable label={`SEGUNDA QUINCENA — ${mesLabel} ${year} (16 AL ${new Date(year, month, 0).getDate()})`}
          rows={q2Rows}
          crossPendientes={Object.values(crossPendientes).filter(p => p.quincenaOrigen === 1)}
          onPagar={(emp, cp, sub, restante) => handlePagar(emp, cp, sub, restante, 2)}
          onPagarCross={(emp, cross) => handlePagarCross(emp, cross)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Mes</p>
          <p className="text-2xl font-extrabold text-blue-900 mt-1">{formatUSD(totalQ1 + totalQ2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Pagado</p>
          <p className="text-2xl font-extrabold text-green-600 mt-1">{formatUSD(totalPagado)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Pendiente</p>
          <p className="text-2xl font-extrabold text-red-600 mt-1">{formatUSD(totalPendiente)}</p>
        </div>
      </div>

      {payTarget && createPortal(
        <PayModal
          emp={payTarget.emp}
          monto={payTarget.monto}
          maxMonto={payTarget.maxMonto}
          restante={payTarget.restante}
          isCross={payTarget.isCross}
          quincenaLabel={`${mesLabel} ${year}`}
          onClose={() => setPayTarget(null)}
          onConfirm={handleConfirmPago}
          onMontoChange={handleMontoChange}
        />,
        document.body
      )}
    </div>
  );
};
