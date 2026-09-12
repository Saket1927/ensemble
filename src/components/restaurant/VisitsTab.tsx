import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { Clock, Users, Search, CheckCircle2, Utensils, IndianRupee, History } from 'lucide-react';

export const VisitsTab: React.FC = () => {
  const { activeRestaurant, tableSessions, orders } = useTenant();
  const [search, setSearch] = useState('');

  const currentSessions = tableSessions[activeRestaurant.id] || [];

  // ONLY show sessions where items were actually ordered
  const visitLogs = currentSessions
    .map((sess) => {
      const tableOrders = orders.filter(
        (o) =>
          (o.restaurantId ? o.restaurantId === activeRestaurant.id : true) &&
          o.tableNumber === sess.tableNumber &&
          o.status !== 'cancelled'
      );
      const billTotal = tableOrders.reduce(
        (sum, ord) => sum + ord.items.reduce((iSum, it) => iSum + it.price * it.quantity, 0),
        0
      );

      const allItems = tableOrders.flatMap((o) => o.items);
      const totalItemCount = allItems.reduce((s, it) => s + it.quantity, 0);

      let statusLabel = 'Dining Active';
      if (sess.status === 'bill_requested') statusLabel = 'Bill Requested';
      else if (sess.status === 'paid_pending_reset') statusLabel = 'Paid (Awaiting Reset)';
      else if (sess.status === 'closed') statusLabel = `Completed (${sess.paymentMethod || 'Settled'})`;

      const dateObj = new Date(sess.createdAt);
      const timeFormatted = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateFormatted = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

      return {
        id: sess.id,
        table: sess.tableNumber,
        guest: sess.hostName,
        phone: sess.hostPhone,
        time: timeFormatted,
        date: dateFormatted,
        scans: sess.members.length,
        itemCount: totalItemCount,
        itemSummary: allItems.length > 0 ? allItems.map((i) => `${i.quantity}x ${i.name}`).slice(0, 2).join(', ') : 'Direct Order',
        billTotal,
        billFormatted: billTotal > 0 ? `₹${billTotal.toLocaleString()}` : (sess.status === 'closed' ? 'Settled' : null),
        status: statusLabel,
        hasOrders: totalItemCount > 0 || billTotal > 0 || sess.status === 'closed',
      };
    })
    .filter((v) => v.hasOrders); // User Requirement: Only when items are ordered it should reflect in customer visits

  const filteredLogs = visitLogs.filter(
    (v) =>
      v.guest.toLowerCase().includes(search.toLowerCase()) ||
      v.phone.toLowerCase().includes(search.toLowerCase()) ||
      v.table.toString().includes(search)
  );

  const totalRevenue = filteredLogs.reduce((acc, v) => acc + v.billTotal, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Diner Visits & Ordering History
          </h2>
          <p className="text-xs text-slate-500">
            Chronological audit of ordering guests and completed dining sessions.
          </p>
        </div>

        <div className="w-full sm:w-64 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search table, guest or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Customer Visits (Ordered)
            </span>
            <span className="text-lg font-bold text-slate-900">
              {filteredLogs.length} Diners
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Recorded Order Volume
            </span>
            <span className="text-lg font-bold text-slate-900 font-mono">
              ₹{totalRevenue.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center font-bold">
            <History className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Empty Scans Excluded
            </span>
            <span className="text-xs font-semibold text-slate-600">
              Filtered to verified orders only
            </span>
          </div>
        </div>
      </div>

      {/* Visits Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Table</th>
              <th className="py-3 px-4">Diner & Contact</th>
              <th className="py-3 px-4">Visit Time</th>
              <th className="py-3 px-4">Dishes Ordered</th>
              <th className="py-3 px-4">Order Total</th>
              <th className="py-3 px-4 text-right">Session State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <Utensils className="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-60" />
                  <p className="font-semibold text-xs text-slate-600">No ordering diner visits found</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Only dining sessions where items are actually ordered appear in customer visits.
                  </p>
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[11px] bg-slate-100 text-slate-800 border border-slate-200">
                      Table #{log.table}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{log.guest}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{log.phone || 'Offline Walk-in'}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{log.time}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">{log.date}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">
                      {log.itemCount} item{log.itemCount === 1 ? '' : 's'}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                      {log.itemSummary}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {log.billFormatted || '₹0'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        log.status === 'Dining Active'
                          ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                          : log.status === 'Bill Requested'
                          ? 'bg-amber-100 text-amber-800'
                          : log.status.startsWith('Completed')
                          ? 'bg-purple-100 text-purple-800'
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
