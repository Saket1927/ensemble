import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { SocialSubmission } from '../../types/tenant';
import {
  Share2,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { InstagramIcon, FacebookIcon, WhatsAppIcon, TikTokIcon } from '../common/BrandIcons';

export const SocialModerationTab: React.FC = () => {
  const {
    activeRestaurant,
    activeSocialSubmissions,
    approveSocialSubmission,
    rejectSocialSubmission,
  } = useTenant();

  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedProof, setSelectedProof] = useState<SocialSubmission | null>(null);

  const pendingList = activeSocialSubmissions.filter((s) => s.status === 'pending');
  const approvedList = activeSocialSubmissions.filter((s) => s.status === 'approved');
  const rejectedList = activeSocialSubmissions.filter((s) => s.status === 'rejected');

  const currentList =
    activeTab === 'pending'
      ? pendingList
      : activeTab === 'approved'
      ? approvedList
      : rejectedList;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Social Post Verification Queue
          </h2>
          <p className="text-xs text-slate-500">
            Review guest screenshot proofs from Instagram, TikTok, and WhatsApp to unlock bonus reward spins.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center space-x-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-sm text-xs font-semibold">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition ${
              activeTab === 'pending'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Pending</span>
            {pendingList.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white text-amber-900">
                {pendingList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'approved'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Approved ({approvedList.length})
          </button>

          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'rejected'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rejected ({rejectedList.length})
          </button>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {currentList.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-sm text-slate-800">No {activeTab} submissions</h3>
            <p className="text-xs text-slate-400">
              {activeTab === 'pending'
                ? 'All guest social proofs have been reviewed and rewarded.'
                : `No items in ${activeTab} queue.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentList.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-pink-50 text-pink-700 flex items-center justify-center">
                        {sub.platform === 'Instagram' && <InstagramIcon className="w-4 h-4" />}
                        {sub.platform === 'WhatsApp' && <WhatsAppIcon className="w-4 h-4" />}
                        {sub.platform === 'Facebook' && <FacebookIcon className="w-4 h-4" />}
                        {sub.platform === 'TikTok' && <TikTokIcon className="w-4 h-4" />}
                      </div>
                      <span className="font-bold text-xs text-slate-900">
                        {sub.platform} Share
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        sub.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : sub.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>

                  {/* Screenshot Thumbnail */}
                  <div
                    onClick={() => setSelectedProof(sub)}
                    className="h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer relative group"
                  >
                    <img
                      src={sub.screenshotUrl}
                      alt="Story Proof"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition">
                      Click to Enlarge
                    </div>
                  </div>

                  {/* Diner & Hashtag Info */}
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{sub.customerName}</span>
                      <span className="text-[10px] text-slate-400">{sub.submittedAt}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {sub.customerPhone || '+91 Verified Diner'}
                    </div>
                    <div className="text-[10px] text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100 font-mono truncate">
                      {sub.hashtags}
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                {sub.status === 'pending' && (
                  <div className="p-3 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => rejectSocialSubmission(sub.id)}
                      className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => approveSocialSubmission(sub.id)}
                      className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition flex items-center justify-center space-x-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Approve & Add Spin</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Screenshot Enlarge Modal */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <h3 className="font-serif font-bold text-base text-slate-900">
              Proof by {selectedProof.customerName}
            </h3>
            <div className="h-80 rounded-2xl overflow-hidden border border-slate-200">
              <img
                src={selectedProof.screenshotUrl}
                alt="Story proof"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-slate-500 font-mono">
              {selectedProof.hashtags}
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedProof(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              {selectedProof.status === 'pending' && (
                <button
                  onClick={() => {
                    approveSocialSubmission(selectedProof.id);
                    setSelectedProof(null);
                  }}
                  className="flex-1 py-2 bg-emerald-600 text-white font-bold text-xs uppercase rounded-xl"
                >
                  Approve & Grant Spin
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
