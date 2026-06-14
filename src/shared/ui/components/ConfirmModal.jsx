import React, { useState, useEffect } from 'react';
import headerBg from '../../../assets/header-bg.png';
import './ConfirmModal.css';

const MODAL_HEADER_STYLE = {
  backgroundColor: '#02188E',
  backgroundImage: `linear-gradient(90deg, rgba(1, 12, 72, 0.55) 0%, rgba(4, 51, 255, 0.25) 50%, rgba(1, 12, 72, 0.55) 100%), url(${headerBg})`,
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
};

let confirmListener = null;

export const confirmDialog = (title, message, options = {}) => {
  return new Promise((resolve) => {
    if (confirmListener) {
      confirmListener({
        isOpen: true,
        title,
        message,
        confirmLabel: options.confirmLabel || 'Aceptar',
        cancelLabel: options.cancelLabel || 'Cancelar',
        type: options.type || 'danger', // danger, warning, info
        resolve
      });
    } else {
      // Fallback to native window.confirm if container is not mounted yet
      resolve(window.confirm(message));
    }
  });
};

export const ConfirmDialogContainer = () => {
  const [state, setState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Aceptar',
    cancelLabel: 'Cancelar',
    type: 'danger',
    resolve: null
  });

  useEffect(() => {
    confirmListener = setState;
    return () => {
      confirmListener = null;
    };
  }, []);

  if (!state.isOpen) return null;

  const handleCancel = () => {
    setState(prev => ({ ...prev, isOpen: false }));
    if (state.resolve) state.resolve(false);
  };

  const handleConfirm = () => {
    setState(prev => ({ ...prev, isOpen: false }));
    if (state.resolve) state.resolve(true);
  };

  const getTypeStyle = () => {
    switch (state.type) {
      case 'danger':
        return {
          iconBg: 'rgba(255, 255, 255, 0.2)',
          iconColor: '#ffffff',
          btnBg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          btnShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
        };
      case 'warning':
        return {
          iconBg: 'rgba(255, 255, 255, 0.2)',
          iconColor: '#ffffff',
          btnBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          btnShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
        };
      default:
        return {
          iconBg: 'rgba(255, 255, 255, 0.2)',
          iconColor: '#ffffff',
          btnBg: 'linear-gradient(135deg, #0433ff 0%, #02188e 100%)',
          btnShadow: '0 4px 14px rgba(2, 24, 142, 0.3)',
        };
    }
  };

  const colors = getTypeStyle();

  return (
    <>
      <div className="confirm-overlay" onClick={handleCancel} />
      <div className="confirm-wrapper">
        <div className="confirm-card">
          <div className="confirm-header" style={MODAL_HEADER_STYLE}>
            <div className="confirm-icon-box" style={{ backgroundColor: colors.iconBg, color: colors.iconColor, border: '1px solid rgba(255,255,255,0.25)' }}>
              {state.type === 'danger' && (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
              {state.type === 'warning' && (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              {state.type !== 'danger' && state.type !== 'warning' && (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <h3 className="confirm-title">{state.title}</h3>
          </div>
          <div className="confirm-body">
            <p className="confirm-message">{state.message}</p>
          </div>
          <div className="confirm-footer">
            <button type="button" className="confirm-btn-cancel" onClick={handleCancel}>
              {state.cancelLabel}
            </button>
            <button
              type="button"
              className="confirm-btn-action"
              style={{ background: colors.btnBg, boxShadow: colors.btnShadow }}
              onClick={handleConfirm}
            >
              {state.confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
