import React from 'react';
import { 
  Wrench, 
  LayoutDashboard, 
  Table, 
  Kanban, 
  TrendingUp, 
  PlusCircle,
  Search,
  HardDrive,
  Cpu
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenIntake, onOpenAuth, search, setSearch }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory Grid', icon: Table },
    { id: 'kanban', label: 'Workbench Kanban', icon: Kanban },
    { id: 'master_parts', label: 'Parts & Compatibility', icon: Cpu },
    { id: 'sales', label: 'Sales & Financials', icon: TrendingUp },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between py-3 gap-3">
          
          {/* Logo / Branding */}
          <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shadow-sm">
              <Wrench className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-slate-900 font-mono">REPAIR-IT</span>
                <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold border border-amber-300">v1.0</span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Vintage Electronics Lifecycle Manager</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-full">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                    isActive 
                      ? 'bg-white text-amber-700 shadow-sm border border-slate-200' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions: Search & Quick Intake */}
          <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end mt-1 sm:mt-0">
            <div className="relative flex-1 sm:w-44 lg:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Make, Model, SN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
              />
            </div>

            <button
              onClick={onOpenAuth}
              title="Google Drive Security Settings"
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 transition-colors shrink-0"
            >
              <HardDrive className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">Google Drive</span>
            </button>

            <button
              onClick={onOpenIntake}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-colors shadow-sm active:scale-95 shrink-0"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>Intake Unit</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
