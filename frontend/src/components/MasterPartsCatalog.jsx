import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Search, 
  Plus, 
  Package, 
  Layers, 
  AlertCircle, 
  Tag, 
  Link as LinkIcon, 
  X, 
  Save, 
  Building2 
} from 'lucide-react';
import { getMasterParts, createMasterPart, addPartCompatibility } from '../api/client';

export default function MasterPartsCatalog() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // New Part Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [partNumber, setPartNumber] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Belt');
  const [supplier, setSupplier] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [stockQty, setStockQty] = useState(1);
  const [notes, setNotes] = useState('');

  // Add Compatibility Modal State
  const [selectedPartId, setSelectedPartId] = useState(null);
  const [compBrand, setCompBrand] = useState('');
  const [compModel, setCompModel] = useState('');
  const [compNotes, setCompNotes] = useState('');

  useEffect(() => {
    loadParts();
  }, [search, selectedCategory]);

  const loadParts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      const data = await getMasterParts(params);
      setParts(data);
    } catch (err) {
      console.error('Failed to load master parts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePart = async (e) => {
    e.preventDefault();
    if (!partNumber || !name) return;

    try {
      await createMasterPart({
        part_number: partNumber.trim(),
        name: name.trim(),
        category,
        supplier: supplier.trim(),
        unit_cost: parseFloat(unitCost) || 0,
        stock_qty: parseInt(stockQty) || 0,
        notes: notes.trim()
      });
      setIsAddOpen(false);
      setPartNumber('');
      setName('');
      setSupplier('');
      setUnitCost('');
      setStockQty(1);
      setNotes('');
      loadParts();
    } catch (err) {
      alert('Failed to create part: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleAddCompatibility = async (e) => {
    e.preventDefault();
    if (!selectedPartId || !compBrand || !compModel) return;

    try {
      await addPartCompatibility(selectedPartId, {
        brand: compBrand.trim(),
        model_number: compModel.trim(),
        notes: compNotes.trim()
      });
      setSelectedPartId(null);
      setCompBrand('');
      setCompModel('');
      setCompNotes('');
      loadParts();
    } catch (err) {
      alert('Failed to link compatibility: ' + (err.response?.data?.detail || err.message));
    }
  };

  const categories = ['All', 'Belt', 'Laser Pickup', 'Capacitor', 'IC Module', 'Transistor', 'Mechanical', 'General'];

  const totalPartsCount = parts.length;
  const totalStockQty = parts.reduce((acc, p) => acc + (p.stock_qty || 0), 0);
  const totalCompatibilities = parts.reduce((acc, p) => acc + (p.compatibilities?.length || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-mono flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-amber-600" />
            <span>CENTRAL PARTS & CROSS-REFERENCE CATALOG</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Master inventory of component parts, supplier costs, and make & model compatibility matrix.</p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Master Part</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 font-mono">CATALOGED PART TYPES</span>
            <Package className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">{totalPartsCount}</span>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 font-mono">TOTAL BENCH STOCK QTY</span>
            <Layers className="w-4 h-4 text-amber-700" />
          </div>
          <span className="text-xl font-bold font-mono text-amber-900 mt-1 block">{totalStockQty} units</span>
        </div>

        <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-cyan-800 font-mono">EQUIPMENT CROSS-REFERENCES</span>
            <LinkIcon className="w-4 h-4 text-cyan-700" />
          </div>
          <span className="text-xl font-bold font-mono text-cyan-900 mt-1 block">{totalCompatibilities} Model Links</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Part #, Description, Supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Parts Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-600 font-mono">
                <th className="py-3 px-4 font-bold">Part Number</th>
                <th className="py-3 px-4 font-bold">Description</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold">Supplier</th>
                <th className="py-3 px-4 text-right font-bold">Unit Cost</th>
                <th className="py-3 px-4 text-center font-bold">In Stock</th>
                <th className="py-3 px-4 font-bold">Cross-Reference Compatibility</th>
                <th className="py-3 px-4 text-center font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-mono">Loading master parts catalog...</td>
                </tr>
              ) : parts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">No parts found matching your query.</td>
                </tr>
              ) : (
                parts.map((p) => (
                  <tr key={p.master_part_id} className="hover:bg-slate-50 transition-colors">
                    
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-800">
                      {p.part_number}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {p.name}
                      {p.notes && <p className="text-[11px] text-slate-500 font-normal mt-0.5">{p.notes}</p>}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {p.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {p.supplier || '-'}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                      £{(p.unit_cost || 0).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                        p.stock_qty > 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {p.stock_qty}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {p.compatibilities && p.compatibilities.length > 0 ? (
                          p.compatibilities.map((c) => (
                            <span key={c.compatibility_id} className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                              {c.brand} {c.model_number}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No model links</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedPartId(p.master_part_id)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-700 font-semibold text-[11px] border border-slate-300 transition-colors"
                      >
                        + Link Model
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Create Master Part */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-5 modal-shadow space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-sm text-slate-900 font-mono">ADD NEW MASTER PART</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePart} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Part Number / SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KSS-210A or BELT-42"
                    value={partNumber}
                    onChange={(e) => setPartNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Part Name / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony Optical Laser Pickup Assembly"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Supplier</label>
                  <input
                    type="text"
                    placeholder="Mouser, eBay..."
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit Cost (£)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="18.50"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">In Stock Qty</label>
                  <input
                    type="number"
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="Additional specs or replacement notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Master Part</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Compatibility Link */}
      {selectedPartId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-5 modal-shadow space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-sm text-slate-900 font-mono">LINK COMPATIBLE MODEL</h3>
              <button onClick={() => setSelectedPartId(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCompatibility} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Brand / Make *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pioneer, Sony, Technics"
                  value={compBrand}
                  onChange={(e) => setCompBrand(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Model Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PD-6030 or CDP-227ESD"
                  value={compModel}
                  onChange={(e) => setCompModel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Compatibility Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Requires 2.0mm pulley adjustment"
                  value={compNotes}
                  onChange={(e) => setCompNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Link Compatibility</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
