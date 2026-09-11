import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { TableDayHistory, TableSessionLog } from '../../types/tenant';
import {
  Calendar,
  Clock,
  QrCode,
  Users,
  UtensilsCrossed,
  IndianRupee,
  ChevronRight,
  TrendingUp,
  X,
  Bell,
  CreditCard,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  CheckCircle2,
} from 'lucide-react';

export const TableHistoryView: React.FC<{ initialTableNumber?: number }> = ({ initialTableNumber }) => {
  const {
    activeRestaurant,
    activeTables,
    tableHistoryMap,
    orders,
    tableSessions,
  } = useTenant();

  const [selectedTableNum, setSelectedTableNum] = useState<number | 'all'>(initialTableNumber || 1);
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'this_month'>('today');
  const [selectedDayLog, setSelectedDayLog] = useState<TableDayHistory | null>(null);

  const restaurantId = activeRestaurant.id;
  const historyList: TableDayHistory[] = tableHistoryMap[restaurantId] || [];

  // Date calculation helpers
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date(Date.now() - 86400000);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];
  const sevenDaysAgoDate = new Date(Date.now() - 7 * 86400000);
  const thirtyDaysAgoDate = new Date(Date.now() - 30 * 86400000);

  // Filter history records
  const filteredHistory = historyList.filter((item) => {
    // Table filter
    if (selectedTableNum !== 'all' && item.tableNumber !== selectedTableNum) {
      return false;
    }

    // Date filter
    const itemDate = new Date(item.date);
    if (dateFilter === 'today') return item.date === todayStr;
    if (dateFilter === 'yesterday') return item.date === yesterdayStr;
    if (dateFilter === 'last_7_days') return itemDate >= sevenDaysAgoDate;
    if (dateFilter === 'last_30_days') return itemDate >= thirtyDaysAgoDate;
    if (dateFilter === 'this_month') {
      const now = new Date();
      return itemDate.getFullYear() === now.getFullYear() && itemDate.getMonth() === now.getMonth();
    }
    return true;
  });

  // Calculate aggregates
  const totalScans = filteredHistory.reduce((s, h) => s + (h.qrScans || 0), 0);
  const totalPeople = filteredHistory.reduce((s, h) => s + (h.totalPeople || 0), 0);
  const totalVisits = filteredHistory.reduce((s, h) => s + (h.visits || 0), 0);
  const totalOrders = filteredHistory.reduce((s, h) => s + (h.orders || 0), 0);
  const totalRevenue = filteredHistory.reduce((s, h) => s + (h.revenue || 0), 0);
  const totalCalls = filteredHistory.reduce((s, h) => s + (h.captainCalls || 0), 0);
  const totalBillRequests = filteredHistory.reduce((s, h) => s + (h.billRequests || 0), 0);
  const avgSpend = totalVisits > 0 ? Math.round(totalRevenue / totalVisits) : 0;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header & Table Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
              Section 14: Historical Telemetry
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-600">{activeRestaurant.name}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Day-Wise Table Analytics & History</h2>
          <p className="text-xs text-slate-500">
            Real dining floor audit trail: QR scan traffic, customer density, revenue generation, and session drill-downs.
          </p>
        </div>

        {/* Filters Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Table Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs">
            <QrCode className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-600">Table:</span>
            <select
              value={selectedTableNum}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedTableNum(val === 'all' ? 'all' : Number(val));
              }}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="all">All Tables Overview</option>
              {activeTables.map((t) => (
                <option key={t.tableNumber} value={t.tableNumber}>
                  Table {t.tableNumber}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter Pills */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600 border border-slate-200">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1 rounded-lg transition ${
                dateFilter === 'today' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('yesterday')}
              className={`px-3 py-1 rounded-lg transition ${
                dateFilter === 'yesterday' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => setDateFilter('last_7_days')}
              className={`px-3 py-1 rounded-lg transition ${
                dateFilter === 'last_7_days' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Last 7D
            </button>
            <button
              onClick={() => setDateFilter('this_month')}
              className={`px-3 py-1 rounded-lg transition ${
                dateFilter === 'this_month' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              This Month
            </button>
          </div>
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* QR Scans */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">QR Scans</span>
            <QrCode className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalScans}</div>
          <div className="text-[10px] text-slate-400 mt-1">Verified physical scans</div>
        </div>

        {/* Total Diners */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Diners</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalPeople}</div>
          <div className="text-[10px] text-slate-400 mt-1">{totalVisits} registered visits</div>
        </div>

        {/* Orders */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Orders</span>
            <UtensilsCrossed className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalOrders}</div>
          <div className="text-[10px] text-slate-400 mt-1">Kitchen cross-confirmed</div>
        </div>

        {/* Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Revenue</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">₹{totalRevenue.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 mt-1">Settled & billed</div>
        </div>

        {/* Avg Spend */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Avg Spend</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">₹{avgSpend.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 mt-1">Per dining session</div>
        </div>

        {/* Captain Calls */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Assistance</span>
            <Bell className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalCalls}</div>
          <div className="text-[10px] text-slate-400 mt-1">{totalBillRequests} bill requests</div>
        </div>
      </div>

      {/* Historical Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-600" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
              {selectedTableNum === 'all' ? 'All Dining Tables' : `Table #${selectedTableNum}`} Day-Wise Ledger
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Showing {filteredHistory.length} ledger record{filteredHistory.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Table</th>
                <th className="py-3 px-4">QR Scans</th>
                <th className="py-3 px-4">Diners</th>
                <th className="py-3 px-4">Visits / Sessions</th>
                <th className="py-3 px-4">Orders</th>
                <th className="py-3 px-4">Revenue</th>
                <th className="py-3 px-4">Avg Spend</th>
                <th className="py-3 px-4">Calls / Bills</th>
                <th className="py-3 px-4 text-right">Drill-down</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 text-xs">
                    <div className="max-w-xs mx-auto space-y-1">
                      <p className="font-semibold text-slate-600">No activity recorded for this period</p>
                      <p className="text-[11px] text-slate-400">
                        When guests scan this table QR or dine, day-wise analytics will populate here automatically.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item, idx) => (
                  <tr key={`${item.date}_${item.tableNumber}_${idx}`} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {item.displayDate || item.date}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-bold bg-amber-50 text-amber-800 border border-amber-200 text-[11px]">
                        T-{item.tableNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">{item.qrScans}</td>
                    <td className="py-3 px-4">{item.totalPeople}</td>
                    <td className="py-3 px-4">{item.visits}</td>
                    <td className="py-3 px-4 font-mono">{item.orders}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      ₹{(item.revenue || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      ₹{(item.averageSpend || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-500">
                      {item.captainCalls || 0} calls • {item.billRequests || 0} bills
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedDayLog(item)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px] rounded-lg transition inline-flex items-center space-x-1"
                      >
                        <span>Drill-down</span>
                        <ChevronRight className="w-3 h-3 text-slate-500" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRILL-DOWN MODAL (Section 16) */}
      {selectedDayLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm shadow-sm">
                  T-{selectedDayLog.tableNumber}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Table #{selectedDayLog.tableNumber} Session Audit
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedDayLog.displayDate || selectedDayLog.date} • {activeRestaurant.name}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDayLog(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Day Overview Metrics */}
              <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">QR Scans</div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">{selectedDayLog.qrScans}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Total Diners</div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">{selectedDayLog.totalPeople}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Orders</div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">{selectedDayLog.orders}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Total Revenue</div>
                  <div className="text-lg font-bold text-emerald-700 mt-0.5">₹{selectedDayLog.revenue}</div>
                </div>
              </div>

              {/* Sessions Timeline */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <span>Individual Dining Sessions & Tabs ({selectedDayLog.sessions?.length || 0})</span>
                </h4>

                {(!selectedDayLog.sessions || selectedDayLog.sessions.length === 0) ? (
                  <div className="p-6 bg-slate-50 rounded-2xl text-center text-slate-400 text-xs border border-slate-200">
                    Detailed session breakdown was not logged for this historical summary entry.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDayLog.sessions.map((sess) => (
                      <div
                        key={sess.id}
                        className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 hover:border-slate-300 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 text-xs">{sess.hostName}</span>
                            <span className="text-[11px] text-slate-500">({sess.hostPhone})</span>
                            <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                              {sess.guestCount} Diners
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-[11px] text-slate-500 font-mono">
                              {sess.startTime} {sess.endTime ? `– ${sess.endTime}` : '(Active)'}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                sess.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : sess.status === 'cleared'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {sess.status}
                            </span>
                          </div>
                        </div>

                        {/* Dishes Ordered in this session */}
                        {sess.dishesOrdered && sess.dishesOrdered.length > 0 && (
                          <div className="pt-2 border-t border-slate-200">
                            <div className="text-[11px] font-bold text-slate-600 mb-1">Dishes Plated:</div>
                            <div className="flex flex-wrap gap-1.5">
                              {sess.dishesOrdered.map((dish, dIdx) => (
                                <span
                                  key={dIdx}
                                  className="bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-[10px] font-medium text-slate-700"
                                >
                                  {dish.quantity}x {dish.name} (₹{dish.price * dish.quantity})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px]">
                          <span className="text-slate-500">
                            Calls: {sess.captainCallsCount || 0} • Bill Requested: {sess.billRequested ? 'Yes' : 'No'}
                          </span>
                          <span className="font-bold text-slate-900 font-mono">
                            Tab Total: ₹{sess.totalSpend} ({sess.paymentMethod || 'Paid'})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedDayLog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
