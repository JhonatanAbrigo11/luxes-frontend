// c:/Users/Morqu/OneDrive/Documentos/JAIMS/Luxes/luxes-frontend/src/features/nomina/ui/components/HorasExtrasTable.jsx

import React, { useState, useMemo } from 'react';
import { HoraExtra } from '../../domain/entities/HoraExtra';
import { calcularHorasExtras } from '../../domain/use-cases/calcularHorasExtras';

const formatUSD = (val) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(val);
};

export const HorasExtrasTable = ({ employees, initialOvertime, onSave }) => {
  // Estado local para edición en planilla
  const [records, setRecords] = useState(
    initialOvertime.map(he => ({
      id: he.id,
      fecha: he.fecha,
      colaboradorId: he.colaboradorId,
      horas: he.horas,
      detalleHorario: he.detalleHorario,
      descripcion: he.descripcion,
      valorPorHora: he.valorPorHora,
    }))
  );

  // Calcular resumen consolidado reactivo
  const summary = useMemo(() => {
    // Mapear records a entidades para calcular
    const heEntities = records.map(r => new HoraExtra(r));
    return calcularHorasExtras(employees, heEntities);
  }, [records, employees]);

  const handleChange = (id, field, value) => {
    setRecords(prev =>
      prev.map(row => {
        if (row.id === id) {
          const updated = { ...row, [field]: value };
          return updated;
        }
        return row;
      })
    );
  };

  const handleAddRow = () => {
    const today = new Date().toISOString().split('T')[0];
    const firstEmpId = employees.length > 0 ? employees[0].id : '';
    const newRow = {
      id: Math.random().toString(36).substr(2, 9),
      fecha: today,
      colaboradorId: firstEmpId,
      horas: 1,
      detalleHorario: "17:30 - 18:30",
      descripcion: "Horas extras de soporte",
      valorPorHora: 2.50,
    };
    setRecords(prev => [...prev, newRow]);
  };

  const handleRemoveRow = (id) => {
    setRecords(prev => prev.filter(row => row.id !== id));
  };

  const handleSave = () => {
    try {
      // Validar todos los campos antes de guardar
      const entities = records.map(r => {
        const entity = new HoraExtra(r);
        entity.validate();
        return entity;
      });
      onSave(entities);
    } catch (err) {
      alert(`Error en la planilla: ${err.message}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-slide-up">
      
      {/* Planilla de Ingreso (8 columnas en lg) */}
      <div className="lg:col-span-8 bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden flex flex-col p-6 space-y-4 premium-card">
        <div className="flex justify-between items-center pb-3 border-b border-gray-250">
          <div>
            <h2 className="text-base font-extrabold text-blue-900 uppercase tracking-wide">Planilla de Horas Extras</h2>
            <p className="text-gray-500 text-xs mt-0.5">Ingresa los registros diarios detallados. El total se calcula automáticamente.</p>
          </div>
          <button
            onClick={handleAddRow}
            className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-700 hover:text-white rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
          >
            <span>➕</span> Agregar Fila
          </button>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No hay registros de horas extras en esta planilla. Haz clic en "Agregar Fila" para comenzar.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[450px] sticky-scrollbar">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-widest sticky top-0 z-10 sticky-table-header">
                <tr>
                  <th className="px-3 py-3 w-[125px]">Fecha</th>
                  <th className="px-3 py-3 w-[180px]">Colaborador</th>
                  <th className="px-3 py-3 w-[70px] text-center">Horas</th>
                  <th className="px-3 py-3 w-[110px]">Detalle Horario</th>
                  <th className="px-3 py-3">Descripción</th>
                  <th className="px-3 py-3 w-[80px]">V/Hora</th>
                  <th className="px-3 py-3 w-[80px]">Total</th>
                  <th className="px-3 py-3 w-[45px] text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {records.map((row) => {
                  const calculatedTotal = Number(row.horas || 0) * Number(row.valorPorHora || 0);
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/50">
                      <td className="px-2 py-2">
                        <input
                          type="date"
                          value={row.fecha}
                          onChange={(e) => handleChange(row.id, 'fecha', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 payroll-input"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <select
                          value={row.colaboradorId}
                          onChange={(e) => handleChange(row.id, 'colaboradorId', Number(e.target.value))}
                          className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer payroll-input"
                        >
                          {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>
                              {emp.nombre}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={row.horas}
                          onChange={(e) => handleChange(row.id, 'horas', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs text-center font-bold text-gray-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 payroll-input"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          placeholder="17:30 - 20:00"
                          value={row.detalleHorario}
                          onChange={(e) => handleChange(row.id, 'detalleHorario', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 payroll-input"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          placeholder="Detalle de tarea..."
                          value={row.descripcion}
                          onChange={(e) => handleChange(row.id, 'descripcion', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 payroll-input"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={row.valorPorHora}
                          onChange={(e) => handleChange(row.id, 'valorPorHora', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 payroll-input"
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-bold text-gray-900">
                        {formatUSD(calculatedTotal)}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button
                          onClick={() => handleRemoveRow(row.id)}
                          className="text-red-500 hover:text-red-700 font-bold text-sm outline-none cursor-pointer"
                          title="Eliminar registro"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {records.length > 0 && (
          <div className="flex justify-end pt-4 border-t border-gray-150">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-900/10 transition-all duration-200 cursor-pointer"
            >
              Guardar Cambios en Planilla
            </button>
          </div>
        )}
      </div>

      {/* Resumen por Colaborador (4 columnas en lg) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6 space-y-4 premium-card border-t-4 border-t-blue-700">
          <div>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Resumen Acumulado</h3>
            <p className="text-gray-500 text-xs mt-0.5">Totales acumulados a pagar por colaborador en este período.</p>
          </div>

          <div className="divide-y divide-gray-100 max-h-[350px] overflow-y-auto sticky-scrollbar">
            {Object.values(summary.porColaborador).map(col => (
              <div key={col.empleadoId} className="py-3 flex justify-between items-center text-xs">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800 uppercase text-xs">{col.nombre}</span>
                  <span className="text-gray-500 text-[10px]">{col.horas} horas extras</span>
                </div>
                <span className="font-bold text-blue-700 text-xs bg-blue-50/50 border border-blue-100/60 px-2.5 py-1 rounded-lg">
                  {formatUSD(col.total)}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex justify-between items-center pt-3 mt-4 border-t border-gray-200">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total General</span>
              <span className="text-gray-600 text-xs font-semibold">{summary.totalHorasGeneral} horas registradas</span>
            </div>
            <span className="font-black text-blue-900 text-base">
              {formatUSD(summary.totalGeneral)}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
