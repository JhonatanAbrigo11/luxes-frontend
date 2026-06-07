import React from 'react';
import { Star, MessageSquare, CheckCircle, UserCheck } from 'lucide-react';

const MOCK_RESULTADOS_ENCUESTA = {
  completada: true,
  fecha: '2026-06-05',
  calificacionGeneral: 5,
  comentarios: 'Excelente servicio, muy rápidos y el diseño quedó exactamente como lo pedimos. Definitivamente volveremos a trabajar con LUXES.',
  personal: [
    { nombre: 'Carlos Rivera', rol: 'Instalador', estrellas: 5 },
    { nombre: 'Ana Gómez', rol: 'Diseñadora', estrellas: 5 }
  ]
};

export function CompletadoPanel({ proyectoId }) {
  const { completada, fecha, calificacionGeneral, comentarios, personal } = MOCK_RESULTADOS_ENCUESTA;

  if (!completada) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
          <MessageSquare size={24} className="text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-700">Esperando respuesta del cliente</h3>
        <p className="text-sm text-slate-500 mt-2 max-w-md">
          La encuesta de satisfacción fue enviada. Los resultados aparecerán aquí una vez que el cliente la haya completado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
          <CheckCircle size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-emerald-800">Proyecto finalizado exitosamente</h3>
          <p className="text-xs text-emerald-600">
            Encuesta de satisfacción recibida el {fecha}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calificación General y Comentarios */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            Evaluación General del Cliente
          </h4>
          
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={28}
                className={s <= calificacionGeneral ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
              />
            ))}
            <span className="ml-2 text-lg font-black text-slate-800">{calificacionGeneral}/5</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative">
            <MessageSquare size={16} className="absolute top-4 left-4 text-slate-300" />
            <p className="text-sm text-slate-700 italic pl-6">
              "{comentarios}"
            </p>
          </div>
        </div>

        {/* Desempeño del Personal */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            Desempeño del Personal Involucrado
          </h4>
          
          <div className="space-y-3">
            {personal.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <UserCheck size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">{p.nombre}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-medium">{p.rol}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      className={s <= p.estrellas ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
