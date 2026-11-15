import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Receipt,
  PlusCircle,
  Filter,
  Eye,
  Printer,
  DollarSign,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { Payment, MemberProfile, PaymentMethod, PaymentStatus } from '../../types';

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  // Modals
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Record Form
  const [recordForm, setRecordForm] = useState({
    memberId: '',
    amount: 50.0,
    method: 'CASH' as PaymentMethod,
    status: 'PAID' as PaymentStatus,
    notes: '',
  });

  useEffect(() => {
    fetchPayments();
    fetchMembers();
  }, [statusFilter, methodFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (methodFilter) params.method = methodFilter;
      const res = await apiClient.get('/payments', { params });
      setPayments(res.data || []);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await apiClient.get('/members');
      setMembers(res.data.data || []);
    } catch (err) {
      console.error('Failed to load members:', err);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/payments', {
        memberId: recordForm.memberId,
        amount: Number(recordForm.amount),
        method: recordForm.method,
        status: recordForm.status,
        notes: recordForm.notes,
      });
      setIsRecordOpen(false);
      setRecordForm({
        memberId: '',
        amount: 50.0,
        method: 'CASH',
        status: 'PAID',
        notes: '',
      });
      fetchPayments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const openReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsReceiptOpen(true);
  };

  const totalCollected = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Payments & Invoicing
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track subscription revenue, dues, invoice records, and manual receipts.
          </p>
        </div>
        <button
          onClick={() => setIsRecordOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-xl shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" /> Record Payment
        </button>
      </div>

      {/* Overview Banner */}
      <div className="p-5 bg-gradient-to-r from-sky-900 to-indigo-900 rounded-3xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <p className="text-xs uppercase font-bold text-sky-200 tracking-wider">
            Total Revenue in Current View
          </p>
          <h3 className="text-3xl font-black mt-1">
            ${totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="text-xs text-sky-200">
          Showing {payments.length} transactions
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase">
            <Filter className="w-4 h-4" /> Filters:
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-sky-500"
          >
            <option value="">All Payment Statuses</option>
            <option value="PAID">PAID Only</option>
            <option value="PENDING">PENDING Only</option>
            <option value="FAILED">FAILED Only</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-sky-500"
          >
            <option value="">All Payment Methods</option>
            <option value="ONLINE">ONLINE</option>
            <option value="CARD">CARD</option>
            <option value="CASH">CASH</option>
            <option value="BANK_TRANSFER">BANK TRANSFER</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Invoice #</th>
                <th className="px-6 py-3.5">Member</th>
                <th className="px-6 py-3.5">Plan / Description</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Method</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    No payment transactions found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">
                      {p.invoiceNumber}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 text-xs">
                        {p.member?.firstName} {p.member?.lastName}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {p.member?.memberCode}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600">
                      {p.subscription?.plan?.name || p.notes || 'Club Dues'}
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900 text-sm">
                      ${p.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                      {p.method}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={p.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                      {new Date(p.paidAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openReceipt(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isRecordOpen}
        onClose={() => setIsRecordOpen(false)}
        title="Record Member Payment"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Select Member
            </label>
            <select
              required
              value={recordForm.memberId}
              onChange={(e) => setRecordForm({ ...recordForm, memberId: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
            >
              <option value="">-- Choose Member --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.memberCode} — {m.firstName} {m.lastName} ({m.user?.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Amount ($ USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={recordForm.amount}
                onChange={(e) => setRecordForm({ ...recordForm, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Payment Method
              </label>
              <select
                value={recordForm.method}
                onChange={(e) => setRecordForm({ ...recordForm, method: e.target.value as PaymentMethod })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
              >
                <option value="CASH">CASH</option>
                <option value="CARD">CREDIT/DEBIT CARD</option>
                <option value="BANK_TRANSFER">BANK TRANSFER</option>
                <option value="ONLINE">ONLINE GATEWAY</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Payment Status
            </label>
            <select
              value={recordForm.status}
              onChange={(e) => setRecordForm({ ...recordForm, status: e.target.value as PaymentStatus })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
            >
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Notes / Description
            </label>
            <input
              type="text"
              value={recordForm.notes}
              onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
              placeholder="e.g. Annual membership renewal dues"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRecordOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
            >
              Record Payment
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Invoice Receipt Modal */}
      <Modal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        title="Payment Receipt & Invoice"
      >
        {selectedPayment && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h4 className="font-black text-lg text-slate-900">ClubHub Membership</h4>
                  <p className="text-xs text-slate-500">Official Payment Receipt</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-xs text-sky-700">
                    {selectedPayment.invoiceNumber}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(selectedPayment.paidAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 font-bold uppercase">Billed To:</p>
                  <p className="font-bold text-slate-800 mt-1">
                    {selectedPayment.member?.firstName} {selectedPayment.member?.lastName}
                  </p>
                  <p className="text-slate-500 font-mono">{selectedPayment.member?.memberCode}</p>
                  <p className="text-slate-500">{selectedPayment.member?.user?.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 font-bold uppercase">Payment Info:</p>
                  <p className="font-semibold text-slate-700 mt-1">Method: {selectedPayment.method}</p>
                  <p className="mt-1">
                    <Badge status={selectedPayment.status} />
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between py-2 text-xs">
                  <span className="font-semibold text-slate-700">
                    {selectedPayment.subscription?.plan?.name || selectedPayment.notes || 'Club Membership Dues'}
                  </span>
                  <span className="font-bold text-slate-900">${selectedPayment.amount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-slate-200 text-sm font-black text-slate-900">
                  <span>Total Amount Paid</span>
                  <span>${selectedPayment.amount.toFixed(2)} USD</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
