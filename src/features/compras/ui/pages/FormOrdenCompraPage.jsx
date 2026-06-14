import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  getOrdenById, createOrden, updateOrden, getProveedores,
  getMetodosPago, registrarAbono
} from '../../application/comprasService';
import { getMateriales } from '../../../inventario/application/inventarioService';
import './ComprasPage.css';
import { toast } from '../../../../shared/ui/components/Toast';
import { PDFPreviewModal } from '../../../../shared/ui/components/PDFPreviewModal.jsx';

const fmt = (n) => '$' + Number(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const mapOrdenToPDFFormat = (orden) => {
  if (!orden) return null;
  return {
    id: orden.numero,
    fechaCreacion: orden.fecha ? new Date(orden.fecha).toISOString().split('T')[0] : '',
    estado: (orden.estado || 'PENDIENTE').toUpperCase(),
    proyectoNombre: orden.concepto || 'Compra de Materiales',
    comentarios: orden.notas || 'Sin observaciones.',
    items: (orden.detalles || []).map(d => ({
      sku: d.materialId ? d.materialId.slice(-8).toUpperCase() : 'ESP-LIBRE',
      nombre: d.descripcion,
      cantidad: d.cantidad,
      precioUnitario: d.precioUnitario,
      unidad: 'unidad'
    }))
  };
};

export const FormOrdenCompraPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [proveedores, setProveedores] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [metodos, setMetodos] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    proveedorId: '',
    fecha: new Date().toISOString().split('T')[0],
    impuesto: '0',
    concepto: '',
    notas: '',
    detalles: [],
    fechaVencimiento: '',
  });

  // Top Bar input state
  const [itemInput, setItemInput] = useState({
    materialId: '',
    descripcion: '',
    cantidad: '1',
    precioUnitario: '0',
  });

  // Search combobox auto-suggest states
  const [provSearch, setProvSearch] = useState('');
  const [provDropdownOpen, setProvDropdownOpen] = useState(false);
  const [matDropdownOpen, setMatDropdownOpen] = useState(false);

  // Modal confirm submit
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmForm, setConfirmForm] = useState({
    monto: '0',
    metodoPagoId: '',
    referencia: '',
    fechaVencimiento: '',
  });

  // PDF Preview states
  const [isPDFOpen, setIsPDFOpen] = useState(false);
  const [previewOC, setPreviewOC] = useState(null);

  const handlePDFClose = () => {
    setIsPDFOpen(false);
    navigate('/compras');
  };


  const loadData = useCallback(async () => {
    try {
      const [provList, matResult, metodoList] = await Promise.all([
        getProveedores(),
        getMateriales({ limit: 100 }),
        getMetodosPago()
      ]);
      setProveedores(provList);
      setMetodos(metodoList);

      const matList = matResult.items || matResult || [];
      setMateriales(matList);

      if (isEdit) {
        const o = await getOrdenById(id);
        if (o) {
          setForm({
            proveedorId: o.proveedorId,
            fecha: o.fecha ? new Date(o.fecha).toISOString().split('T')[0] : '',
            impuesto: o.impuesto || 0,
            concepto: o.concepto || '',
            notas: o.notas || '',
            detalles: o.detalles && o.detalles.length > 0
              ? o.detalles.map(d => ({
                  descripcion: d.descripcion,
                  cantidad: d.cantidad,
                  precioUnitario: d.precioUnitario,
                  materialId: d.materialId || null,
                  isCustom: !d.materialId
                }))
              : [],
            fechaVencimiento: o.cuentaPorPagar?.fechaVencimiento
              ? new Date(o.cuentaPorPagar.fechaVencimiento).toISOString().split('T')[0]
              : '',
          });

          // Sync supplier search text
          const selectedProv = provList.find(p => p.id === o.proveedorId);
          if (selectedProv) {
            setProvSearch(`${selectedProv.nombre} ${selectedProv.ruc ? `(${selectedProv.ruc})` : ''}`);
          }
        }
      } else {
        if (provList.length > 0) {
          setForm(prev => ({ ...prev, proveedorId: provList[0].id }));
          setProvSearch(`${provList[0].nombre} ${provList[0].ruc ? `(${provList[0].ruc})` : ''}`);
        }
      }
    } catch (err) {
      toast.error('Error al cargar datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [id, isEdit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculations
  const subtotal = form.detalles.reduce((s, d) => s + ((parseFloat(d.cantidad) || 0) * (parseFloat(d.precioUnitario) || 0)), 0);
  const total = subtotal + (parseFloat(form.impuesto) || 0);

  // Add Item from Top Line to Table
  const handleAddItem = () => {
    const qty = parseFloat(itemInput.cantidad) || 0;
    const price = parseFloat(itemInput.precioUnitario) || 0;

    if (!itemInput.descripcion.trim()) {
      toast.error('La descripción no puede estar vacía.');
      return;
    }
    if (qty <= 0) {
      toast.error('La cantidad debe ser mayor a 0.');
      return;
    }
    if (price < 0) {
      toast.error('El precio unitario no puede ser negativo.');
      return;
    }

    setForm(prev => ({
      ...prev,
      detalles: [
        ...prev.detalles,
        {
          descripcion: itemInput.descripcion,
          cantidad: itemInput.cantidad,
          precioUnitario: itemInput.precioUnitario,
          materialId: itemInput.materialId || null,
          isCustom: !itemInput.materialId
        }
      ]
    }));

    // Reset top input fields
    setItemInput({
      materialId: '',
      descripcion: '',
      cantidad: '1',
      precioUnitario: '0',
    });
  };

  const removeDetalle = (index) => {
    setForm(prev => ({ ...prev, detalles: prev.detalles.filter((_, i) => i !== index) }));
  };

  const updateDetalle = (index, field, val) => {
    setForm(prev => {
      const detalles = [...prev.detalles];
      let updated = { ...detalles[index] };

      if (field === 'descripcion') {
        updated.descripcion = val;
      } else {
        updated[field] = val; // Store exact string to allow clearing
      }

      detalles[index] = updated;
      return { ...prev, detalles };
    });
  };

  const handleOpenConfirm = (e) => {
    e.preventDefault();
    if (!form.proveedorId) {
      toast.error('Por favor seleccione un proveedor.');
      return;
    }
    if (form.detalles.length === 0) {
      toast.error('Debe agregar al menos un item a la tabla antes de continuar.');
      return;
    }
    const defaultMetodo = metodos.filter(m => m.activo)[0]?.id || '';
    const defaultVencimiento = form.fechaVencimiento || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setConfirmForm({
      monto: '0',
      metodoPagoId: defaultMetodo,
      referencia: '',
      fechaVencimiento: defaultVencimiento,
    });
    setConfirmModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        proveedorId: form.proveedorId,
        fecha: form.fecha,
        impuesto: parseFloat(form.impuesto) || 0,
        concepto: form.concepto,
        notas: form.notas,
        detalles: form.detalles.map(d => ({
          descripcion: d.descripcion,
          cantidad: parseFloat(d.cantidad) || 0,
          precioUnitario: parseFloat(d.precioUnitario) || 0,
          materialId: d.materialId || null
        })),
        fechaVencimiento: confirmForm.fechaVencimiento || null
      };

      let newOrden;
      if (isEdit) {
        newOrden = await updateOrden(id, payload);
      } else {
        newOrden = await createOrden(payload);
      }

      const abonoMonto = parseFloat(confirmForm.monto) || 0;
      if (abonoMonto > 0 && newOrden?.id) {
        await registrarAbono(newOrden.id, {
          metodoPagoId: confirmForm.metodoPagoId,
          monto: abonoMonto,
          referencia: confirmForm.referencia
        });
      }

      setConfirmModalOpen(false);
      toast.success(isEdit ? 'Orden de compra actualizada con éxito' : 'Orden de compra registrada con éxito');
      setPreviewOC(mapOrdenToPDFFormat(newOrden));
      setIsPDFOpen(true);
    } catch (err) {
      toast.error('Error al guardar la orden: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="co-page animate-slide-up">
        <div className="co-card co-loader-box">
          <div className="co-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="co-page animate-slide-up">
      {/* Header */}
      <div className="co-card co-header" style={{ border: '1.5px solid #cbd5e1', background: '#ffffff' }}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl flex items-center justify-center shrink-0" style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="co-title" style={{ color: '#1e293b', fontWeight: 800 }}>
              {isEdit ? 'Editar Orden de Compra' : 'Registro de Órdenes de Compra'}
            </h1>
            <p className="co-subtitle">
              {isEdit ? 'Modifica los datos de la orden de compra' : 'Crea un nuevo recibo de compra con uno o varios recursos'}
            </p>
          </div>
        </div>
        <Link to="/compras" className="co-btn-ghost" style={{ color: '#2563eb', fontWeight: 700 }}>
          ← Volver a Órdenes
        </Link>
      </div>

      {/* Main Forms Layout */}
      <form onSubmit={handleOpenConfirm} className="space-y-6">
        
        {/* Encabezado and Valores split grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Encabezado Card */}
          <div className="co-card lg:col-span-2 p-5" style={{ background: '#fff', border: '1.5px solid #e2e8f0', overflow: 'visible' }}>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              Encabezado de la Orden
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="co-label">No. de Orden</label>
                <div className="co-input bg-slate-50 font-mono text-xs font-semibold flex items-center h-[38px] text-slate-400 px-4 border border-slate-200/80" style={{ borderRadius: '10px' }}>
                  {isEdit ? form.numero : 'ORC_XXX_YYYY (Autogenerado)'}
                </div>
              </div>
              <div>
                <label className="co-label">Fecha de Orden</label>
                <input
                  type="date"
                  className="co-input"
                  value={form.fecha}
                  onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))}
                  required
                />
              </div>
              <div className="relative">
                <label className="co-label">Proveedor</label>
                <input
                  type="text"
                  className="co-input"
                  placeholder="Buscar proveedor..."
                  value={provSearch}
                  onChange={e => {
                    setProvSearch(e.target.value);
                    setProvDropdownOpen(true);
                    const found = proveedores.find(p => `${p.nombre} ${p.ruc ? `(${p.ruc})` : ''}` === e.target.value);
                    setForm(prev => ({ ...prev, proveedorId: found ? found.id : '' }));
                  }}
                  onFocus={() => setProvDropdownOpen(true)}
                  onBlur={() => {
                    setTimeout(() => setProvDropdownOpen(false), 200);
                  }}
                />
                {provDropdownOpen && (
                  <div className="co-search-dropdown">
                    {proveedores
                      .filter(p => {
                        const term = provSearch.toLowerCase();
                        return p.nombre.toLowerCase().includes(term) || (p.ruc && p.ruc.includes(term));
                      })
                      .map(p => (
                        <div
                          key={p.id}
                          className="co-search-item"
                          onMouseDown={() => {
                            setForm(prev => ({ ...prev, proveedorId: p.id }));
                            setProvSearch(`${p.nombre} ${p.ruc ? `(${p.ruc})` : ''}`);
                            setProvDropdownOpen(false);
                          }}
                        >
                          <div className="font-semibold text-slate-800">{p.nombre}</div>
                          {p.ruc && <div className="text-slate-400 text-[10px]">{p.ruc}</div>}
                        </div>
                      ))}
                    {proveedores.filter(p => {
                      const term = provSearch.toLowerCase();
                      return p.nombre.toLowerCase().includes(term) || (p.ruc && p.ruc.includes(term));
                    }).length === 0 && (
                      <div className="px-3 py-2 text-xs text-slate-400 text-center">Sin resultados</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4">
              <label className="co-label">Concepto / Objeto de Compra</label>
              <input
                type="text"
                className="co-input"
                placeholder="Ej. Adquisición de insumos de vinilo para stock..."
                value={form.concepto}
                onChange={e => setForm(p => ({ ...p, concepto: e.target.value }))}
              />
            </div>
          </div>

          {/* Valores Summary Card */}
          <div className="co-card p-5 flex flex-col justify-between" style={{ background: '#fff', border: '1.5px solid #e2e8f0' }}>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              Valores de la Orden
            </div>
            <div className="space-y-4 flex-1 justify-center flex flex-col">
              <div className="flex justify-between items-center text-sm text-slate-600">
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px]">Subtotal:</span>
                <span className="font-bold text-slate-800 text-base">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-slate-600">
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px] flex items-center gap-2">
                  Impuesto / IVA ($):
                  <input
                    type="number"
                    className="co-input"
                    style={{ width: '80px', padding: '3px 10px', display: 'inline', fontSize: '12px', height: '28px' }}
                    step="0.01"
                    min="0"
                    value={form.impuesto}
                    onChange={e => setForm(p => ({ ...p, impuesto: e.target.value }))}
                    onWheel={e => e.target.blur()}
                  />
                </span>
                <span className="font-bold text-slate-800 text-base">{fmt(parseFloat(form.impuesto) || 0)}</span>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-3 mt-3 flex justify-between items-center">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total Final:</span>
              <span className="text-2xl font-black text-blue-600">{fmt(total)}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Item Entry Bar */}
        <div className="p-5" style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px' }}>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
            Agregar Recurso a la Orden
          </div>
          <div className="flex flex-wrap items-end gap-3">
            
            {/* Searchable Description / Autocomplete Combobox */}
            <div className="relative flex-[3] min-w-[280px]">
              <label className="co-label">Descripción del Recurso</label>
              <input
                type="text"
                className="co-input"
                placeholder="Escribe descripción o busca material del inventario..."
                value={itemInput.descripcion}
                onChange={e => {
                  const val = e.target.value;
                  setItemInput(prev => ({
                    ...prev,
                    descripcion: val,
                    materialId: '' // Clear link if they type custom text
                  }));
                  setMatDropdownOpen(true);
                }}
                onFocus={() => setMatDropdownOpen(true)}
                onBlur={() => {
                  setTimeout(() => setMatDropdownOpen(false), 200);
                }}
              />
              {matDropdownOpen && (
                <div className="co-search-dropdown">
                  {materiales
                    .filter(m => {
                      const term = itemInput.descripcion.toLowerCase();
                      return m.nombre.toLowerCase().includes(term);
                    })
                    .map(m => (
                      <div
                        key={m.id}
                        className="co-search-item"
                        onMouseDown={() => {
                          setItemInput(prev => ({
                            ...prev,
                            materialId: m.id,
                            descripcion: m.nombre,
                            precioUnitario: m.precioCosto || 0
                          }));
                          setMatDropdownOpen(false);
                        }}
                      >
                        <div className="font-semibold text-slate-800">{m.nombre}</div>
                        <div className="text-slate-400 text-[10px]">
                          Stock Actual: {m.stockActual} | Costo Unit: {fmt(m.precioCosto)}
                        </div>
                      </div>
                    ))}
                  {materiales.filter(m => {
                    const term = itemInput.descripcion.toLowerCase();
                    return m.nombre.toLowerCase().includes(term);
                  }).length === 0 && (
                    <div className="px-3 py-2 text-xs text-slate-400 text-center">
                      Material nuevo (escribe texto libre)
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="w-[90px]">
              <label className="co-label">Cantidad</label>
              <input
                type="number"
                className="co-input text-center"
                min="0.01"
                step="0.01"
                value={itemInput.cantidad}
                onChange={e => setItemInput(prev => ({ ...prev, cantidad: e.target.value }))}
                onWheel={e => e.target.blur()}
              />
            </div>

            <div className="w-[120px]">
              <label className="co-label">Precio Unit.</label>
              <input
                type="number"
                className="co-input text-right"
                min="0"
                step="0.01"
                value={itemInput.precioUnitario}
                onChange={e => setItemInput(prev => ({ ...prev, precioUnitario: e.target.value }))}
                onWheel={e => e.target.blur()}
              />
            </div>

            <div className="w-[120px]">
              <label className="co-label">Subtotal</label>
              <div className="co-input bg-slate-50 text-right font-semibold text-slate-500 flex items-center justify-end px-3 border border-slate-200/80" style={{ height: '38px', borderRadius: '10px' }}>
                {fmt((parseFloat(itemInput.cantidad) || 0) * (parseFloat(itemInput.precioUnitario) || 0))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="co-add-btn-moderate h-[38px] shrink-0"
            >
              + Agregar
            </button>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="co-items-table">
            <thead>
              <tr>
                <th className="text-center" style={{ width: '60px' }}>N°</th>
                <th style={{ width: '130px' }}>Tipo</th>
                <th>Descripción / Recurso</th>
                <th className="text-center" style={{ width: '100px' }}>Cantidad</th>
                <th className="text-center" style={{ width: '160px' }}>Precio Unit.</th>
                <th className="text-right" style={{ width: '130px' }}>Subtotal</th>
                <th className="text-center" style={{ width: '80px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {form.detalles.map((d, index) => (
                <tr key={index}>
                  <td className="text-center font-bold text-slate-400">{index + 1}</td>
                  <td>
                    <span className={`co-badge-pill ${d.isCustom ? 'co-badge-pill-slate' : 'co-badge-pill-blue'}`}>
                      {d.isCustom ? 'Libre' : 'Inventario'}
                    </span>
                  </td>
                  <td>
                    {d.isCustom ? (
                      <input
                        type="text"
                        className="co-table-input w-full"
                        value={d.descripcion}
                        onChange={e => updateDetalle(index, 'descripcion', e.target.value)}
                        required
                      />
                    ) : (
                      <span className="font-semibold text-slate-700">{d.descripcion}</span>
                    )}
                  </td>
                  <td>
                    <input
                      type="number"
                      className="co-table-input text-center mx-auto"
                      style={{ width: '75px' }}
                      min="0.01"
                      step="0.01"
                      value={d.cantidad}
                      onChange={e => updateDetalle(index, 'cantidad', e.target.value)}
                      required
                      onWheel={e => e.target.blur()}
                    />
                  </td>
                  <td>
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        className="co-table-input text-right"
                        style={{ width: '95px' }}
                        min="0"
                        step="0.01"
                        value={d.precioUnitario}
                        onChange={e => updateDetalle(index, 'precioUnitario', e.target.value)}
                        required
                        onWheel={e => e.target.blur()}
                      />
                    </div>
                  </td>
                  <td className="text-right font-extrabold text-slate-800">
                    {fmt((parseFloat(d.cantidad) || 0) * (parseFloat(d.precioUnitario) || 0))}
                  </td>
                  <td className="text-center">
                    <button
                      type="button"
                      onClick={() => removeDetalle(index)}
                      className="co-table-remove-btn"
                      title="Eliminar item"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
              {form.detalles.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400 font-medium text-sm">
                    No hay items agregados en esta orden. Utilice la barra superior para agregar items a la tabla.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Observaciones and Submit footer */}
        <div className="flex flex-wrap md:flex-nowrap gap-6">
          <div className="flex-1">
            <label className="co-label">Observaciones de la Orden</label>
            <textarea
              className="co-input co-textarea"
              style={{ borderRadius: '10px' }}
              rows={3}
              placeholder="Detalles sobre la entrega, condiciones de pago, observaciones generales..."
              value={form.notas}
              onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
            />
          </div>
          <div className="flex items-center justify-end gap-3 shrink-0 self-end mt-4">
            <button type="button" onClick={() => navigate('/compras')} className="co-btn-ghost" style={{ fontWeight: 600 }}>
              Cancelar
            </button>
            <button
              type="submit"
              className="co-btn-primary"
              style={{
                padding: '12px 30px',
                borderRadius: '10px'
              }}
            >
              Guardar y Continuar
            </button>
          </div>
        </div>

      </form>

      {/* Confirmation & Payment Modal */}
      {confirmModalOpen && createPortal(
        <>
          <div className="co-overlay" onClick={() => setConfirmModalOpen(false)} />
          <div className="co-modal-wrap">
            <div className="co-modal animate-co-modal-in" style={{ maxWidth: '720px', width: '100%' }}>
              <div className="co-modal-header">
                <h2 className="text-lg font-bold text-slate-800">Confirmación de Orden y Pago Inicial</h2>
                <button type="button" onClick={() => setConfirmModalOpen(false)} className="co-modal-close">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="co-modal-body">
                <div className="co-abono-info mb-4" style={{ background: '#f8fafc' }}>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">Monto Total de Orden:</span>
                    <span className="font-extrabold text-blue-600 text-lg">{fmt(total)}</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Two Column Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column (Payment details) */}
                    <div className="space-y-4">
                      <div>
                        <label className="co-label">¿Abono o Pago Inicial?</label>
                        <input
                          type="number"
                          className="co-input font-bold"
                          style={{ fontSize: '15px' }}
                          step="0.01"
                          min="0"
                          max={total}
                          value={confirmForm.monto}
                          onChange={e => {
                            const valStr = e.target.value;
                            const valNum = parseFloat(valStr) || 0;
                            setConfirmForm(p => ({
                              ...p,
                              monto: valStr,
                              metodoPagoId: valNum > 0 ? p.metodoPagoId : '',
                              referencia: valNum > 0 ? p.referencia : '',
                            }));
                          }}
                          required
                          onWheel={e => e.target.blur()}
                        />
                      </div>

                      <div>
                        <label className="co-label" style={{ opacity: (parseFloat(confirmForm.monto) || 0) > 0 ? 1 : 0.5 }}>
                          Método de Pago Utilizado
                        </label>
                        <select
                          className="co-input"
                          value={confirmForm.metodoPagoId}
                          onChange={e => setConfirmForm(p => ({ ...p, metodoPagoId: e.target.value }))}
                          disabled={(parseFloat(confirmForm.monto) || 0) === 0}
                          required={(parseFloat(confirmForm.monto) || 0) > 0}
                          style={{ opacity: (parseFloat(confirmForm.monto) || 0) > 0 ? 1 : 0.6 }}
                        >
                          <option value="">Seleccionar método…</option>
                          {metodos.filter(m => m.activo).map(m => (
                            <option key={m.id} value={m.id}>{m.nombre}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="co-label" style={{ opacity: (parseFloat(confirmForm.monto) || 0) > 0 ? 1 : 0.5 }}>
                          Referencia / Comprobante de Pago
                        </label>
                        <input
                          type="text"
                          className="co-input"
                          placeholder="Ej. Cheque #1024, Transf Pichincha..."
                          value={confirmForm.referencia}
                          onChange={e => setConfirmForm(p => ({ ...p, referencia: e.target.value }))}
                          disabled={(parseFloat(confirmForm.monto) || 0) === 0}
                          style={{ opacity: (parseFloat(confirmForm.monto) || 0) > 0 ? 1 : 0.6 }}
                        />
                      </div>
                    </div>

                    {/* Right Column (Due date) */}
                    <div className="space-y-4">
                      <div>
                        <label className="co-label" style={{ opacity: (parseFloat(confirmForm.monto) || 0) < total ? 1 : 0.5 }}>
                          Vencimiento Saldo Pendiente {(parseFloat(confirmForm.monto) || 0) < total ? `(${fmt(total - (parseFloat(confirmForm.monto) || 0))})` : ''}
                        </label>
                        <input
                          type="date"
                          className="co-input"
                          value={(parseFloat(confirmForm.monto) || 0) < total ? confirmForm.fechaVencimiento : ''}
                          onChange={e => setConfirmForm(p => ({ ...p, fechaVencimiento: e.target.value }))}
                          disabled={(parseFloat(confirmForm.monto) || 0) >= total}
                          required={(parseFloat(confirmForm.monto) || 0) < total}
                          style={{ opacity: (parseFloat(confirmForm.monto) || 0) < total ? 1 : 0.6 }}
                        />
                        {(parseFloat(confirmForm.monto) || 0) >= total && (
                          <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                            ✓ No aplica - Pagado al 100%
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => setConfirmModalOpen(false)} className="co-btn-ghost">
                      Cancelar
                    </button>
                    <button type="submit" disabled={saving} className="co-btn-primary" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 14px rgba(16,185,129,0.3)', borderRadius: '10px' }}>
                      {saving && <div className="co-spinner-sm" />}
                      Confirmar y Registrar Orden
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Visor Reutilizable de PDF */}
      <PDFPreviewModal
        isOpen={isPDFOpen}
        onClose={handlePDFClose}
        oc={previewOC}
        title="Orden de Compra Guardada"
      />
    </div>
  );
};
