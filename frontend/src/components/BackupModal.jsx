import React, { useState } from 'react';
import { X, Database, Download, UploadCloud, FileSpreadsheet, ShieldAlert } from 'lucide-react';
import { restoreDatabase } from '../api/client';

export default function BackupModal({ isOpen, onClose }) {
  const [restoreFile, setRestoreFile] = useState(null);
  const [restoring, setRestoring] = useState(false);

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    window.location.href = '/api/v1/system/backup';
  };

  const handleExportCSV = () => {
    window.location.href = '/api/v1/system/export/csv';
  };

  const handleRestoreSubmit = async (e) => {
    e.preventDefault();
    if (!restoreFile) return;

    if (!window.confirm("WARNING: Restoring a database file will overwrite all current inventory data. Are you sure you want to proceed?")) {
      return;
    }

    try {
      setRestoring(true);
      await restoreDatabase(restoreFile);
      alert("Database restored successfully! Reloading page...");
      window.location.reload();
    } catch (err) {
      alert("Failed to restore database: " + (err.response?.data?.detail || err.message));
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md modal-shadow overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 border border-amber-300">
              <Database className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-mono">BACKUP & DATA EXPORT</h2>
              <p className="text-xs text-slate-500">Database backup, restore, and CSV accounting exports.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Action 1: Download CSV Ledger */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 flex items-center space-x-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export CSV Financial Ledger</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Export inventory, parts costs, and profit breakdown to Excel.</p>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shrink-0 shadow-2xs"
            >
              Export CSV
            </button>
          </div>

          {/* Action 2: Download SQLite Backup */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 flex items-center space-x-1.5">
                <Download className="w-4 h-4 text-amber-600" />
                <span>Download Database Backup</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Full backup of SQLite <code className="font-mono text-slate-700">repair_it.db</code> file.</p>
            </div>
            <button
              onClick={handleDownloadBackup}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors shrink-0 shadow-2xs"
            >
              Download .db
            </button>
          </div>

          {/* Action 3: Restore Database */}
          <form onSubmit={handleRestoreSubmit} className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-2.5">
            <h4 className="font-bold text-rose-900 flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Restore Database from File</span>
            </h4>
            <p className="text-[11px] text-rose-800">Warning: Overwrites current local database with uploaded <code className="font-mono">.db</code> file.</p>
            
            <input
              type="file"
              required
              accept=".db"
              onChange={(e) => setRestoreFile(e.target.files[0])}
              className="w-full bg-white border border-rose-300 rounded-lg p-1.5 text-xs text-slate-900 focus:outline-none"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={restoring || !restoreFile}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-2xs"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{restoring ? 'Restoring...' : 'Restore Database'}</span>
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
}
