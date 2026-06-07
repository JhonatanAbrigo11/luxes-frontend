import React from 'react';

export const EmptyState = ({ message = 'No hay registros para el rango seleccionado.' }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
      <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    </div>
    <p className="text-sm font-medium text-gray-500 max-w-xs">{message}</p>
    <p className="text-[10px] text-gray-400 mt-2">Intenta cambiar el rango de fechas o los filtros</p>
  </div>
);
