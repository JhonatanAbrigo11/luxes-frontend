import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export const CredencialCard = ({ emp, isPrinting, onPrint }) => {
  return (
    <div className={`relative group w-full max-w-[300px] ${isPrinting ? 'print-target' : 'perspective'}`}>
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />

      <div className="relative flex flex-col bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl h-full">
        
        {/* Card Header Band */}
        <div className="h-20 bg-gradient-to-br from-[#02188E] to-indigo-700 relative shrink-0 flex items-end px-4 pb-3">
          <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white/90 border border-white/20 tracking-widest">
            LUXES · 2026
          </div>
          <span className="text-white/40 text-[10px] font-mono tracking-widest">CREDENCIAL</span>
        </div>

        {/* Avatar */}
        <div className="flex justify-center -mt-10 relative z-10 shrink-0">
          <img
            src={emp.foto || `https://api.dicebear.com/7.x/adventurer/svg?seed=${emp.id}`}
            alt={emp.nombre}
            className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover bg-gray-100"
          />
        </div>

        {/* Info */}
        <div className="text-center px-5 pt-3 pb-4 grow">
          <h3 className="text-lg font-bold text-gray-800 leading-tight">{emp.nombre}</h3>
          <p className="text-[#02188E] font-semibold text-sm mt-1">{emp.cargo}</p>
          <span className="inline-block mt-1 bg-blue-50 text-blue-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-wide">
            {emp.departamento}
          </span>
        </div>

        {/* Divider */}
        <div className="mx-5 border-t border-dashed border-gray-200" />

        {/* QR Section */}
        <div className="flex flex-col items-center py-5 shrink-0">
          <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100">
            <QRCodeSVG value={emp.id} size={90} level="H" fgColor="#02188E" />
          </div>
          <p className="text-[10px] text-gray-400 mt-2 font-mono tracking-widest">{emp.id}</p>
        </div>

        {/* Print Button — appears on hover */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-white via-white/95 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex justify-center translate-y-2 group-hover:translate-y-0 print-hidden">
          <button
            onClick={() => onPrint(emp.id)}
            className="bg-[#02188E] hover:bg-blue-800 active:scale-95 text-white text-xs font-bold py-2 px-5 rounded-full shadow-lg transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir Carnet
          </button>
        </div>
      </div>
    </div>
  );
};
