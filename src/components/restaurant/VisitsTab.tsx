import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { QrCode, Clock, Users, ArrowUpRight, Search, CheckCircle2 } from 'lucide-react';

export const VisitsTab: React.FC = () => {
  const { activeRestaurant, activeTable } = useTenant();
  const [search, setSearch] = useState('');

  const visitLogs = [
    { id: 'v1', table: 12, guest: 'Rahul Sharma', time: '12 mins ago', scans: 2, bill: '₹1,480', status: 'Dining Active' },
    { id: 'v2', table: 4, guest: 'Priya Patel', time: '34 mins ago', scans: 1, bill: '₹1,230', status: 'Bill Requested' },
    { id: 'v3', table: 8, guest: 'Karan Mehra', time: '1 hr ago', scans: 3, bill: '₹2,650', status: 'Completed' },
    { id: 'v4', table: 19, guest: 'Vikramaditya Rao', time: '2 hrs ago', scans: 1, bill: '₹3,200', status: 'Completed' },
    { id: 'v5', table: 2, guest: 'Simran Jolly', time: '3 hrs ago', scans: 2, bill: '₹890', status: 'Completed' },
    { id: 'v6', table: 15, guest: 'Aditya Birla (Guest)', time: '4 hrs ago', scans: 1, bill: '₹1,670', status: 'Completed' },
    { id: 'v7', table: 22, guest: 'Neha & Ankit', time: '5 hrs ago', scans: 2, bill: '₹2,100', status: 'Completed' },
  ];

  const filteredLogs = visitLogs.filter((v) =>
    v.guest.toLowerCase().includes(search.toLowerCase()) || v.table.toString().includes(search)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Table Visits & Dining Sessions
          </h2>
          <p className="text-xs text-slate-500">
            Chronological audit of guest QR interactions and table billings.
          </p>
        </div>

        <div className="w-full sm:w-64 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search table or guest..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Table</th>
              <th className="py-3 px-4">Diner Name</th>
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4 text-center">Menu Scans</th>
              <th className="py-3 px-4">Estimated Bill</th>
              <th className="py-3 px-4 text-right">Session State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 transition">
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[11px] bg-slate-100 text-slate-800 border border-slate-200">
                    Table #{log.table}
                  </span>
                </td>
                <td className="py-3 px-4 font-bold text-slate-900">
                  {log.guest}
                </td>
                <td className="py-3 px-4 text-slate-500 flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{log.time}</span>
                </td>
                <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                  {log.scans}
                </td>
                <td className="py-3 px-4 font-bold text-slate-900">
                  {log.bill}
                </td>
                <td className="py-3 px-4 text-right">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      log.status === 'Dining Active'
                        ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                        : log.status === 'Bill Requested'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
