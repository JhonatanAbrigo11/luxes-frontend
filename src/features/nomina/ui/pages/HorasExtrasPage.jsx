// c:/Users/Morqu/OneDrive/Documentos/JAIMS/Luxes/luxes-frontend/src/features/nomina/ui/pages/HorasExtrasPage.jsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNomina } from '../../application/hooks/useNomina';
import { HorasExtrasTable } from '../components/HorasExtrasTable';

export const HorasExtrasPage = () => {
  const navigate = useNavigate();
  const { employees, overtime, loading, loadData, saveOvertimeRecords } = useNomina();

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveOvertime = async (updatedOvertime) => {
    await saveOvertimeRecords(updatedOvertime);
    alert('Planilla de horas extras guardada correctamente.');
    navigate('/nomina');
  };

  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500 text-sm">
        Cargando planilla de horas extras...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Cabecera / Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider">
        <button onClick={() => navigate('/nomina')} className="hover:text-blue-700 font-bold transition-all">Nómina</button>
        <span>/</span>
        <span className="font-semibold text-gray-800">Horas Extras</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-900 tracking-tight">Registro de Horas Extras</h1>
          <p className="text-gray-500 text-sm mt-1">Planilla diaria de horas extras laboradas por colaborador.</p>
        </div>
        <button
          onClick={() => navigate('/nomina')}
          className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-xs shadow-2xs transition-all duration-200"
        >
          Volver a Nómina
        </button>
      </div>

      {/* Tabla y Resumen */}
      <HorasExtrasTable
        employees={employees}
        initialOvertime={overtime}
        onSave={handleSaveOvertime}
      />

    </div>
  );
};
