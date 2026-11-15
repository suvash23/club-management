import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { Modal } from '../../components/common/Modal';
import { Award, PlusCircle, CheckCircle2, Edit2, Trash2, Clock, Users } from 'lucide-react';
import { MembershipPlan } from '../../types';

export const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [form, setForm] = useState({
    id: '',
    name: '',
    description: '',
    price: 49.0,
    durationInDays: 30,
    features: '',
    isActive: true,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/plans');
      setPlans(res.data || []);
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/plans', {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        durationInDays: Number(form.durationInDays),
        features: form.features,
        isActive: form.isActive,
      });
      setIsAddOpen(false);
      resetForm();
      fetchPlans();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create plan');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.put(`/plans/${form.id}`, {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        durationInDays: Number(form.durationInDays),
        features: form.features,
        isActive: form.isActive,
      });
      setIsEditOpen(false);
      resetForm();
      fetchPlans();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update plan');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await apiClient.patch(`/plans/${id}/toggle-active`);
      fetchPlans();
    } catch (err) {
      alert('Failed to change plan status');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete plan "${name}"?`)) return;
    try {
      await apiClient.delete(`/plans/${id}`);
      fetchPlans();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cannot delete plan while it has active subscriptions.');
    }
  };

  const openEdit = (p: MembershipPlan) => {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: p.price,
      durationInDays: p.durationInDays,
      features: p.features || '',
      isActive: p.isActive,
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setForm({
      id: '',
      name: '',
      description: '',
      price: 49.0,
      durationInDays: 30,
      features: '',
      isActive: true,
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Membership Plans
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure club subscription tiers, pricing, duration, and benefits.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsAddOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-xl shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" /> Create New Plan
        </button>
      </div>

      {/* Plans Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
          </div>
        ) : plans.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            No membership plans available. Create your first plan above.
          </div>
        ) : (
          plans.map((p) => {
            const featureList = p.features
              ? p.features.split(',').map((f) => f.trim()).filter(Boolean)
              : [];

            return (
              <div
                key={p.id}
                className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between shadow-sm hover:shadow-md ${
                  p.isActive ? 'border-slate-200' : 'border-rose-100 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          p.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {p.isActive ? 'Active Plan' : 'Archived'}
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-900 mt-2">{p.name}</h3>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-600">
                      <Award className="w-6 h-6" />
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 min-h-[32px]">{p.description}</p>

                  <div className="mt-5 pb-5 border-b border-slate-100 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">${p.price}</span>
                    <span className="text-xs font-semibold text-slate-400">
                      / {p.durationInDays} days
                    </span>
                  </div>

                  {/* Feature list */}
                  <div className="mt-5 space-y-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Included Benefits:
                    </p>
                    {featureList.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                    {featureList.length === 0 && (
                      <p className="text-xs text-slate-400 italic">No specific perks specified.</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>{p._count?.subscriptions || 0} Subscriptions</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(p.id)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      {p.isActive ? 'Archive' : 'Activate'}
                    </button>
                    <button
                      onClick={() => openEdit(p)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-amber-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddOpen || isEditOpen}
        onClose={() => {
          setIsAddOpen(false);
          setIsEditOpen(false);
        }}
        title={isEditOpen ? 'Edit Membership Plan' : 'Create New Membership Plan'}
      >
        <form onSubmit={isEditOpen ? handleUpdate : handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Plan Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Platinum Annual Pass"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief summary of this membership level..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price ($ USD)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Duration (Days)</label>
              <input
                type="number"
                min="1"
                required
                value={form.durationInDays}
                onChange={(e) => setForm({ ...form, durationInDays: parseInt(e.target.value) || 30 })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Included Features (comma-separated)
            </label>
            <textarea
              rows={3}
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
              placeholder="Gym access, 2 Guest passes per month, Sauna, 15% Dining discount"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
            />
            <label htmlFor="isActive" className="text-sm font-semibold text-slate-700">
              Active and available for member enrollment
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(false);
                setIsEditOpen(false);
              }}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
            >
              {isEditOpen ? 'Save Changes' : 'Create Plan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
