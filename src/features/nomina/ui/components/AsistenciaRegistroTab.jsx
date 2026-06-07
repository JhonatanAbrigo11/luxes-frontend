import React, { useState, useEffect, useMemo } from 'react';
import { getAsistencias } from '../../../asistencia/application/asistenciaService';
import { empleadosMock } from '../../infrastructure/mock/nominaData';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const DIAS_SEMANA = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

// Turnos de la semana (lunes a viernes)
const TURNOS_SEMANA = ['08:00 - 13:00', '14:00 - 17:30'];
const TURNO_SABADO  = '09:00 - 14:00';

/**
 * Devuelve las semanas (lun-sáb) del mes indicado.
 * Cada semana es un array de Date (lunes a sábado).
 */
function getSemanasDelMes(year, month) {
  const semanas = [];
  const inicio = new Date(year, month, 1);
  const fin    = new Date(year, month + 1, 0);

  // Ir al primer lunes <= inicio
  let cursor = new Date(inicio);
  const diaSemana = cursor.getDay(); // 0=Dom
  const diff = diaSemana === 0 ? -6 : 1 - diaSemana;
  cursor.setDate(cursor.getDate() + diff);

  while (cursor <= fin) {
    const semana = [];
    for (let i = 0; i < 6; i++) { // Lun → Sáb
      semana.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    semanas.push(semana);
  }
  return semanas;
}

/**
 * Verifica si un empleado asistió a un turno en una fecha específica.
 * Para simplificar, marcamos ✓ si hay al menos una marcación de ENTRADA o MARCACION ese día.
 */
function empleadoAsistio(registros, empleadoId, fecha, turno) {
  const fechaStr = fecha.toISOString().split('T')[0];
  return registros.some(r => {
    const rFecha = new Date(r.fechaHora).toISOString().split('T')[0];
    return r.empleadoId === String(empleadoId) && rFecha === fechaStr;
  });
}

// ─── Componente ───────────────────────────────────────────────────────────────
export const AsistenciaRegistroTab = () => {
  const hoy = new Date();
  const [año, setAño]     = useState(hoy.getFullYear());
  const [mes, setMes]     = useState(hoy.getMonth());
  const [semIdx, setSemIdx] = useState(0);
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getAsistencias();
        setRegistros(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const semanas = useMemo(() => getSemanasDelMes(año, mes), [año, mes]);

  // Asegurar que semIdx sea válido al cambiar de mes
  useEffect(() => {
    setSemIdx(0);
  }, [mes, año]);

  const semanaActual = semanas[semIdx] || [];
  // lun-vie son primeras 5, sáb es la 6ta
  const diasSem = semanaActual.slice(0, 5);  // lun-vie
  const diaSab  = semanaActual[5];            // sáb

  const formatFecha = (d) => {
    if (!d) return '';
    const nombre = DIAS_SEMANA[d.getDay()];
    return `${nombre} ${d.getDate()}`;
  };

  const mesAnterior = () => {
    if (mes === 0) { setMes(11); setAño(a => a - 1); }
    else setMes(m => m - 1);
  };
  const mesSiguiente = () => {
    if (mes === 11) { setMes(0); setAño(a => a + 1); }
    else setMes(m => m + 1);
  };

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-blue-900 tracking-tight uppercase">
            Registro de Asistencia — {MESES[mes]} {año}
          </h2>
          <p className="text-gray-400 text-xs mt-0.5">Tabla semanal de marcaciones de entrada y salida por turno.</p>
        </div>
        {/* Selector mes */}
        <div className="flex items-center gap-2">
          <button onClick={mesAnterior}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 font-bold shadow-sm transition-all">‹</button>
          <span className="text-sm font-bold text-gray-700 min-w-[130px] text-center">
            {MESES[mes]} {año}
          </span>
          <button onClick={mesSiguiente}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 font-bold shadow-sm transition-all">›</button>
        </div>
      </div>

      {/* Selector de semana */}
      <div className="flex gap-2 flex-wrap">
        {semanas.map((sem, idx) => {
          const lun = sem[0];
          const sab = sem[5];
          const label = `${lun.getDate()}–${sab.getDate()}`;
          return (
            <button key={idx} onClick={() => setSemIdx(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                idx === semIdx
                  ? 'bg-blue-900 text-white border-blue-900 shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
              }`}>
              Sem {idx + 1} ({label})
            </button>
          );
        })}
      </div>

      {/* Tabla principal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Título de la tabla */}
        <div className="bg-blue-900 text-white text-center py-2.5 font-extrabold text-sm tracking-widest uppercase">
          REGISTRO DE NÓMINA {MESES[mes].toUpperCase()} {año}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-xs" style={{ borderCollapse: 'collapse' }}>
              <thead>
                {/* Fila 1: días de la semana */}
                <tr>
                  <th rowSpan={2} className="border border-gray-300 bg-gray-50 px-3 py-2 text-center font-bold text-gray-700 w-8">#</th>
                  <th rowSpan={2} className="border border-gray-300 bg-gray-50 px-4 py-2 font-bold text-gray-700 min-w-[160px]">NOMBRES</th>
                  {diasSem.map((d, i) => (
                    <th key={i} colSpan={2}
                      className="border border-gray-300 bg-blue-50 px-2 py-2 text-center font-bold text-blue-800 uppercase">
                      {formatFecha(d)}
                    </th>
                  ))}
                  {diaSab && (
                    <th colSpan={1}
                      className="border border-gray-300 bg-blue-50 px-2 py-2 text-center font-bold text-blue-800 uppercase">
                      {formatFecha(diaSab)}
                    </th>
                  )}
                  <th rowSpan={2} className="border border-gray-300 bg-gray-50 px-3 py-2 text-center font-bold text-gray-700 min-w-[90px]">OBSERVACIÓN</th>
                </tr>
                {/* Fila 2: turnos */}
                <tr>
                  {diasSem.map((_, i) =>
                    TURNOS_SEMANA.map((t, ti) => (
                      <th key={`${i}-${ti}`}
                        className="border border-gray-300 bg-blue-50/60 px-1.5 py-1.5 text-center text-[9px] font-semibold text-blue-700 whitespace-nowrap">
                        {t}
                      </th>
                    ))
                  )}
                  {diaSab && (
                    <th className="border border-gray-300 bg-blue-50/60 px-1.5 py-1.5 text-center text-[9px] font-semibold text-blue-700 whitespace-nowrap">
                      {TURNO_SABADO}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {empleadosMock.map((emp, idx) => {
                  return (
                    <tr key={emp.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                      <td className="border border-gray-200 text-center font-bold text-gray-500 px-2 py-2">{idx + 1}</td>
                      <td className="border border-gray-200 px-3 py-2 font-semibold text-gray-800 uppercase text-[11px]">
                        {emp.nombre}
                      </td>
                      {diasSem.map((dia, di) => {
                        const fuera = dia.getMonth() !== mes;
                        const asistio = !fuera && empleadoAsistio(registros, emp.id, dia, 'manana');
                        return TURNOS_SEMANA.map((_, ti) => (
                          <td key={`${di}-${ti}`}
                            className={`border border-gray-200 text-center py-2 ${
                              fuera ? 'bg-gray-100' :
                              asistio ? 'bg-white' : 'bg-red-100'
                            }`}>
                            {!fuera && asistio && (
                              <span className="text-green-700 font-black text-sm">✓</span>
                            )}
                          </td>
                        ));
                      })}
                      {diaSab && (() => {
                        const fuera = diaSab.getMonth() !== mes;
                        const asistioSab = !fuera && empleadoAsistio(registros, emp.id, diaSab, 'sabado');
                        return (
                          <td className={`border border-gray-200 text-center py-2 ${
                            fuera ? 'bg-gray-100' :
                            asistioSab ? 'bg-white' : 'bg-red-100'
                          }`}>
                            {!fuera && asistioSab && (
                              <span className="text-green-700 font-black text-sm">✓</span>
                            )}
                          </td>
                        );
                      })()}
                      <td className="border border-gray-200 px-2 py-2 text-gray-400 text-[10px] italic"></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Leyenda */}
        <div className="flex items-center gap-5 px-5 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="inline-block w-4 h-4 bg-white border border-gray-300 rounded-sm text-center text-green-700 font-black leading-4">✓</span>
            <span>Asistió</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="inline-block w-4 h-4 bg-red-100 border border-red-200 rounded-sm"></span>
            <span>Ausente</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="inline-block w-4 h-4 bg-gray-100 border border-gray-200 rounded-sm"></span>
            <span>Fuera del mes</span>
          </div>
        </div>
      </div>
    </div>
  );
};
