// src/features/proyectos/ui/components/PersonalSelector.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Search, UserCheck, X, FileEdit } from 'lucide-react';
import { AsignacionPersonal } from '../../domain/entities/AsignacionPersonal.js';

const ROLES = AsignacionPersonal.ROLES;

export function PersonalSelector({ empleados = [], personalAsignado = [], onChange }) {
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

  const unassignedEmployees = empleados.filter(
    (emp) => !personalAsignado.some((p) => p.empleadoId === emp.id) &&
             (emp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
              emp.cargo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelect = (empleado) => {
    onChange([
      ...personalAsignado,
      { empleadoId: empleado.id, nombre: empleado.nombre, cargo: empleado.cargo, rol: ROLES[1], notas: '' }
    ]);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const handleRemove = (empleadoId) => {
    onChange(personalAsignado.filter((p) => p.empleadoId !== empleadoId));
  };

  const handleChangeAtributo = (empleadoId, campo, valor) => {
    onChange(
      personalAsignado.map((p) =>
        p.empleadoId === empleadoId ? { ...p, [campo]: valor } : p
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Buscador */}
      <div className="relative" ref={searchRef}>
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white transition-colors"
          placeholder="Buscar personal por nombre o cargo..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
        />
        
        {/* Dropdown */}
        {isDropdownOpen && searchTerm.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
            {unassignedEmployees.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                No se encontró personal disponible
              </div>
            ) : (
              unassignedEmployees.map((emp) => (
                <button
                  key={emp.id}
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors text-left"
                  onClick={() => handleSelect(emp)}
                >
                  <div>
                    <p className="text-sm font-bold text-slate-800">{emp.nombre}</p>
                    <p className="text-xs text-slate-500">{emp.cargo}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Tarjetas de personal asignado */}
      {personalAsignado.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {personalAsignado.map((p) => (
            <div key={p.empleadoId} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col shadow-sm group hover:border-indigo-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{p.nombre}</p>
                    <p className="text-xs text-slate-500">{p.cargo || 'Personal'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleRemove(p.empleadoId)}
                  className="text-slate-300 hover:text-red-500 transition-colors p-1"
                  title="Quitar personal"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="space-y-3 mt-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rol de Instalación</label>
                  <select
                    value={p.rol}
                    onChange={(e) => handleChangeAtributo(p.empleadoId, 'rol', e.target.value)}
                    className="w-full mt-1 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                    <FileEdit size={10} />
                    Observaciones
                  </label>
                  <input
                    type="text"
                    value={p.notas || ''}
                    onChange={(e) => handleChangeAtributo(p.empleadoId, 'notas', e.target.value)}
                    placeholder="Ej. Lleva la escalera, encargado llaves..."
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
