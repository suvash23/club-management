import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  Search,
  PlusCircle,
  Edit2,
  Trash2,
  Eye,
  Filter,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from 'lucide-react';
import { MemberProfile, MembershipPlan, MemberStatus } from '../../types';

export const MembersPage: React.FC = () => {
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  // Add Form State
  const [addForm, setAddForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    planId: '',
    status: 'ACTIVE' as MemberStatus,
  });

  // Edit Form State
  const [editForm, setEditForm] = useState({
    id: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    status: 'ACTIVE' as MemberStatus,
  });

  useEffect(() => {
    fetchMembers();
    fetchPlans();
  }, [statusFilter, page]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 6 };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await apiClient.get('/members', { params });
      setMembers(res.data.data || []);
      if (res.data.meta) {
        setTotalPages(res.data.meta.totalPages || 1);
        setTotalCount(res.data.meta.total || 0);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await apiClient.get('/plans?onlyActive=true');
      setPlans(res.data || []);
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMembers();
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/members', addForm);
      setIsAddOpen(false);
      setAddForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        planId: '',
        status: 'ACTIVE',
      });
      fetchMembers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create member');
    }
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.put(`/members/${editForm.id}`, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone,
        address: editForm.address,
        status: editForm.status,
      });
      setIsEditOpen(false);
      fetchMembers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update member');
    }
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete member "${name}"? This will permanently remove their user credentials and records.`)) {
      return;
    }
    try {
      await apiClient.delete(`/members/${id}`);
      fetchMembers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete member');
    }
  };

  const openView = async (id: string) => {
    try {
      const res = await apiClient.get(`/members/${id}`);
      setSelectedMember(res.data);
      setIsViewOpen(true);
    } catch (err) {
      console.error('Failed to load member details');
    }
  };

  const openEdit = (member: MemberProfile) => {
    setEditForm({
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      phone: member.phone || '',
      address: member.address || '',
      status: member.status,
    });
    setIsEditOpen(true);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Member Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Register new members, manage subscriptions, and view profiles.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-xl shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" /> Register New Member
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, member code..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Filter className="w-4 h-4" /> Filter Status:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:border-sky-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="EXPIRED">Expired Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Member</th>
                <th className="px-6 py-3.5">Member Code</th>
                <th className="px-6 py-3.5">Phone & Contact</th>
                <th className="px-6 py-3.5">Active Plan</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Joined</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No members match your criteria.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-sm font-bold text-slate-600 shrink-0">
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
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">
                      {m.memberCode}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                      {m.phone || <span className="text-slate-400 italic">None</span>}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                      {m.subscriptions?.[0]?.plan?.name || (
                        <span className="text-slate-400 italic">No Active Plan</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={m.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                      {new Date(m.joinDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openView(m.id)}
                          title="View Profile Details"
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-sky-600 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(m)}
                          title="Edit Member"
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-amber-600 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(m.id, `${m.firstName} ${m.lastName}`)}
                          title="Delete Member"
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {members.length} of {totalCount} members (Page {page} of {totalPages})
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="font-bold text-slate-800 px-1">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Club Member">
        <form onSubmit={handleCreateMember} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">First Name</label>
              <input
                type="text"
                required
                value={addForm.firstName}
                onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Last Name</label>
              <input
                type="text"
                required
                value={addForm.lastName}
                onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address (Login)</label>
            <input
              type="email"
              required
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={addForm.password}
              onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
              placeholder="Minimum 6 characters"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone</label>
              <input
                type="text"
                value={addForm.phone}
                onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                placeholder="+1 555-0100"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Initial Membership Plan</label>
              <select
                value={addForm.planId}
                onChange={(e) => setAddForm({ ...addForm, planId: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
              >
                <option value="">-- No plan initially --</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (${p.price})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mailing Address</label>
            <input
              type="text"
              value={addForm.address}
              onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
              placeholder="Street, City, Postal Code"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
            >
              Create Member
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Member Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Member Profile">
        <form onSubmit={handleUpdateMember} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">First Name</label>
              <input
                type="text"
                required
                value={editForm.firstName}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Last Name</label>
              <input
                type="text"
                required
                value={editForm.lastName}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone</label>
            <input
              type="text"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Address</label>
            <input
              type="text"
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Membership Status</label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value as MemberStatus })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-sky-500"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="EXPIRED">EXPIRED</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Member Details Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Member Profile & Subscription History"
        maxWidth="max-w-2xl"
      >
        {selectedMember && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center font-black text-xl text-slate-600 shrink-0">
                {selectedMember.avatarUrl ? (
                  <img src={selectedMember.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  selectedMember.firstName.charAt(0)
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xl font-bold text-slate-900">
                    {selectedMember.firstName} {selectedMember.lastName}
                  </h4>
                  <Badge status={selectedMember.status} />
                </div>
                <p className="text-xs font-mono font-bold text-sky-700">
                  ID: {selectedMember.memberCode}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {selectedMember.user?.email}
                  </span>
                  {selectedMember.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> {selectedMember.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Subscriptions History */}
            <div>
              <h5 className="font-bold text-slate-900 text-sm mb-2">Subscription History</h5>
              <div className="space-y-2">
                {selectedMember.subscriptions?.map((s: any) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl border border-slate-200/80 bg-white flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{s.plan?.name}</p>
                      <p className="text-slate-500">
                        {new Date(s.startDate).toLocaleDateString()} — {new Date(s.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge status={s.status} />
                  </div>
                ))}
                {(!selectedMember.subscriptions || selectedMember.subscriptions.length === 0) && (
                  <p className="text-xs text-slate-400 italic">No subscription history.</p>
                )}
              </div>
            </div>

            {/* Payments History */}
            <div>
              <h5 className="font-bold text-slate-900 text-sm mb-2">Recent Payments</h5>
              <div className="space-y-2">
                {selectedMember.payments?.map((p: any) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border border-slate-200/80 bg-white flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold font-mono text-slate-800">{p.invoiceNumber}</p>
                      <p className="text-slate-500">
                        {new Date(p.paidAt).toLocaleDateString()} via {p.method}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">${p.amount.toFixed(2)}</p>
                      <Badge status={p.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
