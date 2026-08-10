import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, QrCode } from 'lucide-react';

export default function QRCodeModal({ unit, isOpen, onClose }) {
  if (!isOpen || !unit) return null;

  const targetUrl = `${window.location.origin}/?unit=${unit.unit_id}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm modal-shadow overflow-hidden flex flex-col print:border-none print:shadow-none print:w-full print:max-w-full">
        
        {/* Modal Header - Hidden on Print */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-sm text-slate-900 font-mono">WORKSHOP STORAGE TAG</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable QR Storage Label */}
        <div className="p-6 text-center space-y-4 font-mono">
          <div className="border-2 border-slate-900 rounded-xl p-4 bg-slate-50 space-y-3 print:border-black">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">REPAIR-IT WORKSHOP TAG</span>
              <h2 className="text-xl font-bold text-slate-900 font-sans mt-0.5">{unit.brand} {unit.model_number}</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 inline-block mt-1">
                {unit.category}
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 inline-block shadow-2xs">
              <QRCodeSVG value={targetUrl} size={150} level="H" />
            </div>

            <div className="text-xs space-y-0.5">
              <p className="font-bold text-slate-900">SN: {unit.serial_number}</p>
              <p className="text-[10px] text-slate-500">Scan QR code to open bench log & diagnostic history</p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 print:hidden">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Workshop Tag</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
