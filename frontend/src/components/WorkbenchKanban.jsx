import React from 'react';
import { 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  PackageCheck,
  Tag,
  Plus
} from 'lucide-react';

export default function WorkbenchKanban({ units, onSelectUnit, onUpdateStatus, onOpenIntake }) {
  const columns = [
    {
      id: 'Triage',
      title: 'Triage (Just Arrived)',
      icon: AlertCircle,
      accent: 'border-amber-500/40 bg-amber-500/5 text-amber-400',
      badge: 'bg-amber-500/20 text-amber-300'
    },
    {
      id: 'Waiting Parts',
      title: 'Waiting on Parts',
      icon: Clock,
      accent: 'border-orange-500/40 bg-orange-500/5 text-orange-400',
      badge: 'bg-orange-500/20 text-orange-300'
    },
    {
      id: 'On Bench',
      title: 'On The Bench',
      icon: Wrench,
      accent: 'border-cyan-500/40 bg-cyan-500/5 text-cyan-400',
      badge: 'bg-cyan-500/20 text-cyan-300'
    },
    {
      id: 'Ready to Sell',
      title: 'Ready for Sale',
      icon: CheckCircle2,
      accent: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300'
    }
  ];

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 1:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">P1 - HIGH</span>;
      case 2:
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">P2 - MED</span>;
      case 3:
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">P3 - LOW</span>;
      default:
        return null;
    }
  };

  const getActionForColumn = (unit, colId) => {
    switch (colId) {
      case 'Triage':
        return (
          <button
            onClick={(e) => { e.stopPropagation(); onUpdateStatus(unit.unit_id, 'On Bench'); }}
            className="w-full flex items-center justify-center space-x-1 py-1.5 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold text-xs border border-cyan-500/30 transition-colors"
          >
            <span>Move to Bench</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        );
      case 'Waiting Parts':
        return (
          <button
            onClick={(e) => { e.stopPropagation(); onUpdateStatus(unit.unit_id, 'On Bench'); }}
            className="w-full flex items-center justify-center space-x-1 py-1.5 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-xs border border-emerald-500/30 transition-colors"
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Mark Parts Received ➔ Bench</span>
          </button>
        );
      case 'On Bench':
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => { e.stopPropagation(); onUpdateStatus(unit.unit_id, 'Waiting Parts'); }}
              className="flex-1 py-1.5 px-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 font-medium text-[11px] border border-orange-500/30 transition-colors"
            >
              Order Parts
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onUpdateStatus(unit.unit_id, 'Ready to Sell'); }}
              className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-[11px] border border-emerald-500/30 transition-colors"
            >
              Ready to Sell ➔
            </button>
          </div>
        );
      case 'Ready to Sell':
        return (
          <button
            onClick={(e) => { e.stopPropagation(); onSelectUnit(unit.unit_id); }}
            className="w-full flex items-center justify-center space-x-1 py-1.5 px-3 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-semibold text-xs border border-purple-500/30 transition-colors"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Create / Record Listing</span>
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white font-mono">WORKBENCH KANBAN BOARD</h2>
          <p className="text-xs text-slate-400">Visual workflow stages for diagnostic triage, parts procurement, and bench repair.</p>
        </div>
        <button
          onClick={onOpenIntake}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Log Purchase</span>
        </button>
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const Icon = col.icon;
          const colUnits = units.filter((u) => u.system_status === col.id);

          return (
            <div 
              key={col.id}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className={`flex items-center justify-between pb-3 border-b border-slate-800 mb-3 ${col.accent}`}>
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4" />
                  <h3 className="font-bold text-sm text-white font-mono">{col.title}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono ${col.badge}`}>
                  {colUnits.length}
                </span>
              </div>

              {/* Column Unit Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colUnits.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-xs text-slate-600 border border-dashed border-slate-800 rounded-xl">
                    No units in stage
                  </div>
                ) : (
                  colUnits.map((unit) => {
                    const log = unit.repair_log || {};
                    const parts = unit.part_orders || [];
                    const pendingParts = parts.filter((p) => p.order_status !== 'Installed');

                    return (
                      <div
                        key={unit.unit_id}
                        onClick={() => onSelectUnit(unit.unit_id)}
                        className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl p-4 transition-all hover:shadow-lg hover:shadow-black/50 cursor-pointer space-y-3 group"
                      >
                        {/* Top Line: Brand/Model + Priority */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                              {unit.brand} {unit.model_number}
                            </h4>
                            <span className="text-[11px] text-slate-400 font-mono">{unit.category} • {unit.serial_number}</span>
                          </div>
                          {getPriorityBadge(log.priority)}
                        </div>

                        {/* Diagnostic Symptoms / Notes */}
                        {log.initial_symptoms && (
                          <div className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 line-clamp-2">
                            <span className="text-amber-400 font-semibold">Symptoms: </span>
                            {log.initial_symptoms}
                          </div>
                        )}

                        {/* Part Order Blocker alert if waiting on parts */}
                        {col.id === 'Waiting Parts' && pendingParts.length > 0 && (
                          <div className="text-[11px] text-orange-300 bg-orange-500/10 p-2 rounded-lg border border-orange-500/20">
                            <span className="font-semibold">Blocker: </span>
                            {pendingParts[0].description} ({pendingParts[0].supplier || 'Ordered'})
                          </div>
                        )}

                        {/* Bottom Actions */}
                        <div className="pt-1 border-t border-slate-800/60">
                          {getActionForColumn(unit, col.id)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
