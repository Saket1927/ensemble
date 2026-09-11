import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import {
  Users,
  UserPlus,
  Shield,
  Key,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  UserX,
  Edit2,
  X,
  Table,
} from 'lucide-react';
import { StaffAccount } from '../../services/auth/authTypes';

export const StaffTab: React.FC = () => {
  const { user, getStaffForRestaurant, createStaffAccount, toggleStaffStatus, resetStaffPassword, updateStaffAccount } = useAuth();
  const { activeRestaurant, activeTables } = useTenant();

  const [activeSubTab, setActiveSubTab] = useState<'captains' | 'all'>('captains');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState<StaffAccount | null>(null);
  const [showEditModal, setShowEditModal] = useState<StaffAccount | null>(null);

  // Add Captain form state
  const [fullName, setFullName] = useState('');
  const [loginId, setLoginId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [assignedTables, setAssignedTables] = useState<number[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset password state
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Edit staff state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editTables, setEditTables] = useState<number[]>([]);

  // Get real staff accounts for active restaurant
  const staffList = getStaffForRestaurant(activeRestaurant.id);
  const captainList = staffList.filter((s) => s.role === 'captain');
  const displayList = activeSubTab === 'captains' ? captainList : staffList;

  const handleCreateCaptain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !loginId || !password) {
      setFormError('Please fill in Full Name, Login ID, and Password.');
      return;
    }

    setFormError(null);
    const res = await createStaffAccount({
      name: fullName,
      loginId: loginId.trim(),
      email: email.trim() || `${loginId.trim()}@${activeRestaurant.slug}.com`,
      password,
      role: 'captain',
      restaurantId: activeRestaurant.id,
      restaurantName: activeRestaurant.name,
      restaurantSlug: activeRestaurant.slug,
      phone,
      assignedTables,
    });

    if (res.success) {
      setSuccessMessage(`Captain "${fullName}" created successfully with Login ID: ${loginId}`);
      setShowAddModal(false);
      setFullName('');
      setLoginId('');
      setEmail('');
      setPassword('');
      setPhone('');
      setAssignedTables([]);
      setTimeout(() => setSuccessMessage(null), 5000);
    } else {
      setFormError(res.error || 'Failed to create Captain account.');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showResetModal || !newPassword) return;
    const ok = await resetStaffPassword(showResetModal.id, newPassword);
    if (ok) {
      setSuccessMessage(`Password updated for ${showResetModal.name}.`);
      setShowResetModal(null);
      setNewPassword('');
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;
    updateStaffAccount(showEditModal.id, {
      name: editName,
      email: editEmail,
      phone: editPhone,
      assignedTables: editTables,
    });
    setSuccessMessage(`Staff member ${editName} updated successfully.`);
    setShowEditModal(null);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const toggleTableSelection = (tableNum: number, currentList: number[], setList: (arr: number[]) => void) => {
    if (currentList.includes(tableNum)) {
      setList(currentList.filter((t) => t !== tableNum));
    } else {
      setList([...currentList, tableNum].sort((a, b) => a - b));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">
              Restaurant Staff & Service Captains
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage floor service captains, authentication credentials, and table assignments for {activeRestaurant.name}.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center space-x-2 transition shadow-md shadow-amber-500/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Captain</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('captains')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'captains'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Service Captains ({captainList.length})
        </button>
        <button
          onClick={() => setActiveSubTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'all'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All Staff ({staffList.length})
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        {displayList.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No captains added yet.</p>
            <p className="text-xs mt-1">Click "+ Add Captain" to create your first service captain account.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Captain / Staff</th>
                  <th className="px-4 py-3">Login ID</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Assigned Tables</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Login</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {displayList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3">
                      <div className="font-bold text-white">{staff.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span>{staff.email}</span>
                        {staff.phone && (
                          <>
                            <span>•</span>
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span>{staff.phone}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-amber-400">
                      {staff.loginId}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          staff.role === 'captain'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : staff.role === 'owner'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {staff.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {staff.assignedTables && staff.assignedTables.length > 0 ? (
                        <span className="text-[11px] text-slate-300">
                          {staff.assignedTables.length === activeTables.length
                            ? 'All Tables'
                            : `Tables: ${staff.assignedTables.join(', ')}`}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">All Tables</span>
                      )}
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
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditName(staff.name);
                            setEditEmail(staff.email);
                            setEditPhone(staff.phone || '');
                            setEditTables(staff.assignedTables || []);
                            setShowEditModal(staff);
                          }}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setNewPassword('');
                            setShowResetModal(staff);
                          }}
                          className="px-2 py-1 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800/50 text-amber-300 rounded text-[11px] transition"
                        >
                          Reset Pass
                        </button>
                        {staff.role !== 'owner' && (
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
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Captain Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Add Dining Floor Captain</h3>
                <p className="text-xs text-slate-400">
                  Assigned automatically to {activeRestaurant.name}.
                </p>
              </div>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCaptain} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Captain Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Captain Vikram Singh"
                  required
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Login ID * (for Captain Login)
                  </label>
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="captain1"
                    required
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password / Passcode *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-3.5 py-2 pr-9 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98200 11223"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address (optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="captain@heritage.com"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Assigned Tables (leave empty for All Tables)
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
                  {activeTables.map((t) => (
                    <button
                      type="button"
                      key={t.tableNumber}
                      onClick={() => toggleTableSelection(t.tableNumber, assignedTables, setAssignedTables)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                        assignedTables.includes(t.tableNumber)
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Table {t.tableNumber}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md"
                >
                  Save Captain Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
            <button
              onClick={() => setShowResetModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2.5 mb-4">
              <Key className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Reset Password for {showResetModal.name}</h3>
            </div>
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    className="w-full px-3.5 py-2 pr-9 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(null)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowEditModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2.5 mb-4">
              <Edit2 className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Edit Staff Details: {showEditModal.name}</h3>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Tables</label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
                  {activeTables.map((t) => (
                    <button
                      type="button"
                      key={t.tableNumber}
                      onClick={() => toggleTableSelection(t.tableNumber, editTables, setEditTables)}
                      className={`px-2 py-0.5 rounded text-xs font-medium transition ${
                        editTables.includes(t.tableNumber)
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      T{t.tableNumber}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(null)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
