import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { BarChart3, Download, DollarSign, Users, TrendingUp, PieChart } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';

export const ReportsPage: React.FC = () => {
  const [financial, setFinancial] = useState<any>(null);
  const [membership, setMembership] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [finRes, memRes] = await Promise.all([
        apiClient.get('/reports/financial'),
        apiClient.get('/reports/membership'),
      ]);
      setFinancial(finRes.data);
      setMembership(memRes.data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'members' | 'payments') => {
    try {
      const response = await apiClient.get(`/reports/export/${type}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_export_${new Date().toISOString().substring(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert(`Failed to export ${type} report.`);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Financial revenue analysis, member retention, and data exports.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('members')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl shadow-sm transition"
          >
            <Download className="w-4 h-4 text-sky-600" /> Export Members CSV
          </button>
          <button
            onClick={() => handleExport('payments')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-xl shadow-sm transition"
          >
            <Download className="w-4 h-4" /> Export Payments CSV
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue Collected"
          value={`$${Number(financial?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="emerald"
          subtitle="All confirmed payments"
        />
        <StatCard
          title="Payment Transactions"
          value={financial?.totalTransactions || 0}
          icon={TrendingUp}
          color="blue"
          subtitle="Processed to date"
        />
        <StatCard
          title="Total Registered Members"
          value={membership?.totalMembers || 0}
          icon={Users}
          color="indigo"
          subtitle="In system registry"
        />
        <StatCard
          title="Active Members Share"
          value={`${membership?.totalMembers ? Math.round(((membership?.statusCounts?.ACTIVE || 0) / membership.totalMembers) * 100) : 0}%`}
          icon={PieChart}
          color="purple"
          subtitle={`${membership?.statusCounts?.ACTIVE || 0} currently active`}
        />
      </div>

      {/* Financial & Membership Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Methods Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <h3 className="font-extrabold text-slate-900 text-lg mb-1">Revenue by Payment Method</h3>
          <p className="text-xs text-slate-500 mb-6">Distribution across payment channels</p>

          <div className="space-y-4">
            {financial?.methodBreakdown?.map((item: any) => {
              const total = financial.totalRevenue || 1;
              const percent = Math.round((item.amount / total) * 100);
              return (
                <div key={item.method} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">{item.method}</span>
                    <span className="text-slate-900">
                      ${item.amount.toFixed(2)} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-sky-600 h-2.5 rounded-full"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Membership Status Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <h3 className="font-extrabold text-slate-900 text-lg mb-1">Membership Status Distribution</h3>
          <p className="text-xs text-slate-500 mb-6">Current member standing snapshot</p>

          <div className="space-y-4">
            {Object.entries(membership?.statusCounts || {}).map(([status, count]: [string, any]) => {
              const total = membership.totalMembers || 1;
              const percent = Math.round((count / total) * 100);
              const colorMap: Record<string, string> = {
                ACTIVE: 'bg-emerald-500',
                EXPIRED: 'bg-rose-500',
                INACTIVE: 'bg-slate-400',
              };

              return (
                <div key={status} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">{status}</span>
                    <span className="text-slate-900">
                      {count} Members ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`${colorMap[status] || 'bg-sky-600'} h-2.5 rounded-full`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
