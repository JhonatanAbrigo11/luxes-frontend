import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Send, Check } from 'lucide-react';

// Mocks para simular empleados
const MOCK_EMPLEADOS = [
  { id: 'e1', nombre: 'Carlos Rivera', rol: 'Instalador' },
  { id: 'e2', nombre: 'Ana Gómez', rol: 'Diseñadora' }
];

export function EncuestaPage() {
  const { id } = useParams();
  const [enviado, setEnviado] = useState(false);
  
  const [estrellas, setEstrellas] = useState(0);
  const [hoverEstrellas, setHoverEstrellas] = useState(0);
  const [calificacionPersonal, setCalificacionPersonal] = useState({});
  const [comentarios, setComentarios] = useState('');

  const handleEstrellaPersonal = (empId, valor) => {
    setCalificacionPersonal(prev => ({
      ...prev,
      [empId]: valor
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (estrellas === 0) return;
    
    setEnviado(true);
  };

  if (enviado) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-slate-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-2xl p-12 text-center shadow-lg border border-slate-100">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={32} strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-4">¡Gracias por tu respuesta!</h2>
          <p className="text-slate-600 text-base mb-8">
            Hemos recibido tus comentarios. Tu opinión es fundamental para nosotros.
          </p>
          <img src="/Logo.jpg" alt="LUXES" className="h-10 mx-auto rounded-lg shadow-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/50 to-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative">
      
      {/* Patrón de fondo sutil (decorativo) */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1e3a8a 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>

      {/* Contenedor Principal Unificado */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col max-h-full z-10 overflow-hidden">
        
        {/* Header Unificado dentro de la tarjeta */}
        <div className="p-6 sm:px-10 sm:pt-8 sm:pb-6 border-b border-slate-50 text-center bg-white flex-shrink-0">
          <img src="/Logo.jpg" alt="LUXES" className="h-12 mx-auto mb-4 rounded shadow-sm" />
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">
            Nos importa tu opinión
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            Hola <span className="font-semibold text-blue-600">Cliente Valioso</span>, ayúdanos a evaluar el proyecto: <span className="font-medium text-slate-700">{id}</span>
          </p>

          <h2 className="text-lg font-medium text-slate-700 tracking-tight mb-3">
            ¿Cómo fue tu experiencia general?
          </h2>
          
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverEstrellas(star)}
                onMouseLeave={() => setHoverEstrellas(0)}
                onClick={() => setEstrellas(star)}
                className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  size={42}
                  strokeWidth={1.5}
                  className={`transition-colors duration-200 ${
                    star <= (hoverEstrellas || estrellas)
                      ? 'fill-blue-500 text-blue-500'
                      : 'fill-transparent text-slate-200 hover:text-blue-200'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Formulario con espaciado balanceado */}
        <div className="overflow-y-auto px-6 sm:px-10 py-6 flex-1 bg-slate-50/50">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            
            <div className="space-y-8 flex-1">
              {/* Evaluación Personal */}
              <div>
                <div className="mb-4">
                  <p className="text-base font-semibold text-slate-800">Evaluación del equipo</p>
                  <p className="text-xs text-slate-500">Califica la atención de las personas que trabajaron en tu proyecto.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {MOCK_EMPLEADOS.map(emp => (
                    <div key={emp.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                      <div className="mb-2 sm:mb-0">
                        <p className="font-semibold text-slate-700 text-sm">{emp.nombre}</p>
                        <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">{emp.rol}</p>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleEstrellaPersonal(emp.id, star)}
                            className="focus:outline-none"
                          >
                            <Star
                              size={20}
                              strokeWidth={1.5}
                              className={`transition-colors duration-200 ${
                                star <= (calificacionPersonal[emp.id] || 0)
                                  ? 'fill-blue-400 text-blue-400'
                                  : 'fill-transparent text-slate-200 hover:text-blue-100'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sugerencias */}
              <div className="flex flex-col">
                <p className="text-base font-semibold text-slate-800 mb-3">Comentarios adicionales</p>
                <textarea
                  className="w-full p-4 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none shadow-sm"
                  placeholder="¿Qué podríamos mejorar para tu próxima experiencia?"
                  rows="3"
                  value={comentarios}
                  onChange={(e) => setComentarios(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex-shrink-0">
              <button
                type="submit"
                disabled={estrellas === 0}
                className={`w-full py-3.5 font-medium text-base rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 ${
                  estrellas === 0 ? 'text-slate-400 cursor-not-allowed' : 'text-white hover:opacity-90'
                }`}
                style={{ backgroundColor: estrellas === 0 ? '#e2e8f0' : 'var(--color-secondary-blue)' }}
              >
                <Send size={18} />
                Enviar retroalimentación
              </button>
              {estrellas === 0 && (
                <p className="text-center text-slate-400 text-xs mt-2">
                  * Selecciona una calificación general para poder enviar
                </p>
              )}
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
