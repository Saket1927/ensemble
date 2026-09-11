import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { QrCode, Clock, Users, ArrowUpRight, Search, CheckCircle2 } from 'lucide-react';

export const VisitsTab: React.FC = () => {
  const { activeRestaurant, tableSessions, orders } = useTenant();
  const [search, setSearch] = useState('');

  const currentSessions = tableSessions[activeRestaurant.id] || [];

  const visitLogs = currentSessions.map((sess) => {
    const tableOrders = orders.filter(
      (o) => (o.restaurantId ? o.restaurantId === activeRestaurant.id : true) && o.tableNumber === sess.tableNumber && o.status !== 'cancelled'
    );
    const billTotal = tableOrders.reduce(
      (sum, ord) => sum + ord.items.reduce((iSum, it) => iSum + it.price * it.quantity, 0),
      0
    );

    let statusLabel = 'Dining Active';
    if (sess.status === 'bill_requested') statusLabel = 'Bill Requested';
    else if (sess.status === 'paid_pending_reset') statusLabel = 'Paid (Awaiting Reset)';
    else if (sess.status === 'closed') statusLabel = 'Completed';

    const timeFormatted = new Date(sess.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      id: sess.id,
      table: sess.tableNumber,
      guest: sess.hostName,
      time: timeFormatted,
      scans: sess.members.length,
      bill: billTotal > 0 ? `₹${billTotal.toLocaleString()}` : 'No orders yet',
      status: statusLabel,
    };
  });

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
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-60" />
                  <p className="font-semibold text-xs text-slate-600">No active dining sessions found</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">When guests scan QR standees and enter their details, live visits appear here automatically.</p>
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
