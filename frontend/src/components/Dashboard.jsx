import React from 'react';
import { 
  Box, 
  Wrench, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle, 
  ArrowRight,
  PackageCheck,
  Tag,
  Plus
} from 'lucide-react';

export default function Dashboard({ stats, onSelectUnit, onOpenIntake, setActiveTab, onUpdateStatus }) {
  if (!stats) return <div className="p-8 text-slate-400">Loading workbench metrics...</div>;

  const kpis = [
    { label: 'Units in Stock', value: stats.total_units_stock, icon: Box, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'On The Bench', value: stats.units_on_bench, icon: Wrench, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { label: 'Waiting on Parts', value: stats.units_waiting_parts, icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    { label: 'Ready to Sell', value: stats.units_ready_to_sell, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { 
      label: '30-Day Net Profit', 
      value: `£${stats.thirty_day_profit.toFixed(2)}`, 
      icon: TrendingUp, 
      color: stats.thirty_day_profit >= 0 ? 'text-emerald-400' : 'text-rose-400', 
      bg: 'bg-emerald-500/10 border-emerald-500/20' 
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 p-6 rounded-2xl border border-slate-800 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-mono">WORKSHOP COMMAND CENTER</h1>
          <p className="text-sm text-slate-400 mt-1">Live status snapshot of vintage audio equipment inventory & workbench triage.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenIntake}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Log New Purchase</span>
          </button>
          <button
            onClick={() => setActiveTab('kanban')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-colors"
          >
            <Wrench className="w-4 h-4 text-cyan-400" />
            <span>Open Workbench Kanban</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={idx}
              className={`p-4 rounded-xl border ${kpi.bg} backdrop-blur-sm flex flex-col justify-between transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{kpi.label}</span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div className={`text-2xl font-bold font-mono ${kpi.color} mt-2`}>
                {kpi.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Action Required & Quick Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Action Required Panel */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white font-mono">Action Required</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {stats.action_required_items.length} Pending
            </span>
          </div>

          {stats.action_required_items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
              <p className="text-sm font-medium text-slate-300">All workbench actions caught up!</p>
              <p className="text-xs text-slate-500 mt-1">No parts awaiting bench installation or pending sales dispatch.</p>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-80 pr-1">
              {stats.action_required_items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 mt-0.5">
                      {item.type === 'part_arrived' && <PackageCheck className="w-4 h-4 text-emerald-400" />}
                      {item.type === 'unit_sold' && <Tag className="w-4 h-4 text-cyan-400" />}
                      {item.type === 'high_priority_triage' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">{item.title}</span>
                      </div>
                      <p className="text-sm font-medium text-white mt-0.5">{item.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    {item.target_status && (
                      <button
                        onClick={() => onUpdateStatus(item.unit_id, item.target_status)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/40 transition-colors"
                      >
                        {item.action_text}
                      </button>
                    )}
                    <button
                      onClick={() => onSelectUnit(item.unit_id)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links & Workflow Shortcuts */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white font-mono mb-4">Workbench Shortcuts</h2>
            
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab('kanban')}
                className="w-full text-left p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">Workbench Kanban Board</div>
                  <div className="text-xs text-slate-400">View diagnostic stages & bench priorities</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className="w-full text-left p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">Inventory Data Table</div>
                  <div className="text-xs text-slate-400">Filter, sort, and manage full serial numbers</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </button>

              <button
                onClick={() => setActiveTab('sales')}
                className="w-full text-left p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">Sales & True Profit Calculator</div>
                  <div className="text-xs text-slate-400">Review multi-channel exits & platform fees</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-500 flex items-center justify-between">
            <span>Repair-It System v1.0</span>
            <span className="text-emerald-400 font-medium">● Local API Connected</span>
          </div>
        </div>

      </div>

    </div>
  );
}
