import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Lock, User, ArrowRight, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export const CaptainLogin: React.FC<{
  onNavigate: (path: string) => void;
  restaurantSlug?: string;
  restaurantName?: string;
}> = ({ onNavigate, restaurantSlug, restaurantName }) => {
  const { login } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId || !password) {
      setError('Please enter your Captain Login ID and password.');
      return;
    }

    setError(null);
    setLoading(true);
    // Specifically require captain role and bind to restaurantSlug if present
    const res = await login(loginId, password, 'captain', restaurantSlug);
    setLoading(false);

    if (res.success) {
      onNavigate(restaurantSlug ? `/${restaurantSlug}/captain` : '/captain');
    } else {
      setError(res.error || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-8 font-sans">
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 font-black text-2xl shadow-xl shadow-amber-500/20 mb-3">
            <Bell className="w-7 h-7 text-slate-950" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white font-serif">
            {restaurantName || 'ENSEMBLE'}
          </h1>
          <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-500/20 text-[11px] font-mono font-bold text-amber-400 mt-1">
            <span>{restaurantName ? `${restaurantName.toUpperCase()} CAPTAIN FLOOR` : 'CAPTAIN FLOOR TERMINAL'}</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {restaurantName
              ? `Service terminal for dining floor captains at ${restaurantName}.`
              : 'Quick-access service station for dining room captains.'}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Captain Login ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="captain1"
                  autoComplete="username"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Captain Password / Passcode
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-950/40 flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <>
                  <span>Unlock Captain Floor</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-5 text-center text-xs text-slate-500">
          <span>Dedicated service terminal for authorized dining captains.</span>
        </div>
      </div>
    </div>
  );
};
