// src/features/inventario/ui/InventarioPage.jsx

import React, { useState } from 'react';
import { useProyectosContext } from '../../proyectos/application/context/ProyectosContext.jsx';
import { ACTIONS } from '../../proyectos/application/store/proyectosStore.js';
import { Package, Search, Plus, Minus, Check, AlertCircle, Edit, RefreshCw } from 'lucide-react';
import './InventarioPage.css';

export function InventarioPage() {
  const { state, dispatch } = useProyectosContext();
  const { inventario } = state;

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('TODAS');

  // Modal para ajustar stock
  const [selectedItem, setSelectedItem] = useState(null);
  const [newStock, setNewStock] = useState(0);

  // Categorías únicas del inventario
  const categorias = ['TODAS', ...new Set(inventario.map(item => item.categoria))];

  // Métricas
  const totalItems = inventario.length;
  const lowStockCount = inventario.filter(item => item.stock > 0 && item.stock <= 5).length;
  const emptyStockCount = inventario.filter(item => item.stock === 0).length;

  // Filtrar artículos
  const filteredItems = inventario.filter((item) => {
    const matchesSearch = 
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = activeCategory === 'TODAS' || item.categoria === activeCategory;

    return matchesSearch && matchesCategory;
  });

  // Abrir modal de ajuste de stock
  function handleOpenAdjustStock(item) {
    setSelectedItem(item);
    setNewStock(item.stock);
  }

  // Guardar nuevo stock
  function handleSaveStock() {
    if (!selectedItem) return;

    dispatch({
      type: ACTIONS.UPDATE_INVENTARIO_ITEM,
      payload: {
        id: selectedItem.id,
        cambios: { stock: Math.max(0, newStock) }
      }
    });

    // Resetear
    setSelectedItem(null);
  }

  return (
    <div className="inventario-container">
      {/* Header */}
      <div className="inventario-header-box">
        <h1 className="inventario-title">Control de Inventario</h1>
        <p className="inventario-subtitle">
          Administración de materiales, stock disponible y consumos para proyectos de impresión e instalación.
        </p>
      </div>

      {/* Stats row */}
      <div className="inventario-stats-grid">
        <div className="inventario-stat-card">
          <div className="inv-icon-wrapper total">
            <Package size={20} />
          </div>
          <div className="stat-data">
            <span className="inv-stat-value">{totalItems}</span>
            <span className="inv-stat-label">Materiales en Catálogo</span>
          </div>
        </div>

        <div className="inventario-stat-card">
          <div className="inv-icon-wrapper low">
            <AlertCircle size={20} />
          </div>
          <div className="stat-data">
            <span className="inv-stat-value">{lowStockCount}</span>
            <span className="inv-stat-label">Bajo Stock (≤ 5)</span>
          </div>
        </div>

        <div className="inventario-stat-card">
          <div className="inv-icon-wrapper empty">
            <AlertCircle size={20} />
          </div>
          <div className="stat-data">
            <span className="inv-stat-value">{emptyStockCount}</span>
            <span className="inv-stat-label">Agotados (Sin Stock)</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search and Category Filter */}
      <div className="inventario-control-bar">
        <div className="inventario-search-wrapper">
          <Search size={18} className="inv-search-icon" />
          <input
            type="text"
            className="inv-search-input"
            placeholder="Buscar por nombre de material o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="inventario-tabs">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`inv-tab-pill ${activeCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="inventario-table-card">
        <div className="inventario-table-wrapper">
          <table className="inventario-table">
            <thead>
              <tr>
                <th className="inventario-th">Material / SKU</th>
                <th className="inventario-th">Categoría</th>
                <th className="inventario-th">Disponibilidad (Stock)</th>
                <th className="inventario-th">Unidad</th>
                <th className="inventario-th" style={{ textAlign: 'right' }}>Costo Unitario</th>
                <th className="inventario-th" style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="inventario-td" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                      No se encontraron materiales que coincidan con los filtros.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.stock > 0 && item.stock <= 5;
                  const isEmpty = item.stock === 0;
                  const stockClass = isEmpty ? 'empty' : isLow ? 'lowstock' : 'instock';
                  const stockText = isEmpty ? 'Agotado' : isLow ? 'Stock Bajo' : 'En Stock';

                  return (
                    <tr key={item.id} className="inventario-tr">
                      <td className="inventario-td">
                        <div className="item-name-cell">
                          <span className="item-title">{item.nombre}</span>
                          <span className="item-sku">{item.sku}</span>
                        </div>
                      </td>
                      <td className="inventario-td">
                        <span className="badge-category">{item.categoria}</span>
                      </td>
                      <td className="inventario-td">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span className="font-bold text-slate-800" style={{ fontSize: '1rem', minWidth: '30px' }}>
                            {item.stock}
                          </span>
                          <span className={`badge-stock ${stockClass}`}>
                            {stockText}
                          </span>
                        </div>
                      </td>
                      <td className="inventario-td">{item.unidad}</td>
                      <td className="inventario-td" style={{ textAlign: 'right', fontWeight: '600', color: '#334155' }}>
                        ${item.precioUnitario.toFixed(2)}
                      </td>
                      <td className="inventario-td" style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleOpenAdjustStock(item)}
                          className="inv-edit-btn"
                          title="Ajustar Stock"
                        >
                          <Edit size={14} />
                          Ajustar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Ajustar Stock</h3>
              <button 
                onClick={() => setSelectedItem(null)}
                className="modal-close-btn"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                <span className="form-label" style={{ display: 'block', fontSize: '0.7rem' }}>Material Seleccionado</span>
                <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a' }}>{selectedItem.nombre}</span>
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace', marginTop: '0.15rem' }}>SKU: {selectedItem.sku}</span>
              </div>

              <div className="form-field-group">
                <label className="form-label">Cantidad en Stock</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setNewStock(prev => Math.max(0, prev - 1))}
                    className="inv-edit-btn"
                    style={{ padding: '0.625rem', borderRadius: '0.75rem' }}
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    min="0"
                    className="form-input-number"
                    style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold' }}
                    value={newStock}
                    onChange={(e) => setNewStock(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                  <button
                    type="button"
                    onClick={() => setNewStock(prev => prev + 1)}
                    className="inv-edit-btn"
                    style={{ padding: '0.625rem', borderRadius: '0.75rem' }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setSelectedItem(null)}
                className="card-action-btn secondary"
                style={{ flex: 'none', width: 'auto', px: '1.25rem' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveStock}
                className="card-action-btn primary"
                style={{ flex: 'none', width: 'auto', px: '1.5rem' }}
              >
                <Check size={14} />
                Guardar Ajuste
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
