import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { StaffAccount, UserRole } from '../../services/auth/authTypes';
import {
  Key,
  Shield,
  Search,
  Plus,
  Copy,
  CheckCircle2,
  Lock,
  User,
  UtensilsCrossed,
  Bell,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  Clock,
  Check,
} from 'lucide-react';

export const MasterCredentialsDirectory: React.FC = () => {
  const { getAllStaffAccounts, createStaffAccount, toggleStaffStatus, resetStaffPassword, updateStaffAccount } = useAuth();
  const { restaurants } = useTenant();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'owner_manager' | 'captain'>('all');
  const [restaurantFilter, setRestaurantFilter] = useState<string>('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffAccount | null>(null);

  // Add Staff State
  const [newName, setNewName] = useState('');
  const [newLoginId, setNewLoginId] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('captain');
  const [newRestaurantId, setNewRestaurantId] = useState<string>(restaurants[0]?.id || '');
  const [addError, setAddError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset Password State
  const [tempPassword, setTempPassword] = useState('');
  const [resetSuccessNotice, setResetSuccessNotice] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const staffAccounts = getAllStaffAccounts();

  // Filter accounts
  const filteredAccounts = staffAccounts.filter((acc) => {
    if (roleFilter === 'owner_manager' && acc.role !== 'owner' && acc.role !== 'manager') return false;
    if (roleFilter === 'captain' && acc.role !== 'captain') return false;
    if (restaurantFilter !== 'all' && acc.restaurantId !== restaurantFilter) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      acc.name.toLowerCase().includes(q) ||
      acc.loginId.toLowerCase().includes(q) ||
      acc.email.toLowerCase().includes(q) ||
      (acc.restaurantName && acc.restaurantName.toLowerCase().includes(q)) ||
      (acc.restaurantSlug && acc.restaurantSlug.toLowerCase().includes(q))
    );
  });

  const getPortalUrl = (acc: StaffAccount) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    if (acc.role === 'master_admin') return `${origin}/master/login`;
    if (acc.role === 'captain' && acc.restaurantSlug) return `${origin}/${acc.restaurantSlug}/captain/login`;
    return `${origin}/restaurant/login`;
  };

  const handleCopyUrl = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleOpenResetModal = (acc: StaffAccount) => {
    setSelectedStaff(acc);
    // Generate secure temporary random password
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#%';
    let gen = '';
    for (let i = 0; i < 10; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTempPassword(gen);
    setResetSuccessNotice(null);
    setShowResetModal(true);
  };

  const handleExecuteResetPassword = async () => {
    if (!selectedStaff || !tempPassword) return;
    const ok = await resetStaffPassword(selectedStaff.id, tempPassword);
    if (ok) {
      setResetSuccessNotice(`Password has been reset. Provide this single-use credential to ${selectedStaff.name}.`);
    }
  };

  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newLoginId || !newEmail || !newPassword) {
      setAddError('All fields marked with * are required.');
      return;
    }

    setAddError(null);
    setIsSubmitting(true);

    const matchedRest = restaurants.find((r) => r.id === newRestaurantId);
    const res = await createStaffAccount({
      name: newName.trim(),
      loginId: newLoginId.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim() || undefined,
      password: newPassword,
      role: newRole,
      restaurantId: newRole === 'master_admin' ? undefined : matchedRest?.id,
      restaurantName: newRole === 'master_admin' ? undefined : matchedRest?.name,
      restaurantSlug: newRole === 'master_admin' ? undefined : matchedRest?.slug,
      status: 'active',
    });

    setIsSubmitting(false);

    if (res.success) {
      setShowAddModal(false);
      setNewName('');
      setNewLoginId('');
      setNewEmail('');
      setNewPhone('');
      setNewPassword('');
    } else {
      setAddError(res.error || 'Failed to create staff account');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Stats */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Access & Credentials Directory</h2>
              <p className="text-xs text-slate-400">
                Centralized credential management across all restaurants. Plaintext passwords are never displayed.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setAddError(null);
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center space-x-2 shrink-0 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Access / Captain</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, login ID, restaurant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                roleFilter === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Roles ({staffAccounts.length})
            </button>
            <button
              onClick={() => setRoleFilter('owner_manager')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                roleFilter === 'owner_manager' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Owners & Mgrs
            </button>
            <button
              onClick={() => setRoleFilter('captain')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                roleFilter === 'captain' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Captains
            </button>
          </div>

          {/* Restaurant Filter */}
          <select
            value={restaurantFilter}
            onChange={(e) => setRestaurantFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Restaurants</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.slug})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff Accounts Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Role & Restaurant</th>
                <th className="py-3 px-4">Login ID / Username</th>
                <th className="py-3 px-4">Portal URL</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-300">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    No staff accounts match your current filters.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => {
                  const portalUrl = getPortalUrl(acc);
                  const isMaster = acc.role === 'master_admin';
                  const isCaptain = acc.role === 'captain';

                  return (
                    <tr key={acc.id} className="hover:bg-slate-900/40 transition">
                      {/* Staff Member */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isMaster
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : isCaptain
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                            }`}
                          >
                            {isMaster ? 'M' : isCaptain ? 'C' : 'O'}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs">{acc.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{acc.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Restaurant */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col space-y-0.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider w-max ${
                              isMaster
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                                : isCaptain
                                ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                                : 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'
                            }`}
                          >
                            {acc.role.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {acc.restaurantName || (isMaster ? 'Global Platform' : 'General')}
                          </span>
                        </div>
                      </td>

                      {/* Login ID */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs text-amber-300 bg-slate-900 px-2 py-1 rounded border border-slate-800 w-max">
                          {acc.loginId}
                        </div>
                      </td>

                      {/* Portal URL */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono text-[10px] text-slate-400 truncate max-w-[150px]">
                            {portalUrl.replace(/^https?:\/\/[^/]+/, '')}
                          </span>
                          <button
                            onClick={() => handleCopyUrl(portalUrl, `url_${acc.id}`)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
                            title="Copy Portal URL"
                          >
                            {copiedKey === `url_${acc.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => toggleStaffStatus(acc.id, acc.status === 'active' ? 'disabled' : 'active')}
                          disabled={isMaster}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition ${
                            acc.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-rose-500/10 hover:text-rose-400'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-emerald-500/10 hover:text-emerald-400'
                          } ${isMaster ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                          title={isMaster ? 'Cannot disable Master account' : 'Click to toggle status'}
                        >
                          {acc.status}
                        </button>
                      </td>

                      {/* Last Login */}
                      <td className="py-3.5 px-4 text-[11px] text-slate-400">
                        {acc.lastLoginAt ? new Date(acc.lastLoginAt).toLocaleDateString() : 'Never'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenResetModal(acc)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-[11px] font-bold rounded-lg border border-slate-700 transition"
                          >
                            Reset Password
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Provision New Access / Captain */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Provision Restaurant Staff Access</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {addError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddStaffSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Restaurant *</label>
                <select
                  value={newRestaurantId}
                  onChange={(e) => {
                    setNewRestaurantId(e.target.value);
                    const sel = restaurants.find((r) => r.id === e.target.value);
                    if (sel && newRole === 'captain') {
                      setNewLoginId(`captain.${sel.slug}`);
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Role *</label>
                <select
                  value={newRole}
                  onChange={(e) => {
                    const r = e.target.value as UserRole;
                    setNewRole(r);
                    const sel = restaurants.find((x) => x.id === newRestaurantId);
                    if (sel) {
                      if (r === 'captain') setNewLoginId(`captain.${sel.slug}`);
                      else if (r === 'owner') setNewLoginId(`${sel.slug}.owner`);
                      else if (r === 'manager') setNewLoginId(`manager.${sel.slug}`);
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="captain">Service Captain (Floor Duty)</option>
                  <option value="manager">Restaurant Manager</option>
                  <option value="owner">Restaurant Owner</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Login ID / Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. captain.radha"
                    value={newLoginId}
                    onChange={(e) => setNewLoginId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono placeholder:text-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="staff@restaurant.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+91 98200 00000"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Initial Password *</label>
                  <input
                    type="text"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition"
                >
                  {isSubmitting ? 'Provisioning...' : 'Provision Staff Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Reset Password (Temporary Single-Use Password) */}
      {showResetModal && selectedStaff && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Reset Staff Password</h3>
              </div>
              <button onClick={() => setShowResetModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="text-white font-bold">{selectedStaff.name}</div>
              <div className="text-slate-400 font-mono">
                {selectedStaff.loginId} • {selectedStaff.role} ({selectedStaff.restaurantName || 'Global'})
              </div>
            </div>

            {resetSuccessNotice ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{resetSuccessNotice}</span>
                </div>

                <div className="bg-slate-900 border border-amber-500/40 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">
                      Single-Use Temporary Password:
                    </div>
                    <div className="font-mono text-sm font-bold text-white tracking-widest mt-0.5">
                      {tempPassword}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(tempPassword);
                      setCopiedKey('temp_pwd');
                      setTimeout(() => setCopiedKey(null), 2000);
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-1"
                  >
                    {copiedKey === 'temp_pwd' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'temp_pwd' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Security note: This password will not be stored in plaintext. Once this modal is closed, it cannot be recovered.
                </p>

                <button
                  onClick={() => setShowResetModal(false)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
                >
                  Close & Done
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <p className="text-slate-400 leading-relaxed">
                  Generate a temporary secure password or enter a new one. In accordance with zero-trust security standards, plaintext passwords are never displayed in dashboards.
                </p>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">New Temporary Password</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={tempPassword}
                      onChange={(e) => setTempPassword(e.target.value)}
                      className="w-full pl-3 pr-24 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#%';
                        let gen = '';
                        for (let i = 0; i < 10; i++) {
                          gen += chars.charAt(Math.floor(Math.random() * chars.length));
                        }
                        setTempPassword(gen);
                      }}
                      className="absolute right-2 top-1.5 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded font-semibold"
                    >
                      Generate New
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteResetPassword}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition"
                  >
                    Apply New Password
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
