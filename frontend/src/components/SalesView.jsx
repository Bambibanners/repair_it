import React from 'react';
import { TrendingUp } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-mono flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>SALES & FINANCIAL ROLL-UPS</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Track multi-channel listings, platform fee roll-ups, and net profit performance.</p>
        </div>
      </div>

      {/* Summary Financial Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 block font-mono">TOTAL REVENUE (SOLD)</span>
          <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">£{totalRevenue.toFixed(2)}</span>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 shadow-sm">
          <span className="text-[11px] font-bold text-amber-800 block font-mono">TOTAL COST BASIS</span>
          <span className="text-xl font-bold font-mono text-amber-900 mt-1 block">£{totalCostBasisSold.toFixed(2)}</span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-800 block font-mono">CUMULATIVE NET PROFIT</span>
          <span className="text-xl font-bold font-mono text-emerald-700 mt-1 block">£{totalNetProfit.toFixed(2)}</span>
        </div>

        <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-200 shadow-sm">
          <span className="text-[11px] font-bold text-cyan-800 block font-mono">NET PROFIT MARGIN</span>
          <span className="text-xl font-bold font-mono text-cyan-800 mt-1 block">{overallMarginPercent.toFixed(1)}%</span>
        </div>
      </div>

      {/* Table of Units & Exits */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-900 font-mono">Equipment Sales & Profit Ledger</h3>
          <span className="text-xs text-slate-500">Click any row to open listing details</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-600 font-mono">
                <th className="py-3 px-4 font-bold">Item</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold">Exit Platform</th>
                <th className="py-3 px-4 text-right font-bold">Base Cost</th>
                <th className="py-3 px-4 text-right font-bold">Parts Cost</th>
                <th className="py-3 px-4 text-right font-bold">Cost Basis</th>
                <th className="py-3 px-4 text-right font-bold">Sale Price</th>
                <th className="py-3 px-4 text-right font-bold">Fees & Ship</th>
                <th className="py-3 px-4 text-right font-bold">Net Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-mono">
              {units.map((u) => {
                const fin = u.financial_summary || {};
                const listing = u.sales_listings?.[0] || {};
                const isSold = u.system_status === 'Sold';
                const isReady = u.system_status === 'Ready to Sell';

                return (
                  <tr 
                    key={u.unit_id}
                    onClick={() => onSelectUnit(u.unit_id)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-sans font-bold text-slate-900">
                      {u.brand} {u.model_number}
                    </td>

                    <td className="py-3.5 px-4 font-sans">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        isSold 
                          ? 'bg-purple-100 text-purple-800 border-purple-300' 
                          : isReady 
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        {u.system_status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-sans text-slate-700">
                      {listing.platform || (isReady ? 'Listing Pending' : 'N/A')}
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-600">
                      £{u.base_cost.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-right text-amber-700 font-bold">
                      £{(fin.parts_cost || 0).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-right text-amber-900 font-bold">
                      £{(fin.total_cost_basis || u.base_cost).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-800 font-bold">
                      {isSold 
                        ? `£${(fin.final_sale_price || 0).toFixed(2)}`
                        : listing.target_price ? `£${listing.target_price.toFixed(2)} (Target)` : '-'}
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-600">
                      £{((fin.platform_fees || 0) + (fin.shipping_costs || 0)).toFixed(2)}
                    </td>

                    <td className={`py-3.5 px-4 text-right font-bold ${
                      isSold 
                        ? fin.net_profit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                        : 'text-slate-400'
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
