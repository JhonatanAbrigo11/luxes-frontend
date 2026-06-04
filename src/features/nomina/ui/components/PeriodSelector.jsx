// c:/Users/Morqu/OneDrive/Documentos/JAIMS/Luxes/luxes-frontend/src/features/nomina/ui/components/PeriodSelector.jsx

import React from 'react';

const MESES = [
  { valor: 1, nombre: "Enero" },
  { valor: 2, nombre: "Febrero" },
  { valor: 3, nombre: "Marzo" },
  { valor: 4, nombre: "Abril" },
  { valor: 5, nombre: "Mayo" },
  { valor: 6, nombre: "Junio" },
  { valor: 7, nombre: "Julio" },
  { valor: 8, nombre: "Agosto" },
  { valor: 9, nombre: "Septiembre" },
  { valor: 10, nombre: "Octubre" },
  { valor: 11, nombre: "Noviembre" },
  { valor: 12, nombre: "Diciembre" },
];

export const PeriodSelector = ({ activePeriod, onChange }) => {
  const { year, month, type } = activePeriod;

  const handleMonthChange = (e) => {
    onChange(year, Number(e.target.value), type);
  };

  const handleYearChange = (e) => {
    onChange(Number(e.target.value), month, type);
  };

  const handleTypeChange = (newType) => {
    onChange(year, month, newType);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
      {/* Selector de Mes/Año */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Período de Nómina</label>
          <div className="flex gap-2">
            <select
              value={month}
              onChange={handleMonthChange}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all cursor-pointer"
            >
              {MESES.map((m) => (
                <option key={m.valor} value={m.valor}>
                  {m.nombre}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={handleYearChange}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all cursor-pointer"
            >
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs segmentados de tipo de período */}
      <div className="flex flex-col">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 md:text-right">Frecuencia</label>
        <div className="bg-gray-100 p-1 rounded-lg flex items-center gap-1">
          <button
            onClick={() => handleTypeChange("mensual")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
              type === "mensual"
                ? "bg-white text-blue-800 shadow-sm font-bold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => handleTypeChange("1ra_quincena")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
              type === "1ra_quincena"
                ? "bg-white text-blue-800 shadow-sm font-bold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            1ra Quincena
          </button>
          <button
            onClick={() => handleTypeChange("2da_quincena")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
              type === "2da_quincena"
                ? "bg-white text-blue-800 shadow-sm font-bold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            2da Quincena
          </button>
        </div>
      </div>
    </div>
  );
};
