// src/features/proyectos/ui/components/MaterialesForm.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Search, Package, Wrench, X, AlertCircle } from 'lucide-react';

const INVENTARIO_MOCK = [
  { id: 'INV-001', nombre: 'Taladro Percutor DeWalt', tipo: 'herramienta', disponible: false, razon: 'No devuelta (En proyecto #P4)' },
  { id: 'INV-002', nombre: 'Escalera de aluminio 3m', tipo: 'herramienta', disponible: true },
  { id: 'INV-003', nombre: 'Pistola de calor', tipo: 'herramienta', disponible: true },
  { id: 'INV-004', nombre: 'Tornillos auto-roscantes', tipo: 'material', disponible: true },
  { id: 'INV-005', nombre: 'Cinta doble faz 3M', tipo: 'material', disponible: true },
  { id: 'INV-006', nombre: 'Silicón transparente', tipo: 'material', disponible: true },
  { id: 'INV-007', nombre: 'Andamio cuerpo completo', tipo: 'herramienta', disponible: false, razon: 'En mantenimiento' },
];

const UNIDADES = ['unidad', 'metro', 'litro', 'galón', 'caja', 'paquete'];

export function MaterialesForm({ materiales = [], onChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  const unselectedItems = INVENTARIO_MOCK.filter(
    (item) => !materiales.some((m) => m.inventarioId === item.id) &&
              item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (item) => {
    if (!item.disponible) return;

    onChange([
      ...materiales,
      { 
        inventarioId: item.id, 
        nombre: item.nombre, 
        tipo: item.tipo,
        cantidad: 1, 
        unidad: item.tipo === 'herramienta' ? 'unidad' : 'unidad', 
        observacion: '' 
      }
    ]);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const handleRemove = (inventarioId) => {
    onChange(materiales.filter((m) => m.inventarioId !== inventarioId));
  };

  const handleChangeAtributo = (inventarioId, campo, valor) => {
    onChange(
      materiales.map((m) =>
        m.inventarioId === inventarioId ? { ...m, [campo]: valor } : m
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Buscador de Inventario */}
      <div className="relative" ref={searchRef}>
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white transition-colors"
          placeholder="Buscar herramientas o materiales en inventario..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
        />
        
        {/* Dropdown de Inventario */}
        {isDropdownOpen && searchTerm.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
            {unselectedItems.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                No se encontraron artículos en inventario
              </div>
            ) : (
              unselectedItems.map((item) => (
                <button
                  key={item.id}
                  disabled={!item.disponible}
                  className={`w-full flex items-center justify-between p-3 border-b border-slate-100 last:border-0 transition-colors text-left
                    ${item.disponible ? 'hover:bg-slate-50 cursor-pointer' : 'bg-slate-50 opacity-60 cursor-not-allowed'}`}
                  onClick={() => handleSelect(item)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${item.tipo === 'herramienta' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {item.tipo === 'herramienta' ? <Wrench size={16} /> : <Package size={16} />}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${item.disponible ? 'text-slate-800' : 'text-slate-500 line-through'}`}>
                        {item.nombre}
                      </p>
                      {item.disponible ? (
                        <p className="text-xs text-slate-500 capitalize">{item.tipo}</p>
                      ) : (
                        <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-0.5">
                          <AlertCircle size={12} />
                          {item.razon}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{item.id}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Tarjetas de Materiales/Herramientas Seleccionadas */}
      {materiales.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {materiales.map((m) => (
            <div key={m.inventarioId} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col shadow-sm group hover:border-indigo-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${m.tipo === 'herramienta' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {m.tipo === 'herramienta' ? <Wrench size={18} /> : <Package size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 line-clamp-1" title={m.nombre}>{m.nombre}</p>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">{m.tipo}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleRemove(m.inventarioId)}
                  className="text-slate-300 hover:text-red-500 transition-colors p-1"
                  title="Quitar de la lista"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cantidad</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={m.cantidad}
                    onChange={(e) => handleChangeAtributo(m.inventarioId, 'cantidad', parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Unidad</label>
                  <select
                    value={m.unidad}
                    onChange={(e) => handleChangeAtributo(m.inventarioId, 'unidad', e.target.value)}
                    disabled={m.tipo === 'herramienta'} // Las herramientas suelen ser por unidad
                    className="w-full mt-1 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    {UNIDADES.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Observaciones</label>
                  <input
                    type="text"
                    value={m.observacion || ''}
                    onChange={(e) => handleChangeAtributo(m.inventarioId, 'observacion', e.target.value)}
                    placeholder={m.tipo === 'herramienta' ? 'Ej. Verificar estado al devolver' : 'Ej. Cortar a la medida'}
                    className="w-full mt-1 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
