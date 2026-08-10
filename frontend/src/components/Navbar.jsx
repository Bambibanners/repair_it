import React from 'react';
import { 
  Wrench, 
  LayoutDashboard, 
  Table, 
  Kanban, 
  TrendingUp, 
  PlusCircle,
  Search,
  SlidersHorizontal
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenIntake, search, setSearch }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory Grid', icon: Table },
    { id: 'kanban', label: 'Workbench Kanban', icon: Kanban },
    { id: 'sales', label: 'Sales & Financials', icon: TrendingUp },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo / Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm shadow-amber-500/20">
              <Wrench className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white font-mono">REPAIR-IT</span>
                <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30">v1.0</span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Vintage Electronics Lifecycle Manager</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive 
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions: Search & Quick Intake */}
          <div className="flex items-center space-x-3">
            <div className="relative hidden sm:block w-48 lg:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Make, Model, SN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors"
              />
            </div>

            <button
              onClick={onOpenIntake}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors shadow-md shadow-amber-500/20 active:scale-95"
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
