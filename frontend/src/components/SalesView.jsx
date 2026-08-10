import React from 'react';
import { TrendingUp, ExternalLink, Tag, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SalesView({ units, onSelectUnit }) {
  const readyUnits = units.filter((u) => u.system_status === 'Ready to Sell');
  const soldUnits = units.filter((u) => u.system_status === 'Sold');

  const totalRevenue = soldUnits.reduce((acc, u) => acc + (u.financial_summary?.total_revenue || 0), 0);
  const totalNetProfit = soldUnits.reduce((acc, u) => acc + (u.financial_summary?.net_profit || 0), 0);
  const totalCostBasisSold = soldUnits.reduce((acc, u) => acc + (u.financial_summary?.total_cost_basis || 0), 0);
  const overallMarginPercent = totalRevenue > 0 ? ((totalNetProfit / totalRevenue) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white font-mono flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>SALES & FINANCIAL ROLL-UPS</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Track multi-channel listings, platform fee roll-ups, and net profit performance.</p>
        </div>
      </div>

      {/* Summary Financial Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <span className="text-xs text-slate-400 block font-mono">TOTAL REVENUE (SOLD)</span>
          <span className="text-xl font-bold font-mono text-white mt-1 block">£{totalRevenue.toFixed(2)}</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <span className="text-xs text-slate-400 block font-mono">TOTAL COST BASIS</span>
          <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">£{totalCostBasisSold.toFixed(2)}</span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-sm">
          <span className="text-xs text-emerald-400 block font-mono">CUMULATIVE NET PROFIT</span>
          <span className="text-xl font-bold font-mono text-emerald-300 mt-1 block">£{totalNetProfit.toFixed(2)}</span>
        </div>

        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-sm">
          <span className="text-xs text-cyan-400 block font-mono">NET PROFIT MARGIN</span>
          <span className="text-xl font-bold font-mono text-cyan-300 mt-1 block">{overallMarginPercent.toFixed(1)}%</span>
        </div>
      </div>

      {/* Table of Units & Exits */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white font-mono">Equipment Sales & Profit Ledger</h3>
          <span className="text-xs text-slate-400">Click any row to open listing modal</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Exit Platform</th>
                <th className="py-3 px-4 text-right">Base Cost</th>
                <th className="py-3 px-4 text-right">Parts Cost</th>
                <th className="py-3 px-4 text-right">Cost Basis</th>
                <th className="py-3 px-4 text-right">Sale Price</th>
                <th className="py-3 px-4 text-right">Fees & Ship</th>
                <th className="py-3 px-4 text-right">Net Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {units.map((u) => {
                const fin = u.financial_summary || {};
                const listing = u.sales_listings?.[0] || {};
                const isSold = u.system_status === 'Sold';
                const isReady = u.system_status === 'Ready to Sell';

                return (
                  <tr 
                    key={u.unit_id}
                    onClick={() => onSelectUnit(u.unit_id)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-sans font-semibold text-white">
                      {u.brand} {u.model_number}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isSold 
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                          : isReady 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                      }`}>
                        {u.system_status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-sans text-slate-300">
                      {listing.platform || (isReady ? 'Listing Pending' : 'N/A')}
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-400">
                      £{u.base_cost.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-right text-amber-400">
                      £{(fin.parts_cost || 0).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-right text-amber-300 font-bold">
                      £{(fin.total_cost_basis || u.base_cost).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-200">
                      {isSold 
                        ? `£${(fin.final_sale_price || 0).toFixed(2)}`
                        : listing.target_price ? `£${listing.target_price.toFixed(2)} (Target)` : '-'}
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-400">
                      £{((fin.platform_fees || 0) + (fin.shipping_costs || 0)).toFixed(2)}
                    </td>

                    <td className={`py-3.5 px-4 text-right font-bold ${
                      isSold 
                        ? fin.net_profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        : 'text-slate-500'
                    }`}>
                      {isSold ? `£${fin.net_profit.toFixed(2)}` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
