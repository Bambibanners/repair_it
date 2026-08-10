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
      accent: 'border-amber-300 bg-amber-50/60 text-amber-800',
      badge: 'bg-amber-100 text-amber-800 border border-amber-300'
    },
    {
      id: 'Waiting Parts',
      title: 'Waiting on Parts',
      icon: Clock,
      accent: 'border-orange-300 bg-orange-50/60 text-orange-800',
      badge: 'bg-orange-100 text-orange-800 border border-orange-300'
    },
    {
      id: 'On Bench',
      title: 'On The Bench',
      icon: Wrench,
      accent: 'border-cyan-300 bg-cyan-50/60 text-cyan-800',
      badge: 'bg-cyan-100 text-cyan-800 border border-cyan-300'
    },
    {
      id: 'Ready to Sell',
      title: 'Ready for Sale',
      icon: CheckCircle2,
      accent: 'border-emerald-300 bg-emerald-50/60 text-emerald-800',
      badge: 'bg-emerald-100 text-emerald-800 border border-emerald-300'
    }
  ];

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 1:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 shrink-0">P1 - HIGH</span>;
      case 2:
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300 shrink-0">P2 - MED</span>;
      case 3:
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-300 shrink-0">P3 - LOW</span>;
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
            className="w-full flex items-center justify-center space-x-1 py-1.5 px-3 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold text-xs border border-cyan-300 transition-colors"
          >
            <span>Move to Bench</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        );
      case 'Waiting Parts':
        return (
          <button
            onClick={(e) => { e.stopPropagation(); onUpdateStatus(unit.unit_id, 'On Bench'); }}
            className="w-full flex items-center justify-center space-x-1 py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 transition-colors"
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
              className="flex-1 py-1.5 px-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 font-semibold text-[11px] border border-orange-300 transition-colors"
            >
              Order Parts
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onUpdateStatus(unit.unit_id, 'Ready to Sell'); }}
              className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-300 transition-colors"
            >
              Ready to Sell ➔
            </button>
          </div>
        );
      case 'Ready to Sell':
        return (
          <button
            onClick={(e) => { e.stopPropagation(); onSelectUnit(unit.unit_id); }}
            className="w-full flex items-center justify-center space-x-1 py-1.5 px-3 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs border border-purple-300 transition-colors"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Record / Create Listing</span>
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-mono">WORKBENCH KANBAN BOARD</h2>
          <p className="text-xs text-slate-500">Visual workflow stages for diagnostic triage, parts procurement, and bench repair.</p>
        </div>
        <button
          onClick={onOpenIntake}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-colors shadow-sm shrink-0 self-start sm:self-center"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Log Purchase</span>
        </button>
      </div>

      {/* Kanban Columns Grid - Responsive grid layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const Icon = col.icon;
          const colUnits = units.filter((u) => u.system_status === col.id);

          return (
            <div 
              key={col.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col min-h-[450px] shadow-sm"
            >
              {/* Column Header */}
              <div className={`flex items-center justify-between pb-3 border-b border-slate-200 mb-3 ${col.accent} p-2 rounded-xl`}>
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4" />
                  <h3 className="font-bold text-xs font-mono">{col.title}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono ${col.badge}`}>
                  {colUnits.length}
                </span>
              </div>

              {/* Column Unit Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colUnits.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
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
                        className="bg-slate-50 border border-slate-200 hover:border-amber-400 hover:bg-white rounded-xl p-3.5 transition-all shadow-sm hover:shadow-md cursor-pointer space-y-2.5 group"
                      >
                        {/* Top Line: Brand/Model + Priority */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-xs text-slate-900 group-hover:text-amber-700 transition-colors">
                              {unit.brand} {unit.model_number}
                            </h4>
                            <span className="text-[10px] text-slate-500 font-mono">{unit.category} • {unit.serial_number}</span>
                          </div>
                          {getPriorityBadge(log.priority)}
                        </div>

                        {/* Diagnostic Symptoms / Notes */}
                        {log.initial_symptoms && (
                          <div className="text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200 line-clamp-2">
                            <span className="text-amber-700 font-bold">Symptoms: </span>
                            {log.initial_symptoms}
                          </div>
                        )}

                        {/* Part Order Blocker alert if waiting on parts */}
                        {col.id === 'Waiting Parts' && pendingParts.length > 0 && (
                          <div className="text-[10px] text-orange-800 bg-orange-100 p-2 rounded-lg border border-orange-300">
                            <span className="font-bold">Blocker: </span>
                            {pendingParts[0].description} ({pendingParts[0].supplier || 'Ordered'})
                          </div>
                        )}

                        {/* Bottom Actions */}
                        <div className="pt-1 border-t border-slate-200">
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
