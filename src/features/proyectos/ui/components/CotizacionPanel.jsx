import React, { useState, useRef, useEffect } from 'react';
import { Search, FileText, Eye, X, CheckCircle, Clock, FileEdit, Calendar } from 'lucide-react';
import { useProyecto } from '../../application/hooks/useProyecto.js';
import { getProformas } from '../../../proformas/application/proformasService.js';
import { ProformaPDF } from '../../../proformas/ui/components/ProformaPDF.jsx';

export function CotizacionPanel({ proyectoId, soloLectura }) {
  const { proyecto } = useProyecto(proyectoId);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCotizaciones, setSelectedCotizaciones] = useState(proyecto?.fases?.COTIZACION?.cotizacionesSeleccionadas || []);
  const [previewOriginal, setPreviewOriginal] = useState(null);
  const [proformas, setProformas] = useState([]);
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

  useEffect(() => {
    getProformas().then(all => setProformas(all));
  }, []);

  const normProformas = proformas.map(p => ({
    id: p.id,
    cliente: p.cliente,
    creadoPor: '—',
    fecha: p.fecha,
    total: p.items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0),
    estado: p.estado,
    items: p.items,
    iva: p.iva,
  }));

  // Filtrar proformas que no estén ya seleccionadas
  const filteredProformas = normProformas.filter(c => 
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
          Vincular Proformas
        </label>
        <div className="relative" ref={searchRef}>
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            disabled={soloLectura}
            className={`w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${soloLectura ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-50 focus:bg-white'}`}
            placeholder="Buscar proforma por código o cliente..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
          />
          
          {/* Dropdown de resultados */}
          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-80 overflow-y-auto">
              {filteredProformas.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  {proformas.length === 0 ? 'No hay proformas disponibles.' : `No se encontraron proformas para "${searchTerm}"`}
                </div>
              ) : (
                filteredProformas.map(c => (
                  <button
                    key={c.id}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors text-left"
                    onClick={() => handleSelect(c)}
                  >
                    <div className="flex-1 pr-4">
                      <p className="text-sm font-bold text-slate-800 mb-0.5">{c.id}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span className="font-semibold text-slate-600">{c.cliente}</span>
                        <span className="flex items-center gap-1"><FileText size={12} className="text-slate-400" /> {c.items?.length || 0} ítem(s)</span>
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
            Proformas Vinculadas
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
                        <span className="flex items-center gap-1"><FileText size={10} className="text-slate-400" /> {c.items?.length || 0} ítem(s)</span>
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
                    onClick={() => setPreviewOriginal(proformas.find(p => p.id === c.id) || null)}
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

      {/* Modal Preview PDF — mismo diseño que Proformas */}
      {previewOriginal && (
        <ProformaPDF proforma={previewOriginal} onClose={() => setPreviewOriginal(null)} />
      )}
    </div>
  );
}
