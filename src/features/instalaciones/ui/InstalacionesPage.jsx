// src/features/instalaciones/ui/InstalacionesPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProyectos } from '../../proyectos/application/hooks/useProyectos.js';
import { useProyectosContext } from '../../proyectos/application/context/ProyectosContext.jsx';
import { 
  Wrench, Search, Play, CheckCircle2, User, MapPin, 
  Calendar, Clock, CheckCircle, Eye, ClipboardList, AlertTriangle 
} from 'lucide-react';
import './InstalacionesPage.css';

const PRIORIDAD_COLORS = {
  BAJA: 'baja',
  MEDIA: 'media',
  ALTA: 'alta',
  URGENTE: 'urgente',
};

const FASE_LABELS = {
  COTIZACION: 'Cotización',
  DISEÑO: 'Diseño',
  PRODUCCION: 'Producción',
  INSTALACION: 'Instalación',
  ENTREGA: 'Entrega',
  COMPLETADO: 'Completado',
};

const FASE_COLORS = {
  COTIZACION: '#6366f1',
  DISEÑO: '#f59e0b',
  PRODUCCION: '#3b82f6',
  INSTALACION: '#f97316',
  ENTREGA: '#10b981',
  COMPLETADO: '#059669',
};

export function InstalacionesPage() {
  const navigate = useNavigate();
  const { todosLosProyectos, updateProyecto, avanzarFaseProyecto } = useProyectos();
  const { state } = useProyectosContext();
  const { ordenesCompra = [] } = state || {};

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('TODAS'); // TODAS, PENDIENTES, ACTIVAS, COMPLETADAS

  // Modal de Completar Instalación
  const [selectedProyecto, setSelectedProyecto] = useState(null);
  const [notasCierre, setNotasCierre] = useState('');

  // Filtrar proyectos que requieren instalación
  const proyectosInstalacion = todosLosProyectos.filter(p => p.requiereInstalacion === true);

  // Estadísticas KPI
  const stats = {
    total: proyectosInstalacion.length,
    pendientes: proyectosInstalacion.filter(p => 
      ['COTIZACION', 'DISEÑO', 'PRODUCCION'].includes(p.faseActual)
    ).length,
    activas: proyectosInstalacion.filter(p => p.faseActual === 'INSTALACION').length,
    completadas: proyectosInstalacion.filter(p => 
      ['ENTREGA', 'COMPLETADO'].includes(p.faseActual)
    ).length,
  };

  // Filtrado final
  const filteredInstallations = proyectosInstalacion.filter((p) => {
    // 1. Filtro de Búsqueda
    const matchesSearch = 
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cliente.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.fases?.INSTALACION?.datos?.direccionInstalacion || p.cliente.direccion || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    // 2. Filtro de Pestaña/Estado
    let matchesTab = true;
    if (activeTab === 'PENDIENTES') {
      matchesTab = ['COTIZACION', 'DISEÑO', 'PRODUCCION'].includes(p.faseActual);
    } else if (activeTab === 'ACTIVAS') {
      matchesTab = p.faseActual === 'INSTALACION';
    } else if (activeTab === 'COMPLETADAS') {
      matchesTab = ['ENTREGA', 'COMPLETADO'].includes(p.faseActual);
    }

    return matchesSearch && matchesTab;
  });

  // Iniciar la instalación (Guardar fecha y hora)
  function handleIniciarInstalacion(proyecto) {
    const now = new Date();
    const fecha = now.toISOString().split('T')[0];
    const hora = now.toTimeString().slice(0, 5);

    const datosInstalacion = proyecto.fases?.INSTALACION?.datos || {};

    const cambios = {
      fases: {
        ...proyecto.fases,
        INSTALACION: {
          ...proyecto.fases?.INSTALACION,
          datos: {
            ...datosInstalacion,
            fechaInstalacion: fecha,
            horaInstalacion: hora,
            direccionInstalacion: datosInstalacion.direccionInstalacion || proyecto.cliente?.direccion || '',
          }
        }
      }
    };

    updateProyecto(proyecto.id, cambios);
  }

  // Guardar y avanzar fase a Entrega
  function handleGuardarCierreInstalacion() {
    if (!selectedProyecto) return;

    const datosInstalacion = selectedProyecto.fases?.INSTALACION?.datos || {};

    const cambios = {
      fases: {
        ...selectedProyecto.fases,
        INSTALACION: {
          ...selectedProyecto.fases?.INSTALACION,
          completada: true,
          fechaCompletada: new Date().toISOString().split('T')[0],
          datos: {
            ...datosInstalacion,
            instalacionCompletada: true,
            notasCierre: notasCierre,
          }
        }
      }
    };

    updateProyecto(selectedProyecto.id, cambios);
    avanzarFaseProyecto(selectedProyecto.id);

    // Resetear modal
    setSelectedProyecto(null);
    setNotasCierre('');
  }

  // Obtener iniciales de los empleados
  function getInitials(name = '') {
    return name
      .split(' ')
      .filter(w => w.length > 0)
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  return (
    <div className="instalaciones-container">
      {/* Header */}
      <div className="instalaciones-header-box">
        <h1 className="instalaciones-title">Módulo de Instalaciones</h1>
        <p className="instalaciones-subtitle">
          Gestión, planificación y seguimiento en tiempo real de los montajes e instalaciones en sitio.
        </p>
      </div>

      {/* Stats KPI Widgets */}
      <div className="instalaciones-stats-grid">
        <div className="instalaciones-stat-card">
          <div className="stat-icon-wrapper total">
            <Wrench size={20} />
          </div>
          <div className="stat-data">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Proyectos</span>
          </div>
        </div>

        <div className="instalaciones-stat-card">
          <div className="stat-icon-wrapper pending">
            <ClipboardList size={20} />
          </div>
          <div className="stat-data">
            <span className="stat-value">{stats.pendientes}</span>
            <span className="stat-label">Pendientes en cola</span>
          </div>
        </div>

        <div className="instalaciones-stat-card">
          <div className="stat-icon-wrapper active">
            <Play size={20} />
          </div>
          <div className="stat-data">
            <span className="stat-value">{stats.activas}</span>
            <span className="stat-label">En curso en sitio</span>
          </div>
        </div>

        <div className="instalaciones-stat-card">
          <div className="stat-icon-wrapper completed">
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-data">
            <span className="stat-value">{stats.completadas}</span>
            <span className="stat-label">Instaladas / Finalizadas</span>
          </div>
        </div>
      </div>

      {/* Search & Filter controls */}
      <div className="instalaciones-control-bar">
        <div className="instalaciones-search-wrapper">
          <Search size={18} className="search-input-icon" />
          <input
            type="text"
            className="search-input-field"
            placeholder="Buscar por proyecto, cliente o dirección..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="instalaciones-tabs">
          <button
            onClick={() => setActiveTab('TODAS')}
            className={`tab-pill-btn ${activeTab === 'TODAS' ? 'active' : ''}`}
          >
            Todas ({stats.total})
          </button>
          <button
            onClick={() => setActiveTab('PENDIENTES')}
            className={`tab-pill-btn ${activeTab === 'PENDIENTES' ? 'active' : ''}`}
          >
            Pendientes ({stats.pendientes})
          </button>
          <button
            onClick={() => setActiveTab('ACTIVAS')}
            className={`tab-pill-btn ${activeTab === 'ACTIVAS' ? 'active' : ''}`}
          >
            En Curso ({stats.activas})
          </button>
          <button
            onClick={() => setActiveTab('COMPLETADAS')}
            className={`tab-pill-btn ${activeTab === 'COMPLETADAS' ? 'active' : ''}`}
          >
            Completadas ({stats.completadas})
          </button>
        </div>
      </div>

      {/* Grid List */}
      {filteredInstallations.length === 0 ? (
        <div className="instalaciones-empty-state">
          <div className="empty-state-icon-box">
            <Wrench size={32} />
          </div>
          <h3 className="empty-state-title">Sin instalaciones encontradas</h3>
          <p className="empty-state-desc">
            No hay proyectos que coincidan con los filtros de búsqueda o estados seleccionados en este momento.
          </p>
        </div>
      ) : (
        <div className="instalaciones-cards-grid">
          {filteredInstallations.map((proyecto) => {
            const datosInstalacion = proyecto.fases?.INSTALACION?.datos || {};
            const isStarted = !!(datosInstalacion.fechaInstalacion && datosInstalacion.horaInstalacion);
            const isFinished = ['ENTREGA', 'COMPLETADO'].includes(proyecto.faseActual);
            
            const personalAsignado = datosInstalacion.personalAsignado || [];
            const materiales = datosInstalacion.materiales || [];
            
            const priorityClass = PRIORIDAD_COLORS[proyecto.prioridad] || 'media';
            const progressColor = FASE_COLORS[proyecto.faseActual] || '#6366f1';

            const ocDelProyecto = ordenesCompra.filter(oc => oc.proyectoId === proyecto.id);
            const ocPendiente = ocDelProyecto.find(oc => oc.estado === 'PENDIENTE');
            const ocAprobada = ocDelProyecto.find(oc => oc.estado === 'APROBADA');

            return (
              <div key={proyecto.id} className="instalacion-card">
                {/* Header */}
                <div className="instalacion-card-header">
                  <h3 className="instalacion-card-title">{proyecto.nombre}</h3>
                  <span className={`badge-priority ${priorityClass}`}>
                    {proyecto.prioridad}
                  </span>
                </div>

                {/* Body */}
                <div className="instalacion-card-body">
                  {/* Client Box */}
                  <div className="instalacion-client-info">
                    <span className="instalacion-client-company">{proyecto.cliente.empresa}</span>
                    <span className="instalacion-client-contact">Contacto: {proyecto.cliente.nombre}</span>
                  </div>

                  {/* Address */}
                  <div className="instalacion-detail-row">
                    <MapPin size={15} className="instalacion-detail-icon" />
                    <span className="instalacion-detail-text" title={datosInstalacion.direccionInstalacion || proyecto.cliente.direccion || 'Sin dirección registrada'}>
                      {datosInstalacion.direccionInstalacion || proyecto.cliente.direccion || 'Sin dirección registrada'}
                    </span>
                  </div>

                  {/* Purchase Order Status */}
                  {ocDelProyecto.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', margin: '0.5rem 0' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Solicitud:</span>
                      {ocPendiente ? (
                        <span style={{ fontSize: '10px', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '9999px', textTransform: 'uppercase', background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}>
                          OC {ocPendiente.id} Pendiente
                        </span>
                      ) : ocAprobada ? (
                        <span style={{ fontSize: '10px', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '9999px', textTransform: 'uppercase', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                          OC {ocAprobada.id} Aprobada
                        </span>
                      ) : (
                        <span style={{ fontSize: '10px', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '9999px', textTransform: 'uppercase', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
                          OC Rechazada
                        </span>
                      )}
                    </div>
                  )}

                  {/* Status Block */}
                  {isFinished ? (
                    <div className="instalacion-state-block completed flex items-center gap-1.5">
                      <CheckCircle size={15} />
                      <span>Instalación Finalizada ({proyecto.fases?.INSTALACION?.fechaCompletada || 'Completada'})</span>
                    </div>
                  ) : proyecto.faseActual === 'INSTALACION' ? (
                    isStarted ? (
                      <div className="instalacion-state-block started flex items-center gap-1.5">
                        <Clock size={15} />
                        <span>Instalación iniciada: {datosInstalacion.fechaInstalacion} a las {datosInstalacion.horaInstalacion}</span>
                      </div>
                    ) : (
                      <div className="instalacion-state-block idle flex items-center gap-1.5">
                        <AlertTriangle size={15} />
                        <span>Fase activa: Requiere registrar arranque</span>
                      </div>
                    )
                  ) : (
                    <div className="instalacion-state-block idle flex items-center gap-1.5" style={{ background: '#f1f5f9', borderColor: '#cbd5e1', color: '#475569' }}>
                      <ClipboardList size={15} />
                      <span>Fase actual del proyecto: {FASE_LABELS[proyecto.faseActual]}</span>
                    </div>
                  )}

                  {/* Team List */}
                  <div className="instalacion-team-group">
                    <span className="team-label">Equipo Asignado:</span>
                    {personalAsignado.length > 0 ? (
                      <div className="team-avatars-list">
                        {personalAsignado.map((p, i) => (
                          <div 
                            key={i} 
                            className="team-avatar-circle" 
                            title={`${p.nombre} - ${p.rol}`}
                          >
                            {getInitials(p.nombre)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="team-empty-msg">Sin personal asignado</span>
                    )}
                  </div>

                  {/* Materials Count */}
                  <div className="instalacion-detail-row">
                    <Wrench size={15} className="instalacion-detail-icon" />
                    <span className="instalacion-detail-text">
                      {materiales.length > 0 
                        ? `${materiales.length} materiales/herramientas enlistados`
                        : 'Sin lista de materiales registrada'
                      }
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="instalacion-progress-box">
                    <div className="progress-labels">
                      <span>Progreso General</span>
                      <span>{proyecto.progreso}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar-fill" 
                        style={{ 
                          width: `${proyecto.progreso}%`, 
                          backgroundColor: progressColor 
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="instalacion-card-actions">
                  <button
                    onClick={() => navigate(`/instalaciones/${proyecto.id}/materiales`)}
                    className="card-action-btn secondary"
                    title="Ver ficha del proyecto"
                  >
                    <Eye size={15} />
                    Ver Proyecto
                  </button>

                  {!isFinished && proyecto.faseActual === 'INSTALACION' && (
                    !isStarted ? (
                      <button
                        onClick={() => handleIniciarInstalacion(proyecto)}
                        className="card-action-btn primary"
                      >
                        <Play size={15} />
                        Iniciar Montaje
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedProyecto(proyecto)}
                        className="card-action-btn success"
                      >
                        <CheckCircle size={15} />
                        Completar
                      </button>
                    )
                  )}

                  {!isFinished && proyecto.faseActual !== 'INSTALACION' && (
                    <button
                      className="card-action-btn secondary"
                      disabled
                      style={{ opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#f8fafc', borderColor: '#cbd5e1' }}
                    >
                      En Cola
                    </button>
                  )}

                  {isFinished && (
                    <button
                      className="card-action-btn secondary"
                      disabled
                      style={{ opacity: 0.7, cursor: 'not-allowed', color: '#059669', borderColor: '#a7f3d0', backgroundColor: '#ecfdf5' }}
                    >
                      <CheckCircle size={15} />
                      Completada
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completion Modal */}
      {selectedProyecto && (
        <div className="modal-overlay" onClick={() => setSelectedProyecto(null)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Finalizar Instalación</h3>
              <button 
                onClick={() => setSelectedProyecto(null)}
                className="modal-close-btn"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p className="text-sm text-slate-500">
                Confirmas que la instalación en sitio para <strong>{selectedProyecto.nombre}</strong> ha concluido de forma satisfactoria.
              </p>

              <div className="form-field-group">
                <label className="form-label">Notas de Cierre</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Observaciones de entrega, conformidad del cliente, problemas resueltos..."
                  value={notasCierre}
                  onChange={(e) => setNotasCierre(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setSelectedProyecto(null)}
                className="card-action-btn secondary"
                style={{ flex: 'none', width: 'auto', px: '1.25rem' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarCierreInstalacion}
                className="card-action-btn success"
                style={{ flex: 'none', width: 'auto', px: '1.5rem' }}
              >
                <CheckCircle size={15} />
                Guardar y Avanzar Fase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
