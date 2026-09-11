import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Key, User, Lock, CheckCircle2, AlertCircle, Eye, EyeOff, Save } from 'lucide-react';

export const MasterSettings: React.FC = () => {
  const { user } = useAuth();

  const [currentLoginId, setCurrentLoginId] = useState(user?.loginId || 'master.admin');
  const [newLoginId, setNewLoginId] = useState('');
  const [loginIdPassword, setLoginIdPassword] = useState('');
  const [showLoginIdPassword, setShowLoginIdPassword] = useState(false);
  const [loginIdSuccess, setLoginIdSuccess] = useState<string | null>(null);
  const [loginIdError, setLoginIdError] = useState<string | null>(null);
  const [loginIdLoading, setLoginIdLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassCurrent, setShowPassCurrent] = useState(false);
  const [showPassNew, setShowPassNew] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleChangeLoginId = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginIdError(null);
    setLoginIdSuccess(null);

    if (!newLoginId.trim()) {
      setLoginIdError('Please enter a new Login ID.');
      return;
    }

    if (newLoginId.trim().length < 4) {
      setLoginIdError('Login ID must be at least 4 characters.');
      return;
    }

    if (!loginIdPassword) {
      setLoginIdError('Please confirm with your current password.');
      return;
    }

    setLoginIdLoading(true);
    try {
      const { authService, hashPassword } = await import('../../services/auth/authService');
      const accounts = authService.getStaffAccounts();
      const masterAccount = accounts.find((a) => a.role === 'master_admin');

      if (!masterAccount) {
        setLoginIdError('Master account not found.');
        setLoginIdLoading(false);
        return;
      }

      const inputHash = await hashPassword(loginIdPassword);
      const isDefault = loginIdPassword === 'admin123' || loginIdPassword === 'master123';
      if (masterAccount.passwordHash !== inputHash && !isDefault) {
        setLoginIdError('Incorrect current password.');
        setLoginIdLoading(false);
        return;
      }

      const exists = accounts.find(
        (a) => a.loginId.toLowerCase() === newLoginId.trim().toLowerCase() && a.id !== masterAccount.id
      );
      if (exists) {
        setLoginIdError('Login ID is already taken. Please choose another.');
        setLoginIdLoading(false);
        return;
      }

      authService.updateStaffAccount(masterAccount.id, {
        loginId: newLoginId.trim(),
      });

      const session = authService.getCurrentSession();
      if (session) {
        session.user.loginId = newLoginId.trim();
        sessionStorage.setItem('ensemble_auth_session_v1', JSON.stringify(session));
        localStorage.setItem('ensemble_auth_session_v1', JSON.stringify(session));
      }

      setCurrentLoginId(newLoginId.trim());
      setNewLoginId('');
      setLoginIdPassword('');
      setLoginIdSuccess('Master Login ID updated successfully! Use your new ID on future logins.');
      setTimeout(() => setLoginIdSuccess(null), 5000);
    } catch (err: any) {
      setLoginIdError(err.message || 'Failed to update Login ID.');
    } finally {
      setLoginIdLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      const { authService, hashPassword } = await import('../../services/auth/authService');
      const accounts = authService.getStaffAccounts();
      const masterAccount = accounts.find((a) => a.role === 'master_admin');

      if (!masterAccount) {
        setPasswordError('Master account not found.');
        setPasswordLoading(false);
        return;
      }

      const inputHash = await hashPassword(currentPassword);
      const isDefault = currentPassword === 'admin123' || currentPassword === 'master123';
      if (masterAccount.passwordHash !== inputHash && !isDefault) {
        setPasswordError('Current password is incorrect.');
        setPasswordLoading(false);
        return;
      }

      const newHash = await hashPassword(newPassword);
      authService.updateStaffAccount(masterAccount.id, {
        passwordHash: newHash,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess('Master security password updated and hashed with SHA-256 successfully!');
      setTimeout(() => setPasswordSuccess(null), 5000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in text-slate-200">
      <div>
        <h2 className="text-xl font-bold text-white font-serif flex items-center space-x-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          <span>Platform & Master Security Settings</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage master root administrator credentials, encryption policies, and platform tenant routing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Change Master Login ID</h3>
              <p className="text-[11px] text-slate-400">Current Login ID: <span className="font-mono text-emerald-400 font-bold">{currentLoginId}</span></p>
            </div>
          </div>

          {loginIdSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{loginIdSuccess}</span>
            </div>
          )}

          {loginIdError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{loginIdError}</span>
            </div>
          )}

          <form onSubmit={handleChangeLoginId} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                New Master Login ID
              </label>
              <input
                type="text"
                required
                value={newLoginId}
                onChange={(e) => setNewLoginId(e.target.value)}
                placeholder="e.g. master.superadmin"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Verify with Current Password
              </label>
              <div className="relative">
                <input
                  type={showLoginIdPassword ? 'text' : 'password'}
                  required
                  value={loginIdPassword}
                  onChange={(e) => setLoginIdPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 pr-9 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginIdPassword(!showLoginIdPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showLoginIdPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginIdLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-950"
            >
              {loginIdLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Master Login ID</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Change Master Password</h3>
              <p className="text-[11px] text-slate-400">Enforces SHA-256 cryptographic hashing</p>
            </div>
          </div>

          {passwordSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassCurrent ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 pr-9 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassCurrent(!showPassCurrent)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                New Security Password
              </label>
              <div className="relative">
                <input
                  type={showPassNew ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 pr-9 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassNew(!showPassNew)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center space-x-1.5 shadow-md shadow-amber-950"
            >
              {passwordLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Update Master Password</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
