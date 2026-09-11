import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';
import { Restaurant } from '../../types/tenant';
import { StaffAccount, UserRole } from '../../services/auth/authTypes';
import {
  UtensilsCrossed,
  Search,
  Plus,
  ExternalLink,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  QrCode,
  Users,
  Star,
  Gift,
  Key,
  Edit2,
  X,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
} from 'lucide-react';

export const RestaurantsList: React.FC<{ onOpenOnboard: () => void }> = ({ onOpenOnboard }) => {
  const {
    restaurants,
    toggleRestaurantStatus,
  } = useTenant();

  const {
    getStaffForRestaurant,
    createStaffAccount,
    toggleStaffStatus,
    resetStaffPassword,
    updateStaffAccount,
  } = useAuth();

  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Master Staff & Access Modal State
  const [staffModalRestaurant, setStaffModalRestaurant] = useState<Restaurant | null>(null);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState<StaffAccount | null>(null);
  const [showEditModal, setShowEditModal] = useState<StaffAccount | null>(null);

  // New Staff form
  const [newName, setNewName] = useState('');
  const [newLoginId, setNewLoginId] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('owner');
  const [newPhone, setNewPhone] = useState('');
  const [showNewPasswordInput, setShowNewPasswordInput] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Reset password state
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [showResetPassInput, setShowResetPassInput] = useState(false);

  // Edit staff state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('captain');

  const filteredRestaurants = restaurants.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.slug.toLowerCase().includes(search.toLowerCase()) ||
      r.city.toLowerCase().includes(search.toLowerCase());

    const matchesPlan = filterPlan === 'All' || r.plan === filterPlan;
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffModalRestaurant || !newName || !newLoginId || !newPassword) {
      setFormError('Please fill in Name, Login ID, and Password.');
      return;
    }

    setFormError(null);
    const res = await createStaffAccount({
      name: newName,
      loginId: newLoginId.trim(),
      email: newEmail.trim() || `${newLoginId.trim()}@${staffModalRestaurant.slug}.com`,
      password: newPassword,
      role: newRole,
      restaurantId: staffModalRestaurant.id,
      restaurantName: staffModalRestaurant.name,
      restaurantSlug: staffModalRestaurant.slug,
      phone: newPhone,
    });

    if (res.success) {
      setShowAddStaffModal(false);
      setNewName('');
      setNewLoginId('');
      setNewEmail('');
      setNewPassword('');
      setNewPhone('');
    } else {
      setFormError(res.error || 'Failed to create staff account.');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showResetModal || !resetPasswordVal) return;
    await resetStaffPassword(showResetModal.id, resetPasswordVal);
    setShowResetModal(null);
    setResetPasswordVal('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;
    updateStaffAccount(showEditModal.id, {
      name: editName,
      email: editEmail,
      phone: editPhone,
      role: editRole,
    });
    setShowEditModal(null);
  };

  const restaurantStaff = staffModalRestaurant
    ? getStaffForRestaurant(staffModalRestaurant.id)
    : [];

  return (
    <div className="space-y-6 animate-fade-in text-slate-200 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white font-serif">
            All Registered Restaurant Tenants
          </h2>
          <p className="text-xs text-slate-400">
            Full directory of subscribed restaurant accounts, plans, staff access, and traffic metrics.
          </p>
        </div>

        <button
          onClick={onOpenOnboard}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Restaurant</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by restaurant name, slug, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 text-xs">
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="bg-slate-900 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All Plans</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Growth">Growth</option>
            <option value="Starter">Starter</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Restaurant</th>
                <th className="py-3 px-4">Domain / Slug</th>
                <th className="py-3 px-4">Plan & MRR</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Tables</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRestaurants.map((rest) => (
                <tr key={rest.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm"
                        style={{ backgroundColor: rest.branding?.primaryColor || '#10b981' }}
                      >
                        {rest.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">
                          {rest.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {rest.city} • {rest.cuisine}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-emerald-400">
                    {rest.slug}.ensemble.com
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {rest.plan}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      ₹{(rest.mrr || 14999).toLocaleString()} / mo
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => toggleRestaurantStatus(rest.id)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                        rest.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {rest.status}
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-center font-bold text-slate-300">
                    {rest.tablesCount} Tables
                  </td>

                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                    {rest.createdAt}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => window.open(`/${rest.slug}/t/1`, '_blank')}
                        className="py-1 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 text-[11px] font-semibold flex items-center space-x-1 transition border border-slate-700"
                        title="View Public Customer Experience"
                      >
                        <span>Guest View</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => setStaffModalRestaurant(rest)}
                        className="py-1 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold flex items-center space-x-1 transition shadow-sm"
                        title="Manage Restaurant Staff Accounts"
                      >
                        <Shield className="w-3 h-3" />
                        <span>Staff & Access</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff & Access Modal (Requirement 6) */}
      {staffModalRestaurant && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/70">
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white"
                  style={{ backgroundColor: staffModalRestaurant.branding?.primaryColor || '#d97706' }}
                >
                  {staffModalRestaurant.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Staff & Access Control — {staffModalRestaurant.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Manage Owner, Manager, and Captain accounts for this tenant partition.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setFormError(null);
                    setNewRole('captain');
                    setShowAddStaffModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Add Staff</span>
                </button>

                <button
                  onClick={() => setStaffModalRestaurant(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Staff List Table */}
            <div className="flex-1 p-5 overflow-y-auto">
              {restaurantStaff.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">No staff accounts registered for {staffModalRestaurant.name}.</p>
                  <p className="text-xs mt-1">Click "+ Add Staff" above to create an Owner, Manager, or Captain account.</p>
                </div>
              ) : (
                <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Staff Member</th>
                        <th className="px-4 py-3">Login ID</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Last Login</th>
                        <th className="px-4 py-3">Created</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {restaurantStaff.map((staff) => (
                        <tr key={staff.id} className="hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3">
                            <div className="font-bold text-white">{staff.name}</div>
                            <div className="text-[11px] text-slate-400">{staff.email}</div>
                          </td>
                          <td className="px-4 py-3 font-mono text-amber-400">
                            {staff.loginId}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                staff.role === 'owner'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : staff.role === 'manager'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {staff.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {staff.status === 'active' ? (
                              <span className="inline-flex items-center space-x-1 text-emerald-400 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Active</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 text-rose-400 font-medium">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Disabled</span>
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-[11px]">
                            {staff.lastLoginAt ? (
                              new Date(staff.lastLoginAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                month: 'short',
                                day: 'numeric',
                              })
                            ) : (
                              <span className="text-slate-600 italic">Never</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-[11px]">
                            {new Date(staff.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex items-center space-x-1.5">
                              <button
                                onClick={() => {
                                  setEditName(staff.name);
                                  setEditEmail(staff.email);
                                  setEditPhone(staff.phone || '');
                                  setEditRole(staff.role);
                                  setShowEditModal(staff);
                                }}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setResetPasswordVal('');
                                  setShowResetModal(staff);
                                }}
                                className="px-2 py-1 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800/50 text-amber-300 rounded text-[11px] transition"
                              >
                                Reset Pass
                              </button>
                              <button
                                onClick={() =>
                                  toggleStaffStatus(
                                    staff.id,
                                    staff.status === 'active' ? 'disabled' : 'active'
                                  )
                                }
                                className={`px-2 py-1 rounded text-[11px] transition ${
                                  staff.status === 'active'
                                    ? 'bg-rose-950/40 text-rose-400 hover:bg-rose-900/50 border border-rose-800/40'
                                    : 'bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/50 border border-emerald-800/40'
                                }`}
                              >
                                {staff.status === 'active' ? 'Disable' : 'Enable'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaffModal && staffModalRestaurant && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddStaffModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white mb-1">
              Create Staff Account for {staffModalRestaurant.name}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Password will be securely hashed with SHA-256 upon creation.
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                >
                  <option value="owner">OWNER (Full Restaurant Admin)</option>
                  <option value="manager">MANAGER (Operations Admin)</option>
                  <option value="captain">CAPTAIN (Floor Service Only)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Staff member name"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Login ID *</label>
                <input
                  type="text"
                  value={newLoginId}
                  onChange={(e) => setNewLoginId(e.target.value)}
                  placeholder={`${staffModalRestaurant.slug}.${newRole}`}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Password *</label>
                <div className="relative">
                  <input
                    type={showNewPasswordInput ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2 pr-9 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPasswordInput(!showNewPasswordInput)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showNewPasswordInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder={`staff@${staffModalRestaurant.slug}.com`}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-3.5 py-1.5 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
            <button
              onClick={() => setShowResetModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 mb-3">
              <Key className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Reset Password for {showResetModal.name}</h3>
            </div>
            <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showResetPassInput ? 'text' : 'password'}
                    value={resetPasswordVal}
                    onChange={(e) => setResetPasswordVal(e.target.value)}
                    placeholder="Enter new password"
                    required
                    className="w-full px-3 py-2 pr-9 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassInput(!showResetPassInput)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showResetPassInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(null)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowEditModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 mb-3">
              <Edit2 className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Edit Staff Details: {showEditModal.name}</h3>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                >
                  <option value="owner">OWNER</option>
                  <option value="manager">MANAGER</option>
                  <option value="captain">CAPTAIN</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(null)}
                  className="px-3.5 py-1.5 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
