import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  TrendingUp, 
  DollarSign, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  PlusCircle, 
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Wrench,
  ShieldCheck
} from 'lucide-react';
import { getMarketValuation } from '../api/client';

export default function MarketResearchModal({ isOpen, onClose, onConvertToIntake }) {
  const [brand, setBrand] = useState('Pioneer');
  const [modelNumber, setModelNumber] = useState('PD-6030');
  const [category, setCategory] = useState('CD Player');
  const [sellerPrice, setSellerPrice] = useState(25);

  const [valuationData, setValuationData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && brand && modelNumber) {
      fetchValuation();
    }
  }, [isOpen]);

  const fetchValuation = async () => {
    if (!brand || !modelNumber) return;
    try {
      setLoading(true);
      const data = await getMarketValuation(
        brand.trim(),
        modelNumber.trim(),
        category,
        parseFloat(sellerPrice) || 0
      );
      setValuationData(data);
    } catch (err) {
      console.error('Failed to get market valuation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchValuation();
  };

  if (!isOpen) return null;

  const flip = valuationData?.flip_analysis;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl modal-shadow overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/30">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900 font-mono">QUICK LOOK: UK eBAY MARKET VALUATION</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  Real UK Sold Averages
                </span>
              </div>
              <p className="text-xs text-slate-500">Research realistic UK eBay sold prices across standard eBay equipment conditions!</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 space-y-5 flex-1 overflow-y-auto">
          
          {/* Quick Lookup Form */}
          <form onSubmit={handleSearchSubmit} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Make / Brand</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pioneer, Marantz"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Model Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PD-6030, 2270"
                  value={modelNumber}
                  onChange={(e) => setModelNumber(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                >
                  <option value="CD Player">CD Player</option>
                  <option value="Amplifier">Amplifier</option>
                  <option value="Receiver">Receiver</option>
                  <option value="Tape Deck">Tape Deck</option>
                  <option value="Turntable">Turntable</option>
                  <option value="Speakers">Speakers</option>
                  <option value="General">General Audio</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Seller Asking Price (£)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 25"
                  value={sellerPrice}
                  onChange={(e) => setSellerPrice(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold text-amber-700 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-xs transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Calculate Realistic Valuation</span>
              </button>
            </div>
          </form>

          {/* Loading Indicator */}
          {loading && (
            <div className="py-12 text-center font-mono text-xs text-slate-500 space-y-2">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p>Fetching 12-Month UK eBay sold sales data...</p>
            </div>
          )}

          {/* Valuation Results */}
          {!loading && valuationData && (
            <div className="space-y-5">
              
              {/* Header Stats Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 text-white shadow-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold font-mono text-amber-400">{valuationData.brand} {valuationData.model_number}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {valuationData.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    12-Mo Sales Volume: <span className="text-slate-200 font-bold">{valuationData.twelve_month_trend.sample_volume} UK completed listings</span>
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-mono">12-Mo UK Market Trend</span>
                    <span className="text-sm font-bold font-mono text-emerald-400">
                      {valuationData.twelve_month_trend.label}
                    </span>
                  </div>

                  <a
                    href={`https://www.ebay.co.uk/sch/i.html?_nkw=${encodeURIComponent(valuationData.brand + ' ' + valuationData.model_number)}&LH_Complete=1&LH_Sold=1`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors shrink-0"
                  >
                    <span>Verify Live on eBay UK</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Condition Breakdown Matrix */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3 font-mono">UK eBay Sold Price Breakdown by Actual eBay Conditions</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  
                  {/* 1. For parts or not working */}
                  <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200 space-y-1.5">
                    <span className="text-[10px] font-bold text-rose-800 block uppercase tracking-wider">🛠️ {valuationData.condition_breakdown.parts_faulty.label}</span>
                    <div className="text-xl font-bold font-mono text-rose-900">
                      £{valuationData.condition_breakdown.parts_faulty.avg_price.toFixed(2)}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">{valuationData.condition_breakdown.parts_faulty.description}</p>
                  </div>

                  {/* 2. Used */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-700 block uppercase tracking-wider">📻 {valuationData.condition_breakdown.used_asis.label}</span>
                    <div className="text-xl font-bold font-mono text-slate-900">
                      £{valuationData.condition_breakdown.used_asis.avg_price.toFixed(2)}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">{valuationData.condition_breakdown.used_asis.description}</p>
                  </div>

                  {/* 3. Seller refurbished */}
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-900 block uppercase tracking-wider">✨ {valuationData.condition_breakdown.serviced_refurbished.label}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">WORKSHOP TARGET</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-amber-900">
                      £{valuationData.condition_breakdown.serviced_refurbished.avg_price.toFixed(2)}
                    </div>
                    <p className="text-[10px] text-amber-800/80 leading-tight">{valuationData.condition_breakdown.serviced_refurbished.description}</p>
                  </div>

                  {/* 4. Like New / New (other) */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-800 block uppercase tracking-wider">🏆 {valuationData.condition_breakdown.mint_boxed.label}</span>
                    <div className="text-xl font-bold font-mono text-emerald-900">
                      £{valuationData.condition_breakdown.mint_boxed.avg_price.toFixed(2)}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">{valuationData.condition_breakdown.mint_boxed.description}</p>
                  </div>

                </div>
              </div>

              {/* Pre-Purchase Flip Profitability Analysis */}
              {flip && (
                <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 shadow-sm ${
                  flip.color === 'emerald' ? 'bg-emerald-50/60 border-emerald-300' :
                  flip.color === 'amber' ? 'bg-amber-50/60 border-amber-300' : 'bg-rose-50/60 border-rose-300'
                }`}>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 font-mono">PRE-PURCHASE FLIP VIABILITY SCORE</span>
                      <div className="flex items-center space-x-2 mt-0.5">
                        {flip.color === 'emerald' && <Flame className="w-5 h-5 text-emerald-600" />}
                        {flip.color === 'amber' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                        {flip.color === 'rose' && <X className="w-5 h-5 text-rose-600" />}
                        <h3 className={`text-base font-extrabold font-mono ${
                          flip.color === 'emerald' ? 'text-emerald-900' :
                          flip.color === 'amber' ? 'text-amber-900' : 'text-rose-900'
                        }`}>
                          {flip.recommendation}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="text-right font-mono">
                        <span className="text-[10px] text-slate-500 block font-bold">MAX SUGGESTED BUY PRICE</span>
                        <span className="text-base font-extrabold text-slate-900">£{flip.max_suggested_buy_price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">SELLER ASKING</span>
                      <span className="font-bold text-slate-900">£{flip.seller_asking_price.toFixed(2)}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">EST. PARTS COST</span>
                      <span className="font-bold text-amber-700">£{flip.est_parts_cost.toFixed(2)}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">eBAY FEES + POST</span>
                      <span className="font-bold text-slate-700">£{(flip.est_ebay_fees + flip.est_shipping).toFixed(2)}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">SERVICED RESALE</span>
                      <span className="font-bold text-slate-900">£{flip.est_serviced_resale.toFixed(2)}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-emerald-300 sm:col-span-1 col-span-2">
                      <span className="text-[10px] text-emerald-800 block font-bold">EST. NET PROFIT</span>
                      <span className="text-base font-extrabold text-emerald-700">£{flip.est_net_profit.toFixed(2)} ({flip.roi_percentage}%)</span>
                    </div>
                  </div>

                  {/* 1-Click Intake Conversion */}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        onClose();
                        onConvertToIntake({
                          brand: valuationData.brand,
                          model_number: valuationData.model_number,
                          category: valuationData.category,
                          base_cost: flip.seller_asking_price
                        });
                      }}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors"
                    >
                      <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                      <span>Bought It? Log Unit to Workbench</span>
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
