import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import {
  Award,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MemberDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberDashboard();
  }, []);

  const fetchMemberDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/dashboard/member');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load member dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRegister = async (eventId: string) => {
    try {
      await apiClient.post(`/events/${eventId}/register`);
      fetchMemberDashboard();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to RSVP for event');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  const member = data?.member;
  const currentSub = data?.currentSubscription;
  const daysRemaining = data?.daysRemaining || 0;
  const upcomingEvents = data?.upcomingEvents || [];
  const enrolledEvents = data?.enrolledEvents || [];
  const recentPayments = data?.recentPayments || [];

  const isEnrolled = (eventId: string) => {
    return enrolledEvents.some((e: any) => e.eventId === eventId && e.status === 'REGISTERED');
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-lg shadow-sky-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-sky-100">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            Member Code: {member?.memberCode}
          </span>
          <h1 className="text-2xl md:text-3xl font-black mt-2">
            Welcome back, {member?.firstName}!
          </h1>
          <p className="text-sky-100 text-sm mt-1 max-w-xl">
            Here is your current club membership status, upcoming exclusive club activities, and payment history.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center md:min-w-[180px]">
          <p className="text-xs uppercase tracking-wider text-sky-200 font-bold">
            Membership Plan
          </p>
          <p className="text-xl font-black mt-1">
            {currentSub?.plan?.name || 'No Active Plan'}
          </p>
          <div className="mt-2 flex items-center justify-center gap-1 text-xs">
            <Clock className="w-3.5 h-3.5 text-sky-200" />
            <span>{daysRemaining} Days Remaining</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Membership Status"
          value={member?.status || 'ACTIVE'}
          subtitle={currentSub?.plan?.name || 'Standard Tier'}
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Days Until Renewal"
          value={`${daysRemaining} Days`}
          subtitle={
            currentSub?.endDate
              ? `Expires ${new Date(currentSub.endDate).toLocaleDateString()}`
              : 'N/A'
          }
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Club Events Enrolled"
          value={enrolledEvents.length}
          subtitle="Your upcoming RSVPs"
          icon={Calendar}
          color="purple"
        />
        <StatCard
          title="Payments Recorded"
          value={recentPayments.length}
          subtitle="Lifetime transactions"
          icon={CreditCard}
          color="indigo"
        />
      </div>

      {/* 2-Columns: Events & Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Upcoming Events */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-lg">Upcoming Club Events</h3>
            <Link
              to="/member/events"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              Browse All Events <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingEvents.map((evt: any) => {
              const registered = isEnrolled(evt.id);
              return (
                <div
                  key={evt.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {evt.fee > 0 ? `$${evt.fee}` : 'Free'}
                      </span>
                      {registered && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          RSVP'd ✓
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-900 text-base mt-2">
                      {evt.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {evt.description}
                    </p>

                    <div className="mt-3 space-y-1 text-xs text-slate-500">
                      <p className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(evt.startDateTime).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {evt.location}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    {registered ? (
                      <span className="w-full inline-block text-center py-2 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-xl">
                        Registered & Confirmed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleQuickRegister(evt.id)}
                        className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition"
                      >
                        1-Click RSVP Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Recent Payment Records */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-lg">Recent Receipts</h3>
            <Link
              to="/member/payments"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              View History <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-3">
            {recentPayments.map((p: any) => (
              <div
                key={p.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <p className="font-mono text-xs font-bold text-slate-800">
                    {p.invoiceNumber}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {new Date(p.paidAt).toLocaleDateString()} • {p.method}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 text-sm">
                    ${p.amount.toFixed(2)}
                  </p>
                  <Badge status={p.status} />
                </div>
              </div>
            ))}

            {recentPayments.length === 0 && (
              <p className="text-center py-6 text-xs text-slate-400">
                No past transactions recorded.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
