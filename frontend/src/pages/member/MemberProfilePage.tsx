import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  ShieldCheck,
  CheckCircle2,
  QrCode,
} from 'lucide-react';

export const MemberProfilePage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/auth/me');
      setProfile(res.data);
      if (res.data.memberProfile) {
        setForm({
          firstName: res.data.memberProfile.firstName || '',
          lastName: res.data.memberProfile.lastName || '',
          phone: res.data.memberProfile.phone || '',
          address: res.data.memberProfile.address || '',
        });
      }
    } catch (err) {
      console.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.memberProfile?.id) return;
    setSaving(true);
    setSavedMsg(false);
    try {
      await apiClient.put(`/members/${profile.memberProfile.id}`, form);
      await refreshProfile();
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  const member = profile?.memberProfile;
  const currentSub = member?.subscriptions?.[0];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          My Profile & Digital Membership Card
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your personal records and display your verified digital club credential.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Digital Card (1 column) */}
        <div>
          <h3 className="font-extrabold text-slate-900 text-lg mb-3">Digital Membership Pass</h3>
          <div className="relative rounded-3xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 text-white p-6 shadow-2xl border border-slate-700/50 overflow-hidden">
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl"></div>

            {/* Card Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center font-black text-sm">
                  C
                </div>
                <div>
                  <h4 className="font-black text-sm tracking-tight">ClubHub</h4>
                  <p className="text-[10px] text-sky-200">Official Membership Card</p>
                </div>
              </div>
              <Badge status={member?.status || 'ACTIVE'} />
            </div>

            {/* Member Photo & Name */}
            <div className="mt-8 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-white/20 overflow-hidden flex items-center justify-center text-xl font-bold shrink-0">
                {member?.avatarUrl ? (
                  <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  member?.firstName?.charAt(0)
                )}
              </div>
              <div>
                <p className="font-extrabold text-lg text-white">
                  {member?.firstName} {member?.lastName}
                </p>
                <p className="font-mono text-xs text-sky-300 tracking-wider">
                  {member?.memberCode}
                </p>
              </div>
            </div>

            {/* Card Footer Details */}
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-400">Membership Tier</p>
                <p className="font-bold text-white mt-0.5">{currentSub?.plan?.name || 'Standard'}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-wider text-slate-400">Joined</p>
                <p className="font-bold text-white mt-0.5">
                  {new Date(member?.joinDate || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-center gap-3">
            <QrCode className="w-8 h-8 text-sky-600 shrink-0" />
            <div>
              <p className="font-bold text-slate-800">Scan at Clubhouse Reception</p>
              <p className="text-slate-500">Present this digital pass for entrance and gym check-in.</p>
            </div>
          </div>
        </div>

        {/* Right: Profile Details Form (2 columns) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-lg mb-1">Personal Contact Details</h3>
            <p className="text-xs text-slate-500 mb-6">Update your telephone and contact mailing address</p>

            {savedMsg && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Profile details have been saved successfully!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 cursor-not-allowed"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Email address changes require administrator confirmation.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 555-0100"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Mailing Address
                </label>
                <textarea
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Street, City, Postal Code"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
