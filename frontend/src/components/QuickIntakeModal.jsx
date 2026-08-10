import React, { useState, useEffect } from 'react';
import { X, PlusCircle } from 'lucide-react';

export default function QuickIntakeModal({ preFill, onClose, onSubmit }) {
  const [brand, setBrand] = useState(preFill?.brand || '');
  const [modelNumber, setModelNumber] = useState(preFill?.model_number || '');
  const [serialNumber, setSerialNumber] = useState(`SN-${Math.floor(100000 + Math.random() * 900000)}`);
  const [category, setCategory] = useState(preFill?.category || 'Amplifier');
  const [acquisitionSource, setAcquisitionSource] = useState('eBay UK');
  const [baseCost, setBaseCost] = useState(preFill?.base_cost || '');
  const [cosmeticCondition, setCosmeticCondition] = useState('Good');
  const [initialSymptoms, setInitialSymptoms] = useState('');
  const [priority, setPriority] = useState(2);

  useEffect(() => {
    if (preFill) {
      if (preFill.brand) setBrand(preFill.brand);
      if (preFill.model_number) setModelNumber(preFill.model_number);
      if (preFill.category) setCategory(preFill.category);
      if (preFill.base_cost !== undefined) setBaseCost(preFill.base_cost);
    }
  }, [preFill]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!brand || !modelNumber || !serialNumber) return;

    onSubmit({
      brand,
      model_number: modelNumber,
      serial_number: serialNumber,
      category,
      acquisition_source: acquisitionSource,
      base_cost: parseFloat(baseCost) || 0.0,
      cosmetic_condition: cosmeticCondition,
      system_status: 'Triage',
      initial_symptoms: initialSymptoms,
      priority: parseInt(priority)
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl modal-shadow overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 border border-amber-300">
              <PlusCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-mono">INTAKE NEW HARDWARE</h2>
              <p className="text-xs text-slate-500">Log newly acquired vintage equipment for workbench triage.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Brand / Manufacturer *</label>
              <input
                type="text"
                required
                placeholder="e.g. Pioneer, NAD, Aiwa"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Model Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. PD-6030, CT-F500"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Serial Number *</label>
              <input
                type="text"
                required
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hardware Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              >
                <option value="CD Player">CD Player / Transport</option>
                <option value="Turntable">Turntable</option>
                <option value="Amplifier">Amplifier / Integrated</option>
                <option value="Tape Deck">Tape Deck / Cassette</option>
                <option value="Receiver">Receiver / Tuner</option>
                <option value="Speakers">Speakers</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Purchase Base Cost (£)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={baseCost}
                onChange={(e) => setBaseCost(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono font-bold text-amber-700 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Acquisition Source</label>
              <input
                type="text"
                placeholder="e.g. Car Boot, eBay, Estate Sale"
                value={acquisitionSource}
                onChange={(e) => setAcquisitionSource(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cosmetic State</label>
              <select
                value={cosmeticCondition}
                onChange={(e) => setCosmeticCondition(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              >
                <option value="Mint">Mint (Like New)</option>
                <option value="Good">Good (Minor Marks)</option>
                <option value="Fair">Fair (Scratch / Dent)</option>
                <option value="Poor">Poor (Major Damage)</option>
                <option value="For Parts">For Parts / Donor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Repair Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              >
                <option value={1}>1 - High Priority</option>
                <option value={2}>2 - Medium Priority</option>
                <option value={3}>3 - Low Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Initial Fault Symptoms</label>
            <textarea
              rows={2}
              placeholder="e.g. No power, drawer jammed, left channel dead..."
              value={initialSymptoms}
              onChange={(e) => setInitialSymptoms(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>Log Intake Record</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
