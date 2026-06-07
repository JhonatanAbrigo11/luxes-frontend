/* c:/Users/Morqu/OneDrive/Documentos/JAIMS/Luxes/luxes-frontend/src/features/colas-impresion/ui/ColasImpresionPage.jsx */

import React, { useState, useEffect } from 'react';
import './ColasImpresionPage.css';
import { usePrintQueue } from '../context/PrintQueueContext';

const renderPriorityBadge = (urgency) => {
  let bgColor = '#f1f5f9';
  let textColor = '#475569';
  let borderColor = '#cbd5e1';
  let icon = null;

  if (urgency === 'Alta') {
    bgColor = '#fee2e2';
    textColor = '#dc2626';
    borderColor = '#fca5a5';
    icon = (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '12px', height: '12px', display: 'inline-block', verticalAlign: 'middle' }}>
        <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.753-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
      </svg>
    );
  } else if (urgency === 'Media') {
    bgColor = '#fef3c7';
    textColor = '#d97706';
    borderColor = '#fde68a';
    icon = (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '12px', height: '12px', display: 'inline-block', verticalAlign: 'middle' }}>
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
      </svg>
    );
  } else {
    bgColor = '#eff6ff';
    textColor = '#1e3a8a';
    borderColor = '#bfdbfe';
    icon = (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '12px', height: '12px', display: 'inline-block', verticalAlign: 'middle' }}>
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-.53 14.03a.75.75 0 001.06 0l3-3a.75.75 0 10-1.06-1.06l-1.72 1.72V8.25a.75.75 0 00-1.5 0v5.69l-1.72-1.72a.75.75 0 00-1.06 1.06l3 3z" clipRule="evenodd" />
      </svg>
    );
  }

  return (
    <span style={{
      fontSize: '0.7rem',
      fontWeight: 700,
      padding: '0.15rem 0.4rem',
      borderRadius: '4px',
      textTransform: 'uppercase',
      letterSpacing: '0.03em',
      backgroundColor: bgColor,
      color: textColor,
      border: `1px solid ${borderColor}`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.2rem',
      verticalAlign: 'middle'
    }}>
      {icon}
      <span>{urgency}</span>
    </span>
  );
};

