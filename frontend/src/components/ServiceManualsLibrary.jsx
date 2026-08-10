import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Folder, 
  ExternalLink, 
  Link as LinkIcon, 
  UploadCloud, 
  X, 
  Filter, 
  BookOpen 
} from 'lucide-react';
import { searchServiceManuals, uploadServiceManual, linkManualToModel } from '../api/client';

export default function ServiceManualsLibrary() {
  const [manuals, setManuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedDocType, setSelectedDocType] = useState('All');

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [brand, setBrand] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('Service Manual');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Link Compatibility State
  const [selectedManualId, setSelectedManualId] = useState(null);
  const [linkBrand, setLinkBrand] = useState('');
  const [linkModel, setLinkModel] = useState('');

  useEffect(() => {
    loadManuals();
  }, [searchQuery, selectedBrand, selectedDocType]);

  const loadManuals = async () => {
    try {
      setLoading(true);
      const res = await searchServiceManuals(
        selectedBrand !== 'All' ? selectedBrand : null, 
        searchQuery || null
      );
      
      let filtered = res || [];
      if (selectedDocType !== 'All') {
        filtered = filtered.filter(m => (m.doc_type || 'Service Manual') === selectedDocType);
      }
      setManuals(filtered);
    } catch (err) {
      console.error('Failed to load service manuals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadManual = async (e) => {
    e.preventDefault();
    if (!file || !title || !brand || !modelNumber) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('brand', brand.trim());
      formData.append('model_number', modelNumber.trim());
      formData.append('title', title.trim());
      formData.append('doc_type', docType);
      formData.append('file', file);

      await uploadServiceManual(formData);
      setIsUploadOpen(false);
      setBrand('');
      setModelNumber('');
      setTitle('');
      setFile(null);
      loadManuals();
    } catch (err) {
      alert('Failed to upload manual: ' + (err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleLinkModel = async (e) => {
    e.preventDefault();
    if (!selectedManualId || !linkBrand || !linkModel) return;

    try {
      await linkManualToModel(selectedManualId, {
        brand: linkBrand.trim(),
        model_number: linkModel.trim()
      });
      setSelectedManualId(null);
      setLinkBrand('');
      setLinkModel('');
      loadManuals();
    } catch (err) {
      alert('Failed to link manual: ' + (err.response?.data?.detail || err.message));
    }
  };

  const docTypes = ['All', 'Service Manual', 'Schematic', 'Alignment Guide', 'User Manual', 'Parts List'];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-mono flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <span>SERVICE MANUALS & SCHEMATICS LIBRARY</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Central repository for vintage service manuals, schematics, alignment guides, and multi-model cross-references.</p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-sm transition-colors shrink-0"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload PDF Manual</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Manual Title, Brand, Model #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {docTypes.map((dt) => (
            <button
              key={dt}
              onClick={() => setSelectedDocType(dt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedDocType === dt
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dt}
            </button>
          ))}
        </div>
      </div>

      {/* Manuals Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-mono text-xs bg-white rounded-2xl border border-slate-200">
          Loading service manuals library...
        </div>
      ) : manuals.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs bg-white rounded-2xl border border-slate-200 space-y-2">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700">No service manuals found matching your query.</p>
          <p className="text-slate-400 text-[11px]">Upload a PDF manual using the button above to store it on Google Drive and index it locally.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {manuals.map((man) => (
            <div key={man.manual_id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3 hover:border-amber-400 transition-colors">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 font-mono">{man.brand}</span>
                      <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{man.title}</h3>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                    {man.doc_type || 'Service Manual'}
                  </span>
                </div>

                {/* Linked Models Badges */}
                <div className="mt-3 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">LINKED COMPATIBLE MODELS</span>
                  <div className="flex flex-wrap gap-1">
                    {man.compatibilities && man.compatibilities.length > 0 ? (
                      man.compatibilities.map((c) => (
                        <span key={c.compatibility_id} className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-50 text-amber-900 border border-amber-300">
                          {c.brand} {c.model_number}
                        </span>
                      ))
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-900 border border-amber-300">
                        {man.brand} {man.model_number}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedManualId(man.manual_id);
                    setLinkBrand(man.brand);
                    setLinkModel('');
                  }}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-700 font-semibold text-[11px] border border-slate-200 transition-colors"
                >
                  <LinkIcon className="w-3 h-3 text-amber-600" />
                  <span>+ Link Model</span>
                </button>

                {man.web_view_link ? (
                  <a
                    href={man.web_view_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-2xs transition-colors"
                  >
                    <span>Open PDF</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">No link available</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: Upload Manual */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-5 modal-shadow space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-sm text-slate-900 font-mono">UPLOAD PDF SERVICE MANUAL</h3>
              <button onClick={() => setIsUploadOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadManual} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand / Make *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pioneer, Sony"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Primary Model # *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PD-6030"
                    value={modelNumber}
                    onChange={(e) => setModelNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pioneer PD-5030 / PD-6030 Service Manual & Schematics"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                >
                  <option value="Service Manual">Service Manual</option>
                  <option value="Schematic">Schematic / Wiring</option>
                  <option value="Alignment Guide">Alignment Guide</option>
                  <option value="User Manual">User Manual</option>
                  <option value="Parts List">Parts List</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select PDF File *</label>
                <input
                  type="file"
                  required
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{uploading ? 'Uploading to Drive...' : 'Upload & Index PDF'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Link Model */}
      {selectedManualId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-5 modal-shadow space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-sm text-slate-900 font-mono">LINK MANUAL TO ANOTHER MODEL</h3>
              <button onClick={() => setSelectedManualId(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLinkModel} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Brand / Make *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pioneer"
                  value={linkBrand}
                  onChange={(e) => setLinkBrand(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Compatible Model Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PD-7030"
                  value={linkModel}
                  onChange={(e) => setLinkModel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Link Model</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
