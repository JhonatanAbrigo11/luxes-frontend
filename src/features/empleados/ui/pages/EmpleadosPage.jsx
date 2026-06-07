import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { getEmpleados, saveEmpleado, deleteEmpleado } from '../../application/empleadosService';

const EMPTY_FORM = {
  nombre: '', cedula: '', cargo: '', departamento: '', telefono: '', correo: '',
  cuentaBanco: '', banco: '', tipoContrato: 'Fijo', sueldoDiario: '', direccion: '', foto: '',
};

const BANCOS = ['Pichincha', 'Guayaquil', 'Bolivariano', 'Pacifico', 'Internacional', 'Produbanco', 'Austro', 'Machala'];
const DEPARTAMENTOS = ['Tecnología', 'Diseño', 'Operaciones', 'Finanzas', 'RRHH', 'Marketing', 'Ventas'];
const CONTRATOS = ['Fijo', 'Indefinido', 'Temporal', 'Por obra'];

export const EmpleadosPage = () => {
  const navigate = useNavigate();
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 5;

  const load = async () => {
    setLoading(true);
    try {
      const data = await getEmpleados();
      setEmpleados(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (emp) => {
    setEditing(emp);
    setForm({ ...emp });
    setFormOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm(prev => ({ ...prev, foto: ev.target?.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await saveEmpleado({ ...form, sueldoDiario: Number(form.sueldoDiario) });
      if (editing) {
        setEmpleados(prev => prev.map(emp => emp.id === saved.id ? saved : emp));
        setFormOpen(false);
      } else {
        navigate('/nomina/credenciales');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const q = search.toLowerCase();
  const filteredAll = empleados.filter(e =>
    e.nombre.toLowerCase().includes(q) ||
    e.id.toLowerCase().includes(q) ||
    e.cedula.includes(q) ||
    e.cargo.toLowerCase().includes(q) ||
    e.departamento.toLowerCase().includes(q) ||
    e.cuentaBanco.includes(q) ||
    e.banco.toLowerCase().includes(q)
  );
  const totalPages = Math.max(1, Math.ceil(filteredAll.length / perPage));
  const safePage = page > totalPages ? 1 : page;
  if (safePage !== page) setPage(safePage);
  const filtered = filteredAll.slice((safePage - 1) * perPage, safePage * perPage);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este empleado?')) return;
    await deleteEmpleado(id);
    setEmpleados(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="p-6 xl:p-8 w-full animate-slide-up">

      <style>{`
        .shadow-card { box-shadow: 0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.02); }
        .btn-primary { background: #2563eb; transition: all 0.15s ease; }
        .btn-primary:hover { background: #1d4ed8; box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
        .btn-ghost { transition: all 0.15s ease; }
        .btn-ghost:hover { background: #f1f5f9; }
        .input-field { border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.8rem; font-weight: 500; color: #1e293b; outline: none; transition: all 0.15s ease; background: white; width: 100%; }
        .input-field:focus { border-color: #93c5fd; ring: 2px; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .input-field::placeholder { color: #94a3b8; }
      `}</style>

      <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Empleados</h1>
          <p className="text-sm text-slate-500">Registro y gestión de empleados</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 text-white rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 shadow-sm shrink-0"
          style={{ backgroundColor: '#1d4ed8' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo Empleado
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white shadow-card rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Lista de Empleados</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar empleado..."
                className="pl-8 pr-3 py-1.5 text-[11px] border border-gray-200 rounded-lg outline-none focus:border-blue-300 bg-gray-50 focus:bg-white w-52 transition-colors"
              />
            </div>
            <span className="text-xs font-medium text-gray-400">{filtered.length} registros</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-200 border-t-blue-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Empleado</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Cédula</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Cargo</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Depto.</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Cuenta Bancaria</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Banco</th>
                  <th className="text-right px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
                          {emp.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{emp.nombre}</p>
                          <span className="text-[10px] text-gray-400">{emp.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-600">{emp.cedula}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{emp.cargo}</td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{emp.departamento}</span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-600">{emp.cuentaBanco}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{emp.banco}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(emp)} className="btn-ghost p-1.5 rounded-lg text-gray-400 hover:text-blue-600">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(emp.id)} className="btn-ghost p-1.5 rounded-lg text-gray-400 hover:text-red-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-sm text-gray-400">{search ? 'No se encontraron empleados' : 'No hay empleados registrados'}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <span className="text-[11px] font-medium text-gray-400">
              Página {safePage} de {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={safePage <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-7 h-7 rounded-lg text-[11px] font-semibold transition-colors ${n === safePage ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  {n}
                </button>
              ))}
              <button
                disabled={safePage >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {formOpen && createPortal(
        <>
          <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md" onClick={() => setFormOpen(false)} />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl animate-modal-in max-h-[85vh] flex flex-col border border-gray-100">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                <h2 className="text-lg font-bold text-gray-800">{editing ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
                <button type="button" onClick={() => setFormOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="overflow-y-auto p-6">
                <form onSubmit={handleSave} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Nombre completo</label>
                      <input name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Ej. Carlos Mendoza" className="input-field" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Foto</label>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 shrink-0">
                          {form.foto ? (
                            <img src={form.foto} alt="preview" className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                            </svg>
                          )}
                        </div>
                        <label className="cursor-pointer px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                          {form.foto ? 'Cambiar foto' : 'Subir foto'}
                          <input type="file" accept="image/*" onChange={handleFotoUpload} className="hidden" />
                        </label>
                        {form.foto && (
                          <button type="button" onClick={() => setForm(prev => ({ ...prev, foto: '' }))} className="text-xs text-red-500 hover:text-red-700 font-semibold">
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Cédula</label>
                      <input name="cedula" value={form.cedula} onChange={handleChange} required placeholder="0912345678" className="input-field" />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Teléfono</label>
                      <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="0991234567" className="input-field" />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Correo electrónico</label>
                      <input name="correo" type="email" value={form.correo} onChange={handleChange} placeholder="correo@luxes.com" className="input-field" />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Cargo</label>
                      <input name="cargo" value={form.cargo} onChange={handleChange} placeholder="Ej. Desarrollador" className="input-field" />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Departamento</label>
                      <select name="departamento" value={form.departamento} onChange={handleChange} className="input-field">
                        <option value="">Seleccionar...</option>
                        {DEPARTAMENTOS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Tipo de contrato</label>
                      <select name="tipoContrato" value={form.tipoContrato} onChange={handleChange} className="input-field">
                        {CONTRATOS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Sueldo diario ($)</label>
                      <input name="sueldoDiario" type="number" step="0.01" value={form.sueldoDiario} onChange={handleChange} placeholder="0.00" className="input-field" />
                    </div>
                    <div className="col-span-2 border-t border-gray-100 pt-4">
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Información Bancaria</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Número de cuenta</label>
                      <input name="cuentaBanco" value={form.cuentaBanco} onChange={handleChange} placeholder="00123456789012345678" className="input-field font-mono" />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Banco</label>
                      <select name="banco" value={form.banco} onChange={handleChange} className="input-field">
                        <option value="">Seleccionar...</option>
                        {BANCOS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Dirección</label>
                      <input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Ciudad / Dirección" className="input-field" />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                    <button type="button" onClick={() => setFormOpen(false)} className="btn-ghost px-4 py-2 rounded-xl text-sm font-semibold text-gray-600">
                      Cancelar
                    </button>
                    <button type="submit" disabled={saving} className="btn-primary px-6 py-2 rounded-xl text-sm font-semibold text-white inline-flex items-center gap-2 disabled:opacity-60">
                      {saving && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />}
                      {editing ? 'Guardar cambios' : 'Registrar Empleado'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes modal-in {
          from { transform: scale(0.95) translateY(8px); opacity: 0; }
          to   { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-modal-in { animation: modal-in 0.2s cubic-bezier(0.16,1,0.3,1) forwards; }
      `}} />
    </div>
  );
};
