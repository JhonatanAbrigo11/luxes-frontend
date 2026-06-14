import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import headerBg from '../../../../assets/header-bg.png';

const LUXES_NAVY = '#02188E';
const HEADER_BG_STYLE = {
  backgroundColor: LUXES_NAVY,
  backgroundImage: `linear-gradient(90deg, rgba(1, 12, 72, 0.55) 0%, rgba(4, 51, 255, 0.25) 50%, rgba(1, 12, 72, 0.55) 100%), url(${headerBg})`,
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
};

export const CredencialCard = ({ emp, isPrinting, onPrint, onFotoUpload }) => {
  const fileInputRef = useRef(null);
  const hasFoto = Boolean(emp.foto?.trim());

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onFotoUpload) {
      onFotoUpload(emp, file);
    }
    e.target.value = '';
  };

  return (
    <div className={`relative group w-full max-w-[300px] ${isPrinting ? 'print-target' : 'perspective'}`}>
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0433ff]/30 to-[#02188E]/40 rounded-2xl blur opacity-25 group-hover:opacity-45 transition duration-500" />

      <div className="relative flex flex-col bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl h-full">
        
        {/* Card Header Band */}
        <div className="h-20 relative shrink-0 flex items-end px-4 pb-3 overflow-hidden" style={HEADER_BG_STYLE}>
          <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white/90 border border-white/20 tracking-widest">
            LUXES · 2026
          </div>
          <span className="text-white/40 text-[10px] font-mono tracking-widest">CREDENCIAL</span>
        </div>

        {/* Avatar */}
        <div className="flex justify-center -mt-10 relative z-10 shrink-0">
          <div className="relative cursor-pointer group/avatar" onClick={handleAvatarClick}>
            {hasFoto ? (
              <img
                src={emp.foto}
                alt={emp.nombre}
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover bg-gray-100"
              />
            ) : (
              <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
              </svg>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>
        </div>

        {/* Info */}
        <div className="text-center px-5 pt-3 pb-4 grow">
          <h3 className="text-lg font-bold text-gray-800 leading-tight">{emp.nombre}</h3>
          <p className="text-[#02188E] font-semibold text-sm mt-1">{emp.cargo}</p>
          <span className="inline-block mt-1 bg-[#f0f6ff] text-[#0433ff] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#c7d9ff] uppercase tracking-wide">
            {emp.departamento}
          </span>
        </div>

        {/* Divider */}
        <div className="mx-5 border-t border-dashed border-gray-200" />

        {/* QR Section */}
        <div className="flex flex-col items-center py-5 shrink-0">
          <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100">
            <QRCodeSVG value={emp.id} size={90} level="H" fgColor={LUXES_NAVY} />
          </div>
          <p className="text-[10px] text-gray-400 mt-2 font-mono tracking-widest">{emp.id}</p>
        </div>

        {/* Print Button */}
        <div className="p-4 flex justify-center print-hidden border-t border-gray-100">
          <button
            onClick={() => onPrint(emp.id)}
            className="bg-[#02188E] hover:bg-[#0433ff] active:scale-95 text-white text-xs font-bold py-2 px-5 rounded-full shadow-lg transition-all flex items-center gap-2"
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
