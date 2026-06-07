import React, { useState, useEffect } from 'react';
import { CredencialCard } from '../components/CredencialCard';
import { getEmpleados } from '../../../empleados/application/empleadosService';

export const CredencialesPage = () => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [printingId, setPrintingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getEmpleados();
        setEmpleados(data);
      } catch (err) {
        console.error('Error loading employees for credentials', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handlePrint = (id) => {
    setPrintingId(id);
    setTimeout(() => { window.print(); setPrintingId(null); }, 150);
  };

  return (
    <div className="p-6 md:p-8 w-full animate-slide-up">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#02188E] via-blue-700 to-indigo-500 bg-clip-text text-transparent">
          Credenciales
        </h1>
        <p className="text-gray-400 mt-1.5 text-sm">
          Carnets de empleados con código QR para imprimir.
        </p>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-200 border-t-blue-500" />
        </div>
      ) : (
        <div className="flex flex-wrap gap-7 justify-center">
          {empleados.map(emp => (
            <CredencialCard
              key={emp.id}
              emp={emp}
              isPrinting={printingId === emp.id}
              onPrint={handlePrint}
            />
          ))}
          {empleados.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-12">No hay empleados registrados</p>
          )}
        </div>
      )}

      {/* Print Styles */}
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
    </div>
  );
};
