import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wrench, 
  Package, 
  TrendingUp, 
  HardDrive, 
  Plus, 
  Save, 
  ExternalLink,
  Trash2,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

export default function UnitDetailModal({ 
  unit, 
  onClose, 
  onUpdateUnit, 
  onUpdateRepairLog, 
  onAddPart, 
  onUpdatePartStatus,
  onDeletePart,
  onCreateSalesListing,
  onUpdateSalesListing 
}) {
  const [activeTab, setActiveTab] = useState('hardware');

  // Form states for Hardware
  const [status, setStatus] = useState(unit?.system_status || 'Triage');
  const [baseCost, setBaseCost] = useState(unit?.base_cost || 0);
  const [cosmeticCondition, setCosmeticCondition] = useState(unit?.cosmetic_condition || 'Good');

  // Form states for Repair Log
  const [priority, setPriority] = useState(unit?.repair_log?.priority || 2);
  const [symptoms, setSymptoms] = useState(unit?.repair_log?.initial_symptoms || '');
  const [actionPlan, setActionPlan] = useState(unit?.repair_log?.action_plan || '');
  const [benchNotes, setBenchNotes] = useState(unit?.repair_log?.bench_notes || '');

  // Form states for New Part
  const [newPartDesc, setNewPartDesc] = useState('');
  const [newPartSupplier, setNewPartSupplier] = useState('');
  const [newPartCost, setNewPartCost] = useState(0);
  const [newPartStatus, setNewPartStatus] = useState('To Order');

  // Form states for Sales Listing
  const [salesPlatform, setSalesPlatform] = useState('eBay');
  const [targetPrice, setTargetPrice] = useState('');
  const [finalSalePrice, setFinalSalePrice] = useState('');
  const [platformFees, setPlatformFees] = useState('');
  const [shippingCosts, setShippingCosts] = useState('');
  const [listingUrl, setListingUrl] = useState('');

  useEffect(() => {
    if (unit) {
      setStatus(unit.system_status);
      setBaseCost(unit.base_cost);
      setCosmeticCondition(unit.cosmetic_condition);
      
      if (unit.repair_log) {
        setPriority(unit.repair_log.priority);
        setSymptoms(unit.repair_log.initial_symptoms || '');
        setActionPlan(unit.repair_log.action_plan || '');
        setBenchNotes(unit.repair_log.bench_notes || '');
      }

      const listing = unit.sales_listings?.[0];
      if (listing) {
        setSalesPlatform(listing.platform);
        setTargetPrice(listing.target_price || '');
        setFinalSalePrice(listing.final_sale_price || '');
        setPlatformFees(listing.platform_fees || 0);
        setShippingCosts(listing.shipping_costs || 0);
        setListingUrl(listing.listing_url || '');
      }
    }
  }, [unit]);

  if (!unit) return null;

  const parts = unit.part_orders || [];
  const partsTotal = parts.reduce((acc, p) => acc + (p.cost || 0), 0);
  const totalCostBasis = (parseFloat(baseCost) || 0) + partsTotal;

  const fin = unit.financial_summary || {};
  const currentSalePrice = parseFloat(finalSalePrice) || 0;
  const currentFees = parseFloat(platformFees) || 0;
  const currentShipping = parseFloat(shippingCosts) || 0;
  const computedNetProfit = currentSalePrice > 0 
    ? (currentSalePrice - (totalCostBasis + currentFees + currentShipping))
    : 0;

  const handleSaveHardware = () => {
    onUpdateUnit(unit.unit_id, {
      system_status: status,
      base_cost: parseFloat(baseCost),
      cosmetic_condition: cosmeticCondition
    });
  };

  const handleSaveRepairLog = () => {
    onUpdateRepairLog(unit.unit_id, {
      priority: parseInt(priority),
      initial_symptoms: symptoms,
      action_plan: actionPlan,
      bench_notes: benchNotes
    });
  };

  const handleCreatePart = (e) => {
    e.preventDefault();
    if (!newPartDesc) return;
    onAddPart(unit.unit_id, {
      description: newPartDesc,
      supplier: newPartSupplier,
      cost: parseFloat(newPartCost) || 0,
      order_status: newPartStatus
    });
    setNewPartDesc('');
    setNewPartSupplier('');
    setNewPartCost(0);
  };

  const handleSaveSales = () => {
    const listingData = {
      platform: salesPlatform,
      target_price: parseFloat(targetPrice) || null,
      final_sale_price: parseFloat(finalSalePrice) || null,
      platform_fees: parseFloat(platformFees) || 0,
      shipping_costs: parseFloat(shippingCosts) || 0,
      listing_url: listingUrl,
      is_active: !finalSalePrice
    };

    if (unit.sales_listings && unit.sales_listings.length > 0) {
      onUpdateSalesListing(unit.sales_listings[0].listing_id, listingData);
    } else {
      onCreateSalesListing(unit.unit_id, listingData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-white font-mono">{unit.brand} {unit.model_number}</h2>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {unit.category}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Serial #: <span className="text-slate-200">{unit.serial_number}</span> • Acquisition: <span className="text-slate-200">{unit.acquisition_source || 'N/A'}</span>
            </p>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 gap-2 pt-2">
          {[
            { id: 'hardware', label: 'Hardware Details', icon: HardDrive },
            { id: 'repair', label: 'Repair Log & Workbench', icon: Wrench },
            { id: 'parts', label: `Parts Consumed (${parts.length})`, icon: Package },
            { id: 'financials', label: 'Financials & Exit', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                  isActive 
                    ? 'border-amber-400 text-amber-400 bg-amber-500/10 rounded-t-lg' 
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="p-6 flex-1 overflow-y-auto">
          
          {/* TAB 1: Hardware Details */}
          {activeTab === 'hardware' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">System Workflow Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Triage">Triage (Just Arrived)</option>
                    <option value="On Bench">On Bench</option>
                    <option value="Waiting Parts">Waiting Parts</option>
                    <option value="Ready to Sell">Ready to Sell</option>
                    <option value="Sold">Sold</option>
                    <option value="Scrapped">Scrapped</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Cosmetic Condition</label>
                  <select
                    value={cosmeticCondition}
                    onChange={(e) => setCosmeticCondition(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Mint">Mint (Collector Grade)</option>
                    <option value="Good">Good (Minor Wear)</option>
                    <option value="Fair">Fair (Noticeable Scratches)</option>
                    <option value="Poor">Poor (Heavily Damaged)</option>
                    <option value="For Parts">For Parts / Donor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Base Purchase Cost (£)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={baseCost}
                    onChange={(e) => setBaseCost(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm font-mono text-amber-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Acquisition Source</label>
                  <input
                    type="text"
                    disabled
                    value={unit.acquisition_source || 'Unspecified'}
                    className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl p-2.5 text-sm text-slate-400 cursor-not-allowed"
                  />
                </div>

              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={handleSaveHardware}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow-md transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Hardware Details</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Repair Log & Workbench */}
          {activeTab === 'repair' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Workbench Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value={1}>1 - High Priority (Immediate Repair)</option>
                    <option value={2}>2 - Medium Priority (Standard Workload)</option>
                    <option value={3}>3 - Low Priority (Backlog / Spare Time)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Initial Symptoms & Fault Diagnostic</label>
                  <textarea
                    rows={3}
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Describe symptoms (e.g. motor spins but laser dead, channel B crackle)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Required Action Plan</label>
                  <textarea
                    rows={2}
                    value={actionPlan}
                    onChange={(e) => setActionPlan(e.target.value)}
                    placeholder="Steps planned (e.g. replace capstan belt, flush pots with DeoxIT)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Bench Notes (Running Work Log)</label>
                  <textarea
                    rows={4}
                    value={benchNotes}
                    onChange={(e) => setBenchNotes(e.target.value)}
                    placeholder="Running log of measurements, solder work, test results..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-amber-500"
                  />
                </div>

              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={handleSaveRepairLog}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow-md transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Workbench Notes</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Parts Consumed */}
          {activeTab === 'parts' && (
            <div className="space-y-6">
              
              {/* Existing Parts Table */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 uppercase text-slate-400 font-mono text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Supplier</th>
                      <th className="py-2.5 px-3">Cost (£)</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {parts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-500">
                          No spare parts logged for this unit.
                        </td>
                      </tr>
                    ) : (
                      parts.map((p) => (
                        <tr key={p.part_id} className="hover:bg-slate-900/50">
                          <td className="py-2.5 px-3 font-medium text-white">{p.description}</td>
                          <td className="py-2.5 px-3 text-slate-400">{p.supplier || '-'}</td>
                          <td className="py-2.5 px-3 font-mono text-amber-400">£{(p.cost || 0).toFixed(2)}</td>
                          <td className="py-2.5 px-3">
                            <select
                              value={p.order_status}
                              onChange={(e) => onUpdatePartStatus(p.part_id, { order_status: e.target.value })}
                              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-200"
                            >
                              <option value="To Order">To Order</option>
                              <option value="Ordered">Ordered</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Received">Received</option>
                              <option value="Installed">Installed</option>
                            </select>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => onDeletePart(p.part_id)}
                              className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add New Part Form */}
              <form onSubmit={handleCreatePart} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">Log New Part Order</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Part description (e.g. Capstan belt)"
                    value={newPartDesc}
                    onChange={(e) => setNewPartDesc(e.target.value)}
                    className="sm:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="Supplier (Farnell, Mouser...)"
                    value={newPartSupplier}
                    onChange={(e) => setNewPartSupplier(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Cost £"
                    value={newPartCost}
                    onChange={(e) => setNewPartCost(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Add Part Order</span>
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* TAB 4: Financials & Exit Strategy */}
          {activeTab === 'financials' && (
            <div className="space-y-6">
              
              {/* Financial Roll-up Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 space-y-4">
                <h3 className="text-sm font-bold text-amber-400 font-mono uppercase tracking-wider">True Net Profit Calculator</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">BASE PURCHASE</span>
                    <span className="text-lg font-bold text-white">£{parseFloat(baseCost || 0).toFixed(2)}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">PARTS CONSUMED</span>
                    <span className="text-lg font-bold text-amber-400">£{partsTotal.toFixed(2)}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/40">
                    <span className="text-amber-400 block text-[10px]">TOTAL COST BASIS</span>
                    <span className="text-lg font-bold text-amber-300">£{totalCostBasis.toFixed(2)}</span>
                  </div>

                  <div className={`p-3 rounded-xl border ${computedNetProfit >= 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                    <span className="text-slate-400 block text-[10px]">COMPUTED NET PROFIT</span>
                    <span className={`text-lg font-bold ${computedNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      £{computedNetProfit.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 font-mono">
                  Formula: Net Profit = Final Sale Price (£{currentSalePrice.toFixed(2)}) - (Cost Basis £{totalCostBasis.toFixed(2)} + Platform Fees £{currentFees.toFixed(2)} + Shipping £{currentShipping.toFixed(2)})
                </div>
              </div>

              {/* Sales Listing Form */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">Multi-Channel Exit Listing Details</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Sales Platform</label>
                    <select
                      value={salesPlatform}
                      onChange={(e) => setSalesPlatform(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="eBay">eBay UK</option>
                      <option value="Reverb">Reverb</option>
                      <option value="Facebook Marketplace">Facebook Marketplace</option>
                      <option value="Audio Mart">Audio Mart</option>
                      <option value="Direct Workshop">Direct Workshop Sale</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Target Asking Price (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Desired price"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Final Sale Price (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Actual sold price"
                      value={finalSalePrice}
                      onChange={(e) => setFinalSalePrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm font-mono text-emerald-400 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Platform Fees (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. eBay 12.9%"
                      value={platformFees}
                      onChange={(e) => setPlatformFees(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Outbound Shipping Paid (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Postage cost"
                      value={shippingCosts}
                      onChange={(e) => setShippingCosts(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Listing URL / Link</label>
                    <input
                      type="text"
                      placeholder="https://www.ebay.co.uk/itm/..."
                      value={listingUrl}
                      onChange={(e) => setListingUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={handleSaveSales}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow-md transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Sales & Exit Record</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
