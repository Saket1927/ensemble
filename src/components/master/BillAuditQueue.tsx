import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { MasterBillUpload } from '../../types/tenant';
import {
  FileCheck,
  Search,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Phone,
  Clock,
  ExternalLink,
  X,
} from 'lucide-react';

export const BillAuditQueue: React.FC = () => {
  const { masterBillUploads, updateBillAuditStatus } = useTenant();
  const [selectedBill, setSelectedBill] = useState<MasterBillUpload | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified' | 'discrepancy_flagged'>('all');

  const filtered = masterBillUploads.filter((b) => {
    if (filterStatus === 'all') return true;
    return b.auditedStatus === filterStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white">Physical Bill Audit & Revenue Verification</h2>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
              Section 8a Fraud Audit
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare customer-uploaded paper receipts against reported in-app sales to identify unrecorded off-app cash settlements.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {(['all', 'pending', 'verified', 'discrepancy_flagged'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                filterStatus === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Bill Uploads Queue Cards / Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3.5">Restaurant & Table</th>
                <th className="p-3.5">Customer & Phone</th>
                <th className="p-3.5">Reported Amount</th>
                <th className="p-3.5">Uploaded</th>
                <th className="p-3.5">Audit Status</th>
                <th className="p-3.5">Bonus Scratch</th>
                <th className="p-3.5 text-right">Receipt Image</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-3.5">
                    <span className="font-bold text-white block">{bill.restaurantName}</span>
                    <span className="text-[10px] text-slate-400">Table #{bill.tableNumber}</span>
                  </td>

                  <td className="p-3.5">
                    <span className="text-white block font-medium">{bill.customerName}</span>
                    <span className="font-mono text-[10px] text-slate-400">{bill.customerPhone}</span>
                  </td>

                  <td className="p-3.5 font-mono font-bold text-emerald-400">
                    ₹{bill.reportedAppTotal.toLocaleString()}
                  </td>

                  <td className="p-3.5 text-[11px] text-slate-400">{bill.uploadedAt}</td>

                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        bill.auditedStatus === 'verified'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : bill.auditedStatus === 'discrepancy_flagged'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                      }`}
                    >
                      {bill.auditedStatus.replace(/_/g, ' ')}
                    </span>
                  </td>

                  <td className="p-3.5 text-[11px]">
                    {bill.bonusScratchWon ? (
                      <span className="text-amber-300 font-semibold">{bill.bonusScratchWon.label}</span>
                    ) : (
                      <span className="text-slate-500">Better luck next time</span>
                    )}
                  </td>

                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setSelectedBill(bill)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 inline-flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Inspect</span>
                    </button>
                  </td>

                  <td className="p-3.5 text-right space-x-1.5">
                    <button
                      onClick={() => updateBillAuditStatus(bill.id, 'verified')}
                      className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded text-[10px] font-bold transition"
                      title="Confirm bill matches reported numbers"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => updateBillAuditStatus(bill.id, 'discrepancy_flagged')}
                      className="px-2 py-1 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded text-[10px] font-bold transition"
                      title="Flag billing discrepancy"
                    >
                      Flag
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill Photo Inspect Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <h3 className="font-bold text-base text-white">Receipt Audit Preview</h3>
                <p className="text-xs text-slate-400">
                  {selectedBill.restaurantName} • Table {selectedBill.tableNumber}
                </p>
              </div>
              <button onClick={() => setSelectedBill(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-700 bg-black max-h-80 flex items-center justify-center">
              <img
                src={selectedBill.billPhotoUrl}
                alt="Receipt snapshot"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Reported Amount:</span>
                <span className="font-mono font-bold text-white">₹{selectedBill.reportedAppTotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Customer Phone:</span>
                <span className="font-mono text-slate-300">{selectedBill.customerPhone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  updateBillAuditStatus(selectedBill.id, 'verified');
                  setSelectedBill(null);
                }}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow"
              >
                Mark Verified
              </button>
              <button
                onClick={() => {
                  updateBillAuditStatus(selectedBill.id, 'discrepancy_flagged');
                  setSelectedBill(null);
                }}
                className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow"
              >
                Flag Discrepancy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
