import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wrench, 
  Package, 
  TrendingUp, 
  HardDrive, 
  Plus, 
  Save, 
  Trash2,
  Folder,
  Image as ImageIcon,
  FileText,
  UploadCloud,
  ExternalLink,
  Link as LinkIcon,
  CheckSquare,
  UserCheck,
  QrCode,
  Printer,
  ShieldCheck,
  DollarSign
} from 'lucide-react';
import { 
  uploadUnitMedia, 
  deleteUnitMedia, 
  searchServiceManuals, 
  uploadServiceManual, 
  linkManualToModel,
  getQCChecklist,
  updateQCChecklist,
  getClientJob,
  updateClientJob
} from '../api/client';
import QRCodeModal from './QRCodeModal';

export default function UnitDetailModal({ 
  unit, 
  onClose, 
  onUpdateUnit, 
  onDeleteUnit,
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
  const [isClientJob, setIsClientJob] = useState(unit?.is_client_job || false);

  // Accessories state
  const [hasRemote, setHasRemote] = useState(unit?.has_remote || false);
  const [hasPhysicalManual, setHasPhysicalManual] = useState(unit?.has_physical_manual || false);
  const [otherAccessories, setOtherAccessories] = useState(unit?.other_accessories || '');

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

  // Media & Manual states
  const [mediaList, setMediaList] = useState(unit?.media_items || []);
  const [uploading, setUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploadType, setUploadType] = useState('image');
  
  // Manuals state
  const [foundManuals, setFoundManuals] = useState([]);
  const [manualTitle, setManualTitle] = useState('');
  const [manualDocType, setManualDocType] = useState('Service Manual');
  const [manualFile, setManualFile] = useState(null);
  const [manualUploading, setManualUploading] = useState(false);

  // Link Manual Modal State
  const [linkingManualId, setLinkingManualId] = useState(null);
  const [linkBrand, setLinkBrand] = useState('');
  const [linkModel, setLinkModel] = useState('');

  // QC Checklist state
  const [dcOffset, setDcOffset] = useState(0.5);
  const [biasCurrent, setBiasCurrent] = useState(25.0);
  const [channelBalance, setChannelBalance] = useState(true);
  const [potsFlushed, setPotsFlushed] = useState(true);
  const [burnInHours, setBurnInHours] = useState(24);
  const [freqResponse, setFreqResponse] = useState(true);
  const [visualInspection, setVisualInspection] = useState(true);
  const [techSig, setTechSig] = useState('Master Tech');
  const [qcNotes, setQcNotes] = useState('');

  // Client Job state
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [depositPaid, setDepositPaid] = useState(0.0);
  const [laborRate, setLaborRate] = useState(45.0);
  const [laborHours, setLaborHours] = useState(1.0);
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [invoiceStatus, setInvoiceStatus] = useState('Draft');

  // QR Modal State
  const [isQROpen, setIsQROpen] = useState(false);

  useEffect(() => {
    if (unit) {
      setStatus(unit.system_status);
      setBaseCost(unit.base_cost);
      setCosmeticCondition(unit.cosmetic_condition);
      setIsClientJob(unit.is_client_job || false);
      setHasRemote(unit.has_remote || false);
      setHasPhysicalManual(unit.has_physical_manual || false);
      setOtherAccessories(unit.other_accessories || '');
      setMediaList(unit.media_items || []);

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

      refreshManuals();

      // Load QC & Client Job
      getQCChecklist(unit.unit_id).then((qc) => {
        if (qc) {
          setDcOffset(qc.dc_offset_mv ?? 0.5);
          setBiasCurrent(qc.bias_current_ma ?? 25.0);
          setChannelBalance(qc.channel_balance_ok ?? true);
          setPotsFlushed(qc.potentiometers_flushed ?? true);
          setBurnInHours(qc.burn_in_hours ?? 24);
          setFreqResponse(qc.frequency_response_ok ?? true);
          setVisualInspection(qc.visual_inspection_ok ?? true);
          setTechSig(qc.tech_signature || 'Master Tech');
          setQcNotes(qc.notes || '');
        }
      }).catch(() => {});

      getClientJob(unit.unit_id).then((job) => {
        if (job) {
          setClientName(job.client_name || '');
          setClientPhone(job.client_phone || '');
          setClientEmail(job.client_email || '');
          setDepositPaid(job.deposit_paid || 0.0);
          setLaborRate(job.labor_rate_per_hr || 45.0);
          setLaborHours(job.labor_hours_spent || 1.0);
          setInvoiceNotes(job.invoice_notes || '');
          setInvoiceStatus(job.invoice_status || 'Draft');
        }
      }).catch(() => {});
    }
  }, [unit]);

  const refreshManuals = () => {
    if (unit?.brand && unit?.model_number) {
      searchServiceManuals(unit.brand, unit.model_number).then((res) => {
        setFoundManuals(res || []);
      }).catch(() => {});
    }
  };

  if (!unit) return null;

  const parts = unit.part_orders || [];
  const partsTotal = parts.reduce((acc, p) => acc + (p.cost || 0), 0);
  const totalCostBasis = (parseFloat(baseCost) || 0) + partsTotal;

  const currentSalePrice = parseFloat(finalSalePrice) || 0;
  const currentFees = parseFloat(platformFees) || 0;
  const currentShipping = parseFloat(shippingCosts) || 0;
  const computedNetProfit = currentSalePrice > 0 
    ? (currentSalePrice - (totalCostBasis + currentFees + currentShipping))
    : 0;

  // Client Job Invoice Calculations
  const computedLaborTotal = (parseFloat(laborHours) || 0) * (parseFloat(laborRate) || 0);
  const computedInvoiceTotal = computedLaborTotal + partsTotal - (parseFloat(depositPaid) || 0);

  const getMediaUrl = (m) => {
    if (!m) return '';
    if (m.gdrive_file_id) {
      return `https://lh3.googleusercontent.com/d/${m.gdrive_file_id}`;
    }
    if (m.thumbnail_link && !m.thumbnail_link.includes('drive.google.com')) {
      return m.thumbnail_link;
    }
    if (m.web_view_link && !m.web_view_link.includes('drive.google.com')) {
      return m.web_view_link;
    }
    return `/api/v1/media/${m.media_id}/file`;
  };

  const handleSaveHardware = () => {
    onUpdateUnit(unit.unit_id, {
      system_status: status,
      base_cost: parseFloat(baseCost),
      cosmetic_condition: cosmeticCondition,
      is_client_job: isClientJob,
      has_remote: hasRemote,
      has_physical_manual: hasPhysicalManual,
      other_accessories: otherAccessories
    });
  };

  const handleDeleteThisUnit = () => {
    if (window.confirm(`Are you sure you want to PERMANENTLY delete ${unit.brand} ${unit.model_number} (SN: ${unit.serial_number}) from workshop inventory?`)) {
      onDeleteUnit(unit.unit_id);
      onClose();
    }
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

  const handleUploadMedia = async (e) => {
    e.preventDefault();
    if (!fileToUpload) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('file_type', uploadType);

      const newMedia = await uploadUnitMedia(unit.unit_id, formData);
      setMediaList((prev) => [...prev, newMedia]);
      setFileToUpload(null);
    } catch (err) {
      alert('Failed to upload media: ' + (err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    try {
      await deleteUnitMedia(mediaId);
      setMediaList((prev) => prev.filter((m) => m.media_id !== mediaId));
    } catch (err) {
      console.error('Failed to delete media:', err);
    }
  };

  const handleUploadManual = async (e) => {
    e.preventDefault();
    if (!manualFile || !manualTitle) return;

    try {
      setManualUploading(true);
      const formData = new FormData();
      formData.append('brand', unit.brand);
      formData.append('model_number', unit.model_number);
      formData.append('title', manualTitle);
      formData.append('doc_type', manualDocType);
      formData.append('file', manualFile);

      await uploadServiceManual(formData);
      refreshManuals();
      setManualTitle('');
      setManualFile(null);
    } catch (err) {
      alert('Failed to upload service manual: ' + (err.response?.data?.detail || err.message));
    } finally {
      setManualUploading(false);
    }
  };

  const handleLinkManualModel = async (e) => {
    e.preventDefault();
    if (!linkingManualId || !linkBrand || !linkModel) return;

    try {
      await linkManualToModel(linkingManualId, {
        brand: linkBrand.trim(),
        model_number: linkModel.trim()
      });
      setLinkingManualId(null);
      setLinkBrand('');
      setLinkModel('');
      refreshManuals();
    } catch (err) {
      alert('Failed to link manual: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleSaveQC = async () => {
    try {
      await updateQCChecklist(unit.unit_id, {
        dc_offset_mv: parseFloat(dcOffset),
        bias_current_ma: parseFloat(biasCurrent),
        channel_balance_ok: channelBalance,
        potentiometers_flushed: potsFlushed,
        burn_in_hours: parseInt(burnInHours),
        frequency_response_ok: freqResponse,
        visual_inspection_ok: visualInspection,
        tech_signature: techSig,
        notes: qcNotes
      });
      alert('QC Calibration Checklist saved!');
    } catch (err) {
      alert('Failed to save QC Checklist: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleSaveClientJob = async () => {
    try {
      await updateClientJob(unit.unit_id, {
        client_name: clientName,
        client_phone: clientPhone,
        client_email: clientEmail,
        deposit_paid: parseFloat(depositPaid) || 0,
        labor_rate_per_hr: parseFloat(laborRate) || 45.0,
        labor_hours_spent: parseFloat(laborHours) || 0,
        invoice_notes: invoiceNotes,
        invoice_status: invoiceStatus
      });
      alert('Client repair job details saved!');
    } catch (err) {
      alert('Failed to save Client Job: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col modal-shadow overflow-hidden print:border-none print:shadow-none print:max-h-full print:w-full">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between print:hidden">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-mono">{unit.brand} {unit.model_number}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                {unit.category}
              </span>
              {isClientJob && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
                  Client Repair Job
                </span>
              )}
              {hasRemote && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  📺 Remote
                </span>
              )}
              {hasPhysicalManual && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                  📖 Manual
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Serial #: <span className="text-slate-800 font-medium">{unit.serial_number}</span> • Acquisition: <span className="text-slate-800 font-medium">{unit.acquisition_source || 'N/A'}</span>
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsQROpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 transition-colors shadow-2xs"
            >
              <QrCode className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">QR Tag</span>
            </button>

            {onDeleteUnit && (
              <button
                onClick={handleDeleteThisUnit}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-rose-600 hover:bg-rose-50 font-semibold text-xs transition-colors shadow-2xs"
                title="Delete Unit Record"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}

            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-4 sm:px-6 gap-1 pt-2 overflow-x-auto print:hidden">
          {[
            { id: 'hardware', label: 'Hardware Details', icon: HardDrive },
            { id: 'repair', label: 'Repair Log & Workbench', icon: Wrench },
            { id: 'parts', label: `Parts Consumed (${parts.length})`, icon: Package },
            { id: 'media', label: `Media & Manuals (${mediaList.length})`, icon: Folder },
            { id: 'qc', label: 'QC & Certificate', icon: CheckSquare },
            { id: 'client', label: 'Client Repair Job', icon: UserCheck },
            { id: 'financials', label: 'Financials & Exit', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                  isActive 
                    ? 'border-amber-500 text-amber-800 bg-white rounded-t-lg shadow-xs' 
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
          
          {/* TAB 1: Hardware Details */}
          {activeTab === 'hardware' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">System Workflow Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cosmetic Condition</label>
                  <select
                    value={cosmeticCondition}
                    onChange={(e) => setCosmeticCondition(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  >
                    <option value="Mint">Mint (Collector Grade)</option>
                    <option value="Good">Good (Minor Wear)</option>
                    <option value="Fair">Fair (Noticeable Scratches)</option>
                    <option value="Poor">Poor (Heavily Damaged)</option>
                    <option value="For Parts">For Parts / Donor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Base Purchase Cost (£)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={baseCost}
                    onChange={(e) => setBaseCost(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono font-bold text-amber-700 focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Job Type</label>
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="is_client_job"
                      checked={isClientJob}
                      onChange={(e) => setIsClientJob(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                    />
                    <label htmlFor="is_client_job" className="text-xs font-bold text-slate-800">Mark as External Client Repair Job</label>
                  </div>
                </div>

              </div>

              {/* Accessories & Included Extras Section */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Included Accessories & Extras</h4>
                
                <div className="flex flex-wrap items-center gap-5 text-xs font-semibold text-slate-800">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasRemote}
                      onChange={(e) => setHasRemote(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                    />
                    <span>Original Remote Included</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasPhysicalManual}
                      onChange={(e) => setHasPhysicalManual(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                    />
                    <span>Physical Printed Manual Included</span>
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Other Accessories / Original Box</label>
                  <input
                    type="text"
                    placeholder="e.g. Original Box & Inserts, FM Antenna, Gold RCA leads"
                    value={otherAccessories}
                    onChange={(e) => setOtherAccessories(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={handleSaveHardware}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-sm transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Hardware Details</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Repair Log & Workbench */}
          {activeTab === 'repair' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4">
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Workbench Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  >
                    <option value={1}>1 - High Priority (Immediate Repair)</option>
                    <option value={2}>2 - Medium Priority (Standard Workload)</option>
                    <option value={3}>3 - Low Priority (Backlog / Spare Time)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Initial Symptoms & Fault Diagnostic</label>
                  <textarea
                    rows={3}
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Describe symptoms (e.g. motor spins but laser dead, channel B crackle)..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Required Action Plan</label>
                  <textarea
                    rows={2}
                    value={actionPlan}
                    onChange={(e) => setActionPlan(e.target.value)}
                    placeholder="Steps planned (e.g. replace capstan belt, flush pots with DeoxIT)..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bench Notes (Running Work Log)</label>
                  <textarea
                    rows={4}
                    value={benchNotes}
                    onChange={(e) => setBenchNotes(e.target.value)}
                    placeholder="Running log of measurements, solder work, test results..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>

              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={handleSaveRepairLog}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-sm transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Workbench Notes</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Parts Consumed */}
          {activeTab === 'parts' && (
            <div className="space-y-5">
              
              {/* Existing Parts Table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead className="bg-slate-50 border-b border-slate-200 uppercase text-slate-600 font-mono text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3 font-bold">Description</th>
                      <th className="py-2.5 px-3 font-bold">Supplier</th>
                      <th className="py-2.5 px-3 font-bold">Cost (£)</th>
                      <th className="py-2.5 px-3 font-bold">Status</th>
                      <th className="py-2.5 px-3 text-center font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">
                          No spare parts logged for this unit.
                        </td>
                      </tr>
                    ) : (
                      parts.map((p) => (
                        <tr key={p.part_id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-bold text-slate-900">{p.description}</td>
                          <td className="py-2.5 px-3 text-slate-600">{p.supplier || '-'}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-amber-700">£{(p.cost || 0).toFixed(2)}</td>
                          <td className="py-2.5 px-3">
                            <select
                              value={p.order_status}
                              onChange={(e) => onUpdatePartStatus(p.part_id, { order_status: e.target.value })}
                              className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-[11px] text-slate-800"
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
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
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
              <form onSubmit={handleCreatePart} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Log New Part Order</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <input
                    type="text"
                    placeholder="Part description (e.g. Capstan belt)"
                    value={newPartDesc}
                    onChange={(e) => setNewPartDesc(e.target.value)}
                    className="sm:col-span-2 bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="Supplier (Farnell, Mouser...)"
                    value={newPartSupplier}
                    onChange={(e) => setNewPartSupplier(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Cost £"
                    value={newPartCost}
                    onChange={(e) => setNewPartCost(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold text-amber-700 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Add Part Order</span>
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* TAB 4: Media & Google Drive */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              
              {/* Media Attachments Gallery */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">Unit Media & Scope Photos</h4>
                
                {mediaList.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-500 text-xs">
                    <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No media attached for this unit yet.</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Upload photos of cosmetic state, component solder work, or video clips below.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {mediaList.map((m) => {
                      const mediaUrl = getMediaUrl(m);
                      const isImage = m.file_type === 'image' || m.file_name?.match(/\.(jpeg|jpg|png|gif|webp|heic)/i);
                      return (
                        <div key={m.media_id} className="relative group bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-2xs p-2">
                          {isImage ? (
                            <img 
                              src={mediaUrl} 
                              alt={m.file_name} 
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `/api/v1/media/${m.media_id}/file`;
                              }}
                              className="w-full h-32 object-cover rounded-lg bg-slate-100" 
                            />
                          ) : (
                            <div className="w-full h-32 flex flex-col items-center justify-center bg-slate-100 rounded-lg text-slate-600 p-2 text-center">
                              <FileText className="w-8 h-8 text-amber-600 mb-1" />
                              <span className="text-[11px] font-semibold truncate max-w-full">{m.file_name}</span>
                            </div>
                          )}

                          <div className="mt-2 flex items-center justify-between text-[11px]">
                            <span className="truncate max-w-[120px] font-medium text-slate-800">{m.file_name}</span>
                            <div className="flex items-center space-x-1">
                              <a
                                href={`/api/v1/media/${m.media_id}/file`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 rounded bg-white border border-slate-200 text-amber-700 hover:bg-amber-50"
                                title="Open Full Resolution File"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => handleDeleteMedia(m.media_id)}
                                className="p-1 rounded bg-white border border-slate-200 text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {m.gdrive_file_id && (
                            <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                              GDRIVE
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Upload Media Form */}
              <form onSubmit={handleUploadMedia} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-2">
                  <UploadCloud className="w-4 h-4 text-amber-600" />
                  <span>Upload Unit Attachment / Photo</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  >
                    <option value="image">Photo / Chassis Image</option>
                    <option value="video">Repair Video Clip</option>
                    <option value="schematic">Schematic / Waveform</option>
                    <option value="manual">Manual PDF</option>
                  </select>

                  <input
                    type="file"
                    required
                    onChange={(e) => setFileToUpload(e.target.files[0])}
                    className="sm:col-span-2 bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={uploading || !fileToUpload}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-xs"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>{uploading ? 'Uploading to Drive...' : 'Upload Attachment'}</span>
                  </button>
                </div>
              </form>

              {/* Service Manuals Vault */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>Service Manuals & Schematics Cross-Reference Vault ({unit.brand} {unit.model_number})</span>
                </h4>

                {foundManuals.length === 0 ? (
                  <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                    No service manual uploaded yet for {unit.brand} {unit.model_number}. Upload a PDF below to store on Google Drive & index locally!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {foundManuals.map((man) => (
                      <div key={man.manual_id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                            <span className="font-bold text-slate-900">{man.title}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 text-slate-700 font-semibold">{man.doc_type || 'Service Manual'}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          {man.web_view_link && (
                            <a
                              href={man.web_view_link}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-[11px] transition-colors"
                            >
                              <span>Open PDF</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 5: QC Checklist & Printable Certificate */}
          {activeTab === 'qc' && (
            <div className="space-y-6">
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-300 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-amber-800" />
                    <h3 className="text-sm font-bold text-amber-900 font-mono">BENCH QUALITY CONTROL & CALIBRATION</h3>
                  </div>

                  <button
                    onClick={handlePrintCertificate}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Restoration Certificate</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">DC Offset Measurement (mV)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={dcOffset}
                      onChange={(e) => setDcOffset(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Bias Current Measurement (mA)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={biasCurrent}
                      onChange={(e) => setBiasCurrent(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">24-Hour Burn-In Test (Hours)</label>
                    <input
                      type="number"
                      value={burnInHours}
                      onChange={(e) => setBurnInHours(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Master Tech Signature</label>
                    <input
                      type="text"
                      value={techSig}
                      onChange={(e) => setTechSig(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Inspection Toggles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
                  <label className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channelBalance}
                      onChange={(e) => setChannelBalance(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <span className="font-bold text-slate-800">Channel Balance OK</span>
                  </label>

                  <label className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={potsFlushed}
                      onChange={(e) => setPotsFlushed(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <span className="font-bold text-slate-800">Pots DeoxIT Flushed</span>
                  </label>

                  <label className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={freqResponse}
                      onChange={(e) => setFreqResponse(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <span className="font-bold text-slate-800">Freq Response OK</span>
                  </label>

                  <label className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visualInspection}
                      onChange={(e) => setVisualInspection(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <span className="font-bold text-slate-800">Chassis Cleaned</span>
                  </label>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSaveQC}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-xs transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save QC Checklist</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Client Repair Job */}
          {activeTab === 'client' && (
            <div className="space-y-6">
              <div className="p-4 sm:p-5 rounded-2xl bg-purple-50 border border-purple-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-5 h-5 text-purple-800" />
                    <h3 className="text-sm font-bold text-purple-900 font-mono">CUSTOMER REPAIR & INVOICING</h3>
                  </div>

                  <button
                    onClick={handlePrintCertificate}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Customer Invoice</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="John Smith"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="07700 900123"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Labor Rate (£/hr)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={laborRate}
                      onChange={(e) => setLaborRate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Labor Hours Worked</label>
                    <input
                      type="number"
                      step="0.25"
                      value={laborHours}
                      onChange={(e) => setLaborHours(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Deposit Paid (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={depositPaid}
                      onChange={(e) => setDepositPaid(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-emerald-700 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Total Invoice Calculation Box */}
                <div className="bg-white p-4 rounded-xl border border-purple-200 font-mono text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Labor Charge ({laborHours} hrs @ £{parseFloat(laborRate || 0).toFixed(2)}/hr):</span>
                    <span className="font-bold text-slate-900">£{computedLaborTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Parts Used Total:</span>
                    <span className="font-bold text-slate-900">£{partsTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Deposit Paid Credit:</span>
                    <span className="font-bold">-£{parseFloat(depositPaid || 0).toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-purple-100 flex justify-between text-sm font-bold text-purple-900">
                    <span>BALANCE DUE ON PICKUP:</span>
                    <span>£{computedInvoiceTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveClientJob}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs shadow-xs transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Client Job & Invoice</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: Financials & Exit Strategy */}
          {activeTab === 'financials' && (
            <div className="space-y-5">
              
              {/* Financial Roll-up Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-amber-300 space-y-4 shadow-sm">
                <h3 className="text-xs font-bold text-amber-800 font-mono uppercase tracking-wider">True Net Profit Calculator</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-slate-500 block text-[10px] font-bold">BASE PURCHASE</span>
                    <span className="text-base font-bold text-slate-900">£{parseFloat(baseCost || 0).toFixed(2)}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-slate-500 block text-[10px] font-bold">PARTS CONSUMED</span>
                    <span className="text-base font-bold text-amber-700">£{partsTotal.toFixed(2)}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 shadow-2xs">
                    <span className="text-amber-800 block text-[10px] font-bold">TOTAL COST BASIS</span>
                    <span className="text-base font-bold text-amber-900">£{totalCostBasis.toFixed(2)}</span>
                  </div>

                  <div className={`p-3 rounded-xl border shadow-2xs ${computedNetProfit >= 0 ? 'bg-emerald-50 border-emerald-300' : 'bg-rose-50 border-rose-300'}`}>
                    <span className="text-slate-600 block text-[10px] font-bold">COMPUTED NET PROFIT</span>
                    <span className={`text-base font-bold ${computedNetProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      £{computedNetProfit.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 font-mono">
                  Formula: Net Profit = Final Sale Price (£{currentSalePrice.toFixed(2)}) - (Cost Basis £{totalCostBasis.toFixed(2)} + Platform Fees £{currentFees.toFixed(2)} + Shipping £{currentShipping.toFixed(2)})
                </div>
              </div>

              {/* Sales Listing Form */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Multi-Channel Exit Listing Details</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sales Platform</label>
                    <select
                      value={salesPlatform}
                      onChange={(e) => setSalesPlatform(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                    >
                      <option value="eBay">eBay UK</option>
                      <option value="Reverb">Reverb</option>
                      <option value="Facebook Marketplace">Facebook Marketplace</option>
                      <option value="Audio Mart">Audio Mart</option>
                      <option value="Direct Workshop">Direct Workshop Sale</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Asking Price (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Desired price"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Final Sale Price (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Actual sold price"
                      value={finalSalePrice}
                      onChange={(e) => setFinalSalePrice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono font-bold text-emerald-700 focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Platform Fees (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. eBay 12.9%"
                      value={platformFees}
                      onChange={(e) => setPlatformFees(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Outbound Shipping Paid (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Postage cost"
                      value={shippingCosts}
                      onChange={(e) => setShippingCosts(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Listing URL / Link</label>
                    <input
                      type="text"
                      placeholder="https://www.ebay.co.uk/itm/..."
                      value={listingUrl}
                      onChange={(e) => setListingUrl(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={handleSaveSales}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-sm transition-colors"
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

      {/* QR Code Modal */}
      <QRCodeModal
        unit={unit}
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
      />
    </div>
  );
}
