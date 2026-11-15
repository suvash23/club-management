import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { Badge } from '../../components/common/Badge';
import { Award, CheckCircle2, Calendar, Clock, DollarSign, Shield } from 'lucide-react';

export const MemberPlanPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [renewing, setRenewing] = useState<string | null>(null);
  const [renewSuccess, setRenewSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashRes, plansRes] = await Promise.all([
        apiClient.get('/dashboard/member'),
        apiClient.get('/plans?onlyActive=true'),
      ]);
      setDashboardData(dashRes.data);
      setPlans(plansRes.data || []);
    } catch (err) {
      console.error('Failed to load plan details');
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (planId: string, planName: string) => {
    if (!window.confirm(`Confirm renewing / switching to "${planName}"?`)) return;
    setRenewing(planId);
    setRenewSuccess('');
    try {
      const res = await apiClient.post('/members/renew', {
        planId,
        paymentMethod: 'ONLINE',
      });
      setRenewSuccess(`Successfully subscribed to ${planName}! Invoice: ${res.data.payment.invoiceNumber}`);
      await loadData();
      setTimeout(() => setRenewSuccess(''), 5000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to renew plan');
    } finally {
      setRenewing(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  const currentSub = dashboardData?.currentSubscription;
  const currentPlan = currentSub?.plan;
  const daysRemaining = dashboardData?.daysRemaining || 0;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          My Membership Plan
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your current active subscription, expiration date, and available membership tiers.
        </p>
      </div>

      {renewSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-sm font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          {renewSuccess}
        </div>
      )}

      {/* Current Active Plan Card */}
      <div className="bg-gradient-to-r from-sky-900 to-indigo-900 rounded-3xl p-6 md:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
                {currentSub?.status || 'ACTIVE'}
              </span>
              <span className="text-sky-200 text-xs font-medium">
                Expires: {currentSub ? new Date(currentSub.endDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <h2 className="text-3xl font-black mt-3">
              {currentPlan?.name || 'No Active Plan'}
            </h2>
            <p className="text-sky-100 text-sm mt-2 max-w-xl">
              {currentPlan?.description || 'Please contact club management to select a membership tier.'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center min-w-[200px]">
            <p className="text-xs uppercase tracking-wider font-bold text-sky-200">
              Validity Remaining
            </p>
            <p className="text-4xl font-black mt-1">{daysRemaining}</p>
            <p className="text-xs text-sky-200 mt-0.5">Days remaining until renewal</p>
          </div>
        </div>

        {currentPlan?.features && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-200 mb-3">
              Your Membership Privileges:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {currentPlan.features.split(',').map((feat: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-sky-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{feat.trim()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Available Club Tiers Grid */}
      <div>
        <h3 className="font-extrabold text-slate-900 text-xl mb-4">All Club Membership Tiers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const isCurrent = currentPlan?.id === p.id;
            const features = p.features ? p.features.split(',').map((f: string) => f.trim()) : [];

            return (
              <div
                key={p.id}
                className={`bg-white rounded-3xl p-6 border transition flex flex-col justify-between ${
                  isCurrent
                    ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-md'
                    : 'border-slate-200 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-lg text-slate-900">{p.name}</h4>
                    {isCurrent && (
                      <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold">
                        Current
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mt-2 min-h-[32px]">{p.description}</p>

                  <div className="mt-4 pb-4 border-b border-slate-100 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">${p.price}</span>
                    <span className="text-xs font-medium text-slate-400">
                      / {p.durationInDays} days
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    {features.map((f: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleRenew(p.id, p.name)}
                    disabled={renewing === p.id}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition ${
                      isCurrent
                        ? 'bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 shadow-sm'
                        : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm'
                    } disabled:opacity-50`}
                  >
                    {renewing === p.id
                      ? 'Processing...'
                      : isCurrent
                      ? 'Renew Current Tier'
                      : 'Switch & Subscribe'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
