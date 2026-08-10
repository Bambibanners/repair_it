import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, LogOut, ShieldCheck, Key, ExternalLink, UploadCloud, FileCode } from 'lucide-react';
import { getGoogleAuthStatus, saveGoogleOAuthToken, uploadServiceAccountJson, googleLogout } from '../api/client';

export default function GoogleDriveAuthModal({ isOpen, onClose }) {
  const [status, setStatus] = useState({ is_authenticated: false, auth_mode: 'none' });
  const [activeTab, setActiveTab] = useState('service_account'); // 'service_account' or 'oauth_token'
  
  // Service Account upload states
  const [jsonFile, setJsonFile] = useState(null);
  const [uploadingJson, setUploadingJson] = useState(false);

  // OAuth token states
  const [tokenInput, setTokenInput] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loadingToken, setLoadingToken] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  const checkStatus = async () => {
    try {
      const s = await getGoogleAuthStatus();
      setStatus(s);
    } catch (err) {
      console.error('Failed to get Google auth status:', err);
    }
  };

  const handleUploadJson = async (e) => {
    e.preventDefault();
    if (!jsonFile) return;

    try {
      setUploadingJson(true);
      const res = await uploadServiceAccountJson(jsonFile);
      setStatus(res);
      setJsonFile(null);
    } catch (err) {
      alert('Failed to upload credentials file: ' + (err.response?.data?.detail || err.message));
    } finally {
      setUploadingJson(false);
    }
  };

  const handleSaveToken = async (e) => {
    e.preventDefault();
    if (!tokenInput) return;

    try {
      setLoadingToken(true);
      const res = await saveGoogleOAuthToken({
        access_token: tokenInput.trim(),
        user_email: userEmail || 'Connected Google Account'
      });
      setStatus(res);
      setTokenInput('');
      setUserEmail('');
    } catch (err) {
      alert('Failed to save Google token: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoadingToken(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await googleLogout();
      setStatus(res);
    } catch (err) {
      console.error('Failed to logout:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md modal-shadow overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 border border-amber-300">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-mono">GOOGLE DRIVE SECURITY</h2>
              <p className="text-xs text-slate-500">Global Google Drive cloud storage setup.</p>
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
          {status.is_authenticated ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3 text-emerald-900">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <h3 className="font-bold text-sm text-emerald-900">Connected to Google Drive</h3>
                  <p className="text-[11px] font-semibold text-emerald-700">
                    Mode: {status.auth_mode === 'service_account' ? 'Permanent Service Account (.json)' : 'OAuth Access Token'}
                  </p>
                  <p className="text-[11px] text-emerald-800 font-mono mt-0.5">{status.user_email}</p>
                </div>
              </div>
              <p className="text-[11px] text-emerald-800 border-t border-emerald-200/80 pt-2">
                All workshop photos, scope videos, and PDF manuals uploaded in Repair-It will save into this Google Drive account!
              </p>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-emerald-800 font-bold transition-colors text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect Credentials</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Method Selector Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 text-[11px] font-bold">
                <button
                  onClick={() => setActiveTab('service_account')}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
                    activeTab === 'service_account'
                      ? 'bg-white text-amber-800 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Option 2: Service Account (.json)
                </button>
                <button
                  onClick={() => setActiveTab('oauth_token')}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
                    activeTab === 'oauth_token'
                      ? 'bg-white text-amber-800 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Option 1: OAuth Token
                </button>
              </div>

              {/* Option 2: Service Account File Upload */}
              {activeTab === 'service_account' && (
                <form onSubmit={handleUploadJson} className="space-y-3">
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-1">
                    <p className="font-bold">Permanent Connection (Recommended)</p>
                    <p>Upload your Google Cloud Service Account <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">credentials.json</code> file. It never expires!</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Select Service Account Key File (.json)</label>
                    <input
                      type="file"
                      required
                      accept=".json"
                      onChange={(e) => setJsonFile(e.target.files[0])}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={uploadingJson || !jsonFile}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>{uploadingJson ? 'Uploading & Connecting...' : 'Upload credentials.json'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Option 1: Access Token Paste */}
              {activeTab === 'oauth_token' && (
                <form onSubmit={handleSaveToken} className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[11px]">
                    <p className="font-bold text-slate-900 mb-0.5">Quick Token Access</p>
                    <p>Paste a temporary OAuth Access token generated from Google Developer Playground.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Google Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="your-name@gmail.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Google Drive Access Token *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Paste OAuth token (ya29.a0...)"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <a
                      href="https://developers.google.com/oauthplayground/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-amber-700 font-bold hover:underline flex items-center space-x-1"
                    >
                      <span>Get OAuth Token</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      type="submit"
                      disabled={loadingToken || !tokenInput}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>{loadingToken ? 'Connecting...' : 'Connect Drive'}</span>
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
