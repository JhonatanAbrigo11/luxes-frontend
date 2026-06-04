// c:/Users/Morqu/OneDrive/Documentos/JAIMS/Luxes/luxes-frontend/src/features/nomina/ui/pages/NominaPage.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNomina } from '../../application/hooks/useNomina';
import { PeriodSelector } from '../components/PeriodSelector';
import { PayrollTable } from '../components/PayrollTable';
import { NominaForm } from '../components/NominaForm';

const formatUSD = (val) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(val);
};

export const NominaPage = () => {
  const navigate = useNavigate();
  const {
    employees,
    calculatedPayrolls,
    globalSummary,
    activePeriod,
    loadData,
    changePeriod,
    savePayrollRecord,
    selectedEmployee,
    selectedRawPayroll,
    setSelectedEmployee,
  } = useNomina();

  const [isEditing, setIsEditing] = useState(false);

  // Cargar datos al montar y al cambiar de período
  useEffect(() => {
    loadData();
  }, [loadData, activePeriod]);

  const handleEdit = (empleadoId) => {
    setSelectedEmployee(empleadoId);
    setIsEditing(true);
  };

  const handleViewRol = (empleadoId) => {
    setSelectedEmployee(empleadoId);
    navigate(`rol/${empleadoId}`);
  };

  const handleSaveNomina = async (updatedNomina) => {
    await savePayrollRecord(updatedNomina);
    setIsEditing(false);
    setSelectedEmployee(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedEmployee(null);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      
      {/* Cabecera Principal */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-gray-200/60">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight bg-gradient-to-r from-blue-900 to-indigo-950 bg-clip-text text-transparent">
            Gestión de Nómina
          </h1>
          <p className="text-gray-500 text-sm mt-1">Calcula salarios, ingresos adicionales, retenciones de IESS y abonos quincenales.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('horas-extras')}
            className="px-4 py-2.5 bg-white border border-gray-200 hover:border-blue-600 hover:text-blue-700 text-gray-700 font-bold rounded-xl text-xs shadow-xs transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            <span>⏰</span> Planilla Horas Extras
          </button>
        </div>
      </div>

      {/* Tarjetas de Resumen Rápido (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="premium-card p-5 rounded-xl border-t-4 border-t-blue-700 flex flex-col justify-between h-[120px]">
          <span className="text-3xs font-bold text-gray-400 uppercase tracking-widest">Costo Nómina</span>
          <span className="text-2xl font-black text-blue-900 leading-none">{formatUSD(globalSummary.netoTotal)}</span>
          <span className="text-3xs text-gray-400 font-medium">Valor neto total a pagar</span>
        </div>
        <div className="premium-card p-5 rounded-xl border-t-4 border-t-green-600 flex flex-col justify-between h-[120px]">
          <span className="text-3xs font-bold text-green-700 uppercase tracking-widest">Abonado / Anticipos</span>
          <span className="text-2xl font-black text-green-600 leading-none">+{formatUSD(globalSummary.abonadoTotal)}</span>
          <span className="text-3xs text-gray-400 font-medium">Suma de adelantos registrados</span>
        </div>
        <div className="premium-card p-5 rounded-xl border-t-4 border-t-red-500 flex flex-col justify-between h-[120px]">
          <span className="text-3xs font-bold text-red-700 uppercase tracking-widest">Saldo Pendiente</span>
          <span className="text-2xl font-black text-red-500 leading-none">{formatUSD(globalSummary.pendienteTotal)}</span>
          <span className="text-3xs text-gray-400 font-medium">Valor restante por pagar</span>
        </div>
        <div className="premium-card p-5 rounded-xl border-t-4 border-t-slate-400 flex flex-col justify-between h-[120px]">
          <span className="text-3xs font-bold text-gray-400 uppercase tracking-widest">Colaboradores</span>
          <span className="text-2xl font-black text-slate-800 leading-none">{globalSummary.totalColaboradores} Activos</span>
          <span className="text-3xs text-gray-400 font-medium">Nóminas vigentes en el período</span>
        </div>
      </div>

      {/* Selector de Período */}
      <PeriodSelector activePeriod={activePeriod} onChange={changePeriod} />

      {/* Tabla Principal */}
      <PayrollTable
        calculatedPayrolls={calculatedPayrolls}
        globalSummary={globalSummary}
        onEdit={handleEdit}
        onViewRol={handleViewRol}
      />

      {/* Modal Formulario de Edición */}
      {isEditing && selectedEmployee && selectedRawPayroll && (
        <NominaForm
          empleado={selectedEmployee}
          rawNomina={selectedRawPayroll}
          onSave={handleSaveNomina}
          onCancel={handleCancelEdit}
        />
      )}

    </div>
  );
};
