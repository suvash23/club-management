import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { ShieldCheck, User as UserIcon, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [resetTokenInfo, setResetTokenInfo] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiClient.post('/auth/login', { email, password });
      login(res.data.accessToken, res.data.user);
      if (res.data.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/member/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (role: 'admin' | 'member') => {
    setError('');
    if (role === 'admin') {
      setEmail('admin@club.com');
      setPassword('admin123');
    } else {
      setEmail('member@club.com');
      setPassword('member123');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg('');
    try {
      const res = await apiClient.post('/auth/forgot-password', { email: forgotEmail });
      setForgotMsg(res.data.message || 'Reset instructions sent.');
      if (res.data.resetToken) {
        setResetTokenInfo(`For testing/demo: Reset Token is "${res.data.resetToken}"`);
      }
    } catch (err: any) {
      setForgotMsg('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-sky-600 to-indigo-700 p-8 text-white text-center">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md items-center justify-center mb-3 shadow-inner">
            <span className="text-3xl font-black">C</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Club Management</h2>
          <p className="text-sky-100 text-sm mt-1">Sign in to your member or admin account</p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {/* Quick Demo Access Pills */}
          <div className="mb-6 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
              Quick Demo Fill:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 transition"
              >
                <ShieldCheck className="w-4 h-4 text-sky-600" /> Admin Demo
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('member')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
              >
                <UserIcon className="w-4 h-4 text-emerald-600" /> Member Demo
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2 p-3.5 text-sm bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModal(true)}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-lg shadow-sky-600/20 transition disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModal}
        onClose={() => {
          setForgotModal(false);
          setForgotMsg('');
          setResetTokenInfo('');
        }}
        title="Reset Password"
      >
        <form onSubmit={handleForgotSubmit} className="space-y-4">
          <p className="text-sm text-slate-600">
            Enter your registered club email address. We will generate instructions to reset your password.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="member@club.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>

          {forgotMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <p>{forgotMsg}</p>
                {resetTokenInfo && <p className="mt-1 font-mono font-bold">{resetTokenInfo}</p>}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setForgotModal(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-bold bg-sky-600 hover:bg-sky-700 text-white"
            >
              Submit Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
