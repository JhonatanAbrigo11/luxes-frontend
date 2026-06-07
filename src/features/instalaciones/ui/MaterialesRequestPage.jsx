// src/features/instalaciones/ui/MaterialesRequestPage.jsx

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProyectosContext } from '../../proyectos/application/context/ProyectosContext.jsx';
import { ACTIONS } from '../../proyectos/application/store/proyectosStore.js';
import { 
  ArrowLeft, Search, Plus, Trash2, MapPin, 
  Package, ShoppingCart, Clock, CheckCircle, AlertTriangle,
  Wrench, User, Calendar, HelpCircle, Eye
} from 'lucide-react';
import { PDFPreviewModal } from '../../../shared/ui/components/PDFPreviewModal.jsx';
import './MaterialesRequestPage.css';

export function MaterialesRequestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useProyectosContext();
  const { proyectos, inventario, ordenesCompra } = state;

  const proyecto = proyectos.find(p => p.id === id);

  // Estados de control
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [materialSearch, setMaterialSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [qty, setQty] = useState(1);
  const [customItemMode, setCustomItemMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customSku, setCustomSku] = useState('');
  const [customPrice, setCustomPrice] = useState(0);
  const [customUnit, setCustomUnit] = useState('unidad');

  // Borrador de la orden de compra
  const [purchaseDraft, setPurchaseDraft] = useState([]);
  const totalBorrador = purchaseDraft.reduce((acc, item) => acc + (item.cantidad * item.precioUnitario), 0);

  // Estados de modales y PDF
  const [isPDFOpen, setIsPDFOpen] = useState(false);
  const [previewOC, setPreviewOC] = useState(null);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success', // 'success' | 'error' | 'confirm'
    onConfirm: null
  });

  const showModal = (title, message, type = 'success', onConfirm = null) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type,
      onConfirm
    });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  function getInitials(name = '') {
    return name
      .split(' ')
      .filter(w => w.length > 0)
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  if (!proyecto) {
    return (
      <div className="request-page-container flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-slate-500">Proyecto no encontrado</p>
        <button onClick={() => navigate('/instalaciones')} className="text-blue-600 underline">
          Volver a Instalaciones
        </button>
      </div>
    );
  }

  // Filtrar artículos en inventario
  const matchedInventory = inventario.filter(item => 
    item.nombre.toLowerCase().includes(materialSearch.toLowerCase()) || 
    item.sku.toLowerCase().includes(materialSearch.toLowerCase())
  );

  const datosInstalacion = proyecto.fases?.INSTALACION?.datos || {};
  const materialesExistentes = datosInstalacion.materiales || [];

  // Filtrar órdenes de compra asociadas a este proyecto
  const ordenesProyecto = ordenesCompra.filter(oc => oc.proyectoId === proyecto.id);

  // Agregar directamente desde el inventario (se descuenta stock al guardar)
  function handleUseFromInventory() {
    if (!selectedItem || qty <= 0) return;

    // Validar stock
    if (qty > selectedItem.stock) {
      showModal('Stock Insuficiente', `No hay stock suficiente. Solo hay ${selectedItem.stock} unidades en stock.`, 'error');
      return;
    }

    // 1. Restar stock en inventario
    dispatch({
      type: ACTIONS.UPDATE_INVENTARIO_ITEM,
      payload: {
        id: selectedItem.id,
        cambios: { stock: selectedItem.stock - qty }
      }
    });

    // 2. Agregar al proyecto
    const nuevoMaterial = {
      nombre: selectedItem.nombre,
      sku: selectedItem.sku,
      cantidad: qty,
      unidad: selectedItem.unidad,
      observacion: 'Tomado del Inventario',
      origen: 'inventario'
    };

    const nuevosMateriales = [...materialesExistentes, nuevoMaterial];

    dispatch({
      type: ACTIONS.UPDATE_PROYECTO,
      payload: {
        id: proyecto.id,
        cambios: {
          fases: {
            ...proyecto.fases,
            INSTALACION: {
              ...proyecto.fases?.INSTALACION,
              datos: {
                ...datosInstalacion,
                materiales: nuevosMateriales
              }
            }
          }
        }
      }
    });

    // Resetear formulario
    setSelectedItem(null);
    setQty(1);
    setMaterialSearch('');
  }

  // Agregar al borrador de compras
  function handleAddToPurchaseDraft() {
    let itemToAdd = null;

    if (customItemMode) {
      if (!customName.trim()) {
        showModal('Error de Validación', 'El nombre del material es requerido.', 'error');
        return;
      }
      itemToAdd = {
        id: `custom-${Date.now()}`,
        nombre: customName,
        sku: customSku || 'ESPECIAL',
        cantidad: qty,
        precioUnitario: parseFloat(customPrice) || 0,
        unidad: customUnit
      };
    } else {
      if (!selectedItem) return;
      itemToAdd = {
        id: selectedItem.id,
        nombre: selectedItem.nombre,
        sku: selectedItem.sku,
        cantidad: qty,
        precioUnitario: selectedItem.precioUnitario,
        unidad: selectedItem.unidad
      };
    }

    // Buscar si ya existe en borrador y sumar cantidad
    const exists = purchaseDraft.find(item => item.sku === itemToAdd.sku);
    if (exists) {
      setPurchaseDraft(purchaseDraft.map(item => 
        item.sku === itemToAdd.sku 
          ? { ...item, cantidad: item.cantidad + itemToAdd.cantidad }
          : item
      ));
    } else {
      setPurchaseDraft([...purchaseDraft, itemToAdd]);
    }

    // Limpiar formulario
    setSelectedItem(null);
    setQty(1);
    setMaterialSearch('');
    setCustomItemMode(false);
    setCustomName('');
    setCustomSku('');
    setCustomPrice(0);
    setCustomUnit('unidad');
  }

  // Quitar ítem del borrador
  function handleRemoveFromDraft(sku) {
    setPurchaseDraft(purchaseDraft.filter(item => item.sku !== sku));
  }

  // Enviar orden de compra
  function handleSendPurchaseOrder() {
    if (purchaseDraft.length === 0) return;

    const nuevaOC = {
      id: `OC-${Date.now().toString().slice(-5)}`,
      proyectoId: proyecto.id,
      proyectoNombre: proyecto.nombre,
      estado: 'PENDIENTE',
      fechaCreacion: new Date().toISOString().split('T')[0],
      items: purchaseDraft.map(item => ({
        sku: item.sku,
        nombre: item.nombre,
        cantidadSolicitada: item.cantidad,
        cantidadAprobada: item.cantidad, // por defecto igual, el admin la aprueba
        precioUnitario: item.precioUnitario,
        unidad: item.unidad
      })),
      comentarios: ''
    };

    dispatch({
      type: ACTIONS.CREAR_ORDEN_COMPRA,
      payload: nuevaOC
    });

    // Limpiar borrador
    setPurchaseDraft([]);
    showModal(
      'Orden de Compra Enviada',
      `La orden de compra ${nuevaOC.id} ha sido enviada a administración con éxito.`,
      'success',
      () => {
        navigate('/instalaciones');
      }
    );
  }

  return (
    <div className="request-page-container">
      {/* Back button */}
      <button onClick={() => navigate('/instalaciones')} className="request-back-btn print:hidden">
        <ArrowLeft size={16} />
        Volver a Panel de Instalaciones
      </button>

      {/* Header */}
      <div className="inventario-header-box print:hidden">
        <h1 className="inventario-title">Detalle de Instalación y Materiales</h1>
        <p className="inventario-subtitle">
          Instalador: Consulta detalles del montaje, personal asignado, materiales listos y solicitudes de compra.
        </p>
      </div>

      {/* Hero Banner: Detalles del Destino / Obra */}
      <div className="request-hero-banner bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center print:hidden">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Package size={20} />
            </span>
            <div>
              <h2 className="text-lg font-black text-slate-800">Ficha de Instalación: {proyecto.nombre}</h2>
              <p className="text-xs text-slate-400">Cliente: <strong className="text-slate-600">{proyecto.cliente.empresa}</strong> • Contacto: {proyecto.cliente.nombre}</p>
            </div>
            <div className="flex items-center gap-1.5 ml-0 lg:ml-4">
              <span className="text-xs font-bold text-slate-400 uppercase font-bold tracking-wide">Estado:</span>
              {proyecto.fases?.INSTALACION?.completada ? (
                <span className="oc-history-badge aprobada">Completada</span>
              ) : proyecto.fases?.INSTALACION?.datos?.fechaInstalacion ? (
                <span className="oc-history-badge pendiente">En Montaje</span>
              ) : (
                <span className="oc-history-badge" style={{ background: '#f1f5f9', color: '#475569', borderColor: '#cbd5e1' }}>En Cola</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
            {/* Address */}
            <div className="flex items-start gap-2 text-slate-600">
              <MapPin size={16} className="text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-500 uppercase text-[9px] tracking-wider">Dirección de Instalación</p>
                <p className="font-medium mt-0.5">{datosInstalacion.direccionInstalacion || proyecto.cliente.direccion || 'Sin dirección registrada'}</p>
              </div>
            </div>

            {/* Schedule */}
            <div className="flex items-start gap-2 text-slate-600">
              <Calendar size={16} className="text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-500 uppercase text-[9px] tracking-wider">Programación</p>
                <p className="font-medium mt-0.5">
                  {datosInstalacion.fechaInstalacion && datosInstalacion.horaInstalacion 
                    ? `${datosInstalacion.fechaInstalacion} a las ${datosInstalacion.horaInstalacion}`
                    : 'Pendiente de arranque'
                  }
                </p>
              </div>
            </div>

            {/* Team assigned */}
            <div className="flex items-start gap-2 text-slate-600">
              <Wrench size={16} className="text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-500 uppercase text-[9px] tracking-wider">Equipo Técnico</p>
                {datosInstalacion.personalAsignado && datosInstalacion.personalAsignado.length > 0 ? (
                  <div className="flex gap-1 mt-1">
                    {datosInstalacion.personalAsignado.map((p, idx) => (
                      <div 
                        key={idx} 
                        className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px]"
                        title={`${p.nombre} (${p.rol})`}
                      >
                        {getInitials(p.nombre)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-medium mt-0.5 italic text-slate-400">Sin personal asignado</p>
                )}
              </div>
            </div>
          </div>

          {/* Special notes if any */}
          {datosInstalacion.notasInstalacion && (
            <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-3 text-xs text-amber-800 flex gap-2 items-start mt-2">
              <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-600" />
              <span><strong>Instrucciones Especiales:</strong> {datosInstalacion.notasInstalacion}</span>
            </div>
          )}
        </div>

        {/* Toggle Request Button */}
        {!proyecto.fases?.INSTALACION?.completada && (
          <button
            onClick={() => setShowRequestForm(!showRequestForm)}
            className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-all shrink-0 cursor-pointer w-full lg:w-auto justify-center
              ${showRequestForm 
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
              }`}
          >
            <ShoppingCart size={16} />
            {showRequestForm ? 'Ocultar Buscador' : 'Solicitar Materiales'}
          </button>
        )}
      </div>

      <div className="request-grid-layout print:hidden">
        {/* Columna Izquierda: Buscador (si showRequestForm) y Materiales Consumidos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Card 2: Buscador e Ingreso de Materiales (solo visible si showRequestForm) */}
          {showRequestForm && (
            <div className="request-section-card">
              <h2 className="request-card-title flex items-center gap-2">
                <Search size={18} />
                Consultar Inventario / Solicitar Material
              </h2>

              {!customItemMode ? (
                <div className="material-search-section">
                  <label className="form-label">Buscar en Inventario</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="inv-search-input"
                      style={{ background: '#ffffff' }}
                      placeholder="Escribe para buscar (ej. Acrílico, Tira LED, Perno...)"
                      value={materialSearch}
                      onChange={(e) => {
                        setMaterialSearch(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                    />
                    {showDropdown && materialSearch.trim().length > 0 && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                        <div className="search-results-dropdown z-20">
                          {matchedInventory.length > 0 ? (
                            matchedInventory.map(item => (
                              <div 
                                key={item.id} 
                                className="search-result-item"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setShowDropdown(false);
                                  setMaterialSearch(item.nombre);
                                }}
                              >
                                <div className="result-item-info">
                                  <span className="result-item-name">{item.nombre}</span>
                                  <span className="result-item-meta">SKU: {item.sku} • Stock: {item.stock} {item.unidad}s</span>
                                </div>
                                <span className="badge-category" style={{ fontSize: '0.65rem' }}>{item.categoria}</span>
                              </div>
                            ))
                          ) : (
                            <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                              Sin resultados.{' '}
                              <button 
                                type="button" 
                                onClick={() => {
                                  setCustomItemMode(true);
                                  setCustomName(materialSearch);
                                  setShowDropdown(false);
                                }}
                                className="text-blue-600 font-bold hover:underline"
                              >
                                Crear artículo especial/compra directa
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="item-add-control-panel" style={{ background: '#fef3c7', border: '1px solid #fde68a' }}>
                  <span className="font-bold text-amber-800 text-sm flex items-center gap-1.5">
                    <AlertTriangle size={15} />
                    Artículo Especial de Compra Externa
                  </span>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <div className="form-field-group">
                      <label className="form-label" style={{ fontSize: '0.65rem' }}>Nombre del Material</label>
                      <input
                        type="text"
                        className="form-input-number"
                        style={{ background: '#ffffff' }}
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                      />
                    </div>
                    <div className="form-field-group">
                      <label className="form-label" style={{ fontSize: '0.65rem' }}>SKU/Código</label>
                      <input
                        type="text"
                        className="form-input-number"
                        style={{ background: '#ffffff' }}
                        value={customSku}
                        placeholder="Ej. ESP-PERNO"
                        onChange={(e) => setCustomSku(e.target.value)}
                      />
                    </div>
                    <div className="form-field-group">
                      <label className="form-label" style={{ fontSize: '0.65rem' }}>Costo Est. ($)</label>
                      <input
                        type="number"
                        className="form-input-number"
                        style={{ background: '#ffffff' }}
                        value={customPrice}
                        onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="form-field-group">
                      <label className="form-label" style={{ fontSize: '0.65rem' }}>Unidad</label>
                      <input
                        type="text"
                        className="form-input-number"
                        style={{ background: '#ffffff' }}
                        value={customUnit}
                        onChange={(e) => setCustomUnit(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button 
                      onClick={() => { setCustomItemMode(false); setMaterialSearch(''); }}
                      className="inv-edit-btn"
                      style={{ fontSize: '0.75rem' }}
                    >
                      Volver a Inventario
                    </button>
                  </div>
                </div>
              )}

              {/* Selector de cantidad y acciones rápidas */}
              {(selectedItem || customItemMode) && (
                <div className="item-add-control-panel">
                  <div className="selected-item-display">
                    <span>
                      Material: <strong>{customItemMode ? customName || 'Artículo Especial' : selectedItem.nombre}</strong>
                    </span>
                    {!customItemMode && (
                      <span className="text-xs text-slate-500">
                        Disponibles en Stock: <strong>{selectedItem.stock} {selectedItem.unidad}s</strong>
                      </span>
                    )}
                  </div>

                  <div className="qty-inputs-box">
                    <span className="form-label">Cantidad requerida:</span>
                    <input
                      type="number"
                      min="1"
                      className="qty-input-field"
                      value={qty}
                      onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                    <span className="font-semibold text-slate-600 text-sm">
                      {customItemMode ? customUnit : selectedItem.unidad}s
                    </span>
                  </div>

                  <div className="qty-actions-row">
                    {!customItemMode && selectedItem.stock > 0 && (
                      <button
                        onClick={handleUseFromInventory}
                        className="card-action-btn primary flex-1"
                        style={{ height: '38px', borderRadius: '0.5rem' }}
                      >
                        <Package size={15} />
                        Utilizar del Inventario ({Math.min(qty, selectedItem.stock)})
                      </button>
                    )}

                    <button
                      onClick={handleAddToPurchaseDraft}
                      className="card-action-btn success flex-1"
                      style={{ height: '38px', borderRadius: '0.5rem', backgroundColor: '#d97706' }}
                    >
                      <ShoppingCart size={15} />
                      {customItemMode 
                        ? 'Añadir a Orden de Compra' 
                        : qty > selectedItem.stock 
                          ? `Solicitar Compra por la diferencia (${qty - selectedItem.stock})`
                          : 'Solicitar Compra Externa'
                      }
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Card 3: Lista de Materiales ya cargados en la Instalación */}
          <div className="request-section-card">
            <h2 className="request-card-title flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-500" />
              Materiales Listos para la Instalación
            </h2>

            {materialesExistentes.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>
                Aún no hay materiales registrados en esta instalación. Consume del stock o solicita compras externas.
              </div>
            ) : (
              <table className="materials-list-table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Cantidad</th>
                    <th>Unidad</th>
                    <th>Origen</th>
                    <th>Observación</th>
                  </tr>
                </thead>
                <tbody>
                  {materialesExistentes.map((m, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: '700' }}>{m.nombre}</td>
                      <td className="font-bold">{m.cantidad}</td>
                      <td>{m.unidad}</td>
                      <td>
                        <span className={`origin-badge ${m.origen === 'compra' ? 'compra' : 'inventario'}`}>
                          {m.origen === 'compra' ? 'Compra' : 'Stock'}
                        </span>
                      </td>
                      <td className="text-xs text-slate-500">{m.observacion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>

        {/* Columna Derecha: Borrador OC (si showRequestForm) e Historial de Solicitudes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Card 4: Borrador de Orden de Compra (solo visible si showRequestForm) */}
          {showRequestForm && (
            <div className="request-section-card draft-oc-card">
              <h2 className="request-card-title flex items-center gap-2" style={{ color: '#b45309' }}>
                <ShoppingCart size={18} />
                Borrador de Orden de Compra
              </h2>

              {purchaseDraft.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#d97706', fontStyle: 'italic', fontSize: '0.85rem' }}>
                  No hay artículos agregados al borrador de compras. Utiliza la sección izquierda para añadir solicitudes.
                </div>
              ) : (
                <>
                  <table className="materials-list-table">
                    <thead>
                      <tr>
                        <th style={{ color: '#b45309', borderBottomColor: '#fde68a' }}>Ítem</th>
                        <th style={{ color: '#b45309', borderBottomColor: '#fde68a' }}>Cant</th>
                        <th style={{ color: '#b45309', borderBottomColor: '#fde68a', textAlign: 'right' }}>Est. Unit</th>
                        <th style={{ color: '#b45309', borderBottomColor: '#fde68a', textAlign: 'center' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseDraft.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="item-name-cell">
                              <span className="item-title" style={{ fontSize: '0.8rem' }}>{item.nombre}</span>
                              <span className="item-sku" style={{ fontSize: '0.65rem' }}>SKU: {item.sku}</span>
                            </div>
                          </td>
                          <td className="font-bold">{item.cantidad} {item.unidad}</td>
                          <td style={{ textAlign: 'right' }}>${item.precioUnitario.toFixed(2)}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => handleRemoveFromDraft(item.sku)}
                              className="text-red-500 hover:text-red-700"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="draft-total-row">
                    <span className="font-bold text-amber-800">Costo Total Estimado:</span>
                    <span className="font-extrabold text-amber-900 text-lg">${totalBorrador.toFixed(2)}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <button
                      onClick={() => {
                        setPreviewOC({
                          id: 'OC-BORRADOR',
                          proyectoId: proyecto.id,
                          proyectoNombre: proyecto.nombre,
                          fechaCreacion: new Date().toISOString().split('T')[0],
                          estado: 'PENDIENTE',
                          items: purchaseDraft.map(item => ({
                            sku: item.sku,
                            nombre: item.nombre,
                            cantidadSolicitada: item.cantidad,
                            precioUnitario: item.precioUnitario,
                            unidad: item.unidad
                          }))
                        });
                        setIsPDFOpen(true);
                      }}
                      className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors flex-1 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Eye size={15} />
                      Vista Previa PDF
                    </button>
                    <button
                      onClick={handleSendPurchaseOrder}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold transition-colors flex-1 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <ShoppingCart size={15} />
                      Enviar Orden ({purchaseDraft.length})
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Card 5: Historial de Ordenes de Compra del Proyecto */}
          <div className="request-section-card">
            <h2 className="request-card-title flex items-center gap-2">
              <Clock size={18} />
              Historial de Solicitudes de Compra
            </h2>

            {ordenesProyecto.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>
                Ninguna orden de compra enviada aún para este proyecto.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {ordenesProyecto.map((oc) => {
                  const statusClass = oc.estado.toLowerCase();

                  return (
                    <div key={oc.id} className="oc-history-card">
                      <div className="oc-history-header">
                        <span className="oc-history-id">{oc.id} • {oc.fechaCreacion}</span>
                        <span className={`oc-history-badge ${statusClass}`}>
                          {oc.estado}
                        </span>
                      </div>

                      <ul className="oc-history-items-list">
                        {oc.items.map((item, idx) => (
                          <li key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{item.nombre}</span>
                            <span className="font-bold">
                              {oc.estado === 'APROBADA' 
                                ? `${item.cantidadAprobada} de ${item.cantidadSolicitada} apr.`
                                : `${item.cantidadSolicitada} und.`
                              }
                            </span>
                          </li>
                        ))}
                      </ul>

                      {oc.comentarios && (
                        <div className="oc-history-comments">
                          <strong>Comentario Admin:</strong> {oc.comentarios}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Visor Reutilizable de PDF */}
      <PDFPreviewModal
        isOpen={isPDFOpen}
        onClose={() => setIsPDFOpen(false)}
        oc={previewOC}
        proyecto={proyecto}
        title="Vista Previa de Orden de Compra (Borrador)"
      />

      {/* Modal Dialog de Alertas (Reemplazo de alert nativo) */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden flex flex-col p-6 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2.5 rounded-full ${
                modalConfig.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                modalConfig.type === 'error' ? 'bg-red-50 text-red-600' :
                'bg-amber-50 text-amber-600'
              }`}>
                {modalConfig.type === 'success' && <CheckCircle size={22} />}
                {modalConfig.type === 'error' && <AlertTriangle size={22} />}
                {modalConfig.type === 'confirm' && <HelpCircle size={22} />}
              </div>
              <h3 className="font-extrabold text-slate-800 text-lg">{modalConfig.title}</h3>
            </div>
            
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">{modalConfig.message}</p>
            
            <div className="flex gap-2 justify-end">
              {modalConfig.type === 'confirm' && (
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={() => {
                  closeModal();
                  if (modalConfig.onConfirm) {
                    modalConfig.onConfirm();
                  }
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
