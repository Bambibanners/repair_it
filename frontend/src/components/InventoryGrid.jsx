import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Plus, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function InventoryGrid({ units, onSelectUnit, onOpenIntake, search, setSearch }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  const categories = ['All', 'Amplifier', 'CD Player', 'Tape Deck', 'Turntable', 'Receiver', 'Speakers'];
  const statuses = ['All', 'Triage', 'On Bench', 'Waiting Parts', 'Ready to Sell', 'Sold', 'Scrapped'];

  const filteredUnits = useMemo(() => {
    return units.filter((u) => {
      const matchCat = selectedCategory === 'All' || u.category === selectedCategory;
      const matchStat = selectedStatus === 'All' || u.system_status === selectedStatus;
      const matchSearch = !search || 
        u.brand.toLowerCase().includes(search.toLowerCase()) ||
        u.model_number.toLowerCase().includes(search.toLowerCase()) ||
        u.serial_number.toLowerCase().includes(search.toLowerCase());

      return matchCat && matchStat && matchSearch;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'cost') {
        valA = a.base_cost;
        valB = b.base_cost;
      }

      if (typeof valA === 'string') {
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      
      return sortDirection === 'asc' ? (valA - valB) : (valB - valA);
    });
  }, [units, selectedCategory, selectedStatus, search, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Triage':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'On Bench':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'Waiting Parts':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'Ready to Sell':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Sold':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Scrapped':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>FILTERS:</span>
          </div>

          {/* Category Selector */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>

          {/* Status Selector */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
            ))}
          </select>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center space-x-3">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search serial #, make, model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <button
            onClick={onOpenIntake}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Unit</span>
          </button>
        </div>

      </div>

      {/* Table Container */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                <th className="py-3 px-4">
                  <button onClick={() => handleSort('brand')} className="flex items-center space-x-1 hover:text-white">
                    <span>Brand & Model</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">Serial Number</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4 text-right">
                  <button onClick={() => handleSort('cost')} className="flex items-center space-x-1 hover:text-white justify-end w-full">
                    <span>Base Cost</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-right">Total Basis</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
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
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                    >
                      {/* Brand & Model */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                          {u.brand} {u.model_number}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                          Src: {u.acquisition_source || 'Unknown'}
                        </div>
                      </td>

                      {/* Serial Number */}
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {u.serial_number}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-slate-300">
                        {u.category}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadgeClass(u.system_status)}`}>
                          {u.system_status}
                        </span>
                      </td>

                      {/* Cosmetic Condition */}
                      <td className="py-3.5 px-4 text-slate-400">
                        {u.cosmetic_condition}
                      </td>

                      {/* Base Cost */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                        £{u.base_cost.toFixed(2)}
                      </td>

                      {/* Total Basis */}
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-amber-400">
                        £{(fin.total_cost_basis || u.base_cost).toFixed(2)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="p-1 rounded-md bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-amber-500/20 transition-colors inline-block">
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="bg-slate-950/90 px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Showing {filteredUnits.length} of {units.length} total units</span>
          <span className="flex items-center space-x-1 text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Click any row to view workbench logs & profit details</span>
          </span>
        </div>
      </div>

    </div>
  );
}
