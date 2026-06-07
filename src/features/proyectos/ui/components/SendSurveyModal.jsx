import React, { useState } from 'react';
import { Send, X, Smartphone, MessageCircle } from 'lucide-react';

export function SendSurveyModal({ isOpen, onClose, proyecto, onConfirm }) {
  if (!isOpen) return null;

  // Texto prellenado para WhatsApp
  const urlEncuesta = `http://localhost:5173/encuesta/${proyecto?.id || 'demo'}`;
  const nombreCliente = typeof proyecto?.cliente === 'object' ? proyecto?.cliente?.nombre : (proyecto?.cliente || 'Cliente');
  const mensajeDefault = `Hola ${nombreCliente}, en LUXES queremos seguir mejorando para brindarte el mejor servicio. Nos encantaría conocer tu opinión sobre el proyecto "${proyecto?.nombre || 'Proyecto'}". Por favor ingresa a este link para evaluar nuestro trabajo: ${urlEncuesta} ¡Gracias por tu confianza!`;

  const [mensaje, setMensaje] = useState(mensajeDefault);
  const numeroWA = '593968982380';

  const handleSendAndComplete = () => {
    // Abrir WhatsApp en nueva pestaña
    const waLink = `https://wa.me/${numeroWA}?text=${encodeURIComponent(mensaje)}`;
    window.open(waLink, '_blank');
    
    // Ejecutar la acción de avanzar fase a Completado
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-emerald-50 px-6 py-4 flex items-center justify-between border-b border-emerald-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <MessageCircle size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Enviar Encuesta de Satisfacción</h2>
              <p className="text-xs text-emerald-600 font-medium">Paso final antes de cerrar el proyecto</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            Se enviará el siguiente mensaje vía WhatsApp para que el cliente califique el desempeño del equipo y deje sus sugerencias. Puedes editar el texto antes de enviarlo.
          </p>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Mensaje de WhatsApp
            </label>
            <textarea
              className="w-full h-32 p-3 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <Smartphone size={16} className="text-slate-400" />
            <span className="text-xs text-slate-500">
              Se enviará al número predeterminado: <strong className="text-slate-700">+{numeroWA}</strong>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSendAndComplete}
            className="px-6 py-2 text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
          >
            <Send size={16} />
            Enviar WhatsApp y Finalizar
          </button>
        </div>

      </div>
    </div>
  );
}
