// c:/Users/Morqu/OneDrive/Documentos/JAIMS/Luxes/luxes-frontend/src/features/nomina/ui/pages/RolDePagoPage.jsx

import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNomina } from '../../application/hooks/useNomina';
import { RolDePagoDoc } from '../components/RolDePagoDoc';

export const RolDePagoPage = () => {
  const { empleadoId } = useParams();
  const navigate = useNavigate();
  const { employees, calculatedPayrolls, activePeriod, loadData, setSelectedEmployee } = useNomina();

  const id = Number(empleadoId);

  // Cargar datos si el estado está vacío al recargar la página directamente
  useEffect(() => {
    if (employees.length === 0) {
      loadData();
    }
  }, [employees, loadData]);

  // Sincronizar el ID seleccionado en el almacén global
  useEffect(() => {
    if (id) {
      setSelectedEmployee(id);
    }
    return () => {
      setSelectedEmployee(null);
    };
  }, [id, setSelectedEmployee]);

  // Buscar el colaborador
  const empleado = useMemo(() => {
    return employees.find(e => e.id === id) || null;
  }, [employees, id]);

  // Buscar la nómina calculada
  const calculatedPayroll = useMemo(() => {
    return calculatedPayrolls.find(p => p.empleadoId === id) || null;
  }, [calculatedPayrolls, id]);

  if (!empleado || !calculatedPayroll) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center print:hidden">
          <button
            onClick={() => navigate('/nomina')}
            className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-xs transition-all"
          >
            Volver a Nómina
          </button>
        </div>
        <div className="flex justify-center items-center py-20 text-gray-500 text-sm">
          No se encontró el rol de pago para el colaborador especificado en este período.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Cabecera / Breadcrumbs - Ocultos al Imprimir */}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider">
          <button onClick={() => navigate('/nomina')} className="hover:text-blue-700 font-bold transition-all">Nómina</button>
          <span>/</span>
          <span className="font-semibold text-gray-800">Rol de Pago</span>
        </div>
        <button
          onClick={() => navigate('/nomina')}
          className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-xs shadow-2xs transition-all duration-200"
        >
          Volver a Nómina
        </button>
      </div>

      {/* Comprobante de Rol de Pago */}
      <RolDePagoDoc
        empleado={empleado}
        calculatedPayroll={calculatedPayroll}
        activePeriod={activePeriod}
      />

    </div>
  );
};
