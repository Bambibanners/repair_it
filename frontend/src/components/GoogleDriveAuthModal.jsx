import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, LogOut, ShieldCheck, Key, ExternalLink } from 'lucide-react';
import { getGoogleAuthStatus, saveGoogleOAuthToken, googleLogout } from '../api/client';

export default function GoogleDriveAuthModal({ isOpen, onClose }) {
  const [status, setStatus] = useState({ is_authenticated: false });
  const [tokenInput, setTokenInput] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleSaveToken = async (e) => {
    e.preventDefault();
    if (!tokenInput) return;

    try {
      setLoading(true);
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
      setLoading(false);
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
              <p className="text-xs text-slate-500">Secure frontend authentication for Google Drive storage.</p>
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
                  <p className="text-[11px] text-emerald-700">{status.user_email || 'Personal Google Account Active'}</p>
                </div>
              </div>
              <p className="text-[11px] text-emerald-800 border-t border-emerald-200/80 pt-2">
                All photos, scope videos, and PDF manuals uploaded in Repair-It will save into your Google Drive!
              </p>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-emerald-800 font-bold transition-colors text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect Account</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                <p className="font-bold mb-1">How Google Drive Auth Works:</p>
                <p>Paste your Google OAuth token or access key below to link Repair-It directly with your personal Google Drive account.</p>
              </div>

              <form onSubmit={handleSaveToken} className="space-y-3">
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Google Drive Access Token / OAuth Key *</label>
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
                    disabled={loading || !tokenInput}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>{loading ? 'Connecting...' : 'Connect Drive'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