export const ColasImpresionPage = () => {
  const {
    activeJob,
    queue,
    completedJobs,
    showCancelModal,
    cancelReasonText,
    setCancelReasonText,
    handleStartActiveJob,
    handleTogglePause,
    handleCompleteActiveJob,
    handleOpenCancelModal,
    handleConfirmCancel,
    handleCloseCancelModal,
    handleCancelQueueJob,
    handleStartQueueJob,
    handleMoveUp,
    handleReturnToQueue
  } = usePrintQueue();

  const [activeTab, setActiveTab] = useState('cola'); // 'cola' or 'historial'

  // Filters for History
  const [filterDate, setFilterDate] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');

  // Pagination for History
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Pagination for Queue
  const [queuePage, setQueuePage] = useState(1);
  const queueItemsPerPage = 15;

  // Selected Job Details Modal
  const [selectedJobDetails, setSelectedJobDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterDate, filterUser, filterStatus]);

  // Reset queue page when queue length changes
  useEffect(() => {
    setQueuePage(prev => {
      const maxPage = Math.max(1, Math.ceil(queue.length / queueItemsPerPage));
      return prev > maxPage ? maxPage : prev;
    });
  }, [queue.length]);

  // Format seconds to mm:ss
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  // Helper to generate a download URL for a print job
  const getDownloadUrl = (job) => {
    if (!job) return '#';
    return job.fileUrl || `data:text/plain;charset=utf-8,Este%20es%20el%20documento%20de%20prueba%20${encodeURIComponent(job.name)}%20en%20cola.`;
  };

  // Filter history jobs
  const filteredHistory = completedJobs.filter(job => {
    let matchesDate = true;
    if (filterDate) {
      const [y, m, d] = filterDate.split('-');
      const formattedFilterDate = `${d}/${m}/${y}`;
      matchesDate = (job.sentAt && job.sentAt.includes(formattedFilterDate)) || 
                    (job.completedAt && job.completedAt.includes(formattedFilterDate));
    }

    const matchesUser = filterUser ? (job.sentBy && job.sentBy.toLowerCase().includes(filterUser.toLowerCase())) : true;
    const matchesStatus = filterStatus === 'Todos' ? true : job.status === filterStatus;

    return matchesDate && matchesUser && matchesStatus;
  });

  // Paginate history jobs
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Paginate queue jobs
  const queueTotalPages = Math.ceil(queue.length / queueItemsPerPage);
  const paginatedQueue = queue.slice((queuePage - 1) * queueItemsPerPage, queuePage * queueItemsPerPage);

  return (
    <div className="colas-impresion-container">
      {/* Header section */}
      <div className="colas-header-row">
        <div className="colas-header-left">
          <div className="colas-header-icon-box">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" className="colas-header-icon">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.82l-.24 2.24H4.5a2.25 2.25 0 00-2.25 2.25v2.25c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-2.25a2.25 2.25 0 00-2.25-2.25h-1.98l-.24-2.24m-11.28 0H18.72m-12 0h12m-12 0l1.24-11.13A2.25 2.25 0 018.21 2.25h7.58a2.25 2.25 0 012.23 1.99L19.28 13.82m-12 0h12" />
            </svg>
          </div>
          <div className="colas-title-group">
            <h1>Colas de Impresión</h1>
            <p>Supervisión informativa y administración del estado de los trabajos en cola.</p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="colas-header-navigation">
          <button 
            type="button" 
            className={`colas-header-nav-btn ${activeTab === 'cola' ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab('cola')}
          >
            Cola de Impresión
          </button>
          <button 
            type="button" 
            className={`colas-header-nav-btn ${activeTab === 'historial' ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab('historial')}
          >
            Historial de Impresión
          </button>
        </div>
      </div>

      {activeTab === 'cola' ? (
        <>
          {/* KPI Cards section */}
          <div className="colas-kpi-grid">
            <div className="colas-kpi-card">
              <span className="colas-kpi-title">Trabajo Seleccionado</span>
              <span className="colas-kpi-value" style={{ fontSize: '1.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--color-primary-blue)' }}>
                {activeJob ? activeJob.name : "Ninguno"}
              </span>
              <span className="colas-kpi-desc">
                {activeJob ? `Cliente: ${activeJob.client || 'Sin cliente'} (${activeJob.status})` : "Elige un nuevo documento"}
              </span>
            </div>

            <div className="colas-kpi-card">
              <span className="colas-kpi-title">Documentos en Espera</span>
              <span className="colas-kpi-value">{queue.length}</span>
              <span className="colas-kpi-desc">Pendientes en cola</span>
            </div>

            <div className="colas-kpi-card">
              <span className="colas-kpi-title">Trabajos Procesados</span>
              <span className="colas-kpi-value" style={{ color: '#0d9488' }}>
                {completedJobs.length}
              </span>
              <span className="colas-kpi-desc">Completados / Cancelados</span>
            </div>
          </div>

          {/* Active Job (Full Width) */}
          <div className="active-job-section-full">
            {activeJob ? (
              <div className={`active-job-card status-${activeJob.status.toLowerCase()}`}>
                <div className="active-job-header">
                  <div className="active-job-header-title">
                    <span className="active-job-eyebrow">Trabajo en Proceso</span>
                    <h3 className="active-job-file-name">{activeJob.name}</h3>
                  </div>

                  <div className="active-job-header-badges">
                    {renderPriorityBadge(activeJob.urgency || 'Media')}
                    <div className="status-badge-container">
                      {activeJob.status === "Listo" ? (
                        <div className="active-badge-ready">
                          <span className="ready-dot"></span>
                          <span>Listo para Iniciar</span>
                        </div>
                      ) : activeJob.status === "Imprimiendo" ? (
                        <div className="active-badge-pulse">
                          <span className="pulse-dot"></span>
                          <span>Imprimiendo</span>
                        </div>
                      ) : activeJob.status === "Pausado" ? (
                        <div className="active-badge-paused">
                          <span className="pause-dot"></span>
                          <span>Pausado</span>
                        </div>
                      ) : (
                        <div className="active-badge-completed">
                          <span>{activeJob.status}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="active-job-body">
                  <div className="active-job-grid">
                    
                    {/* Panel Izquierdo: Identidad de Archivo y Specs */}
                    <div className="active-job-left-panel">
                      
                      {/* Document Meta Row */}
                      <div className="active-job-file-details">
                        <div className="file-icon-wrapper">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" className="file-pdf-icon">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                          </svg>
                        </div>
                        <div className="file-info-text">
                          <span className="client-label" style={{ display: 'block' }}>Cliente: <strong>{activeJob.client || 'Corporación Luxes'}</strong></span>
                          {activeJob.proyectoNombre && (
                            <span className="project-label" style={{ fontSize: '0.825rem', color: '#7c3aed', fontWeight: 700, display: 'block', margin: '0.1rem 0' }}>
                              Proyecto: <strong>{activeJob.proyectoNombre}</strong>
                            </span>
                          )}
                          <div className="file-download-row">
                            <span className="file-size-text">Tamaño: {activeJob.size}</span>
                            <span className="dot-divider">•</span>
                            <a 
                              href={getDownloadUrl(activeJob)} 
                              download={activeJob.name}
                              className="file-download-link"
                              title="Descargar documento activo"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                              </svg>
                              Descargar Documento
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Technical specifications as chips/pills */}
                      <div className="active-job-specs-section">
                        <span className="section-mini-label">Especificaciones de Impresión</span>
                        <div className="specs-pills-container">
                          <div className="spec-pill" title="Material">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.125 1.125 0 001.59 0l7.317-7.317a1.125 1.125 0 000-1.59L11.16 3.659A2.25 2.25 0 009.568 3z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5h.008v.008H6V7.5z" />
                            </svg>
                            <span>{activeJob.format} - {activeJob.finish || 'Normal'}</span>
                          </div>

                          <div className="spec-pill" title="Medidas">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v16.5m16.5-16.5v16.5M12 3.75v16.5m-9-8.25h18" />
                            </svg>
                            <span>{activeJob.width || 1.0}m x {activeJob.height || 1.0}m</span>
                          </div>

                          <div className="spec-pill" title="Copias y Páginas">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 6v10.5A2.25 2.25 0 003.75 18.75h10.5A2.25 2.25 0 0016.5 16.5v-2.25m-1.5-6L12 9.75m0 0L9 6.75m3 3V15" />
                            </svg>
                            <span>{activeJob.copies} {activeJob.copies === 1 ? 'copia' : 'copias'} ({activeJob.pages} {activeJob.pages === 1 ? 'pág.' : 'págs.'})</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Panel Derecho: Progreso de Impresión y Operador */}
                    <div className="active-job-right-panel">
                      
                      {/* Operator info with avatar */}
                      <div className="operator-info-container">
                        <div className="operator-avatar" title="Operador responsable">
                          {(activeJob.responsible || 'ISAM').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="operator-details">
                          <span className="operator-label">Operador</span>
                          <span className="operator-name">{activeJob.responsible || 'ISAM'}</span>
                        </div>
                        
                        <div className="start-time-container">
                          <span className="operator-label">Hora de Inicio</span>
                          <span className="start-time-value">{activeJob.startTime || "Sin iniciar"}</span>
                        </div>
                      </div>

                      {/* Progress and Timer section */}
                      <div className="printing-progress-section">
                        <div className="progress-header-row">
                          <span className="progress-label">
                            {activeJob.status === "Listo" ? "Preparado" : activeJob.status === "Pausado" ? "Impresión en Pausa" : "Progreso de Impresión"}
                          </span>
                          <span className="progress-time-counter">
                            {formatTime(activeJob.elapsedSeconds)}
                          </span>
                        </div>
                        
                        {/* Interactive Progress Bar */}
                        {(() => {
                          const estimatedTotalSeconds = (activeJob.pages * activeJob.copies) * 120; // 2 minutes per page/copy
                          const progressPercent = activeJob.status === "Listo" 
                            ? 0 
                            : Math.min(100, Math.floor((activeJob.elapsedSeconds / estimatedTotalSeconds) * 100));
                          
                          return (
                            <div className="progress-container-outer">
                              <div className="progress-bar-track">
                                <div 
                                  className={`progress-bar-fill ${activeJob.status.toLowerCase()}`}
                                  style={{ width: `${progressPercent}%` }}
                                >
                                  {progressPercent > 5 && activeJob.status === "Imprimiendo" && (
                                    <div className="progress-shimmer"></div>
                                  )}
                                </div>
                              </div>
                              <div className="progress-footer">
                                <span className="progress-percent-text">{progressPercent}% completado</span>
                                <span className="progress-estimate-text">
                                  {activeJob.status === "Listo" 
                                    ? "Espera inicio" 
                                    : activeJob.status === "Pausado" 
                                    ? "Pausado" 
                                    : `Est. ${formatTime(Math.max(0, estimatedTotalSeconds - activeJob.elapsedSeconds))} restantes`}
                                </span>
                              </div>
                            </div>
                          );
                        })()}

                      </div>
                    </div>
                  </div>

                  {/* Special Notes Alert Banner */}
                  {activeJob.notes && (
                    <div className="special-notes-alert-card">
                      <div className="notes-icon-box">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                      </div>
                      <div className="notes-content">
                        <span className="notes-title">Indicaciones Especiales del Cliente:</span>
                        <p className="notes-text">{activeJob.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons Row */}
                  <div className="active-actions-row">
                    <div className="active-actions-left">
                      {activeJob.status === "Listo" ? (
                        <>
                          <button 
                            type="button" 
                            onClick={handleStartActiveJob}
                            className="btn-control-premium btn-start"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                            </svg>
                            Iniciar Impresión
                          </button>

                          <button
                            type="button"
                            onClick={handleReturnToQueue}
                            className="btn-control-premium btn-return"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                            </svg>
                            Devolver a Cola
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            type="button" 
                            onClick={handleTogglePause}
                            className={`btn-control-premium ${activeJob.status === "Imprimiendo" ? 'btn-pause' : 'btn-resume'}`}
                          >
                            {activeJob.status === "Imprimiendo" ? (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                                </svg>
                                Pausar Impresión
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                                </svg>
                                Reanudar Impresión
                              </>
                            )}
                          </button>

                          <button 
                            type="button" 
                            onClick={handleCompleteActiveJob}
                            className="btn-control-premium btn-complete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            Marcar como Completado
                          </button>
                        </>
                      )}
                    </div>

                    <button 
                      type="button" 
                      onClick={handleOpenCancelModal}
                      className="btn-control-premium btn-cancel"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                      </svg>
                      Cancelar Impresión
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="active-job-empty-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="active-job-empty-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                <span className="active-job-empty-title">Elige un nuevo documento</span>
                <p className="active-job-empty-desc">
                  No hay ningún trabajo de impresión activo en este momento. Por favor, selecciona un documento de la cola de impresión que se encuentra a continuación para iniciar el proceso.
                </p>
              </div>
            )}
          </div>

          {/* Queue Table Card */}
          <div className="queue-section-card">
            <div className="queue-header">
              <h3>Documentos en Cola</h3>
              <span className="queue-count-badge">{queue.length} en espera</span>
            </div>

            <div className="queue-table-wrapper">
              {queue.length > 0 ? (
                <table className="queue-table">
                  <thead>
                    <tr>
                      <th style={{ width: '36px' }}>Pos</th>
                      <th style={{ width: '18%' }}>Documento</th>
                      <th style={{ width: '12%' }}>Cliente</th>
                      <th style={{ width: '70px' }}>Urgencia</th>
                      <th style={{ width: '90px' }}>Pág./Cop.</th>
                      <th style={{ width: '16%' }}>Sustrato / Acabado</th>
                      <th style={{ width: '10%' }}>Enviado por</th>
                      <th style={{ width: '110px' }}>Fecha Envío</th>
                      <th style={{ width: '80px' }}>Estado</th>
                      <th style={{ width: '130px', textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedQueue.map((job, index) => (
                      <tr key={job.id}>
                        <td>
                          <span className="queue-position-badge">{(queuePage - 1) * queueItemsPerPage + index + 1}</span>
                        </td>
                        <td style={{ fontWeight: 600, color: '#1e293b' }}>{job.name}</td>
                        <td style={{ fontWeight: 500, color: '#475569' }}>
                          <div>{job.client || 'Sin cliente'}</div>
                          {job.proyectoNombre && (
                            <div style={{ fontSize: '0.725rem', color: '#7c3aed', fontWeight: 700, marginTop: '0.15rem' }}>
                              {job.proyectoNombre}
                            </div>
                          )}
                        </td>
                        <td>{renderPriorityBadge(job.urgency)}</td>
                        <td>{job.copies} copias ({job.pages} pág.)</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <span style={{ fontWeight: 600 }}>{job.format}</span>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Acabado: {job.finish || 'Normal'}</span>
                            <span style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 500 }}>Medidas: {job.width || 1.0}m x {job.height || 1.0}m</span>
                            {job.notes && (
                              <span style={{ fontSize: '0.75rem', color: '#475569', fontStyle: 'italic', backgroundColor: '#f1f5f9', padding: '0.1rem 0.25rem', borderRadius: '4px', display: 'inline-block', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={job.notes}>
                                Obs: {job.notes}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>{job.sentBy || 'Usuario'}</td>
                        <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{job.sentAt || 'Sin fecha'}</td>
                        <td>
                          <span className="queue-status-badge status-waiting">
                            {job.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons-group" style={{ justifyContent: 'center' }}>
                            <button 
                              type="button" 
                              onClick={() => handleStartQueueJob(job.id)}
                              className="btn-action btn-action-play" 
                              title="Cargar e Imprimir"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="action-icon">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                              </svg>
                            </button>
                            
                            <button 
                              type="button" 
                              onClick={() => handleMoveUp((queuePage - 1) * queueItemsPerPage + index)}
                              className="btn-action btn-action-up" 
                              title="Subir prioridad"
                              disabled={(queuePage - 1) * queueItemsPerPage + index === 0}
                              style={(queuePage - 1) * queueItemsPerPage + index === 0 ? { opacity: 0.35, cursor: 'not-allowed', pointerEvents: 'none' } : {}}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="action-icon">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                              </svg>
                            </button>

                            <a 
                              href={getDownloadUrl(job)}
                              download={job.name}
                              className="btn-action btn-action-download" 
                              title="Descargar archivo"
                              style={{ textDecoration: 'none' }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="action-icon">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                              </svg>
                            </a>

                            <button 
                              type="button" 
                              onClick={() => handleCancelQueueJob(job.id)}
                              className="btn-action btn-action-cancel" 
                              title="Cancelar trabajo"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="action-icon">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-queue-msg" style={{ padding: '4rem 0' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="empty-queue-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
                  </svg>
                  <p style={{ fontWeight: 600, color: '#475569' }}>La cola está vacía</p>
                  <p style={{ fontSize: '0.85rem' }}>No hay más trabajos en espera.</p>
                </div>
              )}
            </div>

            {/* Queue Pagination */}
            {queueTotalPages > 1 && (
              <div className="history-pagination">
                <button
                  type="button"
                  onClick={() => setQueuePage(prev => Math.max(1, prev - 1))}
                  disabled={queuePage === 1}
                  className="btn-page"
                >
                  Anterior
                </button>
                <span className="page-info">Página {queuePage} de {queueTotalPages}</span>
                <button
                  type="button"
                  onClick={() => setQueuePage(prev => Math.min(queueTotalPages, prev + 1))}
                  disabled={queuePage >= queueTotalPages}
                  className="btn-page"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* History of Completed Jobs Tab (Full Width Table) */
        <div className="queue-section-card">
          <div className="queue-header">
            <h3>Historial de Impresión</h3>
            <span className="queue-count-badge">{filteredHistory.length} filtrados / {completedJobs.length} total</span>
          </div>

          {/* Filters Bar */}
          <div className="history-filters-bar">
            <div className="filter-group">
              <label className="filter-label">Filtrar por Fecha</label>
              <input 
                type="date" 
                value={filterDate} 
                onChange={e => setFilterDate(e.target.value)} 
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Usuario Remitente</label>
              <input 
                type="text" 
                value={filterUser} 
                onChange={e => setFilterUser(e.target.value)} 
                placeholder="Ej: Juan Pérez..."
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Estado</label>
              <select 
                value={filterStatus} 
                onChange={e => setFilterStatus(e.target.value)} 
                className="filter-select"
              >
                <option value="Todos">Todos los Estados</option>
                <option value="Completado">Completado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
            {(filterDate || filterUser || filterStatus !== 'Todos') && (
              <button 
                type="button" 
                className="btn-clear-filters"
                onClick={() => {
                  setFilterDate('');
                  setFilterUser('');
                  setFilterStatus('Todos');
                }}
              >
                Limpiar Filtros
              </button>
            )}
          </div>

          <div className="queue-table-wrapper">
            {paginatedHistory.length > 0 ? (
              <table className="queue-table history-table-clickable">
                <thead>
                  <tr>
                    <th style={{ width: '90px' }}>Finalización</th>
                    <th style={{ width: '16%' }}>Documento</th>
                    <th style={{ width: '11%' }}>Cliente</th>
                    <th style={{ width: '70px' }}>Urgencia</th>
                    <th style={{ width: '80px' }}>Pág./Cop.</th>
                    <th style={{ width: '14%' }}>Sustrato / Acabado</th>
                    <th style={{ width: '9%' }}>Enviado por</th>
                    <th style={{ width: '10%' }}>Responsable</th>
                    <th style={{ width: '70px' }}>Duración</th>
                    <th style={{ width: '80px' }}>Estado</th>
                    <th style={{ width: '50px', textAlign: 'center' }}>Ver</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedHistory.map((job) => (
                    <tr 
                      key={job.id} 
                      onClick={() => { setSelectedJobDetails(job); setShowDetailsModal(true); }}
                      style={{ cursor: 'pointer' }}
                      title="Haz clic para ver la ficha técnica detallada"
                    >
                      <td style={{ fontWeight: 600, color: '#64748b' }}>{job.completedAt}</td>
                      <td style={{ fontWeight: 600, color: '#1e293b' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span>{job.name}</span>
                          <a 
                            href={getDownloadUrl(job)}
                            download={job.name}
                            onClick={e => e.stopPropagation()} // Stop row click event from bubbling to tr
                            style={{ color: 'var(--color-primary-blue)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}
                            title="Descargar archivo"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" style={{ width: '12px', height: '12px' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            Descargar
                          </a>
                        </div>
                      </td>
                      <td style={{ fontWeight: 500, color: '#475569' }}>
                        <div>{job.client || 'Sin cliente'}</div>
                        {job.proyectoNombre && (
                          <div style={{ fontSize: '0.725rem', color: '#7c3aed', fontWeight: 700, marginTop: '0.15rem' }}>
                            {job.proyectoNombre}
                          </div>
                        )}
                      </td>
                      <td>{renderPriorityBadge(job.urgency)}</td>
                      <td>{job.copies} copias ({job.pages} pág.)</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <span style={{ fontWeight: 600 }}>{job.format}</span>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Acabado: {job.finish || 'Normal'}</span>
                          <span style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 500 }}>Medidas: {job.width || 1.0}m x {job.height || 1.0}m</span>
                          {job.notes && (
                            <span style={{ fontSize: '0.75rem', color: '#475569', fontStyle: 'italic', backgroundColor: '#f1f5f9', padding: '0.1rem 0.25rem', borderRadius: '4px', display: 'inline-block', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={job.notes}>
                              Obs: {job.notes}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>{job.sentBy || 'Usuario'}</td>
                      <td>{job.responsible || 'ISAM'}</td>
                      <td>{formatTime(job.elapsedSeconds)}</td>
                      <td>
                        <span className={`queue-status-badge ${job.status === 'Completado' ? 'status-completed' : 'status-canceled'}`}>
                          {job.status === 'Completado' ? 'Completado' : 'Cancelado'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          type="button" 
                          className="btn-action" 
                          title="Ver Ficha Técnica"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedJobDetails(job);
                            setShowDetailsModal(true);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className="action-icon">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-queue-msg" style={{ padding: '4rem 0' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="empty-queue-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p style={{ fontWeight: 600, color: '#475569' }}>No se encontraron resultados</p>
                <p style={{ fontSize: '0.85rem' }}>Prueba modificando los filtros de búsqueda.</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="history-pagination">
              <button 
                type="button" 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="btn-page"
              >
                Anterior
              </button>
              <span className="page-info">Página {currentPage} de {totalPages}</span>
              <button 
                type="button" 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="btn-page"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}

      {/* Cancellation Reason Modal */}
      {showCancelModal && (
        <div className="colas-modal-overlay">
          <div className="colas-modal-card">
            <span className="colas-modal-title">Cancelar Trabajo de Impresión</span>
            <p className="colas-modal-desc">
              Por favor, especifica el motivo por el cual estás cancelando la impresión de <strong>{activeJob ? activeJob.name : ""}</strong>. Esta información quedará registrada en el historial del trabajo.
            </p>
            <form onSubmit={handleConfirmCancel} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <textarea 
                className="colas-modal-textarea" 
                placeholder="Escribe aquí el motivo (ej: Papel atascado, error de sustrato, archivo incorrecto...)"
                value={cancelReasonText}
                onChange={e => setCancelReasonText(e.target.value)}
                required
              />
              <div className="colas-modal-actions">
                <button type="button" onClick={handleCloseCancelModal} className="btn-modal-back">
                  Volver
                </button>
                <button type="submit" className="btn-modal-cancel">
                  Confirmar Cancelación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detailed Job Info Modal */}
      {showDetailsModal && selectedJobDetails && (
        <div className="colas-modal-overlay" onClick={() => { setShowDetailsModal(false); setSelectedJobDetails(null); }}>
          <div className="colas-modal-card details-modal-card" onClick={e => e.stopPropagation()}>
            <div className="details-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
              <span className="colas-modal-title" style={{ fontSize: '1.2rem', color: 'var(--color-primary-blue)' }}>Ficha Técnica del Trabajo</span>
              <button 
                type="button" 
                onClick={() => { setShowDetailsModal(false); setSelectedJobDetails(null); }} 
                style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#94a3b8', border: 'none', background: 'none', cursor: 'pointer' }}
                title="Cerrar modal"
              >
                &times;
              </button>
            </div>
            
            <div className="details-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.25rem' }}>
              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>{selectedJobDetails.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                  <span className={`queue-status-badge ${selectedJobDetails.status === 'Completado' ? 'status-completed' : 'status-canceled'}`}>
                    {selectedJobDetails.status}
                  </span>
                  {renderPriorityBadge(selectedJobDetails.urgency)}
                </div>
              </div>

              <div className="details-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div className="detail-item">
                  <span className="detail-item-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>Cliente</span>
                  <span className="detail-item-value" style={{ fontWeight: 600, color: '#334155' }}>{selectedJobDetails.client || 'Sin cliente'}</span>
                </div>
                {selectedJobDetails.proyectoNombre && (
                  <div className="detail-item">
                    <span className="detail-item-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>Proyecto Vinculado</span>
                    <span className="detail-item-value" style={{ fontWeight: 600, color: '#7c3aed' }}>{selectedJobDetails.proyectoNombre}</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="detail-item-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>Material / Sustrato</span>
                  <span className="detail-item-value" style={{ fontWeight: 600, color: '#334155' }}>{selectedJobDetails.format}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-item-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>Acabado / Tipo de Lona</span>
                  <span className="detail-item-value" style={{ fontWeight: 600, color: '#334155' }}>{selectedJobDetails.finish || 'Normal'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-item-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>Medidas Físicas</span>
                  <span className="detail-item-value" style={{ fontWeight: 600, color: '#0369a1' }}>{selectedJobDetails.width || 1.0}m x {selectedJobDetails.height || 1.0}m</span>
                </div>
                <div className="detail-item">
                  <span className="detail-item-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>Copias / Páginas</span>
                  <span className="detail-item-value" style={{ fontWeight: 600, color: '#334155' }}>{selectedJobDetails.copies} cop. ({selectedJobDetails.pages} pág.)</span>
                </div>
                <div className="detail-item">
                  <span className="detail-item-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>Enviado por</span>
                  <span className="detail-item-value" style={{ fontWeight: 600, color: '#334155' }}>{selectedJobDetails.sentBy || 'Usuario'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-item-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>Responsable (Operador)</span>
                  <span className="detail-item-value" style={{ fontWeight: 600, color: '#334155' }}>{selectedJobDetails.responsible || 'ISAM'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-item-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>Duración de Impresión</span>
                  <span className="detail-item-value" style={{ fontWeight: 600, color: '#334155' }}>{formatTime(selectedJobDetails.elapsedSeconds)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-item-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>Fecha de Envío</span>
                  <span className="detail-item-value" style={{ fontWeight: 600, color: '#334155' }}>{selectedJobDetails.sentAt || 'Sin fecha'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-item-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>Hora de Finalización</span>
                  <span className="detail-item-value" style={{ fontWeight: 600, color: '#334155' }}>{selectedJobDetails.completedAt || 'Sin registrar'}</span>
                </div>
              </div>

              {selectedJobDetails.notes && (
                <div style={{ marginTop: '0.5rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderLeft: '4px solid var(--color-primary-blue)', borderRadius: '6px' }}>
                  <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Indicaciones Especiales</span>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.45 }}>{selectedJobDetails.notes}</p>
                </div>
              )}

              {selectedJobDetails.status === "Cancelado" && selectedJobDetails.cancelReason && (
                <div style={{ marginTop: '0.5rem', padding: '0.75rem', backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', borderRadius: '6px' }}>
                  <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Motivo de Cancelación</span>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#b91c1c', fontWeight: 600, lineHeight: 1.45 }}>{selectedJobDetails.cancelReason}</p>
                </div>
              )}
            </div>
            
            <div className="colas-modal-actions" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <button 
                type="button" 
                onClick={() => { setShowDetailsModal(false); setSelectedJobDetails(null); }} 
                className="btn-modal-back"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
