import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import {
  Users,
  UserCheck,
  UserX,
  Award,
  DollarSign,
  Calendar,
  ArrowRight,
  PlusCircle,
  Clock,
  MapPin,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/dashboard/admin');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  const overview = data?.overview || {};
  const upcomingEvents = data?.upcomingEvents || [];
  const recentMembers = data?.recentMembers || [];
  const recentPayments = data?.recentPayments || [];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time club overview, membership health, payments, and upcoming activities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/members"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-xl shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" /> Add Member
          </Link>
          <Link
            to="/admin/events"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl shadow-sm transition"
          >
            <Calendar className="w-4 h-4 text-slate-500" /> New Event
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Members"
          value={overview.totalMembers ?? 0}
          icon={Users}
          color="indigo"
          subtitle="All registered"
        />
        <StatCard
          title="Active Members"
          value={overview.activeMembers ?? 0}
          icon={UserCheck}
          color="emerald"
          subtitle="In good standing"
        />
        <StatCard
          title="Expired Members"
          value={overview.expiredMembers ?? 0}
          icon={UserX}
          color="rose"
          subtitle="Needs renewal"
        />
        <StatCard
          title="Membership Plans"
          value={overview.totalPlans ?? 0}
          icon={Award}
          color="purple"
          subtitle="Active tiers"
        />
        <StatCard
          title="Total Payments"
          value={`$${Number(overview.totalPaymentsRevenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="blue"
          subtitle={`${overview.totalPaymentsCount ?? 0} transactions`}
        />
        <StatCard
          title="Upcoming Events"
          value={upcomingEvents.length}
          icon={Calendar}
          color="amber"
          subtitle="Next 30 days"
        />
      </div>

      {/* Main Content Sections: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Members (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Recent Members</h3>
                <p className="text-xs text-slate-500">Newly registered members and plan assignments</p>
              </div>
              <Link
                to="/admin/members"
                className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Member</th>
                    <th className="px-6 py-3">ID Code</th>
                    <th className="px-6 py-3">Active Plan</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Join Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentMembers.map((m: any) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-600">
                          {m.avatarUrl ? (
                            <img src={m.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            m.firstName.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {m.firstName} {m.lastName}
                          </p>
                          <p className="text-xs text-slate-400">{m.user?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-600">
                        {m.memberCode}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                        {m.subscriptions?.[0]?.plan?.name || (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={m.status} />
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-slate-500 font-medium">
                        {new Date(m.joinDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {recentMembers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">
                        No member records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Payments Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Recent Payment Transactions</h3>
                <p className="text-xs text-slate-500">Latest subscriptions and dues collected</p>
              </div>
              <Link
                to="/admin/payments"
                className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Invoice</th>
                    <th className="px-6 py-3">Member</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Method</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentPayments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">
                        {p.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-900">
                        {p.member?.firstName} {p.member?.lastName}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        ${p.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                        {p.method}
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={p.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Events List */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-slate-900 text-lg">Upcoming Events</h3>
              <Link
                to="/admin/events"
                className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {upcomingEvents.map((evt: any) => (
                <div
                  key={evt.id}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">
                      {evt.title}
                    </h4>
                    <span className="shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800">
                      {evt.fee > 0 ? `$${evt.fee}` : 'Free'}
                    </span>
                  </div>

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

                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>
                      Registered: {evt._count?.registrations || 0} / {evt.maxAttendees}
                    </span>
                    <Badge status={evt.status} />
                  </div>
                </div>
              ))}

              {upcomingEvents.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No upcoming club events scheduled.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
