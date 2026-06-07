import React, { useState, useRef, useEffect } from 'react';
import { Search, FileText, Eye, X, CheckCircle, Clock, FileEdit, User, Calendar } from 'lucide-react';
import { useProyecto } from '../../application/hooks/useProyecto.js';

const MOCK_COTIZACIONES = [
  { id: 'COT-2026-001', cliente: 'Restaurante El Sabor', creadoPor: 'Ana López', fecha: '01/06/2026', total: 2333.00, estado: 'Aprobada' },
  { id: 'COT-2026-002', cliente: 'Óptica GYE', creadoPor: 'Carlos Ruiz', fecha: '02/06/2026', total: 850.50, estado: 'Pendiente' },
  { id: 'COT-2026-003', cliente: 'Boutique Paris', creadoPor: 'Ana López', fecha: '03/06/2026', total: 1200.00, estado: 'Borrador' },
  { id: 'COT-2026-004', cliente: 'Hotel Miramar', creadoPor: 'Mario Vega', fecha: '04/06/2026', total: 5400.00, estado: 'Pendiente' },
  { id: 'COT-2026-005', cliente: 'Agencia Nova', creadoPor: 'Carlos Ruiz', fecha: '04/06/2026', total: 310.00, estado: 'Aprobada' },
];

export function CotizacionPanel({ proyectoId, soloLectura }) {
  const { proyecto } = useProyecto(proyectoId);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCotizaciones, setSelectedCotizaciones] = useState(proyecto?.fases?.COTIZACION?.cotizacionesSeleccionadas || []);
  const [previewCotizacion, setPreviewCotizacion] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar cotizaciones que no estén ya seleccionadas
  const filteredCotizaciones = MOCK_COTIZACIONES.filter(c => 
    !selectedCotizaciones.find(sc => sc.id === c.id) &&
    (c.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
     c.cliente.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelect = (cotizacion) => {
    setSelectedCotizaciones([...selectedCotizaciones, cotizacion]);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const handleRemove = (id) => {
    setSelectedCotizaciones(selectedCotizaciones.filter(c => c.id !== id));
  };

  const getEstadoIcon = (estado) => {
    switch(estado) {
      case 'Aprobada': return <CheckCircle size={14} className="text-emerald-500" />;
      case 'Pendiente': return <Clock size={14} className="text-amber-500" />;
      default: return <FileEdit size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Buscador */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Vincular Cotizaciones
        </label>
        <div className="relative" ref={searchRef}>
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            disabled={soloLectura}
            className={`w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${soloLectura ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-50 focus:bg-white'}`}
            placeholder="Buscar por código, cliente o usuario..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
          />
          
          {/* Dropdown de resultados */}
          {isDropdownOpen && searchTerm.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-80 overflow-y-auto">
              {filteredCotizaciones.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  No se encontraron cotizaciones para "{searchTerm}"
                </div>
              ) : (
                filteredCotizaciones.map(c => (
                  <button
                    key={c.id}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors text-left"
                    onClick={() => handleSelect(c)}
                  >
                    <div className="flex-1 pr-4">
                      <p className="text-sm font-bold text-slate-800 mb-0.5">{c.id}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span className="font-semibold text-slate-600">{c.cliente}</span>
                        <span className="flex items-center gap-1"><User size={12} className="text-slate-400" /> {c.creadoPor}</span>
                        <span className="flex items-center gap-1"><Calendar size={12} className="text-slate-400" /> {c.fecha}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-slate-700">${c.total.toFixed(2)}</p>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        {getEstadoIcon(c.estado)}
                        <span className="text-[10px] uppercase tracking-wider text-slate-500">{c.estado}</span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tarjetas seleccionadas */}
      {selectedCotizaciones.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Cotizaciones Vinculadas
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedCotizaciones.map(c => (
              <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col shadow-sm group hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 leading-tight">{c.id}</p>
                      <p className="text-xs font-medium text-slate-600 mt-0.5">{c.cliente}</p>
                      <div className="flex flex-col gap-0.5 mt-1 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        <span className="flex items-center gap-1"><Calendar size={10} className="text-slate-400" /> {c.fecha}</span>
                        <span className="flex items-center gap-1"><User size={10} className="text-slate-400" /> {c.creadoPor}</span>
                      </div>
                    </div>
                  </div>
                  {!soloLectura && (
                    <button 
                      onClick={() => handleRemove(c.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1"
                      title="Desvincular cotización"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                
                <div className="flex items-end justify-between mt-auto pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold mb-0.5">Monto Total</p>
                    <p className="text-sm font-bold text-slate-700">${c.total.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => setPreviewCotizacion(c)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Eye size={14} />
                    Ver PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Preview PDF */}
      {previewCotizacion && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-slate-100 rounded-2xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Header del Modal */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">
                    Documento PDF - {previewCotizacion.id}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Cliente: {previewCotizacion.cliente}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setPreviewCotizacion(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Contenido Fake PDF */}
            <div className="flex-1 p-8 overflow-y-auto bg-slate-200/50 flex flex-col items-center">
              {/* Hoja A4 simulada */}
              <div className="w-full max-w-2xl bg-white shadow-md aspect-[1/1.414] p-10 flex flex-col">
                <div className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-end">
                  <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter">LUXES</h1>
                    <p className="text-xs text-slate-500 font-medium mt-1">Agencia de Publicidad</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl font-bold text-slate-300">COTIZACIÓN</h2>
                    <p className="text-sm font-bold text-slate-800">{previewCotizacion.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-10 text-sm">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Preparado para</p>
                    <p className="font-bold text-slate-800">{previewCotizacion.cliente}</p>
                    <p className="text-slate-600">Guayaquil, Ecuador</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Fecha de emisión</p>
                    <p className="font-medium text-slate-800">{previewCotizacion.fecha}</p>
                  </div>
                </div>

                <table className="w-full mb-8 text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left py-2 text-slate-600 font-bold">Descripción</th>
                      <th className="text-right py-2 text-slate-600 font-bold w-24">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-4">
                        <p className="font-semibold text-slate-800">Desarrollo e Instalación</p>
                        <p className="text-xs text-slate-500 mt-1">Servicios publicitarios según requerimientos del cliente.</p>
                      </td>
                      <td className="py-4 text-right font-medium">${previewCotizacion.total.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="mt-auto border-t border-slate-200 pt-6 flex justify-end">
                  <div className="w-48">
                    <div className="flex justify-between py-1 text-sm">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-medium">${previewCotizacion.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 text-sm">
                      <span className="text-slate-500">IVA (0%)</span>
                      <span className="font-medium">$0.00</span>
                    </div>
                    <div className="flex justify-between py-2 text-lg font-bold border-t border-slate-800 mt-2">
                      <span>Total</span>
                      <span>${previewCotizacion.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
