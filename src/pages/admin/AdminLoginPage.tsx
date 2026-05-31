import React, { useState } from 'react';
import { useAppState } from '../../context/StateContext';
import { KeyRound, ShieldAlert, Mail, Lock, Sparkles } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { adminLogin } = useAppState();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a correct corporate admin email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Admin password must exceed 6 symbols.');
      return;
    }

    try {
      setIsSubmitting(true);
      await adminLogin(email.trim(), password);
    } catch (err) {
      setErrorMsg('Unauthorized credentials. Use baldeshruthi17@gmail.com / admin123');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-6">
      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl space-y-6 text-left">
        
        {/* Core title labels */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center mx-auto border border-yellow-200">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="font-display font-black text-xl text-gray-900 tracking-tight">Admin Gate Entry</h2>
          <p className="text-xs text-slate-500">Authorized personnel only. Secure console routing is monitoring.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-500">Security Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="e.g., manager@jangaonmart.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 bg-slate-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-500">Admin Staff Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 bg-slate-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-800 text-[11px] leading-relaxed">
              <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow transition select-none cursor-pointer ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Authenticating Tunnel...' : 'Decrypt & Sign In'}
          </button>
        </form>

        {/* Demo Preset auto-fillers */}
        <div className="border-t border-slate-100 pt-4 text-center">
          <div className="bg-yellow-50/50 border border-yellow-105 p-3.5 rounded-2xl text-[11px] text-yellow-800 leading-normal flex items-start gap-2">
            <Sparkles className="w-4.5 h-4.5 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Super-Admin Access Credentials:</p>
              <p className="mt-1">
                Email: <button onClick={() => setEmail('baldeshruthi17@gmail.com')} className="underline font-bold text-slate-850">baldeshruthi17@gmail.com</button>
                <br />
                Password: <button onClick={() => setPassword('admin123')} className="underline font-bold text-slate-850">admin123</button>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
