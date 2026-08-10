import React, { useState } from 'react';
import { X, PlusCircle, Wrench, HardDrive } from 'lucide-react';

export default function QuickIntakeModal({ onClose, onSubmit }) {
  const [brand, setBrand] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState(`SN-${Math.floor(100000 + Math.random() * 900000)}`);
  const [category, setCategory] = useState('Amplifier');
  const [acquisitionSource, setAcquisitionSource] = useState('eBay UK');
  const [baseCost, setBaseCost] = useState('');
  const [cosmeticCondition, setCosmeticCondition] = useState('Good');
  const [initialSymptoms, setInitialSymptoms] = useState('');
  const [priority, setPriority] = useState(2);

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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <PlusCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-mono">INTAKE NEW HARDWARE</h2>
              <p className="text-xs text-slate-400">Log newly acquired vintage equipment for workbench triage.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Brand / Manufacturer *</label>
              <input
                type="text"
                required
                placeholder="e.g. Pioneer, NAD, Aiwa"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Model Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. PD-6030, CT-F500"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Serial Number *</label>
              <input
                type="text"
                required
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Hardware Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
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
              <label className="block text-xs font-medium text-slate-400 mb-1">Purchase Base Cost (£)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={baseCost}
                onChange={(e) => setBaseCost(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Acquisition Source</label>
              <input
                type="text"
                placeholder="e.g. Car Boot, eBay, Estate Sale"
                value={acquisitionSource}
                onChange={(e) => setAcquisitionSource(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Cosmetic State</label>
              <select
                value={cosmeticCondition}
                onChange={(e) => setCosmeticCondition(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Mint">Mint (Like New)</option>
                <option value="Good">Good (Minor Marks)</option>
                <option value="Fair">Fair (Scratch / Dent)</option>
                <option value="Poor">Poor (Major Damage)</option>
                <option value="For Parts">For Parts / Donor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Repair Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value={1}>1 - High Priority</option>
                <option value={2}>2 - Medium Priority</option>
                <option value={3}>3 - Low Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Initial Fault Symptoms</label>
            <textarea
              rows={2}
              placeholder="e.g. No power, drawer jammed, left channel dead..."
              value={initialSymptoms}
              onChange={(e) => setInitialSymptoms(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow-md shadow-amber-500/20 transition-colors"
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
