import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronRight, 
  Plus, 
  Sparkles,
  Layers,
  Trash2
} from 'lucide-react';

export default function InventoryGrid({ units, onSelectUnit, onDeleteUnit, onOpenIntake, search, setSearch }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const categories = ['All', 'Amplifier', 'Receiver', 'CD Player', 'Tape Deck', 'Turntable', 'Speakers'];
  const statuses = ['All', 'Triage', 'On Bench', 'Waiting Parts', 'Ready to Sell', 'Sold', 'Scrapped'];

  const filteredUnits = units.filter((unit) => {
    const matchesCategory = selectedCategory === 'All' || unit.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || unit.system_status === selectedStatus;
    const searchLower = search.toLowerCase();
    const matchesSearch = !search || 
      unit.brand.toLowerCase().includes(searchLower) ||
      unit.model_number.toLowerCase().includes(searchLower) ||
      unit.serial_number.toLowerCase().includes(searchLower);

    return matchesCategory && matchesStatus && matchesSearch;
  }).sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === 'cost') {
      valA = a.base_cost;
      valB = b.base_cost;
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Triage': return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'On Bench': return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
      case 'Waiting Parts': return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'Ready to Sell': return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
      case 'Sold': return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Scrapped': return 'bg-rose-100 text-rose-800 border-rose-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        
        {/* Category Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat 
                  ? 'bg-amber-500 text-white shadow-2xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status & Search Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
          >
            {statuses.map((st) => (
              <option key={st} value={st}>Status: {st}</option>
            ))}
          </select>

          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search make, model, SN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white"
            />
          </div>

          <button
            onClick={onOpenIntake}
            className="flex items-center space-x-1 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Unit</span>
          </button>
        </div>

      </div>

      {/* Table Container - Overflow Scroll */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-600 font-mono">
                <th className="py-3 px-4 font-bold">
                  <button onClick={() => handleSort('brand')} className="flex items-center space-x-1 hover:text-amber-700">
                    <span>Brand & Model</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 font-bold">Serial Number</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold">Condition</th>
                <th className="py-3 px-4 text-right font-bold">
                  <button onClick={() => handleSort('cost')} className="flex items-center space-x-1 hover:text-amber-700 justify-end w-full">
                    <span>Base Cost</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-right font-bold">Total Basis</th>
                <th className="py-3 px-4 text-center font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No hardware units matching search/filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUnits.map((u) => {
                  const fin = u.financial_summary || {};
                  return (
                    <tr 
                      key={u.unit_id}
                      onClick={() => onSelectUnit(u.unit_id)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors group"
                    >
                      {/* Brand & Model */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                          {u.brand} {u.model_number}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                          Src: {u.acquisition_source || 'Unknown'}
                        </div>
                      </td>

                      {/* Serial Number */}
                      <td className="py-3.5 px-4 font-mono text-slate-700 font-medium">
                        {u.serial_number}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-slate-700">
                        {u.category}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadgeClass(u.system_status)}`}>
                          {u.system_status}
                        </span>
                      </td>

                      {/* Cosmetic Condition */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {u.cosmetic_condition}
                      </td>

                      {/* Base Cost */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                        £{u.base_cost.toFixed(2)}
                      </td>

                      {/* Total Basis */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-700">
                        £{(fin.total_cost_basis || u.base_cost).toFixed(2)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Are you sure you want to delete ${u.brand} ${u.model_number} (SN: ${u.serial_number})?`)) {
                                onDeleteUnit(u.unit_id);
                              }
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Inventory Unit"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="p-1 rounded-md bg-slate-100 text-slate-500 group-hover:text-amber-700 group-hover:bg-amber-100 transition-colors inline-block">
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Showing {filteredUnits.length} of {units.length} total units</span>
          <span className="flex items-center space-x-1 text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Click any row to view workbench logs & profit details</span>
          </span>
        </div>
      </div>

    </div>
  );
}
