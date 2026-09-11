import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, User, ArrowRight, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export const MasterLogin: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId || !password) {
      setError('Please enter your Login ID and password.');
      return;
    }

    setError(null);
    setLoading(true);
    const res = await login(loginId, password, 'master_admin');
    setLoading(false);

    if (res.success) {
      onNavigate('/master');
    } else {
      setError(res.error || 'Authentication failed');
    }
  };

  const handleFillDemo = () => {
    setLoginId('master.admin');
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-[#0b1120] text-slate-100 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden font-sans">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-2xl shadow-xl shadow-emerald-500/20 mb-4">
            E
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-serif">ENSEMBLE</h1>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] font-mono text-emerald-400 mt-2">
            <Shield className="w-3.5 h-3.5" />
            <span>PLATFORM MASTER ADMIN</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Authorized platform administrators and system operators only.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-7 shadow-2xl shadow-slate-950/80">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start space-x-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Master Login ID / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="master.admin"
                  autoComplete="username"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/50 flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticate Master Session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] text-slate-400 hover:text-emerald-400 transition inline-flex items-center space-x-1 py-1 px-2.5 rounded-lg bg-slate-950/50 border border-slate-800"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>Autofill Master Demo Credentials (master.admin / admin123)</span>
            </button>
          </div>
        </div>

        {/* Portal Switcher Footer */}
        <div className="mt-6 text-center text-xs text-slate-500 flex justify-center items-center space-x-4">
          <button
            onClick={() => onNavigate('/restaurant/login')}
            className="hover:text-amber-400 transition"
          >
            Restaurant Admin Portal &rarr;
          </button>
          <span>•</span>
          <button
            onClick={() => onNavigate('/captain/login')}
            className="hover:text-amber-400 transition"
          >
            Captain Floor Terminal &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
